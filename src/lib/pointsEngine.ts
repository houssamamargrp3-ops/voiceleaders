/**
 * ─────────────────────────────────────────────
 *  SpeakUp Challenge — Points Engine
 *  محرك نظام النقاط والمستويات الكامل
 * ─────────────────────────────────────────────
 */

// ─── ثوابت النظام ───────────────────────────────

export const POINTS = {
  // المشاركة الأساسية
  JOIN_ROOM              : 5,
  COMPLETE_SPEECH        : 15,
  COMPLETE_SPEECH_CHALLENGE: 25,
  COMPLETE_FULL_ROTATION : 10,
  HOST_ROOM              : 10,

  // التقييم
  SUBMIT_EVALUATION      : 5,
  EVALUATE_ALL_SPEAKERS  : 8,
  WRITE_COMMENT          : 3,   // تعليق +50 حرف

  // المحتوى
  UPLOAD_VIDEO           : 20,
  VIDEO_LIKE_RECEIVED    : 2,
  VIDEO_LIKE_DAILY_MAX   : 40,

  // Streak
  STREAK_3_DAYS          : 30,
  STREAK_7_DAYS          : 150,

  // التحديات
  PARTICIPATE_DAILY      : 30,
  PARTICIPATE_WEEKLY     : 75,
  WIN_CHALLENGE_1ST      : 100,
  WIN_CHALLENGE_2ND      : 60,
  WIN_CHALLENGE_3RD      : 40,
} as const;

// نقاط الأداء حسب المتوسط
export const PERFORMANCE_POINTS: Array<{ min: number; max: number; points: number; label: string }> = [
  { min: 9.0, max: 10.0, points: 50, label: '🔥 استثنائي'   },
  { min: 8.0, max: 8.99, points: 35, label: '⭐ ممتاز'       },
  { min: 7.0, max: 7.99, points: 25, label: '👏 جيد جداً'   },
  { min: 6.0, max: 6.99, points: 15, label: '👍 جيد'         },
  { min: 5.0, max: 5.99, points: 8,  label: '📈 مقبول'       },
  { min: 0,   max: 4.99, points: 3,  label: '💪 شارك وكفى'  },
];

// ─── تعريف المستويات ─────────────────────────────

export type UserLevel = 'seedling' | 'trainee' | 'speaker' | 'pro' | 'expert' | 'leader';

export const LEVELS: Array<{
  key   : UserLevel;
  label : string;
  emoji : string;
  badge : string;
  minPoints: number;
  maxRoomsPerDay: number | null;
  perks : string[];
}> = [
  {
    key  : 'seedling',
    label: 'ناشئ',
    emoji: '🌱',
    badge: 'badge_seedling',
    minPoints: 0,
    maxRoomsPerDay: 3,
    perks: ['الغرف العامة'],
  },
  {
    key  : 'trainee',
    label: 'متدرب',
    emoji: '🌿',
    badge: 'badge_trainee',
    minPoints: 200,
    maxRoomsPerDay: 5,
    perks: ['الغرف العامة', 'إنشاء غرف'],
  },
  {
    key  : 'speaker',
    label: 'متحدث',
    emoji: '🔥',
    badge: 'badge_speaker',
    minPoints: 500,
    maxRoomsPerDay: 8,
    perks: ['الغرف العامة', 'إنشاء غرف', 'الغرف الخاصة'],
  },
  {
    key  : 'pro',
    label: 'محترف',
    emoji: '⭐',
    badge: 'badge_pro',
    minPoints: 1000,
    maxRoomsPerDay: 12,
    perks: ['الغرف العامة', 'إنشاء غرف', 'الغرف الخاصة', 'التحديات الأسبوعية'],
  },
  {
    key  : 'expert',
    label: 'خبير',
    emoji: '💎',
    badge: 'badge_expert',
    minPoints: 2000,
    maxRoomsPerDay: null, // غير محدود
    perks: ['الغرف العامة', 'إنشاء غرف', 'الغرف الخاصة', 'التحديات الأسبوعية', 'تدريب المبتدئين'],
  },
  {
    key  : 'leader',
    label: 'قائد إلقاء',
    emoji: '🏆',
    badge: 'badge_leader',
    minPoints: 3500,
    maxRoomsPerDay: null,
    perks: ['كل الميزات', 'إنشاء تحديات', 'لوحة تحكم المدرب'],
  },
];

// ─── تعريف الشارات ───────────────────────────────

export const BADGES: Array<{
  id      : string;
  emoji   : string;
  name    : string;
  description: string;
  condition : string; // وصف الشرط
}> = [
  { id: 'first_speech',   emoji: '🎤', name: 'أول خطاب',       description: 'أكملت أول جلسة خطابة',         condition: 'sessions >= 1' },
  { id: 'on_fire',        emoji: '🔥', name: 'على النار',       description: '3 أيام تدريب متتالية',          condition: 'streak >= 3' },
  { id: 'active_eval',    emoji: '⚡', name: 'مقيّم نشط',       description: 'قيّمت 50 جلسة',                condition: 'evaluations >= 50' },
  { id: 'week_star',      emoji: '🏅', name: 'متحدث الأسبوع',   description: 'أعلى نقاط في الأسبوع',         condition: 'weekly_rank == 1' },
  { id: 'challenge_star', emoji: '🌟', name: 'نجم التحديات',    description: 'فزت بـ 5 تحديات',              condition: 'challengeWins >= 5' },
  { id: 'king',           emoji: '👑', name: 'ملك المنصة',      description: 'المركز الأول في Leaderboard',   condition: 'global_rank == 1' },
  { id: 'precise',        emoji: '🎯', name: 'دقيق الكلمة',     description: 'متوسط تقييم 9+ في 10 جلسات',   condition: 'avg >= 9 for 10 sessions' },
  { id: 'rocket',         emoji: '🚀', name: 'صاروخ التقدم',    description: 'صعّدت مستويين في أسبوع',       condition: 'level_up x2 in 7 days' },
  { id: 'commenter',      emoji: '💬', name: 'المعلّق البنّاء', description: 'كتبت 100 تعليق مفيد',          condition: 'comments >= 100' },
  { id: 'graduate',       emoji: '🎓', name: 'المتميز',         description: 'أكملت 30 تحدياً',              condition: 'challenges >= 30' },
];

// ─── الدوال الرئيسية ─────────────────────────────

/**
 * حساب نقاط جلسة خطابة
 */
export function calculateSpeechPoints(params: {
  overallAverage : number;
  roomType       : 'practice' | 'challenge' | 'open';
  completedFully : boolean;
  isFullRotation : boolean; // هل أكمل كل الجولة؟
}): { total: number; breakdown: Record<string, number>; performanceLabel: string } {

  const breakdown: Record<string, number> = {};

  // نقاط الإتمام الأساسية
  const baseSpeech = params.roomType === 'challenge'
    ? POINTS.COMPLETE_SPEECH_CHALLENGE
    : POINTS.COMPLETE_SPEECH;

  if (params.completedFully) {
    breakdown['إتمام الخطاب'] = baseSpeech;
  }

  // بونص إتمام الجولة الكاملة
  if (params.isFullRotation) {
    breakdown['إتمام الجولة كاملة'] = POINTS.COMPLETE_FULL_ROTATION;
  }

  // نقاط الأداء
  const perf = PERFORMANCE_POINTS.find(
    (p) => params.overallAverage >= p.min && params.overallAverage <= p.max
  ) ?? PERFORMANCE_POINTS[PERFORMANCE_POINTS.length - 1];

  breakdown[`أداء (${params.overallAverage.toFixed(1)})`] = perf.points;

  const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0);

  return { total, breakdown, performanceLabel: perf.label };
}

/**
 * حساب نقاط التقييم
 */
export function calculateEvaluationPoints(params: {
  evaluatedAll : boolean;
  wroteComment : boolean;  // تعليق +50 حرف
}): { total: number; breakdown: Record<string, number> } {

  const breakdown: Record<string, number> = {
    'تقديم تقييم': POINTS.SUBMIT_EVALUATION,
  };

  if (params.evaluatedAll) {
    breakdown['تقييم الجميع'] = POINTS.EVALUATE_ALL_SPEAKERS;
  }

  if (params.wroteComment) {
    breakdown['تعليق بنّاء'] = POINTS.WRITE_COMMENT;
  }

  const total = Object.values(breakdown).reduce((sum, v) => sum + v, 0);
  return { total, breakdown };
}

/**
 * تحديد مستوى المستخدم من النقاط
 */
export function getLevelFromPoints(points: number): typeof LEVELS[number] {
  // نبحث من الأعلى للأدنى
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}

/**
 * هل ترقّى المستخدم؟
 */
export function checkLevelUp(
  oldPoints: number,
  newPoints: number
): { leveledUp: boolean; oldLevel: typeof LEVELS[number]; newLevel: typeof LEVELS[number] } {
  const oldLevel = getLevelFromPoints(oldPoints);
  const newLevel = getLevelFromPoints(newPoints);
  return {
    leveledUp: newLevel.key !== oldLevel.key,
    oldLevel,
    newLevel,
  };
}

/**
 * النقاط المطلوبة للمستوى التالي
 */
export function pointsToNextLevel(currentPoints: number): {
  nextLevel   : typeof LEVELS[number] | null;
  pointsNeeded: number;
  progress    : number; // 0–100%
} {
  const currentLevel = getLevelFromPoints(currentPoints);
  const currentIndex = LEVELS.findIndex((l) => l.key === currentLevel.key);
  const nextLevel    = LEVELS[currentIndex + 1] ?? null;

  if (!nextLevel) {
    return { nextLevel: null, pointsNeeded: 0, progress: 100 };
  }

  const pointsNeeded = nextLevel.minPoints - currentPoints;
  const rangeTotal   = nextLevel.minPoints - currentLevel.minPoints;
  const rangeEarned  = currentPoints       - currentLevel.minPoints;
  const progress     = Math.min(100, Math.round((rangeEarned / rangeTotal) * 100));

  return { nextLevel, pointsNeeded, progress };
}

/**
 * تحقق من الشارات المكتسبة حديثاً
 */
export function checkNewBadges(params: {
  currentBadges : string[];
  streakDays    : number;
  totalSessions : number;
  totalEvaluations: number;
  challengeWins : number;
  totalChallenges: number;
}): string[] {

  const newBadges: string[] = [];
  const owned = new Set(params.currentBadges);

  const check = (id: string, condition: boolean) => {
    if (condition && !owned.has(id)) newBadges.push(id);
  };

  check('first_speech',   params.totalSessions     >= 1);
  check('on_fire',        params.streakDays         >= 3);
  check('active_eval',    params.totalEvaluations   >= 50);
  check('challenge_star', params.challengeWins       >= 5);
  check('graduate',       params.totalChallenges     >= 30);

  return newBadges;
}
