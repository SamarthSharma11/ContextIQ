import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChunk extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  sourceId: Types.ObjectId;
  chunkIndex: number;
  text: string;
  vectorId: string;
  tokenCount: number;
  createdAt: Date;
}

const ChunkSchema = new Schema<IChunk>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    sourceId: { type: Schema.Types.ObjectId, ref: 'Source', required: true, index: true },
    chunkIndex: { type: Number, required: true },
    text: { type: String, required: true },
    vectorId: { type: String, required: true },
    tokenCount: { type: Number, required: true, default: 0 },
    createdAt: { type: Date, default: Date.now },
  }
);

// Compound index for querying all chunks of a source within a tenant
ChunkSchema.index({ tenantId: 1, sourceId: 1 });

export const Chunk = mongoose.model<IChunk>('Chunk', ChunkSchema);
