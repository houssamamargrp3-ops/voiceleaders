import mongoose, { Document, Model, Schema } from 'mongoose';

// ─────────────────────────────────────────────
//  الـ Interface
// ─────────────────────────────────────────────
export interface IChallenge extends Document {
  _id: mongoose.Types.ObjectId;

  /** عنوان التحدي */
  title: string;

  /** وصف تفصيلي للتحدي */
  description: string;

  /** الموضوع المحدد للتحدي (مثال: "تحدث عن قيمة وقتك لمدة دقيقتين") */
  prompt: string;

  /** الصعوبة */
  difficulty: 'easy' | 'medium' | 'hard';

  /** نوع التحدي */
  type: 'daily' | 'weekly' | 'special';

  /** المنشئ (admin / trainer) */
  createdBy: mongoose.Types.ObjectId;

  /** حالة التحدي */
  status: 'upcoming' | 'active' | 'closed';

  /** تاريخ انتهاء التحدي */
  deadline: Date;

  /** الجائزة (نص توصيفي) */
  prize?: string;

  /** النقاط الممنوحة عند إتمام التحدي */
  pointsReward: number;

  /** عدد المشاركين */
  participantsCount: number;

  /** الحد الأدنى لمدة الخطاب بالثواني */
  minDurationSeconds?: number;

  /** الحد الأقصى لمدة الخطاب بالثواني */
  maxDurationSeconds?: number;

  /** الوسوم */
  tags: string[];

  /** صورة أو banner للتحدي */
  coverImage?: string;

  /** عدد أيام الانتظار قبل إعادة المحاولة */
  retakeAfterDays: number;

  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────
//  Schema
// ─────────────────────────────────────────────
const ChallengeSchema = new Schema<IChallenge>(
  {
    title: {
      type: String,
      required: [true, 'عنوان التحدي مطلوب'],
      trim: true,
      maxlength: [150, 'العنوان طويل جداً'],
    },

    description: {
      type: String,
      required: [true, 'وصف التحدي مطلوب'],
      maxlength: [2000, 'الوصف طويل جداً'],
    },

    prompt: {
      type: String,
      required: [true, 'موضوع التحدي مطلوب'],
      trim: true,
      maxlength: [500, 'الموضوع طويل جداً'],
    },

    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },

    type: {
      type: String,
      enum: ['daily', 'weekly', 'special'],
      default: 'daily',
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'منشئ التحدي مطلوب'],
    },

    status: {
      type: String,
      enum: ['upcoming', 'active', 'closed'],
      default: 'upcoming',
    },

    deadline: {
      type: Date,
      required: [true, 'تاريخ انتهاء التحدي مطلوب'],
    },

    prize: { type: String, default: '' },

    pointsReward: { type: Number, default: 50, min: 0 },

    participantsCount: { type: Number, default: 0 },

    minDurationSeconds: { type: Number, default: 60 },  // دقيقة كحد أدنى
    maxDurationSeconds: { type: Number, default: 300 }, // 5 دقائق كحد أقصى

    tags: [{ type: String, trim: true, lowercase: true }],

    coverImage: { type: String, default: '' },

    retakeAfterDays: { type: Number, default: 7 },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────
//  Indexes
// ─────────────────────────────────────────────
ChallengeSchema.index({ status: 1, deadline: 1 });     // التحديات الفعّالة
ChallengeSchema.index({ type: 1, status: 1 });         // تحديات يومية / أسبوعية
ChallengeSchema.index({ createdBy: 1 });               // تحديات منشئ معين
ChallengeSchema.index({ deadline: 1 });                // للتنظيف التلقائي
ChallengeSchema.index({ tags: 1 });                    // البحث بالوسوم

// ─────────────────────────────────────────────
//  Virtual: هل التحدي منتهٍ؟
// ─────────────────────────────────────────────
ChallengeSchema.virtual('isExpired').get(function () {
  return new Date() > this.deadline;
});

const ChallengeModel: Model<IChallenge> =
  mongoose.models.Challenge ||
  mongoose.model<IChallenge>('Challenge', ChallengeSchema);

export default ChallengeModel;
