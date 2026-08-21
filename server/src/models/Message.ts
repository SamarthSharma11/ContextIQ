import mongoose, { Document, Schema, Types } from 'mongoose';

export type MessageRole = 'user' | 'assistant';
export type FeedbackType = 'up' | 'down' | null;

export interface ICitedSource {
  sourceId: Types.ObjectId;
  title: string;
  chunkText?: string;
}

export interface IMessage extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  chatId: Types.ObjectId;
  role: MessageRole;
  content: string;
  sourceRefs?: Types.ObjectId[];
  sources?: ICitedSource[];
  tokensUsed?: number;
  latencyMs?: number;
  feedback?: FeedbackType;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    chatId: { type: Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    sourceRefs: [{ type: Schema.Types.ObjectId, ref: 'Source' }],
    sources: [
      {
        sourceId: { type: Schema.Types.ObjectId, ref: 'Source' },
        title: { type: String },
        chunkText: { type: String },
      },
    ],
    tokensUsed: { type: Number },
    latencyMs: { type: Number },
    feedback: { type: String, enum: ['up', 'down', null], default: null },
    createdAt: { type: Date, default: Date.now },
  }
);

MessageSchema.index({ tenantId: 1, chatId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>('Message', MessageSchema);
