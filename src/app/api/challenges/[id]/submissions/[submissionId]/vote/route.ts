import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import ChallengeSubmission from '@/models/ChallengeSubmission';

/**
 * POST /api/challenges/[id]/submissions/[submissionId]/vote
 * التصويت على مشاركة (مرة واحدة لكل مستخدم)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; submissionId: string }> }
) {
  const { auth } = await import('@/auth');
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول أولاً' }, { status: 401 });
  }

  const { submissionId } = await params;
  await connectDB();

  const submission = await ChallengeSubmission.findById(submissionId);
  if (!submission) {
    return NextResponse.json({ error: 'المشاركة غير موجودة' }, { status: 404 });
  }

  const userId = session.user.id;
  const hasVoted = submission.voters.some((v: any) => v.toString() === userId);

  if (hasVoted) {
    // إلغاء التصويت
    await ChallengeSubmission.findByIdAndUpdate(submissionId, {
      $pull: { voters: userId },
      $inc: { votes: -1 },
    });
    return NextResponse.json({ success: true, action: 'unvoted' });
  } else {
    // إضافة تصويت
    await ChallengeSubmission.findByIdAndUpdate(submissionId, {
      $addToSet: { voters: userId },
      $inc: { votes: 1 },
    });
    return NextResponse.json({ success: true, action: 'voted' });
  }
}
