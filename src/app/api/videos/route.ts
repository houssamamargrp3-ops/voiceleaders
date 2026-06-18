import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Video from '@/models/Video';
import { auth } from '@/auth';

// GET /api/videos - جلب الفيديوهات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sort = searchParams.get('sort') || 'latest';

    await connectDB();

    const sortQuery: Record<string, 1 | -1> = sort === 'popular' ? { likes: -1 } : { createdAt: -1 };

    const [videos, total] = await Promise.all([
      Video.find()
        .sort(sortQuery)
        .skip((page - 1) * limit)
        .limit(limit),
      Video.countDocuments(),
    ]);

    return NextResponse.json({ videos, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}

// POST /api/videos - رفع فيديو جديد
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, url, tags, challenge } = body;

    if (!title || !url) {
      return NextResponse.json({ error: 'العنوان ورابط الفيديو مطلوبان' }, { status: 400 });
    }

    await connectDB();

    const video = await Video.create({
      title: title.trim(),
      description: description || '',
      url,
      tags: tags || [],
      challenge: challenge || '',
      user: session.user.id,
      userName: session.user.name || 'مجهول',
      userLevel: (session.user as { level?: string }).level || 'beginner',
    });

    return NextResponse.json({ success: true, video }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
