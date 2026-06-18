import mongoose from 'mongoose';
import Course from './src/models/Course';
import Enrollment from './src/models/Enrollment';
import User from './src/models/User';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  
  const courses = await Course.find().lean();
  console.log(`Total Courses: ${courses.length}`);
  for (const c of courses) {
    console.log(`- Course: ${c.title} | Instructor: ${c.instructor} | InstructorId: ${c.instructorId} | EnrolledStudents: ${(c.enrolledStudents || []).length}`);
  }

  const users = await User.find().lean();
  console.log(`\nTotal Users: ${users.length}`);
  for (const u of users) {
    console.log(`- User: ${u.name} | Role: ${u.role} | ID: ${u._id}`);
  }

  const enrolls = await Enrollment.find().lean();
  console.log(`\nTotal Enrollments: ${enrolls.length}`);
  for (const e of enrolls) {
    console.log(`- Enroll: User ${e.userId} -> Course ${e.courseId}`);
  }

  process.exit(0);
}

check();
