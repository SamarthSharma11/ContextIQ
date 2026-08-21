import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ITenantChatbotConfig {
  name: string;
  greeting: string;
  accentColor: string;
  placeholder: string;
  allowedOrigins?: string[];
}

export interface ITenant extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  ownerId: Types.ObjectId;
  plan: 'free' | 'starter' | 'growth' | 'scale';
  stripeCustomerId?: string;
  tokenLimit: number;
  tokenUsed: number;
  status: 'active' | 'paused' | 'cancelled';
  onboardingCompleted: boolean;
  pineconeNamespace: string;
  chatbotConfig: ITenantChatbotConfig;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    plan: {
      type: String,
      enum: ['free', 'starter', 'growth', 'scale'],
      default: 'starter',
      required: true,
    },
    stripeCustomerId: { type: String },
    tokenLimit: { type: Number, default: 500000, required: true }, // e.g. 500k tokens starter
    tokenUsed: { type: Number, default: 0, required: true },
    status: {
      type: String,
      enum: ['active', 'paused', 'cancelled'],
      default: 'active',
      required: true,
    },
    onboardingCompleted: { type: Boolean, default: false, required: true },
    pineconeNamespace: { type: String, required: true },
    chatbotConfig: {
      name: { type: String, default: 'ContextIQ Assistant' },
      greeting: { type: String, default: 'Hi there! How can I help you today with our documents and knowledge base?' },
      accentColor: { type: String, default: '#E8675F' },
      placeholder: { type: String, default: 'Ask a question...' },
      allowedOrigins: [{ type: String }],
    },
  },
  { timestamps: true }
);

export const Tenant = mongoose.model<ITenant>('Tenant', TenantSchema);
