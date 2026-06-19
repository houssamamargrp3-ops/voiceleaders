import mongoose, { Schema, Document } from 'mongoose';

export interface IQuizAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  quizIndex: number;
  score: number;
  totalQuestions: number;
  answers: number[]; // Index of the option selected by the user for each question
  completedAt: Date;
  nextRetakeAt: Date; // Date when the user is allowed to retake the quiz
}

const QuizAttemptSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    quizIndex: { type: Number, required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    answers: [{ type: Number }],
    completedAt: { type: Date, default: Date.now },
    nextRetakeAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Compound index to quickly find a user's attempt for a specific quiz in a course
QuizAttemptSchema.index({ userId: 1, courseId: 1, quizIndex: 1 });

export default mongoose.models.QuizAttempt || mongoose.model<IQuizAttempt>('QuizAttempt', QuizAttemptSchema);
