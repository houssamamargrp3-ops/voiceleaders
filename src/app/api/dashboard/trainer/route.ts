import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Course from '@/models/Course';
import Submission from '@/models/Submission';
import { auth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as any)?.role;

    if (!session?.user || !['admin', 'trainer'].includes(role)) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    await connectDB();
    const instructorId = session.user.id;

    // 1. Get Instructor's Courses
    const courses = await Course.find({ instructorId }).select('_id title enrolledStudents rating');
    
    let totalStudents = 0;
    let totalRating = 0;
    const myCourses = courses.map(c => {
      totalStudents += c.enrolledStudents.length;
      totalRating += c.rating;
      return {
        id: c._id.toString(),
        title: c.title,
        students: c.enrolledStudents.length,
        rating: c.rating,
      };
    });

    const averageRating = courses.length > 0 ? (totalRating / courses.length).toFixed(1) : 0;
    const activeCourses = courses.length;

    // 2. Get Evaluations (Pending and Done)
    const submissions = await Submission.find({ instructorId }).populate('userId', 'name').populate('courseId', 'title').sort({ createdAt: -1 });
    
    const pendingEvaluations = submissions
      .filter(sub => sub.status === 'pending')
      .map(sub => ({
        id: sub._id.toString(),
        user: (sub.userId as any)?.name || 'متدرب غير معروف',
        title: (sub.courseId as any)?.title || 'تطبيق دورة',
        date: new Date(sub.createdAt).toLocaleDateString('ar-SA'),
        videoUrl: sub.videoUrl,
      }));

    const evaluationsDone = submissions.filter(sub => sub.status === 'evaluated').length;

    return NextResponse.json({
      myCourses,
      pendingEvaluations,
      quickStats: {
        evaluationsDone,
        totalStudents,
        averageRating,
        activeCourses,
      }
    });
  } catch (error) {
    console.error('Trainer dashboard error:', error);
    return NextResponse.json({ error: 'حدث خطأ داخلي' }, { status: 500 });
  }
}
