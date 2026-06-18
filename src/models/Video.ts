import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IVideo extends Document {
  title: string;
  description: string;
  url: string;
  thumbnail?: string;
  duration?: string;
  user: mongoose.Types.ObjectId;
  userName: string;
  userLevel: string;
  likes: mongoose.Types.ObjectId[];
  comments: {
    user: mongoose.Types.ObjectId;
    userName: string;
    text: string;
    createdAt: Date;
  }[];
  views: number;
  tags: string[];
  challenge?: string;
  rating: number;
  ratingsCount: number;
  createdAt: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: '', maxlength: 2000 },
    url: { type: String, required: true },
    thumbnail: { type: String, default: '' },
    duration: { type: String, default: '' },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userLevel: { type: String, default: 'beginner' },
    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    comments: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        userName: String,
        text: { type: String, maxlength: 500 },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    views: { type: Number, default: 0 },
    tags: [{ type: String }],
    challenge: { type: String, default: '' },
    rating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

VideoSchema.index({ user: 1 });
VideoSchema.index({ createdAt: -1 });
VideoSchema.index({ likes: -1 });

const Video: Model<IVideo> =
  mongoose.models.Video || mongoose.model<IVideo>('Video', VideoSchema);

export default Video;
