import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Course from '@/models/Course';
import QuizAttempt from '@/models/QuizAttempt';
import { auth } from '@/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; quizIndex: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const courseId = resolvedParams.id;
    const quizIndex = parseInt(resolvedParams.quizIndex);

    await connectDB();
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
    }

    if (!course.quizzes || quizIndex < 0 || quizIndex >= course.quizzes.length) {
      return NextResponse.json({ error: 'الاختبار غير موجود' }, { status: 404 });
    }

    const quiz = course.quizzes[quizIndex];
    const timeLimit = quiz.timeLimit ?? 30;
    const retakeAfterDays = quiz.retakeAfterDays ?? 1;

    const lastAttempt = await QuizAttempt.findOne({
      userId: session.user.id,
      courseId,
      quizIndex,
    }).sort({ createdAt: -1 });

    const now = new Date();
    let canRetake = true;
    let nextRetakeAt = null;

    if (lastAttempt) {
      if (now < lastAttempt.nextRetakeAt) {
        canRetake = false;
        nextRetakeAt = lastAttempt.nextRetakeAt;
      }
    }

    return NextResponse.json({
      canRetake,
      nextRetakeAt,
      timeLimit,
      lastAttempt: lastAttempt ? {
        score: lastAttempt.score,
        totalQuestions: lastAttempt.totalQuestions,
        completedAt: lastAttempt.completedAt
      } : null
    });
  } catch (error) {
    console.error('Quiz status error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
