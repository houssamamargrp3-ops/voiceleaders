import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Challenge from '@/models/Challenge';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== 'trainer' && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();

    const query = role === 'admin' ? {} : { instructorId: session.user.id };
    const challenges = await Challenge.find(query).sort({ createdAt: -1 }).lean();

    // Map challenges to include id string instead of _id
    const mapped = challenges.map((c: any) => ({
      ...c,
      id: c._id.toString(),
      _id: undefined,
      instructorId: c.instructorId.toString(),
    }));

    return NextResponse.json({ success: true, challenges: mapped });
  } catch (error) {
    console.error('Fetch challenges error:', error);
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== 'trainer' && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const data = await req.json();
    await connectDB();

    const challenge = new Challenge({
      ...data,
      instructorId: session.user.id,
    });

    await challenge.save();

    return NextResponse.json({ success: true, challenge });
  } catch (error) {
    console.error('Create challenge error:', error);
    return NextResponse.json({ error: 'Failed to create challenge' }, { status: 500 });
  }
}
