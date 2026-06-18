import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Video from '@/models/Video';
import { auth } from '@/auth';

// POST /api/videos/[id]/like - إعجاب/إلغاء إعجاب
export async function POST(
  _request: NextRequest,
  ctx: RouteContext<'/api/videos/[id]/like'>
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
    }

    const { id } = await ctx.params;
    await connectDB();

    const video = await Video.findById(id);
    if (!video) {
      return NextResponse.json({ error: 'الفيديو غير موجود' }, { status: 404 });
    }

    const userId = session.user.id;
    const userObjId = video.likes.find((lid) => lid.toString() === userId);

    if (userObjId) {
      // إلغاء الإعجاب
      video.likes = video.likes.filter((lid) => lid.toString() !== userId);
    } else {
      // إضافة إعجاب
      video.likes.push(userId as unknown as import('mongoose').Types.ObjectId);
    }

    await video.save();

    return NextResponse.json({
      liked: !userObjId,
      likesCount: video.likes.length,
    });
  } catch (error) {
    return NextResponse.json({ error: 'خطأ في الخادم' }, { status: 500 });
  }
}
