import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = 'mongodb+srv://amarhoussam_db_user:7XXsvyBPJgURnnAW@cluster0.n53u1kz.mongodb.net/speakup-leaders?retryWrites=true&w=majority&appName=Cluster0';

async function seed() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    
    const userSchema = new mongoose.Schema({
      name: String, email: String, password: { type: String, select: false }, role: String
    }, { strict: false });
    
    const User = mongoose.models.User || mongoose.model('User', userSchema);
    
    // Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    await User.findOneAndUpdate(
      { email: 'admin@speakup.com' },
      { name: 'الإدارة', email: 'admin@speakup.com', password: adminPassword, role: 'admin', level: 'advanced' },
      { upsert: true, new: true }
    );

    // Create Trainer
    const trainerPassword = await bcrypt.hash('trainer123', 10);
    await User.findOneAndUpdate(
      { email: 'trainer@speakup.com' },
      { name: 'المدرب الأول', email: 'trainer@speakup.com', password: trainerPassword, role: 'trainer', level: 'advanced' },
      { upsert: true, new: true }
    );

    console.log('✅ تم إنشاء الحسابات الافتراضية بنجاح!');
    console.log('-----------------------------------');
    console.log('حساب الإدارة:');
    console.log('البريد: admin@speakup.com');
    console.log('كلمة المرور: admin123');
    console.log('-----------------------------------');
    console.log('حساب المدرب:');
    console.log('البريد: trainer@speakup.com');
    console.log('كلمة المرور: trainer123');
    console.log('-----------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}
seed();
