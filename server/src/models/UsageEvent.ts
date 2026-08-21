import mongoose, { Document, Schema, Types } from 'mongoose';

export type UsageEventType = 'embed' | 'chat';

export interface IUsageEvent extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  type: UsageEventType;
  tokens: number;
  latencyMs?: number;
  refId?: Types.ObjectId;
  createdAt: Date;
}

const UsageEventSchema = new Schema<IUsageEvent>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    type: { type: String, enum: ['embed', 'chat'], required: true },
    tokens: { type: Number, required: true, default: 0 },
    latencyMs: { type: Number },
    refId: { type: Schema.Types.ObjectId },
    createdAt: { type: Date, default: Date.now },
  }
);

// Indexed for time-range aggregation per tenant
UsageEventSchema.index({ tenantId: 1, createdAt: 1 });

export const UsageEvent = mongoose.model<IUsageEvent>('UsageEvent', UsageEventSchema);
