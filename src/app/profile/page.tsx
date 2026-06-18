import { auth } from '@/auth';
import connectDB from '@/lib/connectDB';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import Video from '@/models/Video';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/auth/login');
  }

  await connectDB();

  const user = await User.findById(session.user.id).lean();
  
  if (!user) {
    redirect('/auth/login');
  }

  // Fetch real data for this user
  let enrolledCourses: any[] = [];
  let userVideos: any[] = [];

  if (user.role === 'trainee') {
    const enrollments = await Enrollment.find({ userId: user._id }).populate({
      path: 'courseId',
      model: Course,
      select: 'title category duration',
    }).lean();
    
    enrolledCourses = enrollments.map(e => ({
      _id: e.courseId._id,
      title: (e.courseId as any).title,
      category: (e.courseId as any).category,
      duration: (e.courseId as any).duration,
      progress: e.progress,
    }));
  } else if (user.role === 'trainer') {
    const courses = await Course.find({ instructorId: user._id }).select('title category duration').lean();
    enrolledCourses = courses.map(c => ({
      _id: c._id,
      title: c.title,
      category: c.category,
      duration: c.duration,
      progress: 100, // Trainer owns the course
    }));
  }

  userVideos = await Video.find({ user: user._id }).sort({ createdAt: -1 }).lean();

  const levelLabel = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' }[user.level as 'beginner'|'intermediate'|'advanced'] || 'مبتدئ';
  const roleLabel = { admin: 'مشرف', trainer: 'مدرب', trainee: 'متدرب' }[user.role as 'admin'|'trainer'|'trainee'] || 'متدرب';
  const levelClass = `level-${user.level || 'beginner'}`;

  return (
    <AppLayout>
      <div style={{ maxWidth: 860, margin: '0 auto', paddingBottom: 60 }}>
        
        {/* Profile Card */}
        <div style={{
          background: '#111', border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 16, padding: '40px 28px 24px',
          marginTop: 40, position: 'relative',
        }}>
          {/* Avatar */}
          <div style={{
            position: 'absolute', top: -44, right: 28,
            width: 88, height: 88, borderRadius: '50%',
            background: 'linear-gradient(135deg, #A8860F, #D4AF37, #F5D060)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: '2.2rem', color: '#0A0A0A',
            border: '4px solid #111',
            boxShadow: '0 0 0 2px rgba(212,175,55,0.4), 0 0 25px rgba(212,175,55,0.3)',
          }}>
            {user.name.charAt(0)}
          </div>

          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>{user.name}</h1>
              <span className={`badge ${levelClass}`}>{levelLabel}</span>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>{roleLabel}</span>
            </div>
            
            <div style={{ color: '#888', fontSize: '1rem', marginBottom: 20 }}>
              ✉️ {user.email}
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#D4AF37' }}>{user.points || 0}</span>
                <span style={{ color: '#555', fontSize: '0.85rem', marginRight: 5 }}>نقطة</span>
              </div>
              <div>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#D4AF37' }}>{enrolledCourses.length}</span>
                <span style={{ color: '#555', fontSize: '0.85rem', marginRight: 5 }}>دورات مسجلة</span>
              </div>
              <div>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#D4AF37' }}>{userVideos.length}</span>
                <span style={{ color: '#555', fontSize: '0.85rem', marginRight: 5 }}>فيديوهات مرفوعة</span>
              </div>

              <div style={{ marginRight: 'auto' }}>
                <Link href="/settings" className="btn-outline" style={{ display: 'inline-block', padding: '6px 16px', fontSize: '0.8rem', borderRadius: 8 }}>
                  ⚙️ تعديل الملف الشخصي
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div style={{ marginTop: 40 }}>
          
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            📚 دوراتي التدريبية
          </h2>
          
          {enrolledCourses.length > 0 ? (
            <div className="grid-2">
              {enrolledCourses.map((course: any) => (
                <Link key={course._id.toString()} href={`/courses/${course._id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    background: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 20,
                    transition: 'all 0.2s ease', cursor: 'pointer',
                  }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#D4AF37', marginBottom: 10 }}>{course.title}</h3>
                    <div style={{ color: '#888', fontSize: '0.8rem', marginBottom: 15 }}>
                      القسم: {course.category} • ⏱️ {course.duration}
                    </div>
                    {user.role === 'trainee' && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ flex: 1, height: 6, background: '#222', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ width: `${course.progress}%`, height: '100%', background: course.progress === 100 ? '#4ade80' : '#D4AF37' }}></div>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: course.progress === 100 ? '#4ade80' : '#aaa' }}>{Math.round(course.progress)}%</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', background: '#111', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ color: '#666', marginBottom: 16 }}>لم تقم بالتسجيل في أي دورة بعد.</p>
              <Link href="/courses" className="btn-gold" style={{ padding: '8px 24px', fontSize: '0.9rem' }}>استكشف الدورات</Link>
            </div>
          )}

          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: 20, marginTop: 40, display: 'flex', alignItems: 'center', gap: 10 }}>
            🎥 فيديوهاتي
          </h2>

          {userVideos.length > 0 ? (
            <div className="grid-3">
              {userVideos.map((video: any) => (
                <div key={video._id.toString()} style={{
                  background: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, overflow: 'hidden'
                }}>
                  <div style={{
                    aspectRatio: '16/9', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    🎬
                  </div>
                  <div style={{ padding: 16 }}>
                    <h3 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{video.title}</h3>
                    <div style={{ color: '#666', fontSize: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span>👁️ {video.views}</span>
                      <span>❤️ {video.likes?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: 'center', background: '#111', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
              <p style={{ color: '#666', marginBottom: 16 }}>لم تقم برفع أي فيديو بعد.</p>
              <Link href="/upload" className="btn-outline" style={{ padding: '8px 24px', fontSize: '0.9rem' }}>رفع فيديو جديد</Link>
            </div>
          )}

        </div>
      </div>
    </AppLayout>
  );
}
