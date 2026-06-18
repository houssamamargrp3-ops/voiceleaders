import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Video from '@/models/Video';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;
    const challenge = formData.get('challenge') as string;

    if (!file || !title) {
      return NextResponse.json({ error: 'الفيديو والعنوان مطلوبان' }, { status: 400 });
    }

    // Prepare upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
    await fs.mkdir(uploadDir, { recursive: true });

    // Save the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, buffer);

    const videoUrl = `/uploads/videos/${filename}`;

    await connectDB();

    const video = await Video.create({
      title,
      description: description || '',
      url: videoUrl,
      user: session.user.id,
      userName: session.user.name || 'مستخدم',
      tags: tags ? tags.split('،').map(t => t.trim()).filter(Boolean) : [],
      challenge: challenge || '',
      duration: '0:00',
    });

    return NextResponse.json({ success: true, video });
  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json({ error: 'فشل في رفع الفيديو' }, { status: 500 });
  }
}
