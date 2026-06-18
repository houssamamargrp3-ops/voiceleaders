import mongoose from 'mongoose';
import fs from 'fs';

// Load .env.local
const env = fs.readFileSync('.env.local', 'utf-8');
const uriMatch = env.match(/MONGODB_URI=(.*)/);
const uri = uriMatch ? uriMatch[1] : '';

const courseSchema = new mongoose.Schema({}, { strict: false });
const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

async function check() {
  await mongoose.connect(uri);
  const courses = await Course.find().lean();
  console.log(`Total Courses: ${courses.length}`);
  for (const c of courses) {
    console.log(`- Course: ${c.title} | Instructor: ${c.instructor} | InstructorId: ${c.instructorId} | EnrolledStudents: ${(c.enrolledStudents || []).length}`);
  }
  process.exit(0);
}

check();
