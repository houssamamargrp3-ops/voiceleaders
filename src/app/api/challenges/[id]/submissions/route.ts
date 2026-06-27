import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ChallengeSubmission from '@/models/ChallengeSubmission';
import Challenge from '@/models/Challenge';

/**
 * GET /api/challenges/[id]/submissions
 * جلب المشاركات في تحدي معين
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();

  const submissions = await ChallengeSubmission.find({ challengeId: id, status: 'approved' })
    .sort({ votes: -1 })
    .lean();

  const mapped = submissions.map((s: any) => ({
    ...s,
    id: s._id.toString(),
    challengeId: s.challengeId.toString(),
    userId: s.userId.toString(),
    voters: undefined,
    _id: undefined,
  }));

  return NextResponse.json({ success: true, submissions: mapped });
}

/**
 * POST /api/challenges/[id]/submissions
 * رفع مشاركة في تحدي
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { auth } = await import('@/auth');
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const challenge = await Challenge.findById(id);
  if (!challenge) {
    return NextResponse.json({ error: 'التحدي غير موجود' }, { status: 404 });
  }
  if (challenge.status !== 'active') {
    return NextResponse.json({ error: 'هذا التحدي غير مفتوح للمشاركة حالياً' }, { status: 400 });
  }

  // التحقق من مشاركة سابقة
  const existing = await ChallengeSubmission.findOne({ challengeId: id, userId: session.user.id });
  if (existing) {
    return NextResponse.json({ error: 'لقد شاركت في هذا التحدي مسبقاً' }, { status: 400 });
  }

  const body = await request.json();
  const { videoUrl, durationSeconds, note } = body;

  if (!videoUrl?.trim()) {
    return NextResponse.json({ error: 'رابط الفيديو مطلوب' }, { status: 400 });
  }

  // التحقق من مدة الفيديو
  if (challenge.minDurationSeconds && durationSeconds < challenge.minDurationSeconds) {
    return NextResponse.json({
      error: `مدة الفيديو يجب أن تكون على الأقل ${challenge.minDurationSeconds} ثانية`
    }, { status: 400 });
  }
  if (challenge.maxDurationSeconds && durationSeconds > challenge.maxDurationSeconds) {
    return NextResponse.json({
      error: `مدة الفيديو لا يجب أن تتجاوز ${challenge.maxDurationSeconds} ثانية`
    }, { status: 400 });
  }

  const submission = await ChallengeSubmission.create({
    challengeId: id,
    userId: session.user.id,
    userName: session.user.name || 'مجهول',
    videoUrl: videoUrl.trim(),
    durationSeconds: durationSeconds || 0,
    note: note?.trim() || '',
    status: 'pending',
  });

  // زيادة عدد المشاركين في التحدي
  await Challenge.findByIdAndUpdate(id, { $inc: { participantsCount: 1 } });

  // Add points to the user for participating in a challenge
  const User = (await import('@/models/User')).default;
  await User.findByIdAndUpdate(session.user.id, { $inc: { points: 15 } });

  return NextResponse.json({ success: true, submission }, { status: 201 });
}
