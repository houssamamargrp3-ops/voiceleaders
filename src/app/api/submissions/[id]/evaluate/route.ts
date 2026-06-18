import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Submission from '@/models/Submission';
import { auth } from '@/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (!session?.user || !['admin', 'trainer'].includes(role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { score, feedback } = await request.json();

    if (score === undefined || score < 0 || score > 100) {
      return NextResponse.json({ error: 'التقييم يجب أن يكون بين 0 و 100' }, { status: 400 });
    }

    await connectDB();

    const submission = await Submission.findById(id);
    
    if (!submission) {
      return NextResponse.json({ error: 'الطلب غير موجود' }, { status: 404 });
    }

    // Ensure trainer is the owner of the course (or admin)
    if (role !== 'admin' && submission.instructorId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'لا يمكنك تقييم متدربين في دورات غيرك' }, { status: 403 });
    }

    submission.status = 'evaluated';
    submission.score = score;
    submission.feedback = feedback || '';
    submission.evaluatedAt = new Date();

    await submission.save();

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error('Submission evaluate error:', error);
    return NextResponse.json({ error: 'حدث خطأ داخلي' }, { status: 500 });
  }
}
