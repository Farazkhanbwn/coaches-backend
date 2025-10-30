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
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<IUser>('User', userSchema);
