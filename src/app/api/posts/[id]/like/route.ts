import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Post from '@/models/Post';

/**
 * POST /api/posts/[id]/like
 * إضافة أو إزالة إعجاب من المنشور
 */
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
  const hasLiked = post.likes.some((id: any) => id.toString() === userId);

  if (hasLiked) {
    await Post.findByIdAndUpdate(id, { $pull: { likes: userId } });
    return NextResponse.json({ success: true, action: 'unliked' });
  } else {
    await Post.findByIdAndUpdate(id, { $addToSet: { likes: userId } });
    return NextResponse.json({ success: true, action: 'liked' });
  }
}
