import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'videos');
    let filesInfo = [];
    try {
      const files = await fs.readdir(uploadDir);
      for (const file of files) {
        const stats = await fs.stat(path.join(uploadDir, file));
        filesInfo.push({
          name: file,
          size: stats.size,
          sizeMB: (stats.size / 1024 / 1024).toFixed(2),
          created: stats.birthtime,
        });
      }
    } catch (e: any) {
      return NextResponse.json({ error: e.message, uploadDir });
    }

    return NextResponse.json({
      cwd: process.cwd(),
      uploadDir,
      files: filesInfo,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
