import mongoose, { Schema, Document } from 'mongoose';

export interface IChallenge extends Document {
  title: string;
  description: string;
  week: string;
  deadline: string;
  prize: string;
  status: 'active' | 'closed' | 'upcoming';
  instructorId: mongoose.Types.ObjectId;
  participantsCount: number;
  submissions: any[];
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    week: { type: String, required: true },
    deadline: { type: String, required: true },
    prize: { type: String, required: true },
    status: { type: String, enum: ['active', 'closed', 'upcoming'], default: 'active' },
    instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participantsCount: { type: Number, default: 0 },
    submissions: { type: Array, default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Challenge || mongoose.model<IChallenge>('Challenge', ChallengeSchema);
