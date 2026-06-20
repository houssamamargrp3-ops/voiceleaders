import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; quizIndex: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, quizIndex: quizIndexStr } = await params;
    const quizIndex = parseInt(quizIndexStr, 10);

    const { answers } = await req.json(); // { [questionIndex]: selectedOptionIndex }

    await connectDB();

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    const quiz = course.quizzes[quizIndex];
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    let correctCount = 0;
    quiz.questions.forEach((q: any, i: number) => {
      if (answers[i] === q.correctAnswer) {
        correctCount++;
      }
    });

    const score = quiz.questions.length > 0 ? (correctCount / quiz.questions.length) * 100 : 0;
    const passed = score >= (quiz.passingScore || 50);

    // Save to enrollment if passed
    if (passed) {
      let enrollment = await Enrollment.findOne({ courseId: id, userId: session.user.id });
      if (enrollment) {
        const existingPass = enrollment.passedQuizzes?.find((q: any) => q.quizIndex === quizIndex);
        if (!existingPass) {
          enrollment.passedQuizzes = enrollment.passedQuizzes || [];
          enrollment.passedQuizzes.push({ quizIndex, score });
          await enrollment.save();
        } else if (score > existingPass.score) {
          existingPass.score = score;
          await enrollment.save();
        }
      }
    }

    return NextResponse.json({
      success: true,
      score,
      passed,
      correctCount,
      totalQuestions: quiz.questions.length,
    });
  } catch (error) {
    console.error('Quiz submit error:', error);
    return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 500 });
  }
}
