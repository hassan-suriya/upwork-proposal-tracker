import mongoose, { Schema } from 'mongoose';

export type ProposalStatus = 'applied' | 'viewed' | 'interviewed' | 'hired' | 'rejected';

export interface IProposal {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: Date;
  jobLink: string;
  status: ProposalStatus;
  price: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProposalSchema = new Schema<IProposal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    jobLink: { type: String, required: true },
    status: {
      type: String,
      enum: ['applied', 'viewed', 'interviewed', 'hired', 'rejected'],
      default: 'applied',
    },
    price: { type: Number, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.Proposal ||
  mongoose.model<IProposal>('Proposal', ProposalSchema);
