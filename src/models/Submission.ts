import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISubmission extends Document {
  courseId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  instructorId: mongoose.Types.ObjectId;
  videoUrl: string;
  status: 'pending' | 'evaluated';
  score?: number;
  feedback?: string;
  createdAt: Date;
  evaluatedAt?: Date;
}

const SubmissionSchema = new Schema<ISubmission>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    instructorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    videoUrl: { type: String, required: true },
    status: { type: String, enum: ['pending', 'evaluated'], default: 'pending' },
    score: { type: Number, min: 0, max: 100 },
    feedback: { type: String },
    createdAt: { type: Date, default: Date.now },
    evaluatedAt: { type: Date },
  }
);

// Add index to quickly fetch pending evaluations for a specific instructor
SubmissionSchema.index({ instructorId: 1, status: 1 });
SubmissionSchema.index({ userId: 1, courseId: 1 });

const Submission: Model<ISubmission> =
  mongoose.models.Submission || mongoose.model<ISubmission>('Submission', SubmissionSchema);

export default Submission;
