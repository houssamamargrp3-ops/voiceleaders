import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/connectDB';
import User from '@/models/User';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'البريد الإلكتروني', type: 'email' },
        password: { label: 'كلمة المرور', type: 'password' },
        role: { label: 'الدور', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('يرجى إدخال البريد وكلمة المرور');
        }

        try {
          await connectDB();

          // البحث عن المستخدم مع إظهار كلمة المرور
          const user = await User.findOne({ email: credentials.email }).select('+password');

          if (!user) {
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
          }

          // التحقق من كلمة المرور
          const isValid = await bcrypt.compare(credentials.password as string, user.password);

          if (!isValid) {
            throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة');
          }

          // التحقق من توافق دور المستخدم مع التبويب المختار
          if (credentials.role && user.role !== credentials.role) {
            const roleNames: Record<string, string> = { trainee: 'متدرب', trainer: 'مدرب', admin: 'مشرف' };
            throw new Error(`هذا الحساب غير مسجل كـ ${roleNames[credentials.role as string] || credentials.role}`);
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            level: user.level,
            role: user.role,
            avatar: user.avatar,
            points: user.points,
          };
        } catch (error) {
          throw error;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === 'update' && session) {
        if (session.user?.name) token.name = session.user.name;
        if (session.user?.email) token.email = session.user.email;
        if (session.user?.avatar) token.avatar = session.user.avatar;
      }
      
      if (user) {
        token.id = user.id;
        token.level = (user as { level?: string }).level;
        token.role = (user as { role?: string }).role;
        token.avatar = (user as { avatar?: string }).avatar;
        token.points = (user as { points?: number }).points;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        (session.user as { level?: string }).level = token.level as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { avatar?: string }).avatar = token.avatar as string;
        (session.user as { points?: number }).points = token.points as number;
      }
      return session;
    },
  },

  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 يوم
  },

  secret: process.env.AUTH_SECRET,
});
