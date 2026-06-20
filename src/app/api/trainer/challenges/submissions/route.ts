import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import ChallengeSubmission from '@/models/ChallengeSubmission';
import Challenge from '@/models/Challenge';
import User from '@/models/User';

/**
 * GET /api/trainer/challenges/submissions
 * جلب جميع مشاركات التحديات للمراجعة (للمدربين)
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== 'trainer' && role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  await connectDB();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'pending';
  const challengeId = searchParams.get('challengeId') || '';

  // جلب التحديات التي أنشأها هذا المدرب
  const trainerChallenges = role === 'admin'
    ? await Challenge.find({}).select('_id').lean()
    : await Challenge.find({ createdBy: session.user.id }).select('_id').lean();

  const challengeIds = trainerChallenges.map((c: any) => c._id);

  const filter: Record<string, any> = { challengeId: { $in: challengeIds } };
  if (status && ['pending', 'approved', 'rejected'].includes(status)) filter.status = status;
  if (challengeId) filter.challengeId = challengeId;

  const submissions = await ChallengeSubmission.find(filter)
    .populate('challengeId', 'title pointsReward')
    .sort({ createdAt: -1 })
    .lean();

  const mapped = submissions.map((s: any) => ({
    ...s,
    id: s._id.toString(),
    challengeId: s.challengeId?._id?.toString() || s.challengeId?.toString(),
    challengeTitle: s.challengeId?.title || '',
    pointsReward: s.challengeId?.pointsReward || 0,
    userId: s.userId.toString(),
    voters: undefined,
    _id: undefined,
  }));

  return NextResponse.json({ success: true, submissions: mapped });
}

/**
 * PATCH /api/trainer/challenges/submissions
 * قبول أو رفض مشاركة + منح النقاط
 */
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const role = (session.user as any).role;
  if (role !== 'trainer' && role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { submissionId, action, feedback } = await req.json();
  if (!submissionId || !['approved', 'rejected'].includes(action)) {
    return NextResponse.json({ error: 'البيانات غير صحيحة' }, { status: 400 });
  }

  await connectDB();

  const submission = await ChallengeSubmission.findById(submissionId);
  if (!submission) return NextResponse.json({ error: 'المشاركة غير موجودة' }, { status: 404 });

  // جلب التحدي للحصول على النقاط
  const challenge = await Challenge.findById(submission.challengeId);
  const pointsToAward = action === 'approved' ? (challenge?.pointsReward || 50) : 0;

  // تحديث المشاركة
  submission.status = action;
  submission.trainerFeedback = feedback || '';
  submission.pointsAwarded = pointsToAward;
  await submission.save();

  // إذا تم القبول: منح النقاط للمتدرب
  if (action === 'approved') {
    await User.findByIdAndUpdate(submission.userId, {
      $inc: { points: pointsToAward },
    });
  }

  return NextResponse.json({ success: true, pointsAwarded: pointsToAward });
}
