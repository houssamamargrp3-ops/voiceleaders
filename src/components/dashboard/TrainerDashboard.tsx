'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import EvaluateModal from '../evaluations/EvaluateModal';

export default function TrainerDashboard({ user }: { user: any }) {
  const [data, setData] = useState<{
    myCourses: any[];
    pendingEvaluations: any[];
    quickStats: any;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard/trainer');
      const json = await res.json();
      if (res.ok) setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluationComplete = () => {
    fetchDashboardData(); // Refresh list after evaluation
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#D4AF37' }}>جاري تحميل بيانات لوحة التحكم... ⏳</div>;

  const { myCourses = [], pendingEvaluations = [], quickStats = {} } = data || {};

  const statsList = [
    { label: 'تقييمات أنجزتها', value: quickStats.evaluationsDone || '0', icon: '📝', color: '#4ade80' },
    { label: 'طلاب دربتهم', value: quickStats.totalStudents || '0', icon: '👨‍🎓', color: '#60a5fa' },
    { label: 'متوسط تقييمك', value: quickStats.averageRating || '0', icon: '⭐', color: '#D4AF37' },
    { label: 'دورات نشطة', value: quickStats.activeCourses || '0', icon: '🎥', color: '#a78bfa' },
  ];

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
              مرحباً أيها المدرب، {user?.name?.split(' ')[0] || 'المدرب'} 🎓
            </h1>
            <p style={{ color: '#888', marginTop: 4 }}>
              لديك <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>{pendingEvaluations.length} طلبات</span> في انتظار مراجعتك اليوم.
            </p>
          </div>
          <Link href="/trainer/my-courses" className="btn-gold" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            ➕ إدارة دوراتي
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {statsList.map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#666', marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }} className="dashboard-grid">
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          
          {/* Pending Evaluations */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 className="section-title" style={{ fontSize: '1.2rem', marginBottom: 0 }}>📋 تطبيقات في انتظار التقييم</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {pendingEvaluations.map(evaluation => (
                <div key={evaluation.id} className="card" style={{ padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 46, height: 46, borderRadius: '50%', background: '#1A1A1A',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                    }}>
                      👤
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{evaluation.user}</div>
                      <div style={{ fontSize: '0.8rem', color: '#888', marginTop: 2 }}>{evaluation.title}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>{evaluation.date}</span>
                    <button 
                      onClick={() => setSelectedEvaluation(evaluation)}
                      className="btn-gold" 
                      style={{ padding: '8px 16px', fontSize: '0.8rem' }}
                    >
                      بدء التقييم
                    </button>
                  </div>
                </div>
              ))}
              {pendingEvaluations.length === 0 && (
                <div style={{ textAlign: 'center', padding: 40, color: '#666', background: '#111', borderRadius: 16 }}>
                  لا توجد فيديوهات في انتظار تقييمك حالياً. يمكنك أخذ استراحة! ☕
                </div>
              )}
            </div>
          </div>

          {/* Trainer's Courses */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 className="section-title" style={{ fontSize: '1.2rem', marginBottom: 0 }}>📚 دوراتي</h2>
            </div>
            <div className="grid-2">
              {myCourses.map(course => (
                <Link href={`/courses/${course.id}`} key={course.id} className="course-card" style={{ padding: 20, textDecoration: 'none', display: 'block' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>📹</div>
                  <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: 8 }}>{course.title}</h3>
                  <div style={{ display: 'flex', gap: 16, fontSize: '0.8rem', color: '#888' }}>
                    <span>👨‍🎓 {course.students} طالب</span>
                    <span style={{ color: '#D4AF37' }}>⭐ {course.rating}</span>
                  </div>
                </Link>
              ))}
              {myCourses.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 40, color: '#666', background: '#111', borderRadius: 16 }}>
                  لم تقم بإنشاء أي دورات بعد.
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Quick Actions */}
          <div className="card-gold" style={{ padding: 20, borderRadius: 16 }}>
            <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16, color: '#fff' }}>⚡ إجراءات سريعة</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/courses/create" className="btn-ghost" style={{ width: '100%', textAlign: 'right', padding: 12, justifyContent: 'flex-start', textDecoration: 'none', display: 'block' }}>
                ➕ إنشاء دورة جديدة
              </Link>
              <button className="btn-ghost" style={{ width: '100%', textAlign: 'right', padding: 12, justifyContent: 'flex-start' }}>
                🎤 نشر تحدي للطلاب
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Evaluation Modal */}
      {selectedEvaluation && (
        <EvaluateModal 
          evaluation={selectedEvaluation} 
          onClose={() => setSelectedEvaluation(null)}
          onSuccess={handleEvaluationComplete}
        />
      )}

      <style>{`
        @media (max-width: 1024px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
