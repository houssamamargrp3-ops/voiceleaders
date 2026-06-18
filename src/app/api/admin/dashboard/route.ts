import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import User from '@/models/User';
import Course from '@/models/Course';
import Enrollment from '@/models/Enrollment';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح - للمدراء فقط' }, { status: 403 });
    }

    await connectDB();

    const totalUsers = await User.countDocuments();
    const totalTrainers = await User.countDocuments({ role: 'trainer' });
    const activeUsers = await User.countDocuments(); // Simplification
    const totalCourses = await Course.countDocuments();
    const totalEnrollments = await Enrollment.countDocuments();

    // Latest users
    const recentUsersDocs = await User.find().sort({ createdAt: -1 }).limit(5).select('name email role');
    const recentUsers = recentUsersDocs.map(u => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      role: u.role,
    }));

    // Latest courses
    const recentCoursesDocs = await Course.find().sort({ createdAt: -1 }).limit(5).select('title instructor category enrolledStudents');
    const recentCourses = recentCoursesDocs.map(c => ({
      id: c._id.toString(),
      title: c.title,
      instructor: c.instructor,
      category: c.category,
      studentsCount: c.enrolledStudents?.length || 0
    }));

    return NextResponse.json({
      stats: {
        totalUsers,
        totalTrainers,
        activeUsers,
        totalCourses,
        totalEnrollments,
      },
      recentUsers,
      recentCourses
    });

  } catch (error: any) {
    console.error('Error fetching admin dashboard data:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب البيانات' }, { status: 500 });
  }
}
