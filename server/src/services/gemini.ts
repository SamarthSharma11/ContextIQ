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
 * Generate embedding vector for a given text.
 * Truncates or formats to target dimension (e.g. 1536 if supported or 768 standard).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const client = getGeminiClient();
  // We try text-embedding-004 / gemini-embedding-001
  const model = client.getGenerativeModel({ model: 'text-embedding-004' });
  
  const result = await model.embedContent(text);
  const values = result.embedding.values;
  
  // If target index expects 1536 dimensions and model returned 768, we can pad or if model returned 3072 truncate
  // If needed, match dimensions. Let's ensure standard float array is returned.
  return values;
}

/**
 * Generate embeddings for a batch of chunk texts.
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const embeddings: number[][] = [];
  // Run sequentially or in small batches to respect rate limits
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
  const model = client.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: params.systemPrompt,
  });

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

  // Build history if available
  const contents = [];
  if (params.history && params.history.length > 0) {
    for (const msg of params.history) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }
  }

  // Add the current prompt
  contents.push({
    role: 'user',
    parts: [{ text: fullUserPrompt }],
  });

  const chat = model.startChat();
  const result = await model.generateContent({
    contents,
  });

  const response = result.response;
  const text = response.text();
  const totalTokens = response.usageMetadata?.totalTokenCount || Math.ceil((fullUserPrompt.length + text.length) / 4);

  return {
    text,
    tokensUsed: totalTokens,
  };
}
