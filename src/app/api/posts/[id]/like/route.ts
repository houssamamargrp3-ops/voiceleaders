import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Post from '@/models/Post';
import Notification from '@/models/Notification';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();

  const post = await Post.findById(id);
  if (!post) {
    return NextResponse.json({ error: 'المنشور غير موجود' }, { status: 404 });
  }

  const userId = session.user.id;
  const userName = session.user.name || 'مستخدم';
  const hasLiked = post.likes.some((likerId: any) => likerId.toString() === userId);

  if (hasLiked) {
    // إزالة اللايك
    post.likes = post.likes.filter((likerId: any) => likerId.toString() !== userId);
    await post.save();
    return NextResponse.json({ success: true, action: 'unliked' });
  } else {
    // إضافة اللايك
    post.likes.push(userId);
    await post.save();

    // إنشاء إشعار إذا لم يكن المستخدم يعجب بمنشوره الخاص
    if (post.userId.toString() !== userId) {
      await Notification.create({
        userId: post.userId,
        type: 'like',
        senderId: userId,
        senderName: userName,
        postId: post._id,
        text: `أعجب ${userName} بمساركتك`
      });
    }

    return NextResponse.json({ success: true, action: 'liked' });
  }
}
