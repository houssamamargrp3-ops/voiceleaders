import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import User from '@/models/User';

/**
 * GET /api/leaderboard
 * ─────────────────────────────────────────────
 * جلب قائمة المتصدرين مرتبة حسب النقاط
 *
 * Query Params:
 *   limit?  : number — عدد النتائج (افتراضي: 20، أقصى: 100)
 *   level?  : 'beginner' | 'intermediate' | 'advanced' — تصفية بالمستوى
 *   period? : 'all' | 'weekly' | 'monthly' — الفترة الزمنية (افتراضي: 'all')
 *
 * الاستجابة:
 *   200: { success, leaderboard: [{ rank, id, name, points, level, avatar, badge }] }
 *   500: { error }
 *
 * ملاحظة: 'period' مدعوم بشكل كامل عند إضافة حقل weeklyPoints/monthlyPoints
 *         في نموذج User. حالياً يُرتّب بـ points الإجمالية.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit  = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
  const level  = searchParams.get('level') || '';

  await connectDB();

  // بناء الفلتر
  const filter: Record<string, unknown> = {};
  if (level && ['beginner', 'intermediate', 'advanced'].includes(level)) {
    filter.level = level;
  }

  // جلب المتصدرين
  const users = await User.find(filter)
    .select('name avatar level points badges')
    .sort({ points: -1 })
    .limit(limit)
    .lean();

  // تحويل النتائج وإضافة الترتيب
  const leaderboard = users.map((u, index) => ({
    rank  : index + 1,
    id    : u._id.toString(),
    name  : u.name,
    avatar: u.avatar || '',
    level : u.level,
    points: u.points,
    badge : (u.badges as string[])?.[0] || null, // الشارة الأولى (الأهم)
  }));

  return NextResponse.json({ success: true, leaderboard, total: users.length });
}
