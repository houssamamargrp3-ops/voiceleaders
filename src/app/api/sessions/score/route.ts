import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Session from '@/models/Session';
import User from '@/models/User';

/**
 * POST /api/sessions/score
 * ─────────────────────────────────────────────
 * تقديم تقييم لجلسة خطابة
 *
 * الـ Body المطلوب:
 *   sessionId : string  — معرف الجلسة
 *   clarity   : number  — وضوح الفكرة (1–10)
 *   confidence: number  — مستوى الثقة (1–10)
 *   structure : number  — تنظيم الخطاب (1–10)
 *   engagement: number  — جذب الجمهور (1–10)
 *   comment?  : string  — تعليق اختياري
 *
 * الصلاحية: مستخدم في الغرفة بدور "evaluator"
 *           ولا يمكن تقييم نفسك
 *
 * الاستجابة:
 *   200: { success, session, pointsEarned }
 *   400: { error: "نطاق الدرجات خاطئ" | "لا يمكن تقييم نفسك" }
 *   401: { error: "غير مصرح" }
 *   404: { error: "الجلسة غير موجودة" }
 *   409: { error: "قدّمت تقييمك بالفعل" }
 */
export async function POST(request: NextRequest) {
  // 1. التحقق من الجلسة
  const authSession = await auth();
  if (!authSession?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  // 2. قراءة البيانات
  const body = await request.json();
  const { sessionId, clarity, confidence, structure, engagement, comment } = body;

  // 3. التحقق من الحقول
  if (!sessionId) {
    return NextResponse.json({ error: 'معرف الجلسة مطلوب' }, { status: 400 });
  }

  const scores = [clarity, confidence, structure, engagement];
  const allValid = scores.every((s) => typeof s === 'number' && s >= 1 && s <= 10);
  if (!allValid) {
    return NextResponse.json(
      { error: 'جميع الدرجات يجب أن تكون بين 1 و 10' },
      { status: 400 }
    );
  }

  await connectDB();

  // 4. جلب الجلسة
  const session = await Session.findById(sessionId);
  if (!session) {
    return NextResponse.json({ error: 'الجلسة غير موجودة' }, { status: 404 });
  }

  // 5. منع تقييم النفس
  if (session.speakerId.toString() === (authSession.user as any).id) {
    return NextResponse.json({ error: 'لا يمكنك تقييم نفسك' }, { status: 400 });
  }

  // 6. منع التقييم المزدوج
  const alreadyScored = session.scores.some(
    (s) => s.evaluatorId.toString() === (authSession.user as any).id
  );
  if (alreadyScored) {
    return NextResponse.json({ error: 'لقد قدّمت تقييمك لهذه الجلسة بالفعل' }, { status: 409 });
  }

  // 7. إضافة التقييم
  const avg = parseFloat(((clarity + confidence + structure + engagement) / 4).toFixed(2));
  session.scores.push({
    evaluatorId: (authSession.user as any).id as unknown as import('mongoose').Types.ObjectId,
    evaluatorName: (authSession.user as any).name || 'مقيّم',
    clarity,
    confidence,
    structure,
    engagement,
    average: avg,
    comment: comment || '',
    submittedAt: new Date(),
  });

  // 8. حفظ الجلسة (pre-save يحسب overallAverage + pointsEarned تلقائياً)
  await session.save();

  // 9. إضافة النقاط للمتحدث
  await User.findByIdAndUpdate(session.speakerId, {
    $inc: { points: session.pointsEarned },
  });

  return NextResponse.json({
    success: true,
    message: 'تم إرسال تقييمك بنجاح',
    overallAverage: session.overallAverage,
    pointsEarned: session.pointsEarned,
  });
}
