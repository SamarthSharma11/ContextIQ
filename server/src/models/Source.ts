import mongoose, { Document, Schema, Types } from 'mongoose';

export type SourceType = 'pdf' | 'url';
export type SourceStatus = 'queued' | 'processing' | 'ready' | 'failed';

export interface ISource extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  type: SourceType;
  title: string;
  origin: string; // File name or URL
  status: SourceStatus;
  chunkCount: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SourceSchema = new Schema<ISource>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    type: { type: String, enum: ['pdf', 'url'], required: true },
    title: { type: String, required: true, trim: true },
    origin: { type: String, required: true },
    status: {
      type: String,
      enum: ['queued', 'processing', 'ready', 'failed'],
      default: 'queued',
      required: true,
    },
    chunkCount: { type: Number, default: 0 },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

SourceSchema.index({ tenantId: 1, status: 1 });

export const Source = mongoose.model<ISource>('Source', SourceSchema);
