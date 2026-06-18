import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { auth } from '@/auth';
import mongoose from 'mongoose';

// GET /api/courses/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'معرف الدورة غير صالح' }, { status: 400 });
    }

    await connectDB();

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
    }

    // Check if the current user is enrolled
    let enrollment = null;
    const session = await auth();
    if (session?.user) {
      const user = session.user as any;
      enrollment = await Enrollment.findOne({
        userId: user.id,
        courseId: id,
      });
    }

    return NextResponse.json({ course, enrollment });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// PUT /api/courses/[id]
export async function PUT(
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

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
    }

    // Only the course creator or admin can update
    if (user.role !== 'admin' && String(course.instructorId) !== String(user.id)) {
      return NextResponse.json({ error: 'غير مصرح - لا يمكنك تعديل هذه الدورة' }, { status: 403 });
    }

    const body = await request.json();

    // Remove fields that shouldn't be updated directly
    delete body._id;
    delete body.enrolledStudents;
    delete body.reviews;
    delete body.rating;
    delete body.ratingsCount;

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, course: updatedCourse });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// DELETE /api/courses/[id]
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

    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح - المشرفون فقط يمكنهم حذف الدورات' }, { status: 403 });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'معرف الدورة غير صالح' }, { status: 400 });
    }

    await connectDB();

    const course = await Course.findByIdAndDelete(id);
    if (!course) {
      return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
    }

    // Delete all related enrollments
    await Enrollment.deleteMany({ courseId: id });

    return NextResponse.json({ success: true, message: 'تم حذف الدورة بنجاح' });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
