import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';
import User from '@/models/User';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== 'trainer' && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await connectDB();

    const course = await Course.findOne({ _id: id, instructorId: session.user.id });
    if (!course && role !== 'admin') {
      return NextResponse.json({ error: 'Course not found or unauthorized' }, { status: 404 });
    }

    const enrollments = await Enrollment.find({ courseId: id }).populate({
      path: 'userId',
      select: 'name email',
      model: User,
    });

    const students = enrollments.map((e: any) => ({
      enrollmentId: e._id,
      userId: e.userId?._id,
      name: e.userId?.name || 'مستخدم مجهول',
      email: e.userId?.email || '',
      progress: e.progress,
      enrolledAt: e.enrolledAt,
    }));

    return NextResponse.json({ success: true, students });
  } catch (error) {
    console.error('Fetch students error:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== 'trainer' && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await connectDB();

    const query = role === 'admin' ? { _id: id } : { _id: id, instructorId: session.user.id };
    const course = await Course.findOne(query);
    if (!course) {
      return NextResponse.json({ error: 'Course not found or unauthorized' }, { status: 404 });
    }

    // Remove from Course enrolledStudents array
    course.enrolledStudents = course.enrolledStudents.filter((uid: any) => uid.toString() !== userId);
    await course.save();

    // Delete Enrollment record
    await Enrollment.findOneAndDelete({ courseId: id, userId });

    return NextResponse.json({ success: true, message: 'تم طرد المتدرب بنجاح' });
  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}
