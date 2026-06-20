import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IChallengeSubmission extends Document {
  _id: mongoose.Types.ObjectId;

  /** معرف التحدي */
  challengeId: mongoose.Types.ObjectId;

  /** معرف المتدرب */
  userId: mongoose.Types.ObjectId;

  /** اسم المتدرب (cached) */
  userName: string;

  /** رابط الفيديو المرفوع */
  videoUrl: string;

  /** مدة الفيديو بالثواني */
  durationSeconds: number;

  /** ملاحظة المتدرب (اختياري) */
  note?: string;

  /** حالة التقييم */
  status: 'pending' | 'approved' | 'rejected';

  /** النقاط الممنوحة (بعد الموافقة) */
  pointsAwarded: number;

  /** تعليق المدرب */
  trainerFeedback?: string;

  /** عدد الأصوات من المجتمع */
  votes: number;

  /** قائمة المصوّتين (لمنع التصويت المزدوج) */
  voters: mongoose.Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;
}

const ChallengeSubmissionSchema = new Schema<IChallengeSubmission>(
  {
    challengeId: {
      type: Schema.Types.ObjectId,
      ref: 'Challenge',
      required: [true, 'معرف التحدي مطلوب'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'معرف المستخدم مطلوب'],
    },
    userName: { type: String, required: true },
    videoUrl: {
      type: String,
      required: [true, 'رابط الفيديو مطلوب'],
    },
    durationSeconds: { type: Number, default: 0 },
    note: { type: String, default: '', maxlength: 500 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    pointsAwarded: { type: Number, default: 0 },
    trainerFeedback: { type: String, default: '' },
    votes: { type: Number, default: 0 },
    voters: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

// فهرس للبحث السريع
ChallengeSubmissionSchema.index({ challengeId: 1, status: 1 });
ChallengeSubmissionSchema.index({ challengeId: 1, votes: -1 });
ChallengeSubmissionSchema.index({ userId: 1, challengeId: 1 }, { unique: true });

const ChallengeSubmission: Model<IChallengeSubmission> =
  mongoose.models.ChallengeSubmission ||
  mongoose.model<IChallengeSubmission>('ChallengeSubmission', ChallengeSubmissionSchema);

export default ChallengeSubmission;
