import { NextResponse } from 'next/server';
import connectDB from '@/lib/connectDB';
import User from '@/models/User';

export async function GET() {
  await connectDB();
  const result = await User.updateMany({}, { role: 'trainer' });
  return NextResponse.json({ success: true, modified: result.modifiedCount });
}
