import mongoose, { Schema, Document } from 'mongoose';

export interface ICallSession extends Document {
  userId: mongoose.Types.ObjectId;
  callType: 'cold-call' | 'discovery-call' | 'demo-call' | 'follow-up-call';
  callGoal: string;
  voiceUsed: string;
  duration: number; // in seconds
  transcript: Array<{
    speaker: string;
    message: string;
    timestamp: number;
  }>;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    improvementPoints: string[];
    overallScore: number;
  };
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
}

const CallSessionSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    callType: {
      type: String,
      enum: ['cold-call', 'discovery-call', 'demo-call', 'follow-up-call'],
      required: true,
    },
    callGoal: {
      type: String,
      default: '',
    },
    voiceUsed: {
      type: String,
      default: 'alloy',
    },
    duration: {
      type: Number,
      required: true,
      default: 0,
    },
    transcript: [
      {
        speaker: String,
        message: String,
        timestamp: Number,
      },
    ],
    feedback: {
      strengths: [String],
      weaknesses: [String],
      improvementPoints: [String],
      overallScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
CallSessionSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model<ICallSession>('CallSession', CallSessionSchema);
