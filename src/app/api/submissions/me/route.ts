import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Submission from '@/models/Submission';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();

    // Fetch submissions for the current user
    const submissions = await Submission.find({ userId: session.user.id })
      .populate('courseId', 'title thumbnail')
      .populate('instructorId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, submissions });
  } catch (error) {
    console.error('Fetch my submissions error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
