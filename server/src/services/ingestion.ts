import pdfParse from 'pdf-parse';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';
import { Types } from 'mongoose';
import { Source, ISource } from '../models/Source';
import { Chunk } from '../models/Chunk';
import { Tenant } from '../models/Tenant';
import { UsageEvent } from '../models/UsageEvent';
import { splitTextIntoChunks } from './chunking';
import { generateEmbedding } from './gemini';
import { upsertVectors, PineconeChunkRecord } from './pinecone';

/**
 * Extract clean text from a PDF Buffer
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  const data = await pdfParse(pdfBuffer);
  return data.text || '';
}

/**
 * Validate URL to prevent SSRF attacks against internal network metadata
 */
export function validatePublicUrl(targetUrl: string): void {
  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch (e) {
    throw new Error('Invalid URL format');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP and HTTPS protocols are supported');
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block loopback and local hostnames
  if (['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(hostname) || hostname.endsWith('.local')) {
    throw new Error('Access to local/private network addresses is blocked for security');
  }

  // Block cloud metadata services (AWS/GCP/Azure link-local 169.254.169.254)
  if (hostname === '169.254.169.254' || hostname.startsWith('169.254.')) {
    throw new Error('Access to cloud instance metadata services is prohibited');
  }

  // Block RFC 1918 private subnets
  if (
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.') ||
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)
  ) {
    throw new Error('Access to private RFC1918 internal IP ranges is blocked');
  }
}

/**
 * Fetch and extract text from a Web URL
 */
export async function extractTextFromURL(url: string): Promise<{ text: string; title: string }> {
  validatePublicUrl(url);

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'ContextIQ-Bot/1.0 (+https://contextiq.ai)',
    },
    timeout: 15000,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove scripts, styles, iframes, navs, footers for cleaner extraction
  $('script, style, noscript, iframe, nav, footer, header, svg').remove();

  const title = $('title').text().trim() || $('h1').first().text().trim() || url;
  
  // Extract main article or body content
  let bodyText = $('main, article, #content, .content, .main, body').text();
  bodyText = bodyText.replace(/\s+/g, ' ').trim();

  return { text: bodyText, title };
}

/**
 * Ingestion orchestrator: Process source text into chunks, embeddings, and vector store
 */
export async function processSourceIngestion(params: {
  sourceId: Types.ObjectId;
  tenantId: Types.ObjectId;
  namespace: string;
  rawText: string;
  title: string;
}): Promise<void> {
  const { sourceId, tenantId, namespace, rawText, title } = params;

  try {
    // 1. Mark status as processing
    await Source.findByIdAndUpdate(sourceId, { status: 'processing', errorMessage: undefined });

    // 2. Chunk text
    const textChunks = splitTextIntoChunks(rawText);
    if (textChunks.length === 0) {
      throw new Error('No readable text content could be extracted from this source');
    }

    // 3. Generate embeddings and prepare Pinecone records
    const pineconeRecords: PineconeChunkRecord[] = [];
    const chunkDocs = [];
    let totalTokensUsed = 0;

    for (const chunk of textChunks) {
      const vectorId = `${sourceId.toString()}_chunk_${chunk.index}`;
      const embedding = await generateEmbedding(chunk.text);
      totalTokensUsed += chunk.tokenCount;

      pineconeRecords.push({
        id: vectorId,
        values: embedding,
        metadata: {
          tenantId: tenantId.toString(),
          sourceId: sourceId.toString(),
          chunkIndex: chunk.index,
          text: chunk.text,
          title,
        },
      });

      chunkDocs.push({
        tenantId,
        sourceId,
        chunkIndex: chunk.index,
        text: chunk.text,
        vectorId,
        tokenCount: chunk.tokenCount,
      });
    }

    // 4. Upsert vectors to Pinecone
    await upsertVectors(namespace, pineconeRecords);

    // 5. Store chunk documents in MongoDB
    await Chunk.insertMany(chunkDocs);

    // 6. Update Source to ready
    await Source.findByIdAndUpdate(sourceId, {
      status: 'ready',
      chunkCount: chunkDocs.length,
    });

    // 7. Record usage event & update tenant token consumption
    await UsageEvent.create({
      tenantId,
      type: 'embed',
      tokens: totalTokensUsed,
      refId: sourceId,
    });

    await Tenant.findByIdAndUpdate(tenantId, {
      $inc: { tokenUsed: totalTokensUsed },
    });

    console.log(`[Ingestion] Source ${sourceId} (${title}) successfully processed ${chunkDocs.length} chunks (${totalTokensUsed} tokens).`);
  } catch (error: any) {
    console.error(`[Ingestion] Failed to process source ${sourceId}:`, error);
    await Source.findByIdAndUpdate(sourceId, {
      status: 'failed',
      errorMessage: error.message || 'Ingestion failed during processing',
    });
  }
}
