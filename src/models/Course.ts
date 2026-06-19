import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ICourse extends Document {
  title: string;
  description: string;
  instructor: string;
  instructorId?: mongoose.Types.ObjectId;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  duration: string;
  thumbnail?: string;
  tags: string[];
  featured: boolean;
  lessons: {
    _id?: mongoose.Types.ObjectId;
    title: string;
    videoUrl: string;
    duration: string;
    order: number;
  }[];
  materials: {
    title: string;
    url: string;
  }[];
  quizzes: {
    title: string;
    timeLimit: number;
    retakeAfterDays: number;
    questions: {
      questionText: string;
      options: string[];
      correctAnswer: number;
    }[];
  }[];
  enrolledStudents: mongoose.Types.ObjectId[];
  rating: number;
  ratingsCount: number;
  reviews: {
    user: mongoose.Types.ObjectId;
    userName: string;
    rating: number;
    comment: string;
    createdAt: Date;
  }[];
  maxStudents: number;
  isRegistrationClosed: boolean;
  createdAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    instructor: { type: String, required: true },
    instructorId: { type: Schema.Types.ObjectId, ref: 'User' },
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    category: { type: String, required: true },
    duration: { type: String, default: '' },
    thumbnail: { type: String, default: '' },
    tags: [{ type: String }],
    featured: { type: Boolean, default: false },
    lessons: [
      {
        title: { type: String, required: true },
        videoUrl: { type: String, required: true },
        duration: { type: String, default: '' },
        order: { type: Number, required: true },
      },
    ],
    materials: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    quizzes: [
      {
        title: { type: String, required: true },
        timeLimit: { type: Number, default: 30 },
        retakeAfterDays: { type: Number, default: 1 },
        questions: [
          {
            questionText: { type: String, required: true },
            options: [{ type: String, required: true }],
            correctAnswer: { type: Number, required: true },
          },
        ],
      },
    ],
    enrolledStudents: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    rating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    reviews: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    maxStudents: { type: Number, default: 0 },
    isRegistrationClosed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CourseSchema.index({ level: 1 });
CourseSchema.index({ featured: -1 });
CourseSchema.index({ rating: -1 });

const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);

export default Course;
