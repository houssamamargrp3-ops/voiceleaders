import mongoose, { Document, Model, Schema } from 'mongoose';

// ─────────────────────────────────────────────
//  Sub-document: تقييم واحد من مقيِّم
// ─────────────────────────────────────────────
export interface IScoreEntry {
  evaluatorId: mongoose.Types.ObjectId;
  evaluatorName: string;

  /** وضوح الفكرة وتسلسلها */
  clarity: number;       // 1–10

  /** مستوى الثقة بالنفس */
  confidence: number;    // 1–10

  /** تنظيم الخطاب (مقدمة / جسم / خاتمة) */
  structure: number;     // 1–10

  /** مدى تفاعل الجمهور */
  engagement: number;    // 1–10

  /** المتوسط المحسوب تلقائياً */
  average: number;

  /** تعليق نصي اختياري */
  comment?: string;

  submittedAt: Date;
}

// ─────────────────────────────────────────────
//  الـ Interface الرئيسي للجلسة
// ─────────────────────────────────────────────
export interface ISession extends Document {
  _id: mongoose.Types.ObjectId;

  /** الغرفة التي جرت فيها الجلسة */
  roomId: mongoose.Types.ObjectId;

  /** المتحدث في هذه الجلسة */
  speakerId: mongoose.Types.ObjectId;
  speakerName: string;

  /** الموضوع الذي تحدث عنه */
  topic: string;

  /** مدة الخطاب الفعلية بالثواني */
  durationSeconds: number;

  /** جميع التقييمات من المقيِّمين */
  scores: IScoreEntry[];

  /** المتوسط الكلي لجميع التقييمات */
  overallAverage: number;

  /** النقاط المكتسبة من هذه الجلسة */
  pointsEarned: number;

  /** هل أنهى المتحدث جلسته كاملةً؟ */
  completed: boolean;

  /** رابط تسجيل الجلسة (اختياري) */
  recordingUrl?: string;

  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// ─────────────────────────────────────────────
//  Schema
// ─────────────────────────────────────────────
const ScoreEntrySchema = new Schema<IScoreEntry>(
  {
    evaluatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    evaluatorName: { type: String, required: true },

    clarity:    { type: Number, required: true, min: 1, max: 10 },
    confidence: { type: Number, required: true, min: 1, max: 10 },
    structure:  { type: Number, required: true, min: 1, max: 10 },
    engagement: { type: Number, required: true, min: 1, max: 10 },

    average: { type: Number, default: 0 },

    comment: { type: String, default: '', maxlength: 1000 },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// حساب المتوسط تلقائياً قبل الحفظ
ScoreEntrySchema.pre('save', function (next: any) {
  this.average =
    (this.clarity + this.confidence + this.structure + this.engagement) / 4;
  next();
});

const SessionSchema = new Schema<ISession>(
  {
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      required: [true, 'معرف الغرفة مطلوب'],
    },

    speakerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'معرف المتحدث مطلوب'],
    },
    speakerName: { type: String, required: true },

    topic: {
      type: String,
      required: [true, 'موضوع الجلسة مطلوب'],
      trim: true,
      maxlength: 200,
    },

    durationSeconds: { type: Number, default: 0, min: 0 },

    scores: [ScoreEntrySchema],

    overallAverage: { type: Number, default: 0 },

    pointsEarned: { type: Number, default: 0 },

    completed: { type: Boolean, default: false },

    recordingUrl: { type: String, default: '' },

    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

// ─────────────────────────────────────────────
//  Middleware: حساب overallAverage عند إضافة score
// ─────────────────────────────────────────────
SessionSchema.pre('save', function (next: any) {
  if (this.scores && this.scores.length > 0) {
    const total = this.scores.reduce((sum, s) => sum + s.average, 0);
    this.overallAverage = parseFloat((total / this.scores.length).toFixed(2));

    // النقاط = المتوسط * 10 (يمكن تعديل الخوارزمية لاحقاً)
    this.pointsEarned = Math.round(this.overallAverage * 10);
  }
  next();
});

// ─────────────────────────────────────────────
//  Virtual: مدة الجلسة بالدقائق
// ─────────────────────────────────────────────
SessionSchema.virtual('durationMinutes').get(function () {
  return parseFloat((this.durationSeconds / 60).toFixed(1));
});

// ─────────────────────────────────────────────
//  Indexes
// ─────────────────────────────────────────────
SessionSchema.index({ roomId: 1 });
SessionSchema.index({ speakerId: 1, createdAt: -1 });
SessionSchema.index({ overallAverage: -1 });
SessionSchema.index({ pointsEarned: -1 });

const Session: Model<ISession> =
  mongoose.models.Session || mongoose.model<ISession>('Session', SessionSchema);

export default Session;
