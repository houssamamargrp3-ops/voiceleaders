import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Submission from '@/models/Submission';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== 'trainer' && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    const submissions = await Submission.find({ instructorId: session.user.id })
      .populate('userId', 'name email avatar level')
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Fetch evaluations error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
