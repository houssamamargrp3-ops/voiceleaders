import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Session from '@/models/Session';
import Room from '@/models/Room';

/**
 * POST /api/sessions/start
 * ─────────────────────────────────────────────
 * بدء جلسة خطابة جديدة داخل غرفة
 *
 * الـ Body المطلوب:
 *   roomId  : string — معرف الغرفة
 *   topic   : string — موضوع الخطاب
 *
 * الصلاحية: المتحدث الفعلي في الغرفة
 *
 * الاستجابة:
 *   201: { success, session }
 *   400: { error: "بيانات ناقصة" }
 *   401: { error: "غير مصرح" }
 *   403: { error: "لست متحدثاً في هذه الغرفة" }
 *   404: { error: "الغرفة غير موجودة" }
 */
export async function POST(request: NextRequest) {
  // 1. التحقق من الجلسة
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  // 2. قراءة البيانات
  const body = await request.json();
  const { roomId, topic } = body;

  if (!roomId || !topic?.trim()) {
    return NextResponse.json({ error: 'معرف الغرفة والموضوع مطلوبان' }, { status: 400 });
  }

  await connectDB();

  // 3. التحقق من وجود الغرفة
  const room = await Room.findById(roomId);
  if (!room) {
    return NextResponse.json({ error: 'الغرفة غير موجودة' }, { status: 404 });
  }

  // 4. التحقق أن المستخدم مشارك بدور "speaker"
  const participant = room.participants.find(
    (p) => p.userId.toString() === session.user.id && p.role === 'speaker'
  );
  if (!participant) {
    return NextResponse.json({ error: 'لست متحدثاً في هذه الغرفة' }, { status: 403 });
  }

  // 5. إنشاء الجلسة
  const speakingSession = await Session.create({
    roomId,
    speakerId: session.user.id,
    speakerName: session.user.name,
    topic: topic.trim(),
    startedAt: new Date(),
    completed: false,
  });

  return NextResponse.json({ success: true, session: speakingSession }, { status: 201 });
}
