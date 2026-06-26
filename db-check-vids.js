require('dotenv').config({path: '.env.local'});
const mongoose = require('mongoose');
const connectDB = require('./src/lib/connectDB').default;
async function run() {
  await connectDB();
  const db = mongoose.connection.db;
  const posts = await db.collection('posts').find({}).sort({createdAt: -1}).limit(5).toArray();
  const videos = await db.collection('videos').find({}).sort({createdAt: -1}).limit(5).toArray();
  console.log('--- POSTS ---');
  posts.forEach(p => console.log(p.userName, p.videoUrl));
  console.log('--- VIDEOS ---');
  videos.forEach(v => console.log(v.userName, v.url));
  process.exit(0);
}
run();
