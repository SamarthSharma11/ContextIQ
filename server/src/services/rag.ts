import { Types } from 'mongoose';
import { Tenant } from '../models/Tenant';
import { Chat } from '../models/Chat';
import { Message, ICitedSource } from '../models/Message';
import { UsageEvent } from '../models/UsageEvent';
import { generateEmbedding, generateChatCompletion } from './gemini';
import { querySimilarVectors } from './pinecone';
import { getCache, setCache } from './redis';
import crypto from 'crypto';

export interface RAGQueryOptions {
  tenantId: Types.ObjectId;
  sessionId: string;
  userMessage: string;
  topK?: number;
}

export interface RAGResponse {
  answer: string;
  sources: ICitedSource[];
  tokensUsed: number;
  latencyMs: number;
  limitReached?: boolean;
}

/**
 * Execute RAG query against tenant's isolated vector knowledge base
 */
export async function executeRAGQuery(options: RAGQueryOptions): Promise<RAGResponse> {
  const startTime = Date.now();
  const { tenantId, sessionId, userMessage, topK = 4 } = options;

  // 1. Fetch Tenant with Redis cache (60s TTL) to avoid repeated DB hits on every message
  const tenantCacheKey = `tenant:${tenantId.toString()}`;
  let tenant = await getCache<any>(tenantCacheKey);
  if (!tenant) {
    tenant = await Tenant.findById(tenantId).lean();
    if (tenant) await setCache(tenantCacheKey, tenant, 60);
  }
  if (!tenant) {
    throw new Error('Tenant not found');
  }

  if (tenant.status === 'paused' || tenant.tokenUsed >= tenant.tokenLimit) {
    return {
      answer: "I'm sorry, but this assistant is currently unavailable as the workspace has reached its monthly usage limit. Please contact the administrator to upgrade the plan.",
      sources: [],
      tokensUsed: 0,
      latencyMs: Date.now() - startTime,
      limitReached: true,
    };
  }

  // 2. Find or create Chat conversation
  let chat = await Chat.findOne({ tenantId, sessionId });
  if (!chat) {
    chat = await Chat.create({
      tenantId,
      sessionId,
      startedAt: new Date(),
      lastMessageAt: new Date(),
      messageCount: 0,
    });
  }

  // Save User message
  await Message.create({
    tenantId,
    chatId: chat._id,
    role: 'user',
    content: userMessage,
  });

  // 3. Embed user question — check Redis vector cache first (1h TTL)
  // Cache key is a hash of tenant + message to ensure isolation
  const embeddingCacheKey = `emb:${tenantId.toString()}:${crypto
    .createHash('md5')
    .update(userMessage.toLowerCase().trim())
    .digest('hex')}`;
  let queryVector = await getCache<number[]>(embeddingCacheKey);
  if (!queryVector) {
    queryVector = await generateEmbedding(userMessage);
    await setCache(embeddingCacheKey, queryVector, 3600); // 1h TTL
  }

  // 4. Query Pinecone namespace
  const matches = await querySimilarVectors(tenant.pineconeNamespace, queryVector, topK);

  const contextChunks: string[] = [];
  const citedSourcesMap = new Map<string, ICitedSource>();

  for (const match of matches) {
    if (match.metadata && match.metadata.text) {
      contextChunks.push(match.metadata.text);
      if (match.metadata.sourceId && !citedSourcesMap.has(match.metadata.sourceId)) {
        citedSourcesMap.set(match.metadata.sourceId, {
          sourceId: new Types.ObjectId(match.metadata.sourceId),
          title: match.metadata.title || 'Referenced Document',
          chunkText: match.metadata.text.slice(0, 150) + '...',
        });
      }
    }
  }

  // 5. Fetch recent chat history for session context (last 6 messages)
  const recentMessages = await Message.find({ tenantId, chatId: chat._id })
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();
  
  const history = recentMessages
    .reverse()
    .slice(0, -1) // exclude the message we just inserted
    .map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

  // 6. Generate answer via Gemini
  const botConfig = tenant.chatbotConfig || {
    name: 'ContextIQ Assistant',
  };

  const systemPrompt = `You are "${botConfig.name}", an intelligent, friendly, and accurate AI assistant for this organization.
Your role is to answer questions strictly grounded in the verified organization documentation and knowledge base provided to you.
Be concise, clear, and direct. When relevant, reference details from the documents.
If the provided context does not contain the answer, politely say that you don't have information about that in the knowledge base.`;

  const { text: answer, tokensUsed } = await generateChatCompletion({
    systemPrompt,
    userMessage,
    contextChunks,
    history,
  });

  const latencyMs = Date.now() - startTime;
  const sources = Array.from(citedSourcesMap.values());
  const sourceRefs = sources.map((s) => s.sourceId);

  // 7. Save Assistant message
  const assistantMsg = await Message.create({
    tenantId,
    chatId: chat._id,
    role: 'assistant',
    content: answer,
    sourceRefs,
    sources,
    tokensUsed,
    latencyMs,
  });

  // 8. Update Chat metadata
  await Chat.findByIdAndUpdate(chat._id, {
    lastMessageAt: new Date(),
    $inc: { messageCount: 2 },
  });

  // 9. Record Usage Event & Update Tenant token consumption
  await UsageEvent.create({
    tenantId,
    type: 'chat',
    tokens: tokensUsed,
    latencyMs,
    refId: assistantMsg._id,
  });

  await Tenant.findByIdAndUpdate(tenantId, {
    $inc: { tokenUsed: tokensUsed },
  });

  return {
    answer,
    sources,
    tokensUsed,
    latencyMs,
  };
}
