'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';

export default function MyEvaluationsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/submissions/me')
      .then(res => res.json())
      .then(data => {
        if (data.success) setSubmissions(data.submissions);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const pending = submissions.filter(s => s.status === 'pending');
  const evaluated = submissions.filter(s => s.status === 'evaluated');

  return (
    <AppLayout>
      <div style={{ marginBottom: 28 }}>
        <div className="badge badge-gold" style={{ marginBottom: 10 }}>📝 تقييماتي</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
          نتائج <span className="text-gradient">التطبيقات العملية</span>
        </h1>
        <p style={{ color: '#666', fontSize: '0.9rem', marginTop: 6 }}>
          راجع درجاتك وملاحظات المدربين على تطبيقاتك المرسلة في الدورات
        </p>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#D4AF37' }}>جاري التحميل...</div>
      ) : submissions.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: '#111', borderRadius: 16 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎬</div>
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: 8 }}>لم ترسل أي تطبيق بعد</h3>
          <p style={{ color: '#888', marginBottom: 20 }}>اذهب إلى دوراتك المسجلة وأرسل تطبيقاتك ليتم تقييمها.</p>
          <Link href="/my-courses">
            <button className="btn-gold">تصفح دوراتي</button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {/* Evaluated Submissions */}
          {evaluated.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, color: '#4ade80' }}>
                ✅ تم التقييم ({evaluated.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {evaluated.map(sub => (
                  <div key={sub._id} className="card" style={{ padding: 20, borderLeft: '4px solid #4ade80' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: '0.75rem', color: '#888' }}>
                            المدرب: {sub.instructorId?.name || 'غير معروف'}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#666' }}>•</span>
                          <span style={{ fontSize: '0.75rem', color: '#888' }}>
                            {new Date(sub.evaluatedAt).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                          {sub.courseId?.title}
                        </h3>
                        <a href={sub.videoUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: '#60a5fa', textDecoration: 'underline' }}>
                          مشاهدة الفيديو المرفوع
                        </a>
                        
                        {sub.feedback && (
                          <div style={{ marginTop: 16, padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.8rem', color: '#D4AF37', fontWeight: 600, marginBottom: 6 }}>ملاحظات المدرب:</div>
                            <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: 1.6 }}>{sub.feedback}</p>
                          </div>
                        )}
                      </div>
                      
                      <div style={{ textAlign: 'center', background: 'rgba(74,222,128,0.1)', padding: '16px 24px', borderRadius: 12, border: '1px solid rgba(74,222,128,0.2)' }}>
                        <div style={{ fontSize: '0.85rem', color: '#4ade80', marginBottom: 4 }}>الدرجة</div>
                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>{sub.score}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Submissions */}
          {pending.length > 0 && (
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16, color: '#D4AF37' }}>
                ⏳ قيد المراجعة ({pending.length})
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {pending.map(sub => (
                  <div key={sub._id} className="card" style={{ padding: 20, borderLeft: '4px solid #D4AF37', background: 'rgba(212,175,55,0.02)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                      <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: 8 }}>
                          {sub.courseId?.title}
                        </h3>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>
                          المدرب: {sub.instructorId?.name || 'غير معروف'}
                          {' • '}
                          تم الإرسال: {new Date(sub.createdAt).toLocaleDateString('ar-EG')}
                        </div>
                      </div>
                      <span className="badge badge-gold">بانتظار تقييم المدرب</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
