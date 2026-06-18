import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';
import Video from '@/models/Video';
import Course from '@/models/Course';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const userId = session.user.id;
    await connectDB();

    // 1. Fetch user's enrollments
    const enrollments = await Enrollment.find({ userId }).populate({
      path: 'courseId',
      model: Course,
      select: 'title category instructor thumbnail'
    });

    const inProgressCourses = enrollments
      .filter(e => e.progress < 100)
      .map(e => ({
        id: e.courseId._id,
        title: (e.courseId as any).title,
        instructor: (e.courseId as any).instructor,
        category: (e.courseId as any).category,
        progress: e.progress,
      }));

    const completedCoursesCount = enrollments.filter(e => e.progress === 100).length;

    // 2. Fetch user's videos count
    const videosCount = await Video.countDocuments({ user: userId });

    // 3. Fetch recent community videos
    const recentVideosDocs = await Video.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate({ path: 'user', select: 'name avatar' });

    const recentVideos = recentVideosDocs.map(v => ({
      id: v._id.toString(),
      title: v.title,
      duration: v.duration || '0:00',
      likes: v.likes.length,
      views: v.views,
      user: {
        name: v.userName || (v.user as any)?.name || 'مستخدم',
      }
    }));

    // 4. Fetch Leaderboard
    const topUsersDocs = await User.find().sort({ points: -1 }).limit(5).select('name points');
    const topUsers = topUsersDocs.map((u, i) => ({
      rank: i + 1,
      points: u.points,
      user: { name: u.name }
    }));

    // 5. Fetch Recommended / Available Courses (courses user is not enrolled in)
    const enrolledCourseIds = enrollments.map(e => e.courseId._id);
    const availableCoursesDocs = await Course.find({ _id: { $nin: enrolledCourseIds } })
      .sort({ createdAt: -1 })
      .limit(3)
      .select('title category instructor thumbnail maxStudents enrolledStudents isRegistrationClosed');
      
    const availableCourses = availableCoursesDocs.map(c => ({
      id: c._id.toString(),
      title: c.title,
      instructor: c.instructor,
      category: c.category,
      isRegistrationClosed: c.isRegistrationClosed,
      enrolledCount: c.enrolledStudents?.length || 0,
      maxStudents: c.maxStudents || 0
    }));

    // 6. Fetch Platform stats
    const totalUsers = await User.countDocuments();
    const totalVideos = await Video.countDocuments();
    const totalCourses = await Course.countDocuments();

    return NextResponse.json({
      quickStats: {
        points: (session.user as any).points || 0,
        completedCourses: completedCoursesCount,
        videosCount: videosCount,
        followersCount: 0, // Not implemented yet in DB
      },
      inProgressCourses,
      availableCourses,
      recentVideos,
      topUsers,
      platformStats: {
        totalUsers,
        totalVideos,
        totalCourses,
        countriesCount: 15 // Mock or static for now
      }
    });

  } catch (error: any) {
    console.error('Error fetching trainee dashboard data:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب البيانات' }, { status: 500 });
  }
}
