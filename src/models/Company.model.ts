import mongoose, { Schema, Document } from 'mongoose';

export interface ICompany extends Document {
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerId?: mongoose.Types.ObjectId;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Date;
  updatedAt: Date;
}

const CompanySchema = new Schema<ICompany>(
  {
    name: { type: String, required: true },
    ownerName: { type: String, required: true },
    ownerEmail: { type: String, required: true, unique: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' }
  },
  { timestamps: true }
);

export default mongoose.model<ICompany>('Company', CompanySchema);
