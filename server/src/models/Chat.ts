import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IChat extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  sessionId: string;
  startedAt: Date;
  lastMessageAt: Date;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    sessionId: { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
    lastMessageAt: { type: Date, default: Date.now },
    messageCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ChatSchema.index({ tenantId: 1, sessionId: 1 }, { unique: true });

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
