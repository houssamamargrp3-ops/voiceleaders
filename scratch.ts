import mongoose from 'mongoose';
import User from './src/models/User';

async function makeTrainer() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const res = await User.updateMany({}, { role: 'trainer' });
  console.log(`Updated ${res.modifiedCount} users to trainer.`);
  process.exit(0);
}

makeTrainer();
