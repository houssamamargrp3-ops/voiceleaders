import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Challenge from '@/models/Challenge';

/**
 * GET /api/challenges/[id]
 * جلب تفاصيل تحدي واحد
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await connectDB();

  const challenge = await Challenge.findById(id).lean();
  if (!challenge) {
    return NextResponse.json({ error: 'التحدي غير موجود' }, { status: 404 });
  }

  const serialized = {
    ...challenge,
    id: (challenge._id as any).toString(),
    createdBy: challenge.createdBy.toString(),
    _id: undefined,
  };

  return NextResponse.json({ success: true, challenge: serialized });
}

/**
 * PATCH /api/challenges/[id]
 * تعديل تحدي (للمدربين/المشرفين فقط)
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { auth } = await import('@/auth');
  const session = await auth();

  const userRole = (session?.user as any)?.role;
  if (!session?.user?.id || !['trainer', 'admin'].includes(userRole)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  const { id } = await params;
  await connectDB();

  const body = await request.json();
  const allowed = ['title', 'description', 'prompt', 'difficulty', 'type', 'status', 'deadline',
    'pointsReward', 'prize', 'minDurationSeconds', 'maxDurationSeconds', 'tags', 'retakeAfterDays'];
  
  const updates: Record<string, any> = {};
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key];
  }

  const updated = await Challenge.findByIdAndUpdate(id, updates, { new: true });
  if (!updated) return NextResponse.json({ error: 'التحدي غير موجود' }, { status: 404 });

  return NextResponse.json({ success: true, challenge: updated });
}

/**
 * DELETE /api/challenges/[id]
 * حذف تحدي
 */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { auth } = await import('@/auth');
  const session = await auth();

  const userRole = (session?.user as any)?.role;
  if (!session?.user?.id || !['trainer', 'admin'].includes(userRole)) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  const { id } = await params;
  await connectDB();

  await Challenge.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
