import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/connectDB';
import User from '@/models/User';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, level, country, city, role } = body;

    // --- التحقق من البيانات ---
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'الاسم والبريد وكلمة المرور مطلوبة' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' },
        { status: 400 }
      );
    }

    if (!level || !['beginner', 'intermediate', 'advanced'].includes(level)) {
      return NextResponse.json(
        { error: 'يرجى تحديد المستوى' },
        { status: 400 }
      );
    }
    
    // Ensure role is valid (no admin registration via API allowed)
    const validRole = role === 'trainer' ? 'trainer' : 'trainee';

    // --- الاتصال بقاعدة البيانات ---
    await connectDB();

    // --- التحقق من عدم تكرار البريد ---
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'هذا البريد الإلكتروني مسجل مسبقاً' },
        { status: 409 }
      );
    }

    // --- تشفير كلمة المرور ---
    const hashedPassword = await bcrypt.hash(password, 12);

    // --- إنشاء المستخدم ---
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      level,
      country: country || '',
      city: city || '',
      role: validRole,
      points: 0,
      badges: level === 'advanced' ? ['🏆 خطيب متقدم'] : level === 'intermediate' ? ['⚡ خطيب متوسط'] : ['🌱 ناشئ'],
    });

    // --- الرد بدون كلمة المرور ---
    return NextResponse.json(
      {
        success: true,
        message: 'تم إنشاء الحساب بنجاح! مرحباً بك في المنيعة لقادة الإلقاء 🎉',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          level: user.level,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Registration error:', error);

    // خطأ Mongoose - Validation
    if (error instanceof Error && error.name === 'ValidationError') {
      const messages = Object.values((error as unknown as { errors: Record<string, { message: string }> }).errors)
        .map((e: { message: string }) => e.message)
        .join('، ');
      return NextResponse.json({ error: messages }, { status: 400 });
    }

    // خطأ Duplicate Key (email)
    if (error instanceof Error && (error as { code?: number }).code === 11000) {
      return NextResponse.json(
        { error: 'هذا البريد الإلكتروني مسجل مسبقاً' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'حدث خطأ في الخادم، يرجى المحاولة لاحقاً' },
      { status: 500 }
    );
  }
}
