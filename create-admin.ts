import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const uriMatch = env.match(/MONGODB_URI=(.*)/);
const MONGODB_URI = uriMatch ? uriMatch[1].trim() : '';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'trainee' },
  level: { type: String, default: 'beginner' },
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function createAdmin() {
  await mongoose.connect(MONGODB_URI);
  
  let admin = await User.findOne({ email: 'admin@admin.com' });
  const hashedPassword = await bcrypt.hash('123456', 10);
  
  if (!admin) {
    admin = new User({
      name: 'المدير العام',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'admin',
      level: 'advanced'
    });
    await admin.save();
    console.log('Admin created successfully.');
  } else {
    admin.role = 'admin';
    admin.password = hashedPassword;
    await admin.save();
    console.log('Admin already exists. Role updated to admin.');
  }
  
  mongoose.disconnect();
}

createAdmin().catch(console.error);
