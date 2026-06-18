import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  bio: string;
  country: string;
  city: string;
  role: 'trainee' | 'trainer' | 'admin';
  avatar?: string;
  followers: string[];
  following: string[];
  points: number;
  badges: string[];
  coursesCompleted: string[];
  certificates: string[];
  videosCount: number;
  rating: number;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    youtube?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'الاسم مطلوب'],
      trim: true,
      minlength: [2, 'الاسم يجب أن يكون حرفين على الأقل'],
      maxlength: [60, 'الاسم طويل جداً'],
    },
    email: {
      type: String,
      required: [true, 'البريد الإلكتروني مطلوب'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'البريد الإلكتروني غير صحيح'],
    },
    password: {
      type: String,
      required: [true, 'كلمة المرور مطلوبة'],
      minlength: [8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'],
      select: false, // لا يُرجَع افتراضياً في الاستعلامات
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    bio: {
      type: String,
      default: '',
      maxlength: [500, 'السيرة الذاتية طويلة جداً'],
    },
    country: { type: String, default: '' },
    city: { type: String, default: '' },
    role: {
      type: String,
      enum: ['trainee', 'trainer', 'admin'],
      default: 'trainee',
    },
    avatar: { type: String, default: '' },
    followers: [{ type: String }],
    following: [{ type: String }],
    points: { type: Number, default: 0 },
    badges: [{ type: String }],
    coursesCompleted: [{ type: String }],
    certificates: [{ type: String }],
    videosCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    socialLinks: {
      linkedin: { type: String, default: '' },
      twitter: { type: String, default: '' },
      youtube: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        const retObj = ret as Record<string, any>;
        retObj.id = retObj._id.toString();
        delete retObj._id;
        delete retObj.__v;
        delete retObj.password;
        return retObj;
      },
    },
  }
);

// إنشاء index على البريد الإلكتروني للبحث السريع
UserSchema.index({ email: 1 });
UserSchema.index({ level: 1 });
UserSchema.index({ points: -1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
