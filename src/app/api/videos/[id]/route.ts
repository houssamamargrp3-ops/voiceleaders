import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Video from '@/models/Video';
import Post from '@/models/Post';
import User from '@/models/User';
import path from 'path';
import fs from 'fs/promises';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    await connectDB();
    
    // Find video first
    const video = await Video.findById(id);
    if (!video) {
      return NextResponse.json({ error: 'الفيديو غير موجود' }, { status: 404 });
    }
    
    // Ensure user owns the video or is admin
    const sessionUser = session.user as any;
    if (video.user.toString() !== sessionUser.id && sessionUser.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح بحذف هذا الفيديو' }, { status: 403 });
    }

    const videoUrl = video.url;

    // Delete Video from DB
    await Video.findByIdAndDelete(id);

    // Find and delete the associated Post if exists
    if (videoUrl) {
      const post = await Post.findOne({ videoUrl: videoUrl });
      if (post) {
        await Post.findByIdAndDelete(post._id);
      }
    }

    // Decrement user videos count
    await User.findByIdAndUpdate(video.user, { 
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
    console.error('Delete video error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
