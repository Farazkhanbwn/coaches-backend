import mongoose from 'mongoose';
import type { Document } from 'mongoose';
const { Schema } = mongoose;

export interface ILoginSession extends Document {
  userId: mongoose.Types.ObjectId;
  loginTime: Date;
  logoutTime?: Date;
  userAgent?: string;
  ipAddress?: string;
  device?: string;
  browser?: string;
  os?: string;
  isActive: boolean;
}

const loginSessionSchema = new Schema<ILoginSession>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  loginTime: { type: Date, default: Date.now, index: true },
  logoutTime: { type: Date },
  userAgent: { type: String },
  ipAddress: { type: String },
  device: { type: String },
  browser: { type: String },
  os: { type: String },
  isActive: { type: Boolean, default: true }
});

export default mongoose.model<ILoginSession>('LoginSession', loginSessionSchema);
