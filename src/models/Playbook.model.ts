import mongoose, { Document, Schema } from 'mongoose';

export interface IPlaybook extends Document {
  createdBy: mongoose.Types.ObjectId;
  title: string;
  formData: {
    idealProspect: {
      profile: string;
      websiteLinks: string[];
    };
    idealCustomer: {
      decisionMaker: string;
      jobTitles: string;
      nightWorries: string;
      fears: string;
      dailyFrustrations: string;
    };
    differentiators: string;
    other: {
      coldEmailExamples: string;
      salesCollateral: string;
    };
    qualificationQuestions: string;
    valueInStoryForm: {
      customerOutcomes: string;
      outcomeExamples: string;
    };
    notes: string;
  };
  generatedContent: {
    callScript: {
      openingLine: string;
      discoveryQuestions: string[];
      objectionHandling: Array<{
        objection: string;
        response: string;
      }>;
      closingStatement: string;
    };
    emailTemplates: {
      coldOutreach: string;
      followUp: string;
    };
    voicemailScript: string;
    discoveryFramework: {
      openEndedQuestions: string[];
      keyValuePoints: string[];
    };
    valueInStoryForm?: {
      customerOutcomes: string;
      outcomeExamples: string;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const PlaybookSchema = new Schema<IPlaybook>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    formData: {
      idealProspect: {
        profile: { type: String, default: '' },
        websiteLinks: [{ type: String }],
      },
      idealCustomer: {
        decisionMaker: { type: String, default: '' },
        jobTitles: { type: String, default: '' },
        nightWorries: { type: String, default: '' },
        fears: { type: String, default: '' },
        dailyFrustrations: { type: String, default: '' },
      },
      differentiators: { type: String, default: '' },
      other: {
        coldEmailExamples: { type: String, default: '' },
        salesCollateral: { type: String, default: '' },
      },
      qualificationQuestions: { type: String, default: '' },
      valueInStoryForm: {
        customerOutcomes: { type: String, default: '' },
        outcomeExamples: { type: String, default: '' },
      },
      notes: { type: String, default: '' },
    },
    generatedContent: {
      callScript: {
        openingLine: { type: String, default: '' },
        discoveryQuestions: [{ type: String }],
        objectionHandling: [
          {
            objection: { type: String },
            response: { type: String },
          },
        ],
        closingStatement: { type: String, default: '' },
      },
      emailTemplates: {
        coldOutreach: { type: String, default: '' },
        followUp: { type: String, default: '' },
      },
      voicemailScript: { type: String, default: '' },
      discoveryFramework: {
        openEndedQuestions: [{ type: String }],
        keyValuePoints: [{ type: String }],
      },
      valueInStoryForm: {
        customerOutcomes: { type: String, default: '' },
        outcomeExamples: { type: String, default: '' },
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Playbook = mongoose.model<IPlaybook>('Playbook', PlaybookSchema);
