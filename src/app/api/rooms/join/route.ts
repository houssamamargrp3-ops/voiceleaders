import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Room from '@/models/Room';

/**
 * POST /api/rooms/join
 * ─────────────────────────────────────────────
 * الانضمام إلى غرفة موجودة
 *
 * الـ Body المطلوب:
 *   roomId     : string — معرف الغرفة
 *   role       : 'speaker' | 'evaluator' | 'audience'
 *   accessCode?: string — مطلوب إن كانت الغرفة خاصة
 *
 * الصلاحية المطلوبة: مستخدم مسجّل الدخول
 *
 * الاستجابة:
 *   200: { success, room, message }
 *   400: { error: "رمز الدخول خاطئ" | "الغرفة ممتلئة" | "أنت بالفعل في الغرفة" }
 *   401: { error: "يجب تسجيل الدخول" }
 *   404: { error: "الغرفة غير موجودة" }
 *   409: { error: "الغرفة منتهية" }
 *   500: { error: "خطأ في الخادم" }
 */
export async function POST(request: NextRequest) {
  // 1. التحقق من الجلسة
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول للانضمام' }, { status: 401 });
  }

  // 2. قراءة البيانات
  const body = await request.json();
  const { roomId, role, accessCode } = body;

  if (!roomId) {
    return NextResponse.json({ error: 'معرف الغرفة مطلوب' }, { status: 400 });
  }

  await connectDB();

  // 3. جلب الغرفة
  const room = await Room.findById(roomId);
  if (!room) {
    return NextResponse.json({ error: 'الغرفة غير موجودة' }, { status: 404 });
  }

  // 4. التحقق من حالة الغرفة
  if (room.status === 'ended') {
    return NextResponse.json({ error: 'هذه الغرفة منتهية' }, { status: 409 });
  }

  // 5. التحقق من رمز الدخول (إن كانت خاصة)
  if (room.isPrivate && room.accessCode !== accessCode) {
    return NextResponse.json({ error: 'رمز الدخول غير صحيح' }, { status: 400 });
  }

  // 6. التحقق من عدم التكرار
  const alreadyIn = room.participants.some(
    (p) => p.userId.toString() === (session.user as any).id
  );
  if (alreadyIn) {
    return NextResponse.json({ error: 'أنت بالفعل في هذه الغرفة', room }, { status: 200 });
  }

  // 7. التحقق من سعة الغرفة
  if (room.participants.length >= room.maxParticipants) {
    return NextResponse.json({ error: 'الغرفة ممتلئة' }, { status: 400 });
  }

  // 8. إضافة المستخدم للغرفة
  room.participants.push({
    userId: (session.user as any).id as unknown as import('mongoose').Types.ObjectId,
    name: (session.user as any).name || 'مجهول',
    role: role || 'audience',
    joinedAt: new Date(),
  });

  // 9. تغيير حالة الغرفة إلى "live" إذا اكتمل الحد الأدنى
  if (room.status === 'waiting' && room.participants.length >= 2) {
    room.status = 'live';
  }

  await room.save();

  return NextResponse.json({
    success: true,
    message: 'انضممت إلى الغرفة بنجاح',
    room,
  });
}
