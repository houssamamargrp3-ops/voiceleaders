import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { auth } from '@/auth';
import mongoose from 'mongoose';

// POST /api/courses/[id]/enroll
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول للتسجيل في الدورة' }, { status: 401 });
    }

    const user = session.user as any;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'معرف الدورة غير صالح' }, { status: 400 });
    }

    await connectDB();

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
    }

    if (course.isRegistrationClosed) {
      return NextResponse.json({ error: 'التسجيل مغلق حالياً لهذه الدورة' }, { status: 403 });
    }

    if (course.maxStudents > 0 && course.enrolledStudents.length >= course.maxStudents) {
      return NextResponse.json({ error: 'عذراً، اكتمل العدد الأقصى للمسجلين' }, { status: 403 });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId: user.id,
      courseId: id,
    });

    if (existingEnrollment) {
      return NextResponse.json({ error: 'أنت مسجل بالفعل في هذه الدورة' }, { status: 400 });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      userId: user.id,
      courseId: id,
      completedLessons: [],
      progress: 0,
    });

    // Add user to course's enrolledStudents
    await Course.findByIdAndUpdate(id, {
      $addToSet: { enrolledStudents: user.id },
    });

    return NextResponse.json({ success: true, enrollment }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// DELETE /api/courses/[id]/enroll
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
    }

    const user = session.user as any;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'معرف الدورة غير صالح' }, { status: 400 });
    }

    await connectDB();

    const enrollment = await Enrollment.findOneAndDelete({
      userId: user.id,
      courseId: id,
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'أنت غير مسجل في هذه الدورة' }, { status: 404 });
    }

    // Remove user from course's enrolledStudents
    await Course.findByIdAndUpdate(id, {
      $pull: { enrolledStudents: user.id },
    });

    return NextResponse.json({ success: true, message: 'تم إلغاء التسجيل بنجاح' });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
