import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Submission from '@/models/Submission';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== 'trainer' && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const { score, feedback } = await req.json();

    if (score === undefined) {
      return NextResponse.json({ error: 'Score is required' }, { status: 400 });
    }

    await connectDB();

    const query = role === 'admin' ? { _id: id } : { _id: id, instructorId: session.user.id };
    const submission = await Submission.findOne(query);
    
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found or unauthorized' }, { status: 404 });
    }

    submission.score = score;
    submission.feedback = feedback || '';
    submission.status = 'evaluated';
    submission.evaluatedAt = new Date();

    await submission.save();

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    console.error('Update evaluation error:', error);
    return NextResponse.json({ error: 'Failed to update evaluation' }, { status: 500 });
  }
}
