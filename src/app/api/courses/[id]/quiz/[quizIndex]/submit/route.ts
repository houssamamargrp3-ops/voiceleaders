import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Course from '@/models/Course';
import QuizAttempt from '@/models/QuizAttempt';
import { auth } from '@/auth';

export async function POST(
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
    const body = await request.json();
    const { answers } = body; // Array of selected options [0, 2, 1, 3]

    if (!Array.isArray(answers)) {
      return NextResponse.json({ error: 'إجابات غير صالحة' }, { status: 400 });
    }

    await connectDB();
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
    }

    if (!course.quizzes || quizIndex < 0 || quizIndex >= course.quizzes.length) {
      return NextResponse.json({ error: 'الاختبار غير موجود' }, { status: 404 });
    }

    const quiz = course.quizzes[quizIndex];
    const retakeAfterDays = quiz.retakeAfterDays ?? 1;

    // Check if user is allowed to retake
    const lastAttempt = await QuizAttempt.findOne({
      userId: session.user.id,
      courseId,
      quizIndex,
    }).sort({ createdAt: -1 });

    const now = new Date();
    if (lastAttempt && now < lastAttempt.nextRetakeAt) {
      return NextResponse.json({ error: 'لا يمكنك إعادة الاختبار الآن' }, { status: 403 });
    }

    // Calculate score
    let score = 0;
    const totalQuestions = quiz.questions.length;

    quiz.questions.forEach((q: any, idx: number) => {
      if (answers[idx] === q.correctAnswer) {
        score++;
      }
    });

    const nextRetakeAt = new Date(now.getTime() + retakeAfterDays * 24 * 60 * 60 * 1000);

    const attempt = await QuizAttempt.create({
      userId: session.user.id,
      courseId,
      quizIndex,
      score,
      totalQuestions,
      answers,
      nextRetakeAt
    });

    return NextResponse.json({
      success: true,
      score,
      totalQuestions,
      nextRetakeAt
    });
  } catch (error) {
    console.error('Quiz submit error:', error);
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
