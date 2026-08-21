import { Pinecone, RecordMetadata } from '@pinecone-database/pinecone';
import { config } from '../config/env';

let pineconeClient: Pinecone | null = null;

export function getPineconeClient(): Pinecone {
  if (!pineconeClient) {
    if (!config.pineconeApiKey) {
      throw new Error('PINECONE_API_KEY is not set in environment');
    }
    pineconeClient = new Pinecone({
      apiKey: config.pineconeApiKey,
    });
  }
  return pineconeClient;
}

export function getPineconeIndex() {
  const client = getPineconeClient();
  return client.index(config.pineconeIndex);
}

export interface PineconeChunkRecord {
  id: string;
  values: number[];
  metadata: {
    tenantId: string;
    sourceId: string;
    chunkIndex: number;
    text: string;
    title: string;
  };
}

/**
 * Upsert vectors into tenant-specific namespace in Pinecone.
 */
export async function upsertVectors(
  namespace: string,
  records: PineconeChunkRecord[]
): Promise<void> {
  const index = getPineconeIndex();
  const ns = index.namespace(namespace);
  
  // Upsert in batches of 100
  const batchSize = 100;
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    await ns.upsert(batch);
  }
}

/**
 * Query top-k vectors from tenant-specific namespace.
 */
export async function querySimilarVectors(
  namespace: string,
  queryVector: number[],
  topK: number = 4
): Promise<Array<{ id: string; score: number; metadata: PineconeChunkRecord['metadata'] }>> {
  const index = getPineconeIndex();
  const ns = index.namespace(namespace);

  const queryResponse = await ns.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
  });

  return (queryResponse.matches || []).map((match) => ({
    id: match.id,
    score: match.score || 0,
    metadata: match.metadata as unknown as PineconeChunkRecord['metadata'],
  }));
}

/**
 * Delete vectors associated with a source from tenant namespace.
 */
export async function deleteVectorsByIds(namespace: string, vectorIds: string[]): Promise<void> {
  if (!vectorIds.length) return;
  const index = getPineconeIndex();
  const ns = index.namespace(namespace);
  await ns.deleteMany(vectorIds);
}

/**
 * Delete entire namespace when tenant is deleted.
 */
export async function deleteNamespace(namespace: string): Promise<void> {
  const index = getPineconeIndex();
  const ns = index.namespace(namespace);
  await ns.deleteAll();
}
