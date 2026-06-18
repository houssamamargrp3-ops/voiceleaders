import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Challenge from '@/models/Challenge';
import { mockChallenges } from '@/lib/mockData';

export async function GET() {
  try {
    await connectDB();
    const challenges = await Challenge.find().sort({ createdAt: -1 }).lean();

    // Map challenges
    const mapped = challenges.map((c: any) => ({
      ...c,
      id: c._id.toString(),
      _id: undefined,
      instructorId: c.instructorId.toString(),
    }));

    // For demonstration, we merge with mockChallenges if the DB is empty
    // so the UI doesn't look empty before trainers add real ones.
    const allChallenges = mapped.length > 0 ? mapped : mockChallenges;

    return NextResponse.json({ success: true, challenges: allChallenges });
  } catch (error) {
    console.error('Fetch public challenges error:', error);
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 });
  }
}
