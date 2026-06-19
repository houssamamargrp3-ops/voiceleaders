import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import QuizAttempt from '@/models/QuizAttempt';
import { redirect } from 'next/navigation';
import LearnClient from './LearnClient';

export default async function LearnPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ lesson?: string }> }) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  
  const session = await auth();
  if (!session?.user) {
    redirect('/auth/login');
  }

  await connectDB();

  const course = await Course.findById(resolvedParams.id).lean();
  if (!course) {
    redirect('/courses');
  }

  const enrollment = await Enrollment.findOne({
    userId: session.user.id,
    courseId: course._id,
  }).lean();

  const userRole = (session.user as any).role;
  if (!enrollment && userRole !== 'admin' && userRole !== 'trainer') {
    // User is not enrolled and not admin/trainer
    redirect(`/courses/${course._id}`);
  }

  // Fetch user's quiz attempts to determine passed quizzes
  const quizAttempts = await QuizAttempt.find({
    userId: session.user.id,
    courseId: course._id,
  }).lean();

  const passedQuizzes: Record<number, boolean> = {};
  course.quizzes?.forEach((quiz: any, index: number) => {
    const attempts = quizAttempts.filter((a: any) => a.quizIndex === index);
    const passingScore = quiz.passingScore || 50;
    passedQuizzes[index] = attempts.some((a: any) => (a.score / a.totalQuestions) * 100 >= passingScore);
  });

  // Pass data to client component for interactivity
  const serializedCourse = {
    ...course,
    _id: course._id.toString(),
    instructorId: course.instructorId?.toString(),
    lessons: course.lessons?.map((l: any) => ({
      ...l,
      _id: l._id.toString(),
    })) || [],
    materials: course.materials || [],
    quizzes: course.quizzes || [],
  };

  const serializedEnrollment = enrollment ? {
    ...enrollment,
    _id: enrollment._id.toString(),
    userId: enrollment.userId.toString(),
    courseId: enrollment.courseId.toString(),
    completedLessons: enrollment.completedLessons || [],
  } : null;

  return (
    <LearnClient 
      course={serializedCourse} 
      enrollment={serializedEnrollment} 
      initialLessonId={resolvedSearchParams.lesson} 
      passedQuizzes={passedQuizzes}
    />
  );
}
