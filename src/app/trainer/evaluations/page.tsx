'use client';
import { useState, useEffect } from 'react';

export default function EvaluationsPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/trainer/evaluations')
      .then(res => res.json())
      .then(data => {
        setSubmissions(data.submissions || []);
        setLoading(false);
      });
  }, []);

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !score) return;
    setSaving(true);

    const res = await fetch(`/api/trainer/evaluations/${selectedSub._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ score: Number(score), feedback }),
    });

    const data = await res.json();
    setSaving(false);
    if (data.success) {
      alert('تم إرسال التقييم بنجاح!');
      setSubmissions(submissions.map(s => s._id === selectedSub._id ? data.submission : s));
      setSelectedSub(null);
      setScore('');
      setFeedback('');
    } else {
      alert(data.error);
    }
  };

  const pending = submissions.filter(s => s.status === 'pending');
  const evaluated = submissions.filter(s => s.status === 'evaluated');

  return (
    <div style={{ paddingBottom: 60 }}>
      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 24 }}>طلبات التقييم المفتوحة</h2>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>جاري التحميل...</div>
      ) : submissions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, background: '#111', borderRadius: 12 }}>
          لا يوجد أي طلبات تقييم من الطلاب حالياً.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24, alignItems: 'start' }}>
          
          {/* List of submissions */}
          <div>
            <h3 style={{ fontSize: '1.1rem', color: '#D4AF37', marginBottom: 16 }}>بانتظار التقييم ({pending.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {pending.length === 0 && <p style={{ color: '#888', fontSize: '0.9rem' }}>لا يوجد طلبات جديدة.</p>}
              {pending.map(sub => (
                <div key={sub._id} onClick={() => setSelectedSub(sub)} style={{
                  background: selectedSub?._id === sub._id ? 'rgba(212,175,55,0.1)' : '#111',
                  border: `1px solid ${selectedSub?._id === sub._id ? '#D4AF37' : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: 12, padding: 16, cursor: 'pointer', transition: 'all 0.2s'
                }}>
                  <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#fff' }}>{sub.userId?.name || 'طالب غير معروف'}</div>
                  <div style={{ color: '#888', fontSize: '0.85rem', marginTop: 4 }}>
                    دورة: {sub.courseId?.title || 'غير معروف'}
                  </div>
                  <div style={{ color: '#D4AF37', fontSize: '0.75rem', marginTop: 8 }}>
                    تم الإرسال: {new Date(sub.createdAt).toLocaleDateString('ar-SA')}
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: '1.1rem', color: '#4ade80', marginBottom: 16 }}>تم التقييم ({evaluated.length})</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {evaluated.map(sub => (
                <div key={sub._id} style={{ background: '#111', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: '1.05rem', color: '#fff' }}>{sub.userId?.name}</div>
                  <div style={{ color: '#888', fontSize: '0.85rem', marginTop: 4 }}>الدرجة: <strong style={{ color: '#4ade80' }}>{sub.score}%</strong></div>
                </div>
              ))}
            </div>
          </div>

          {/* Evaluation Panel */}
          {selectedSub ? (
            <div className="card" style={{ padding: 24, position: 'sticky', top: 20 }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: 16, color: '#D4AF37' }}>تقييم الطالب: {selectedSub.userId?.name}</h3>
              
              <div style={{ marginBottom: 20 }}>
                <video src={selectedSub.videoUrl} controls style={{ width: '100%', borderRadius: 8, background: '#000' }} />
              </div>

              <form onSubmit={handleEvaluate}>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: '#ccc' }}>الدرجة (من 100) *</label>
                  <input
                    type="number" min="0" max="100" required
                    className="input"
                    value={score} onChange={e => setScore(e.target.value)}
                  />
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: '#ccc' }}>الملاحظات والتوجيه (اختياري)</label>
                  <textarea
                    rows={4}
                    className="input"
                    placeholder="اكتب ملاحظاتك على الأداء لمساعدة الطالب في التحسن..."
                    value={feedback} onChange={e => setFeedback(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-gold" style={{ width: '100%' }} disabled={saving || !score}>
                  {saving ? 'جاري الإرسال...' : 'إرسال التقييم'}
                </button>
              </form>
            </div>
          ) : (
            <div style={{ background: '#111', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: 12, padding: 40, textAlign: 'center', color: '#888' }}>
              اختر طلب تقييم من القائمة لعرض التفاصيل ومشاهدة الفيديو.
            </div>
          )}

        </div>
      )}
    </div>
  );
}
