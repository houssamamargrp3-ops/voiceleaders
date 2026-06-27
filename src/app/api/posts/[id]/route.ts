import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Post from '@/models/Post';
import Video from '@/models/Video';
import User from '@/models/User';
import path from 'path';
import fs from 'fs/promises';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();
    
    // Find post first
    const post = await Post.findById(params.id);
    if (!post) {
      return NextResponse.json({ error: 'المنشور غير موجود' }, { status: 404 });
    }
    
    // Ensure user owns the post or is admin
    const sessionUser = session.user as any;
    if (post.userId.toString() !== sessionUser.id && sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح بحذف هذا الفيديو' }, { status: 403 });
    }

    const videoUrl = post.videoUrl;

    // Delete Post from DB
    await Post.findByIdAndDelete(params.id);

    // Find and delete the associated Video if exists
    if (videoUrl) {
      const video = await Video.findOne({ url: videoUrl });
      if (video) {
        await Video.findByIdAndDelete(video._id);
      }
    }

    // Decrement user videos count (prevent negative)
    await User.findByIdAndUpdate(post.userId, { 
      $inc: { videosCount: -1 } 
    });

    // Try to delete physical file
    if (videoUrl && videoUrl.startsWith('/uploads/')) {
      try {
        const urlPath = decodeURIComponent(videoUrl.split('?')[0]);
        const safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
        const filePath = path.join(process.cwd(), 'public', safePath);
        
        const stat = await fs.stat(filePath).catch(() => null);
        if (stat && stat.isFile()) {
          await fs.unlink(filePath);
        }
      } catch (e) {
        console.error("Failed to delete physical file:", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Delete post error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
