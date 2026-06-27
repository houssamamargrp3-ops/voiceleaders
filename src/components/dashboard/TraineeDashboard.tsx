'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TraineeDashboard({ user }: { user: any }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/dashboard/trainee');
        const json = await res.json();
        if (res.ok) setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#D4AF37' }}>جاري تحميل بيانات لوحة التحكم... ⏳</div>;
  }

  const quickStats = [
    { label: 'النقاط المكتسبة', value: (data?.quickStats?.points || 0).toLocaleString(), icon: '⭐', color: '#D4AF37' },
    { label: 'دورات أكملتها', value: data?.quickStats?.completedCourses || '0', icon: '📚', color: '#60a5fa' },
    { label: 'فيديوهاتك', value: data?.quickStats?.videosCount || '0', icon: '🎥', color: '#4ade80' },
    { label: 'متابعيك', value: data?.quickStats?.followersCount || '0', icon: '👥', color: '#a78bfa' },
  ];

  const inProgressCourses = data?.inProgressCourses || [];
  const recentVideos = data?.recentVideos || [];
  const topUsers = data?.topUsers || [];
  const platformStats = data?.platformStats || { totalUsers: 0, totalVideos: 0, totalCourses: 0, countriesCount: 0 };

  return (
    <>
      {/* Welcome Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: 4 }}>
              {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff' }}>
              مرحباً، {user?.name?.split(' ')[0] || 'المتدرب'} 👋
            </h1>
            <p style={{ color: '#888', marginTop: 4 }}>
              استمر في رحلتك نحو الاحتراف. أنت في المستوى{' '}
              <span className="badge level-advanced" style={{ fontSize: '0.7rem' }}>
                {user?.level === 'advanced' ? 'متقدم' : user?.level === 'intermediate' ? 'متوسط' : 'مبتدئ'}
              </span>
            </p>
          </div>
          <Link href="/upload" className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            🎥 ارفع فيديو جديد
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {quickStats.map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }} className="dashboard-grid">

        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

          {/* Continue Learning */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 className="section-title" style={{ fontSize: '1.2rem', marginBottom: 0 }}>📚 متابعة التعلم</h2>
              <Link href="/courses" style={{ color: '#D4AF37', fontSize: '0.8rem', textDecoration: 'none' }}>تصفح الدورات</Link>
            </div>
            
            {inProgressCourses.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {inProgressCourses.map((course: any) => (
                  <Link key={course.id} href={`/courses/${course.id}`} style={{ textDecoration: 'none' }}>
                    <div className="course-card" style={{ padding: 18, flexDirection: 'row', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{
                        width: 56, height: 56, borderRadius: 12, flexShrink: 0,
                        background: 'linear-gradient(135deg, #1A1A2E, #16213E)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.5rem',
                        border: '1px solid rgba(212,175,55,0.15)',
                      }}>
                        {course.category === 'خطابة' ? '🎤' : course.category === 'قيادة' ? '🚀' : '📹'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {course.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#666', marginBottom: 8 }}>{course.instructor}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="course-progress-bar" style={{ flex: 1 }}>
                            <div className="course-progress-fill" style={{ width: `${course.progress}%` }} />
                          </div>
                          <span style={{ fontSize: '0.72rem', color: '#D4AF37', fontWeight: 600, flexShrink: 0 }}>
                            {course.progress}%
                          </span>
                        </div>
                      </div>
                      <span style={{ color: '#555', flexShrink: 0 }}>←</span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ padding: 20, textAlign: 'center', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12 }}>
                  <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: 12 }}>لم تبدأ أي دورة بعد. استكشف الدورات المتاحة وطور مهاراتك!</p>
                  <Link href="/courses" className="btn-outline">اكتشف جميع الدورات</Link>
                </div>
                
                {data?.availableCourses && data.availableCourses.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <h3 style={{ fontSize: '1rem', color: '#fff', marginBottom: 12 }}>🌟 دورات مقترحة لك</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {data.availableCourses.map((course: any) => (
                        <Link key={course.id} href={`/courses/${course.id}`} style={{ textDecoration: 'none' }}>
                          <div className="course-card" style={{ padding: 16, flexDirection: 'row', display: 'flex', alignItems: 'center', gap: 16, background: '#111', opacity: (course.isRegistrationClosed || (course.maxStudents > 0 && course.enrolledCount >= course.maxStudents)) ? 0.7 : 1 }}>
                            <div style={{ flex: 1 }}>
                              <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 600, marginBottom: 4 }}>{course.title}</h3>
                              <p style={{ fontSize: '0.8rem', color: '#888' }}>المدرب: {course.instructor}</p>
                            </div>
                            
                            {(course.isRegistrationClosed || (course.maxStudents > 0 && course.enrolledCount >= course.maxStudents)) ? (
                              <div style={{ fontSize: '0.75rem', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '4px 8px', borderRadius: 6, fontWeight: 'bold' }}>
                                🔒 اكتمل العدد / مغلق
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.8rem', color: '#D4AF37', background: 'rgba(212,175,55,0.1)', padding: '4px 8px', borderRadius: 6 }}>
                                عرض التفاصيل
                              </div>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Recent Videos from Community */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 className="section-title" style={{ fontSize: '1.2rem', marginBottom: 0 }}>🎥 من المجتمع</h2>
              <Link href="/community" style={{ color: '#D4AF37', fontSize: '0.8rem', textDecoration: 'none' }}>عرض الكل</Link>
            </div>
            {recentVideos.length > 0 ? (
              <div className="grid-3">
                {recentVideos.map((video: any) => (
                  <Link key={video.id} href="/community" style={{ textDecoration: 'none' }}>
                    <div className="video-card">
                      <div className="video-thumbnail" style={{ height: 120 }}>
                        <div style={{
                          position: 'absolute', inset: 0,
                          background: `linear-gradient(135deg, hsl(40, 30%, 15%), hsl(50, 25%, 10%))`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '2rem',
                        }}>
                          🎤
                        </div>
                        <div style={{
                          position: 'absolute', bottom: 6, left: 8,
                          background: 'rgba(0,0,0,0.7)', borderRadius: 4,
                          padding: '2px 6px', fontSize: '0.7rem', color: '#fff',
                        }}>
                          {video.duration}
                        </div>
                      </div>
                      <div style={{ padding: '10px 12px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ddd', marginBottom: 4, lineHeight: 1.4,
                          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {video.title}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#555' }}>
                          <span>{video.user?.name?.split(' ')[0] || 'مستخدم'}</span>
                          <span>❤️ {(video.likes / 1000).toFixed(1)}K</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div style={{ padding: 20, textAlign: 'center', color: '#888', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12 }}>
                لا توجد فيديوهات حتى الآن
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* AI Analysis Card */}
          <div className="card-gold" style={{ padding: 22, borderRadius: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem',
              }}>🤖</div>
              <div>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>تحليل الذكاء الاصطناعي</div>
                <div style={{ fontSize: '0.7rem', color: '#888' }}>تحليل آخر مقطع</div>
              </div>
            </div>
            {[
              { label: 'وضوح الصوت', value: 87, color: '#4ade80' },
              { label: 'سرعة الإلقاء', value: 72, color: '#D4AF37' },
              { label: 'الثقة والجرأة', value: 94, color: '#60a5fa' },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: '0.78rem', color: '#888' }}>{item.label}</span>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: item.color }}>{item.value}%</span>
                </div>
                <div style={{ height: 5, background: '#242424', borderRadius: 3 }}>
                  <div style={{
                    height: '100%', borderRadius: 3, width: `${item.value}%`,
                    background: item.color, transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            ))}
            <Link href="/feed" className="btn-ghost" style={{ display: 'block', textAlign: 'center', marginTop: 12, textDecoration: 'none', fontSize: '0.8rem', padding: '10px' }}>
              📊 تحليل كامل
            </Link>
          </div>

          {/* Leaderboard Mini */}
          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700, fontSize: '0.95rem' }}>🏆 المتصدرون</h3>
              <Link href="/leaderboard" style={{ color: '#D4AF37', fontSize: '0.75rem', textDecoration: 'none' }}>الكل</Link>
            </div>
            {topUsers.map((u: any, i: number) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 0',
                borderBottom: i < topUsers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <span style={{ width: 20, fontSize: '0.85rem', fontWeight: 700, color: i < 3 ? '#D4AF37' : '#555', flexShrink: 0 }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${u.rank}`}
                </span>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, color: '#0A0A0A', flexShrink: 0,
                }}>
                  {u.user?.name?.[0] || 'M'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#ddd', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {u.user?.name || 'مستخدم'}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#555' }}>{u.points.toLocaleString()} نقطة</div>
                </div>
              </div>
            ))}
          </div>

          {/* Platform Stats */}
          <div className="card-gold" style={{ padding: 20, borderRadius: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 16, color: '#D4AF37' }}>🌍 إحصائيات المنصة</h3>
            {[
              { label: 'خطيب مسجّل', value: platformStats.totalUsers },
              { label: 'فيديو منشور', value: platformStats.totalVideos },
              { label: 'دورة متاحة', value: platformStats.totalCourses },
              { label: 'دولة مشاركة', value: platformStats.countriesCount },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0',
                borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              }}>
                <span style={{ fontSize: '0.78rem', color: '#666' }}>{s.label}</span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#D4AF37' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
