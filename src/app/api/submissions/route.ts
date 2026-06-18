import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Submission from '@/models/Submission';
import Course from '@/models/Course';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { courseId, videoUrl } = await request.json();

    if (!courseId || !videoUrl) {
      return NextResponse.json({ error: 'رابط الفيديو مطلوب' }, { status: 400 });
    }

    await connectDB();

    // Verify course exists and get instructorId
    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
    }

    // Check if trainee already has a pending submission for this course
    const existingPending = await Submission.findOne({
      courseId,
      userId: session.user.id,
      status: 'pending'
    });

    if (existingPending) {
      return NextResponse.json({ error: 'لديك بالفعل تقييم معلق قيد المراجعة في هذه الدورة' }, { status: 400 });
    }

    const submission = await Submission.create({
      courseId,
      userId: session.user.id,
      instructorId: course.instructorId || course.instructor, // Fallback if instructorId missing
      videoUrl,
    });

    return NextResponse.json({ success: true, submission }, { status: 201 });
  } catch (error) {
    console.error('Submission create error:', error);
    return NextResponse.json({ error: 'حدث خطأ داخلي' }, { status: 500 });
  }
}
