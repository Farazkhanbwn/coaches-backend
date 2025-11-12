import mongoose from 'mongoose';
import type { Document } from 'mongoose';
const { Schema } = mongoose;

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'sales' | 'coach' | 'admin';
  companyName?: string;
  ownerName?: string;
  ownerEmail?: string;
  phone?: string;
  coachId?: mongoose.Types.ObjectId;
  companyId?: mongoose.Types.ObjectId;
  isEmailVerified: boolean;
  emailVerificationToken?: string | null;
  emailVerificationExpires?: Date | null;
  resetPasswordToken?: string | null;
  resetPasswordExpires?: Date | null;
  invitationToken?: string | null;
  invitationExpires?: Date | null;
  subscription?: {
    plan: 'Free' | 'Pro' | 'Enterprise';
    status: 'Active' | 'Inactive' | 'Trial' | 'Pending';
    billingCycle: 'Monthly' | 'Yearly';
    startDate?: Date;
    nextBillingDate?: Date;
    lastUpdatedBy?: string;
    lastUpdatedAt?: Date;
  };
  lastLoginAt?: Date;
  loginCount: number;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  role: { type: String, enum: ['sales', 'coach', 'admin'], required: true },
  companyName: { type: String },
  ownerName: { type: String },
  ownerEmail: { type: String },
  phone: { type: String },
  coachId: { type: Schema.Types.ObjectId, ref: 'User' },
  companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  invitationToken: { type: String },
  invitationExpires: { type: Date },
  subscription: {
    plan: { type: String, enum: ['Free', 'Pro', 'Enterprise'], default: 'Free' },
    status: { type: String, enum: ['Active', 'Inactive', 'Trial', 'Pending'], default: 'Active' },
    billingCycle: { type: String, enum: ['Monthly', 'Yearly'], default: 'Monthly' },
    startDate: { type: Date },
    nextBillingDate: { type: Date },
    lastUpdatedBy: { type: String },
    lastUpdatedAt: { type: Date }
  },
  lastLoginAt: { type: Date },
  loginCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', userSchema);
