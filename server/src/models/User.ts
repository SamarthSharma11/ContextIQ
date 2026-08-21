import mongoose, { Document, Schema, Types } from 'mongoose';

export type UserRole = 'owner' | 'admin' | 'editor' | 'viewer';
export type UserStatus = 'invited' | 'active' | 'disabled';

export interface IUser extends Document {
  _id: Types.ObjectId;
  tenantId: Types.ObjectId;
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
  status: UserStatus;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['owner', 'admin', 'editor', 'viewer'],
      default: 'viewer',
      required: true,
    },
    name: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['invited', 'active', 'disabled'],
      default: 'active',
      required: true,
    },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// Compound unique index: email unique per tenant
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });

export const User = mongoose.model<IUser>('User', UserSchema);
