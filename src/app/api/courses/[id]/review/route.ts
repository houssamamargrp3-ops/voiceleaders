import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import { auth } from '@/auth';
import mongoose from 'mongoose';

// POST /api/courses/[id]/review
export async function POST(
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

    const body = await request.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'التقييم يجب أن يكون بين 1 و 5' }, { status: 400 });
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return NextResponse.json({ error: 'التعليق مطلوب' }, { status: 400 });
    }

    await connectDB();

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      userId: user.id,
      courseId: id,
    });

    if (!enrollment) {
      return NextResponse.json({ error: 'يجب أن تكون مسجلاً في الدورة لإضافة تقييم' }, { status: 403 });
    }

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: 'الدورة غير موجودة' }, { status: 404 });
    }

    // Check if user already reviewed
    const existingReview = course.reviews.find(
      (review) => String(review.user) === String(user.id)
    );

    if (existingReview) {
      return NextResponse.json({ error: 'لقد قمت بتقييم هذه الدورة بالفعل' }, { status: 400 });
    }

    // Add the review
    course.reviews.push({
      user: user.id,
      userName: user.name || 'مستخدم',
      rating: Number(rating),
      comment: comment.trim(),
      createdAt: new Date(),
    });

    // Recalculate average rating and count
    course.ratingsCount = course.reviews.length;
    const totalRating = course.reviews.reduce((sum, r) => sum + r.rating, 0);
    course.rating = Math.round((totalRating / course.ratingsCount) * 10) / 10;

    await course.save();

    return NextResponse.json({
      success: true,
      review: course.reviews[course.reviews.length - 1],
      rating: course.rating,
      ratingsCount: course.ratingsCount,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
