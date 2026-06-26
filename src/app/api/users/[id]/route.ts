import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    // يجب أن يكون المستخدم مشرفاً أو مدرباً على الأقل للقيام بهذا
    if (!session?.user || (session.user as any).role !== 'admin' && (session.user as any).role !== 'trainer') {
      return NextResponse.json({ success: false, error: 'غير مصرح' }, { status: 403 });
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ success: false, error: 'معرف غير صالح' }, { status: 400 });
    }

    await connectDB();

    const deletedUser = await User.findByIdAndDelete(params.id);

    if (!deletedUser) {
      return NextResponse.json({ success: false, error: 'المستخدم غير موجود' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { success: false, error: 'حدث خطأ داخلي' },
      { status: 500 }
    );
  }
}
