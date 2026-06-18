import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { auth } from '@/auth';
import mongoose from 'mongoose';

// POST /api/courses/[id]/lessons/[lessonId]/complete
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    const { id, lessonId } = await params;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
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

    // Verify the lesson exists in the course
    const lessonExists = course.lessons.some(
      (lesson) => String(lesson._id) === lessonId
    );
    if (!lessonExists) {
      return NextResponse.json({ error: 'الدرس غير موجود في هذه الدورة' }, { status: 404 });
    }

    const enrollment = await Enrollment.findOne({
      userId: user.id,
      courseId: id,
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'أنت غير مسجل في هذه الدورة' }, { status: 403 });
    }

    // Check if lesson is already completed
    if (enrollment.completedLessons.includes(lessonId)) {
      return NextResponse.json({ error: 'هذا الدرس مكتمل بالفعل' }, { status: 400 });
    }

    // Add lesson to completedLessons
    enrollment.completedLessons.push(lessonId);

    // Recalculate progress
    const totalLessons = course.lessons.length;
    enrollment.progress = totalLessons > 0
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0;

    enrollment.lastAccessedAt = new Date();
    await enrollment.save();

    return NextResponse.json({
      success: true,
      enrollment,
    });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// DELETE /api/courses/[id]/lessons/[lessonId]/complete
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    const { id, lessonId } = await params;

    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
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

    const enrollment = await Enrollment.findOne({
      userId: user.id,
      courseId: id,
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'أنت غير مسجل في هذه الدورة' }, { status: 403 });
    }

    // Check if lesson was completed
    const lessonIndex = enrollment.completedLessons.indexOf(lessonId);
    if (lessonIndex === -1) {
      return NextResponse.json({ error: 'هذا الدرس غير مكتمل بالفعل' }, { status: 400 });
    }

    // Remove lesson from completedLessons
    enrollment.completedLessons.splice(lessonIndex, 1);

    // Recalculate progress
    const totalLessons = course.lessons.length;
    enrollment.progress = totalLessons > 0
      ? Math.round((enrollment.completedLessons.length / totalLessons) * 100)
      : 0;

    enrollment.lastAccessedAt = new Date();
    await enrollment.save();

    return NextResponse.json({
      success: true,
      enrollment,
    });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
