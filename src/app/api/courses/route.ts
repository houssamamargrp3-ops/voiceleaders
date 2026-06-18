import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Course from '@/models/Course';
import { auth } from '@/auth';

// GET /api/courses
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    await connectDB();

    const query: Record<string, unknown> = {};
    if (level && level !== 'all') query.level = level;
    if (category && category !== 'all') query.category = category;
    if (featured === 'true') query.featured = true;

    const courses = await Course.find(query).sort({ rating: -1, createdAt: -1 });

    return NextResponse.json({ courses });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// POST /api/courses - إضافة دورة (Admin فقط)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string })?.role;
    if (!session?.user || !['admin', 'trainer'].includes(role || '')) {
      return NextResponse.json({ error: 'غير مصرح - مشرفون أو مدربون فقط' }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, instructor, level, category, duration, tags, lessons, materials, quizzes } = body;

    if (!title || !description || !instructor || !level || !category) {
      return NextResponse.json({ error: 'جميع الحقول الأساسية مطلوبة' }, { status: 400 });
    }

    await connectDB();

    const course = await Course.create({
      title, description, instructor, level, category,
      duration: duration || '',
      tags: tags || [],
      lessons: lessons || [],
      materials: materials || [],
      quizzes: quizzes || [],
      instructorId: session.user.id,
    });

    return NextResponse.json({ success: true, course }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
