import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Course from '@/models/Course';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== 'trainer' && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    await connectDB();

    const course = await Course.findOne({ _id: id, instructorId: session.user.id });
    if (!course && role !== 'admin') {
      return NextResponse.json({ error: 'Course not found or unauthorized' }, { status: 404 });
    }

    const updatedCourse = await Course.findByIdAndUpdate(id, body, { new: true });

    return NextResponse.json({ success: true, course: updatedCourse });
  } catch (error) {
    console.error('Update course error:', error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
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

    await connectDB();

    const course = await Course.findOne({ _id: id, instructorId: session.user.id });
    if (!course && role !== 'admin') {
      return NextResponse.json({ error: 'Course not found or unauthorized' }, { status: 404 });
    }

    await Course.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
