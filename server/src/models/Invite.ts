import mongoose, { Document, Schema, Types } from 'mongoose';
import { UserRole } from './User';

export interface IInvite extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  email: string;
  role: UserRole;
  token: string;
  invitedBy: Types.ObjectId;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: Date;
  createdAt: Date;
}

const InviteSchema = new Schema<IInvite>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    role: {
      type: String,
      enum: ['owner', 'admin', 'editor', 'viewer'],
      default: 'viewer',
      required: true,
    },
    token: { type: String, required: true, unique: true },
    invitedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired'],
      default: 'pending',
      required: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      required: true,
    },
  },
  { timestamps: true }
);

InviteSchema.index({ token: 1 }, { unique: true });
InviteSchema.index({ tenantId: 1, email: 1 });

export const Invite = mongoose.model<IInvite>('Invite', InviteSchema);
