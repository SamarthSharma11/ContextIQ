import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IBillingEvent extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  stripeEventId: string;
  type: string;
  amount?: number;
  status: 'processed' | 'failed';
  createdAt: Date;
}

const BillingEventSchema = new Schema<IBillingEvent>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    stripeEventId: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    amount: { type: Number },
    status: { type: String, enum: ['processed', 'failed'], default: 'processed', required: true },
    createdAt: { type: Date, default: Date.now },
  }
);

BillingEventSchema.index({ stripeEventId: 1 }, { unique: true });

export const BillingEvent = mongoose.model<IBillingEvent>('BillingEvent', BillingEventSchema);
