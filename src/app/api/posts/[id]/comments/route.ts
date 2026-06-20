import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Post from '@/models/Post';
import User from '@/models/User';

/**
 * POST /api/posts/[id]/comments
 * إضافة تعليق للمنشور
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول للتعليق' }, { status: 401 });
  }

  const { text } = await request.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: 'التعليق لا يمكن أن يكون فارغاً' }, { status: 400 });
  }

  const { id } = await params;
  await connectDB();

  const user = await User.findById(session.user.id).select('avatar');
  
  const newComment = {
    userId: session.user.id,
    userName: session.user.name || 'مجهول',
    avatar: user?.avatar || '',
    text: text.trim(),
    createdAt: new Date(),
  };

  const post = await Post.findByIdAndUpdate(
    id,
    { $push: { comments: newComment } },
    { new: true }
  );

  if (!post) {
    return NextResponse.json({ error: 'المنشور غير موجود' }, { status: 404 });
  }

  return NextResponse.json({ success: true, comment: newComment });
}
