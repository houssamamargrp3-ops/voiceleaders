import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Course from '@/models/Course';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== 'trainer' && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await connectDB();
    
    let courses;
    if (role === 'admin') {
      courses = await Course.find({}).sort({ createdAt: -1 });
    } else {
      courses = await Course.find({ instructorId: session.user.id }).sort({ createdAt: -1 });
    }

    return NextResponse.json({ courses });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const role = (session.user as any).role;
    if (role !== 'trainer' && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title } = await req.json();

    if (!title) {
      return NextResponse.json({ error: 'العنوان مطلوب' }, { status: 400 });
    }

    await connectDB();

    const course = await Course.create({
      title,
      description: 'وصف الدورة...',
      instructor: session.user.name || 'مدرب',
      instructorId: session.user.id,
      level: 'beginner',
      category: 'عام',
      duration: '0 ساعات',
      lessons: [],
      materials: [],
      quizzes: [],
    });

    return NextResponse.json({ success: true, course }, { status: 201 });
  } catch (error) {
    console.error('Create course error:', error);
    return NextResponse.json({ error: 'فشل في إنشاء الدورة' }, { status: 500 });
  }
}
