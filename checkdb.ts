import mongoose from 'mongoose';
import Course from './src/models/Course';
import User from './src/models/User';
import Enrollment from './src/models/Enrollment';

async function check() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const courses = await Course.countDocuments();
  const users = await User.countDocuments();
  const enrolls = await Enrollment.countDocuments();
  console.log(`Courses: ${courses}, Users: ${users}, Enrollments: ${enrolls}`);
  process.exit(0);
}

check();
