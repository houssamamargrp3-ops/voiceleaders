import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Room from '@/models/Room';

/**
 * POST /api/rooms/create
 * ─────────────────────────────────────────────
 * إنشاء غرفة تدريب جديدة
 *
 * الـ Body المطلوب:
 *   name           : string  — اسم الغرفة
 *   topic          : string  — الموضوع المحدد للنقاش
 *   type           : 'practice' | 'challenge' | 'open'
 *   maxParticipants: number  — الحد الأقصى للمشاركين (2–20)
 *   isPrivate      : boolean — غرفة خاصة أم عامة؟
 *   accessCode?    : string  — رمز الدخول (إن كانت خاصة)
 *   durationMinutes?: number — مدة الجلسة المحددة
 *
 * الصلاحية المطلوبة: مستخدم مسجّل الدخول (JWT)
 *
 * الاستجابة:
 *   201: { success, room }
 *   400: { error: "بيانات ناقصة" }
 *   401: { error: "يجب تسجيل الدخول" }
 *   500: { error: "خطأ في الخادم" }
 */
export async function POST(request: NextRequest) {
  // 1. التحقق من الجلسة
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول لإنشاء غرفة' }, { status: 401 });
  }

  // 2. قراءة البيانات
  const body = await request.json();
  const { name, topic, type, maxParticipants, isPrivate, accessCode, durationMinutes } = body;

  // 3. التحقق من الحقول الإلزامية
  if (!name?.trim() || !topic?.trim()) {
    return NextResponse.json({ error: 'اسم الغرفة والموضوع مطلوبان' }, { status: 400 });
  }

  await connectDB();

  // 4. إنشاء الغرفة مع إضافة المضيف كمشارك أوّل
  const room = await Room.create({
    name: name.trim(),
    topic: topic.trim(),
    type: type || 'open',
    maxParticipants: maxParticipants || 6,
    isPrivate: isPrivate || false,
    accessCode: isPrivate ? accessCode || '' : '',
    durationMinutes: durationMinutes || null,
    hostId: session.user.id,
    hostName: session.user.name,
    status: 'waiting',
    participants: [
      {
        userId: session.user.id,
        name: session.user.name,
        role: 'speaker', // المضيف يبدأ كمتحدث
        joinedAt: new Date(),
      },
    ],
    pointsReward: type === 'challenge' ? 50 : 10,
  });

  return NextResponse.json({ success: true, room }, { status: 201 });
}
