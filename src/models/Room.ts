import mongoose, { Document, Model, Schema } from 'mongoose';

// ─────────────────────────────────────────────
//  Sub-document: مشارك داخل الغرفة
// ─────────────────────────────────────────────
export interface IRoomParticipant {
  userId: mongoose.Types.ObjectId;
  name: string;
  avatar?: string;
  role: 'speaker' | 'evaluator' | 'audience';
  joinedAt: Date;
}

// ─────────────────────────────────────────────
//  الـ Interface الرئيسي للغرفة
// ─────────────────────────────────────────────
export interface IRoom extends Document {
  _id: mongoose.Types.ObjectId;

  /** اسم الغرفة أو موضوعها */
  name: string;
  topic: string;
  description?: string;

  /** المضيف */
  hostId: mongoose.Types.ObjectId;
  hostName: string;

  /** المشاركون الحاليون في الغرفة */
  participants: IRoomParticipant[];

  /** أقصى عدد للمشاركين */
  maxParticipants: number;

  /** نوع الغرفة */
  type: 'practice' | 'challenge' | 'open';

  /** حالة الغرفة */
  status: 'waiting' | 'live' | 'ended';

  /** مدة الجلسة المحددة بالدقائق (اختياري) */
  durationMinutes?: number;

  /** نقاط المكافأة عند إتمام الغرفة */
  pointsReward: number;

  /** رمز الدخول (للغرف الخاصة) */
  accessCode?: string;
  isPrivate: boolean;

  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────
//  Schema
// ─────────────────────────────────────────────
const RoomParticipantSchema = new Schema<IRoomParticipant>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    avatar: { type: String, default: '' },
    role: {
      type: String,
      enum: ['speaker', 'evaluator', 'audience'],
      default: 'audience',
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: false } // لا نحتاج _id لكل مشارك
);

const RoomSchema = new Schema<IRoom>(
  {
    name: {
      type: String,
      required: [true, 'اسم الغرفة مطلوب'],
      trim: true,
      maxlength: [100, 'اسم الغرفة طويل جداً'],
    },
    topic: {
      type: String,
      required: [true, 'موضوع الغرفة مطلوب'],
      trim: true,
      maxlength: [200, 'الموضوع طويل جداً'],
    },
    description: { type: String, default: '', maxlength: 500 },

    hostId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    hostName: { type: String, required: true },

    participants: [RoomParticipantSchema],
    maxParticipants: {
      type: Number,
      default: 6,
      min: [2, 'يجب أن تكون الغرفة لمشاركَين على الأقل'],
      max: [20, 'الحد الأقصى 20 مشاركاً'],
    },

    type: {
      type: String,
      enum: ['practice', 'challenge', 'open'],
      default: 'open',
    },

    status: {
      type: String,
      enum: ['waiting', 'live', 'ended'],
      default: 'waiting',
    },

    durationMinutes: { type: Number, min: 5, max: 120 },
    pointsReward: { type: Number, default: 10 },

    accessCode: { type: String, default: '' },
    isPrivate: { type: Boolean, default: false },

    startedAt: { type: Date },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────
//  Indexes للبحث السريع
// ─────────────────────────────────────────────
RoomSchema.index({ status: 1, createdAt: -1 }); // الغرف الحية أولاً
RoomSchema.index({ hostId: 1 });                // غرف مستخدم معين
RoomSchema.index({ type: 1, status: 1 });       // تصفية بالنوع والحالة

// ─────────────────────────────────────────────
//  Virtual: عدد المشاركين الحاليين
// ─────────────────────────────────────────────
RoomSchema.virtual('participantsCount').get(function () {
  return this.participants.length;
});

// ─────────────────────────────────────────────
//  Virtual: هل الغرفة ممتلئة؟
// ─────────────────────────────────────────────
RoomSchema.virtual('isFull').get(function () {
  return this.participants.length >= this.maxParticipants;
});

const Room: Model<IRoom> =
  mongoose.models.Room || mongoose.model<IRoom>('Room', RoomSchema);

export default Room;
