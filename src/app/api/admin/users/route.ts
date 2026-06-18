import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح - للمدراء فقط' }, { status: 403 });
    }

    await connectDB();

    const usersDocs = await User.find().sort({ createdAt: -1 });
    const users = usersDocs.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
      level: u.level || 'beginner',
      points: u.points || 0,
      createdAt: u.createdAt,
    }));

    return NextResponse.json({ users });
  } catch (error: any) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب المستخدمين' }, { status: 500 });
  }
}
