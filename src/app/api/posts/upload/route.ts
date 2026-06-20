import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import Post from '@/models/Post';
import User from '@/models/User';

/**
 * POST /api/posts/upload
 * ─────────────────────────────────────────────
 * نشر فيديو خطابة جديد في الفيد
 *
 * الـ Body المطلوب:
 *   title        : string   — عنوان الفيديو
 *   videoUrl     : string   — رابط الفيديو (مرفوع مسبقاً)
 *   caption?     : string   — وصف اختياري
 *   thumbnailUrl?: string   — صورة مصغرة
 *   videoDuration?: string  — المدة ("2:45")
 *   tags?        : string[] — وسوم
 *   type?        : 'speech' | 'tip' | 'challenge_entry' | 'highlight'
 *   challengeId? : string   — إن كان المنشور ضمن تحدي
 *   sessionId?   : string   — إن كان مرتبطاً بجلسة
 *
 * الصلاحية: مستخدم مسجّل الدخول
 *
 * الاستجابة:
 *   201: { success, post }
 *   400: { error: "العنوان ورابط الفيديو مطلوبان" }
 *   401: { error: "غير مصرح" }
 */
export async function POST(request: NextRequest) {
  // 1. التحقق من الجلسة
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'يجب تسجيل الدخول لنشر فيديو' }, { status: 401 });
  }

  // 2. قراءة البيانات
  const body = await request.json();
  const { title, videoUrl, caption, thumbnailUrl, videoDuration, tags, type, challengeId, sessionId } = body;

  // 3. التحقق من الحقول الإلزامية
  if (!title?.trim() || !videoUrl?.trim()) {
    return NextResponse.json(
      { error: 'عنوان الفيديو ورابطه مطلوبان' },
      { status: 400 }
    );
  }

  await connectDB();

  // 4. جلب بيانات المستخدم الإضافية
  const user = await User.findById(session.user.id).select('level avatar');

  // 5. إنشاء المنشور
  const post = await Post.create({
    userId: session.user.id,
    userName: session.user.name,
    userAvatar: user?.avatar || '',
    userLevel: user?.level || 'beginner',
    title: title.trim(),
    videoUrl: videoUrl.trim(),
    caption: caption || '',
    thumbnailUrl: thumbnailUrl || '',
    videoDuration: videoDuration || '',
    tags: tags || [],
    type: type || 'speech',
    challengeId: challengeId || null,
    sessionId: sessionId || null,
  });

  // 6. تحديث عداد الفيديوهات في بروفايل المستخدم
  await User.findByIdAndUpdate(session.user.id, { $inc: { videosCount: 1 } });

  return NextResponse.json({ success: true, post }, { status: 201 });
}

/**
 * GET /api/posts/upload
 * ─────────────────────────────────────────────
 * جلب منشورات الفيد (Feed)
 *
 * Query Params:
 *   page?  : number — رقم الصفحة (افتراضي: 1)
 *   limit? : number — عدد النتائج (افتراضي: 12)
 *   sort?  : 'latest' | 'popular' | 'trending'
 *   tag?   : string — تصفية بالوسم
 *   userId?: string — منشورات مستخدم معين
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page  = parseInt(searchParams.get('page')  || '1');
  const limit = parseInt(searchParams.get('limit') || '12');
  const sort  = searchParams.get('sort')  || 'latest';
  const tag   = searchParams.get('tag')   || '';
  const userId= searchParams.get('userId')|| '';

  await connectDB();

  // بناء الفلتر
  const filter: Record<string, unknown> = { isActive: true };
  if (tag)    filter.tags   = tag;
  if (userId) filter.userId = userId;

  // بناء الترتيب
  const sortQuery: Record<string, 1 | -1> =
    sort === 'popular'  ? { likesCount: -1 } :
    sort === 'trending' ? { views: -1 }      :
                          { createdAt: -1 };

  const [posts, total] = await Promise.all([
    Post.find(filter)
      .sort(sortQuery)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Post.countDocuments(filter),
  ]);

  return NextResponse.json({
    success: true,
    posts,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
}
