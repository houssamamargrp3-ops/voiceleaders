import mongoose, { Document, Model, Schema } from 'mongoose';

// ─────────────────────────────────────────────
//  Sub-document: تعليق على المنشور
// ─────────────────────────────────────────────
export interface IComment {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  avatar?: string;
  text: string;
  createdAt: Date;
}

// ─────────────────────────────────────────────
//  الـ Interface الرئيسي للمنشور
// ─────────────────────────────────────────────
export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;

  /** صاحب المنشور */
  userId: mongoose.Types.ObjectId;
  userName: string;
  userAvatar?: string;
  userLevel: string;

  /** المحتوى */
  title: string;
  caption?: string;

  /** رابط الفيديو (مطلوب) */
  videoUrl: string;

  /** صورة مصغرة للفيديو */
  thumbnailUrl?: string;

  /** مدة الفيديو (مثال: "2:34") */
  videoDuration?: string;

  /** الإعجابات — قائمة بـ ObjectId للمستخدمين الذين أعجبهم */
  likes: mongoose.Types.ObjectId[];

  /** عدد الإعجابات (مخزّن لأداء أفضل) */
  likesCount: number;

  /** التعليقات */
  comments: IComment[];

  /** عدد المشاهدات */
  views: number;

  /** الوسوم */
  tags: string[];

  /** هل المنشور مرتبط بتحدي معين؟ */
  challengeId?: mongoose.Types.ObjectId;

  /** هل مرتبط بجلسة في غرفة؟ */
  sessionId?: mongoose.Types.ObjectId;

  /** نوع المنشور */
  type: 'speech' | 'tip' | 'challenge_entry' | 'highlight';

  /** هل المنشور موجود؟ (soft delete) */
  isActive: boolean;

  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────
//  Schema
// ─────────────────────────────────────────────
const CommentSchema = new Schema<IComment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    avatar: { type: String, default: '' },
    text: {
      type: String,
      required: [true, 'نص التعليق مطلوب'],
      maxlength: [500, 'التعليق طويل جداً'],
      trim: true,
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const PostSchema = new Schema<IPost>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'معرف المستخدم مطلوب'],
    },
    userName:  { type: String, required: true },
    userAvatar:{ type: String, default: '' },
    userLevel: { type: String, default: 'beginner' },

    title: {
      type: String,
      required: [true, 'عنوان المنشور مطلوب'],
      trim: true,
      maxlength: [150, 'العنوان طويل جداً'],
    },
    caption: {
      type: String,
      default: '',
      maxlength: [2000, 'الوصف طويل جداً'],
    },

    videoUrl: {
      type: String,
      required: [true, 'رابط الفيديو مطلوب'],
      trim: true,
    },
    thumbnailUrl: { type: String, default: '' },
    videoDuration: { type: String, default: '' },

    likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    likesCount: { type: Number, default: 0 },

    comments: [CommentSchema],

    views: { type: Number, default: 0 },

    tags: [{ type: String, trim: true, lowercase: true }],

    challengeId: { type: Schema.Types.ObjectId, ref: 'Challenge', default: null },
    sessionId:   { type: Schema.Types.ObjectId, ref: 'Session',   default: null },

    type: {
      type: String,
      enum: ['speech', 'tip', 'challenge_entry', 'highlight'],
      default: 'speech',
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────
//  Middleware: تحديث likesCount تلقائياً
// ─────────────────────────────────────────────
PostSchema.pre('save', function (next) {
  this.likesCount = this.likes.length;
  next();
});

// ─────────────────────────────────────────────
//  Indexes
// ─────────────────────────────────────────────
PostSchema.index({ userId: 1, createdAt: -1 });   // منشورات مستخدم
PostSchema.index({ likesCount: -1 });              // الأكثر إعجاباً
PostSchema.index({ views: -1 });                   // الأكثر مشاهدة
PostSchema.index({ challengeId: 1 });              // منشورات تحدي معين
PostSchema.index({ tags: 1 });                     // البحث بالوسوم
PostSchema.index({ createdAt: -1, isActive: 1 }); // الفيد الزمني

// ─────────────────────────────────────────────
//  Virtual: عدد التعليقات
// ─────────────────────────────────────────────
PostSchema.virtual('commentsCount').get(function () {
  return this.comments.length;
});

const Post: Model<IPost> =
  mongoose.models.Post || mongoose.model<IPost>('Post', PostSchema);

export default Post;
