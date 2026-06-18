import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import Course from '@/models/Course';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';

export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find().lean();
    const users = await User.find().lean();
    const enrollments = await Enrollment.find().lean();
    
    return NextResponse.json({
      coursesCount: courses.length,
      usersCount: users.length,
      enrollmentsCount: enrollments.length,
      courses: courses.map(c => ({ id: c._id, title: c.title, instructorId: c.instructorId, enrolled: c.enrolledStudents?.length })),
      users: users.map(u => ({ id: u._id, name: u.name, role: u.role }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
