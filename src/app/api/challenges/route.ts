import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Challenge from '@/models/Challenge';

/**
 * GET /api/challenges
 * ─────────────────────────────────────────────
 * جلب التحديات المتاحة (عامة — بدون تسجيل دخول)
 *
 * Query Params:
 *   status?     : 'active' | 'upcoming' | 'closed' (افتراضي: 'active')
 *   type?       : 'daily' | 'weekly' | 'special'
 *   difficulty? : 'easy' | 'medium' | 'hard'
 *   limit?      : number (افتراضي: 10)
 *   page?       : number (افتراضي: 1)
 *
 * الاستجابة:
 *   200: { success, challenges, pagination }
 *   500: { error }
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status     = searchParams.get('status')     || 'active';
  const type       = searchParams.get('type')       || '';
  const difficulty = searchParams.get('difficulty') || '';
  const limit      = parseInt(searchParams.get('limit') || '10');
  const page       = parseInt(searchParams.get('page')  || '1');

  await connectDB();

  // بناء الفلتر
  const filter: Record<string, unknown> = {};
  if (['active', 'upcoming', 'closed'].includes(status)) filter.status = status;
  if (['daily', 'weekly', 'special'].includes(type))      filter.type   = type;
  if (['easy', 'medium', 'hard'].includes(difficulty))    filter.difficulty = difficulty;

  const [challenges, total] = await Promise.all([
    Challenge.find(filter)
      .select('-__v')
      .sort({ deadline: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Challenge.countDocuments(filter),
  ]);

  // تحويل ObjectId إلى string
  const mapped = challenges.map((c) => ({
    ...c,
    id        : c._id.toString(),
    createdBy : c.createdBy.toString(),
    _id       : undefined,
  }));

  return NextResponse.json({
    success: true,
    challenges: mapped,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}

/**
 * POST /api/challenges
 * ─────────────────────────────────────────────
 * إنشاء تحدي جديد (للمدربين والمشرفين فقط)
 *
 * الـ Body المطلوب:
 *   title           : string
 *   description     : string
 *   prompt          : string — الموضوع المحدد
 *   difficulty      : 'easy' | 'medium' | 'hard'
 *   type            : 'daily' | 'weekly' | 'special'
 *   deadline        : string (ISO date)
 *   pointsReward?   : number
 *   minDurationSeconds?: number
 *   maxDurationSeconds?: number
 *   tags?           : string[]
 *   prize?          : string
 */
export async function POST(request: NextRequest) {
  // الـ import داخلي لتجنب مشاكل circular imports
  const { auth } = await import('@/auth');
  const session = await auth();

  // فقط المدربون والمشرفون يمكنهم إنشاء تحديات
  const userRole = (session?.user as { role?: string })?.role;
  if (!session?.user?.id || !['trainer', 'admin'].includes(userRole || '')) {
    return NextResponse.json(
      { error: 'يجب أن تكون مدرباً أو مشرفاً لإنشاء تحدي' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { title, description, prompt, difficulty, type, deadline, pointsReward,
          minDurationSeconds, maxDurationSeconds, tags, prize } = body;

  if (!title?.trim() || !description?.trim() || !prompt?.trim() || !deadline) {
    return NextResponse.json(
      { error: 'العنوان، الوصف، الموضوع، وتاريخ الانتهاء مطلوبون' },
      { status: 400 }
    );
  }

  await connectDB();

  const challenge = await Challenge.create({
    title: title.trim(),
    description: description.trim(),
    prompt: prompt.trim(),
    difficulty: difficulty || 'medium',
    type: type || 'daily',
    createdBy: session.user.id,
    deadline: new Date(deadline),
    status: 'upcoming',
    pointsReward: pointsReward || 50,
    minDurationSeconds: minDurationSeconds || 60,
    maxDurationSeconds: maxDurationSeconds || 300,
    tags: tags || [],
    prize: prize || '',
  });

  return NextResponse.json({ success: true, challenge }, { status: 201 });
}
