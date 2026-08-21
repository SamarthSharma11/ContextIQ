import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';

let genAI: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (!genAI) {
    if (!config.geminiApiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment');
    }
    genAI = new GoogleGenerativeAI(config.geminiApiKey);
  }
  return genAI;
}

/**
 * Generate embedding vector for a given text using gemini-embedding-001 with 1536 dimensions.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: 'gemini-embedding-001' });

  const result = await model.embedContent({
    content: {
      role: 'user',
      parts: [{ text }],
    },
    outputDimensionality: 1536,
  } as any);

  let values = result.embedding.values;

  // Guarantee exact 1536 dimensionality matching Pinecone index configuration
  if (values.length < 1536) {
    values = [...values, ...new Array(1536 - values.length).fill(0)];
  } else if (values.length > 1536) {
    values = values.slice(0, 1536);
  }

  return values;
}

/**
 * Generate embeddings for a batch of chunk texts.
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  for (const text of texts) {
    const embedding = await generateEmbedding(text);
    embeddings.push(embedding);
  }
  return embeddings;
}

/**
 * Generate grounded answer from retrieved context and conversation history.
 */
export async function generateChatCompletion(params: {
  systemPrompt: string;
  userMessage: string;
  contextChunks: string[];
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}): Promise<{ text: string; tokensUsed: number }> {
  const client = getGeminiClient();

  const formattedContext = params.contextChunks
    .map((chunk, idx) => `[Source ${idx + 1}]:\n${chunk}`)
    .join('\n\n---\n\n');

  const fullUserPrompt = `
Here is the factual context from the verified knowledge base:
=========================================
${formattedContext}
=========================================

User Question: ${params.userMessage}

Instructions:
- Answer the user's question accurately and politely using the context provided above.
- If the answer cannot be found in the provided context, state clearly and politely that the documentation does not contain this information.
- Always remain helpful, professional, and grounded in the provided sources.
`;

  const contents = [];
  if (params.history && params.history.length > 0) {
    for (const msg of params.history) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }
  }

  contents.push({
    role: 'user',
    parts: [{ text: fullUserPrompt }],
  });

  // Try preferred model list with automatic graceful fallback
  const candidateModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-3.6-flash'];
  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
      const model = client.getGenerativeModel({
        model: modelName,
        systemInstruction: params.systemPrompt,
      });

      const result = await model.generateContent({
        contents,
      });

      const response = result.response;
      const text = response.text();
      const totalTokens =
        response.usageMetadata?.totalTokenCount ||
        Math.ceil((fullUserPrompt.length + text.length) / 4);

      return {
        text,
        tokensUsed: totalTokens,
      };
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Chat] Model ${modelName} failed, attempting next candidate:`, err.message);
    }
  }

  throw new Error(`All candidate Gemini models failed: ${lastError?.message}`);
}
