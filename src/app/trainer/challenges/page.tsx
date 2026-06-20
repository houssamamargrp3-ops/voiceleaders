'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';

const inputStyle: React.CSSProperties = {
  width: '100%', background: '#111', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, padding: '10px 14px', color: '#fff', fontSize: '0.9rem',
  outline: 'none', fontFamily: 'inherit',
};

const statusColors: Record<string, string> = {
  active: '#4ade80', upcoming: '#60a5fa', closed: '#f87171',
};
const statusLabels: Record<string, string> = {
  active: 'نشط', upcoming: 'قادم', closed: 'منتهٍ',
};
const difficultyColors: Record<string, string> = {
  easy: '#4ade80', medium: '#f59e0b', hard: '#f87171',
};
const difficultyLabels: Record<string, string> = {
  easy: 'سهل', medium: 'متوسط', hard: 'صعب',
};

const emptyForm = {
  title: '', description: '', prompt: '', difficulty: 'medium', type: 'weekly',
  deadline: '', pointsReward: 50, minDurationSeconds: 60, maxDurationSeconds: 300,
  tags: '', prize: '', retakeAfterDays: 7, status: 'upcoming',
};

export default function TrainerChallengesPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'challenges' | 'submissions'>('challenges');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ ...emptyForm });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const [chRes, subRes] = await Promise.all([
        fetch('/api/trainer/challenges'),
        fetch('/api/trainer/challenges/submissions?status=pending'),
      ]);
      const chData = await chRes.json();
      const subData = await subRes.json();
      if (chData.success) setChallenges(chData.challenges);
      if (subData.success) setSubmissions(subData.submissions);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchChallenges(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch('/api/trainer/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          tags: formData.tags.split(',').map((t: string) => t.trim()).filter(Boolean),
          pointsReward: Number(formData.pointsReward),
          minDurationSeconds: Number(formData.minDurationSeconds),
          maxDurationSeconds: Number(formData.maxDurationSeconds),
          retakeAfterDays: Number(formData.retakeAfterDays),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'حدث خطأ');
      setIsModalOpen(false);
      setFormData({ ...emptyForm });
      fetchChallenges();
    } catch (err: any) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleReview = async (submissionId: string, action: 'approved' | 'rejected') => {
    setReviewingId(submissionId);
    try {
      const res = await fetch('/api/trainer/challenges/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, action, feedback: feedbackText }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmissions(prev => prev.filter(s => s.id !== submissionId));
        setFeedbackText('');
        if (action === 'approved' && data.pointsAwarded) {
          alert(`✅ تم القبول ومنح ${data.pointsAwarded} نقطة للمتدرب!`);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReviewingId(null);
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="badge badge-gold" style={{ marginBottom: 10 }}>👨‍🏫 لوحة المدرب</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            إدارة <span className="text-gradient">التحديات</span>
          </h1>
          <p style={{ color: '#666', fontSize: '0.85rem', marginTop: 4 }}>
            أنشئ تحديات، راجع المشاركات، وامنح النقاط
          </p>
        </div>
        <button className="btn-gold" onClick={() => setIsModalOpen(true)} style={{ fontSize: '0.85rem' }}>
          + إنشاء تحدي جديد
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 24, maxWidth: 400 }}>
        <button className={`tab-btn ${activeTab === 'challenges' ? 'active' : ''}`} onClick={() => setActiveTab('challenges')}>
          🎯 تحدياتي ({challenges.length})
        </button>
        <button className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>
          📬 للمراجعة {submissions.length > 0 && (
            <span style={{ background: '#ef4444', color: '#fff', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginRight: 4 }}>
              {submissions.length}
            </span>
          )}
        </button>
      </div>

      {/* ───── Challenges Tab ───── */}
      {activeTab === 'challenges' && (
        <>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#D4AF37' }}>جاري التحميل...</div>
          ) : challenges.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: '#111', borderRadius: 16 }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎯</div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: 8 }}>لا توجد تحديات حالياً</h3>
              <p style={{ color: '#888', marginBottom: 20 }}>ابدأ بإضافة تحدي جديد لتحفيز متدربيك.</p>
              <button className="btn-gold" onClick={() => setIsModalOpen(true)}>إنشاء تحدي الآن</button>
            </div>
          ) : (
            <div className="grid-2">
              {challenges.map(challenge => (
                <div key={challenge.id} className="card" style={{ padding: 20 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600,
                      color: statusColors[challenge.status],
                      background: `${statusColors[challenge.status]}18`,
                      border: `1px solid ${statusColors[challenge.status]}40`,
                      padding: '3px 10px', borderRadius: 100,
                    }}>
                      {statusLabels[challenge.status] || challenge.status}
                    </span>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 600,
                      color: difficultyColors[challenge.difficulty],
                      background: `${difficultyColors[challenge.difficulty]}18`,
                      border: `1px solid ${difficultyColors[challenge.difficulty]}40`,
                      padding: '3px 10px', borderRadius: 100,
                    }}>
                      {difficultyLabels[challenge.difficulty] || challenge.difficulty}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 6, color: '#fff' }}>{challenge.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: 12, lineHeight: 1.6 }}>{challenge.description}</p>

                  {challenge.prompt && (
                    <div style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
                      <p style={{ fontSize: '0.8rem', color: '#D4AF37', fontStyle: 'italic', margin: 0 }}>🎯 &ldquo;{challenge.prompt}&rdquo;</p>
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: '0.75rem', marginBottom: 12 }}>
                    <div style={{ color: '#888' }}>⭐ النقاط: <strong style={{ color: '#D4AF37' }}>{challenge.pointsReward}</strong></div>
                    <div style={{ color: '#888' }}>👥 المشاركون: <strong style={{ color: '#fff' }}>{challenge.participantsCount}</strong></div>
                    <div style={{ color: '#888' }}>⏱️ الحد الأدنى: <strong style={{ color: '#fff' }}>{Math.round((challenge.minDurationSeconds || 60) / 60)} د</strong></div>
                    <div style={{ color: '#888' }}>⏱️ الحد الأقصى: <strong style={{ color: '#fff' }}>{Math.round((challenge.maxDurationSeconds || 300) / 60)} د</strong></div>
                  </div>

                  <div style={{ paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#f87171' }}>
                      ⏳ {new Date(challenge.deadline).toLocaleDateString('ar-EG')}
                    </span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <a href={`/challenges/${challenge.id}`} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 12px', textDecoration: 'none' }}>
                        👁️ معاينة
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ───── Submissions Tab ───── */}
      {activeTab === 'submissions' && (
        <>
          {loading ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#D4AF37' }}>جاري التحميل...</div>
          ) : submissions.length === 0 ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', background: '#111', borderRadius: 16 }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>📬</div>
              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: 8 }}>لا توجد مشاركات للمراجعة</h3>
              <p style={{ color: '#888' }}>ستظهر هنا مشاركات المتدربين بانتظار موافقتك.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {submissions.map(sub => (
                <div key={sub.id} className="card" style={{ padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                    {/* Avatar */}
                    <div style={{
                      width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, color: '#0A0A0A', fontSize: '1.1rem',
                    }}>
                      {sub.userName?.[0] || 'م'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{sub.userName}</span>
                        <span style={{ fontSize: '0.75rem', color: '#D4AF37', background: 'rgba(212,175,55,0.1)', padding: '2px 10px', borderRadius: 100 }}>
                          {sub.challengeTitle}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: 10 }}>
                        🕐 {new Date(sub.createdAt).toLocaleString('ar-EG')}
                        {sub.pointsReward > 0 && <span style={{ color: '#D4AF37', marginRight: 12 }}>⭐ {sub.pointsReward} نقطة ستُمنح عند القبول</span>}
                      </div>

                      {sub.note && (
                        <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 12px', marginBottom: 12, fontSize: '0.85rem', color: '#aaa' }}>
                          💬 {sub.note}
                        </div>
                      )}

                      <a href={sub.videoUrl} target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#60a5fa', fontSize: '0.85rem', textDecoration: 'none', marginBottom: 16 }}>
                        ▶️ مشاهدة الفيديو
                      </a>

                      {/* Feedback */}
                      <div style={{ marginBottom: 12 }}>
                        <textarea
                          className="input-field"
                          rows={2}
                          placeholder="تعليق للمتدرب (اختياري)..."
                          onChange={e => setFeedbackText(e.target.value)}
                          style={{ fontSize: '0.85rem', resize: 'none', width: '100%' }}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                          className="btn-gold"
                          disabled={reviewingId === sub.id}
                          onClick={() => handleReview(sub.id, 'approved')}
                          style={{ fontSize: '0.85rem', padding: '8px 20px', opacity: reviewingId === sub.id ? 0.7 : 1 }}
                        >
                          ✅ قبول ومنح النقاط
                        </button>
                        <button
                          className="btn-ghost"
                          disabled={reviewingId === sub.id}
                          onClick={() => handleReview(sub.id, 'rejected')}
                          style={{ fontSize: '0.85rem', padding: '8px 20px', color: '#f87171', opacity: reviewingId === sub.id ? 0.7 : 1 }}
                        >
                          ❌ رفض
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ───── Create Challenge Modal ───── */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          overflowY: 'auto',
        }}>
          <div style={{
            background: '#141414', padding: 32, borderRadius: 20, width: '100%', maxWidth: 600,
            border: '1px solid rgba(212,175,55,0.2)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>🎯 إنشاء تحدي جديد</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* العنوان */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#aaa', marginBottom: 6 }}>عنوان التحدي *</label>
                <input required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  style={inputStyle} placeholder="مثال: تحدي الارتجال الأسبوعي" />
              </div>

              {/* الوصف */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#aaa', marginBottom: 6 }}>الوصف التفصيلي *</label>
                <textarea required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  style={{ ...inputStyle, resize: 'none' }} rows={3} placeholder="اشرح ما هو المطلوب بالتفصيل..." />
              </div>

              {/* الموضوع */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#aaa', marginBottom: 6 }}>موضوع التحدي (ما سيتحدث عنه المتدرب) *</label>
                <input required value={formData.prompt} onChange={e => setFormData({ ...formData, prompt: e.target.value })}
                  style={inputStyle} placeholder='مثال: "تحدث عن موقف غيّر مسار حياتك"' />
              </div>

              {/* النوع والصعوبة */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#aaa', marginBottom: 6 }}>نوع التحدي</label>
                  <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })}
                    style={{ ...inputStyle, padding: '10px 14px' }}>
                    <option value="daily">يومي</option>
                    <option value="weekly">أسبوعي</option>
                    <option value="special">خاص</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#aaa', marginBottom: 6 }}>مستوى الصعوبة</label>
                  <select value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                    style={{ ...inputStyle, padding: '10px 14px' }}>
                    <option value="easy">سهل</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">صعب</option>
                  </select>
                </div>
              </div>

              {/* المدة */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#aaa', marginBottom: 6 }}>الحد الأدنى للفيديو (ثانية)</label>
                  <input type="number" min={10} value={formData.minDurationSeconds}
                    onChange={e => setFormData({ ...formData, minDurationSeconds: Number(e.target.value) })}
                    style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#aaa', marginBottom: 6 }}>الحد الأقصى للفيديو (ثانية)</label>
                  <input type="number" min={10} value={formData.maxDurationSeconds}
                    onChange={e => setFormData({ ...formData, maxDurationSeconds: Number(e.target.value) })}
                    style={inputStyle} />
                </div>
              </div>

              {/* النقاط والجائزة */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#aaa', marginBottom: 6 }}>النقاط الممنوحة ⭐</label>
                  <input type="number" min={0} value={formData.pointsReward}
                    onChange={e => setFormData({ ...formData, pointsReward: Number(e.target.value) })}
                    style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#aaa', marginBottom: 6 }}>الجائزة (نص)</label>
                  <input value={formData.prize} onChange={e => setFormData({ ...formData, prize: e.target.value })}
                    style={inputStyle} placeholder="100 نقطة + شارة" />
                </div>
              </div>

              {/* التاريخ والحالة */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#aaa', marginBottom: 6 }}>تاريخ الإغلاق *</label>
                  <input required type="date" value={formData.deadline}
                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                    style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#aaa', marginBottom: 6 }}>الحالة عند الإنشاء</label>
                  <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                    style={{ ...inputStyle, padding: '10px 14px' }}>
                    <option value="upcoming">قادم (مجدول)</option>
                    <option value="active">نشط الآن</option>
                  </select>
                </div>
              </div>

              {/* الوسوم */}
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#aaa', marginBottom: 6 }}>الوسوم (مفصولة بفاصلة)</label>
                <input value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })}
                  style={inputStyle} placeholder="خطابة, ارتجال, تحدي" />
              </div>

              {saveError && (
                <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 16px', color: '#f87171', fontSize: '0.9rem' }}>
                  ⚠️ {saveError}
                </div>
              )}

              <button type="submit" disabled={saving} className="btn-gold"
                style={{ padding: '13px', fontSize: '1rem', marginTop: 4, opacity: saving ? 0.7 : 1 }}>
                {saving ? '⏳ جاري الحفظ...' : '🚀 نشر التحدي'}
              </button>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
