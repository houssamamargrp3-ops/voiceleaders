import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import User from '@/models/User';
import { auth } from '@/auth';
import bcrypt from 'bcryptjs';

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { name, email, currentPassword, newPassword } = await request.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'الاسم والبريد الإلكتروني مطلوبان' }, { status: 400 });
    }

    await connectDB();
    
    // Get user from DB with password included
    const user = await User.findById(session.user.id).select('+password');
    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    // Check if they want to update password
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json({ error: 'يرجى إدخال كلمة المرور الحالية لتغيير كلمة المرور' }, { status: 400 });
      }
      
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return NextResponse.json({ error: 'كلمة المرور الحالية غير صحيحة' }, { status: 400 });
      }
      
      user.password = await bcrypt.hash(newPassword, 10);
    }

    // Update name and email
    // Check if email is already taken by someone else
    if (email !== user.email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: user._id } });
      if (existingEmail) {
        return NextResponse.json({ error: 'البريد الإلكتروني مستخدم بالفعل' }, { status: 400 });
      }
    }

    user.name = name;
    user.email = email;
    await user.save();

    return NextResponse.json({ success: true, message: 'تم تحديث البيانات بنجاح' });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json({ error: 'حدث خطأ داخلي' }, { status: 500 });
  }
}
