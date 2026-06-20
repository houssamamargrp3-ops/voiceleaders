import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Challenge from '@/models/Challenge';

/**
 * GET /api/trainer/challenges
 * جلب تحديات المدرب
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== 'trainer' && role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  // Admin يرى الكل، Trainer يرى ما أنشأه فقط
  const query = role === 'admin' ? {} : { createdBy: session.user.id };
  const challenges = await Challenge.find(query).sort({ createdAt: -1 }).lean();

  const mapped = challenges.map((c: any) => ({
    ...c,
    id: c._id.toString(),
    createdBy: c.createdBy?.toString(),
    _id: undefined,
  }));

  return NextResponse.json({ success: true, challenges: mapped });
}

/**
 * POST /api/trainer/challenges
 * إنشاء تحدي جديد
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== 'trainer' && role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const data = await req.json();
  const { title, description, prompt, difficulty, type, deadline, pointsReward,
    minDurationSeconds, maxDurationSeconds, tags, prize, retakeAfterDays, status } = data;

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
    status: status || 'upcoming',
    pointsReward: pointsReward || 50,
    minDurationSeconds: minDurationSeconds || 60,
    maxDurationSeconds: maxDurationSeconds || 300,
    tags: tags || [],
    prize: prize || '',
    retakeAfterDays: retakeAfterDays || 7,
  });

  return NextResponse.json({ success: true, challenge }, { status: 201 });
}
