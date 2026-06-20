import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Room from '@/models/Room';

/**
 * GET /api/rooms
 * جلب قائمة الغرف العامة النشطة
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'waiting,live';
  const type   = searchParams.get('type')   || '';
  const limit  = parseInt(searchParams.get('limit') || '20');

  await connectDB();

  const filter: Record<string, unknown> = {
    isPrivate: false,
    status: { $in: status.split(',') },
  };
  if (type) filter.type = type;

  const rooms = await Room.find(filter)
    .select('name topic type status participants maxParticipants hostName pointsReward createdAt')
    .sort({ status: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  const mapped = rooms.map(r => ({
    ...r,
    id              : r._id.toString(),
    _id             : undefined,
    participantsCount: (r.participants as unknown[]).length,
  }));

  return NextResponse.json({ success: true, rooms: mapped });
}
