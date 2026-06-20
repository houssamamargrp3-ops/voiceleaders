'use client';
import { useState, useEffect, use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const difficultyColors: Record<string, string> = {
  easy: '#4ade80',
  medium: '#f59e0b',
  hard: '#f87171',
};
const difficultyLabels: Record<string, string> = {
  easy: 'سهل',
  medium: 'متوسط',
  hard: 'صعب',
};
const typeLabels: Record<string, string> = {
  daily: 'يومي',
  weekly: 'أسبوعي',
  special: 'خاص',
};

export default function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [challenge, setChallenge] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'submit' | 'submissions'>('info');

  const [videoUrl, setVideoUrl] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [votingId, setVotingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [challengeRes, subsRes] = await Promise.all([
          fetch(`/api/challenges/${id}`),
          fetch(`/api/challenges/${id}/submissions`),
        ]);
        const challengeData = await challengeRes.json();
        const subsData = await subsRes.json();
        if (challengeData.success) setChallenge(challengeData.challenge);
        if (subsData.success) setSubmissions(subsData.submissions);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitting(true);
    try {
      const res = await fetch(`/api/challenges/${id}/submissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'حدث خطأ');
      setSubmitted(true);
      setActiveTab('submissions');
    } catch (err: any) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (submissionId: string) => {
    setVotingId(submissionId);
    try {
      const res = await fetch(`/api/challenges/${id}/submissions/${submissionId}/vote`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setSubmissions(prev => prev.map(s => {
          if (s.id !== submissionId) return s;
          return {
            ...s,
            votes: data.action === 'voted' ? s.votes + 1 : s.votes - 1,
            hasVoted: data.action === 'voted',
          };
        }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setVotingId(null);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#D4AF37' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>⏳</div>
          <p>جاري التحميل...</p>
        </div>
      </AppLayout>
    );
  }

  if (!challenge) {
    return (
      <AppLayout>
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <h2 style={{ color: '#f87171' }}>⚠️ التحدي غير موجود</h2>
          <Link href="/challenges" className="btn-gold" style={{ display: 'inline-block', marginTop: 20 }}>
            العودة للتحديات
          </Link>
        </div>
      </AppLayout>
    );
  }

  const deadline = new Date(challenge.deadline);
  const isExpired = new Date() > deadline;
  const timeLeft = deadline.getTime() - Date.now();
  const hoursLeft = Math.floor(timeLeft / (1000 * 60 * 60));
  const daysLeft = Math.floor(hoursLeft / 24);

  const timeLeftText = isExpired
    ? 'انتهى التحدي'
    : daysLeft > 0
    ? `${daysLeft} يوم متبق`
    : `${hoursLeft} ساعة متبقية`;

  return (
    <AppLayout>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: '0.85rem', color: '#666' }}>
        <Link href="/challenges" style={{ color: '#666', textDecoration: 'none' }}>التحديات</Link>
        <span>/</span>
        <span style={{ color: '#D4AF37' }}>{challenge.title}</span>
      </div>

      {/* Hero Banner */}
      <div style={{
        background: challenge.status === 'active'
          ? 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.03))'
          : challenge.status === 'upcoming'
          ? 'linear-gradient(135deg, rgba(96,165,250,0.15), rgba(96,165,250,0.03))'
          : 'linear-gradient(135deg, rgba(100,100,100,0.1), rgba(50,50,50,0.05))',
        border: `1px solid ${challenge.status === 'active' ? 'rgba(212,175,55,0.25)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 20,
        padding: '32px 28px',
        marginBottom: 28,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Top badges */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <span style={{
            background: challenge.status === 'active' ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.08)',
            color: challenge.status === 'active' ? '#4ade80' : '#aaa',
            border: `1px solid ${challenge.status === 'active' ? 'rgba(74,222,128,0.3)' : 'rgba(255,255,255,0.1)'}`,
            padding: '3px 12px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600,
          }}>
            {challenge.status === 'active' ? '🔴 نشط الآن' : challenge.status === 'upcoming' ? '🔜 قادم' : '⏹ منتهٍ'}
          </span>
          <span style={{ background: 'rgba(255,255,255,0.05)', color: '#aaa', border: '1px solid rgba(255,255,255,0.08)', padding: '3px 12px', borderRadius: 100, fontSize: '0.75rem' }}>
            {typeLabels[challenge.type] || 'تحدي'}
          </span>
          <span style={{
            background: `${difficultyColors[challenge.difficulty]}18`,
            color: difficultyColors[challenge.difficulty],
            border: `1px solid ${difficultyColors[challenge.difficulty]}40`,
            padding: '3px 12px', borderRadius: 100, fontSize: '0.75rem', fontWeight: 600,
          }}>
            {difficultyLabels[challenge.difficulty] || 'متوسط'}
          </span>
        </div>

        <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', marginBottom: 12 }}>
          {challenge.title}
        </h1>
        <p style={{ color: '#999', lineHeight: 1.7, maxWidth: 700, marginBottom: 20 }}>
          {challenge.description}
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '1.1rem' }}>⏱️</span>
            <span style={{ color: isExpired ? '#f87171' : '#D4AF37', fontWeight: 600, fontSize: '0.9rem' }}>{timeLeftText}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '1.1rem' }}>👥</span>
            <span style={{ color: '#aaa', fontSize: '0.9rem' }}>{challenge.participantsCount} مشاركة</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: '1.1rem' }}>⭐</span>
            <span style={{ color: '#D4AF37', fontWeight: 700, fontSize: '0.9rem' }}>{challenge.pointsReward} نقطة</span>
          </div>
          {challenge.prize && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '1.1rem' }}>🏆</span>
              <span style={{ color: '#aaa', fontSize: '0.9rem' }}>{challenge.prize}</span>
            </div>
          )}
        </div>

        {challenge.status === 'active' && !submitted && (
          <button className="btn-gold" style={{ fontSize: '0.95rem', padding: '10px 28px' }}
            onClick={() => setActiveTab('submit')}>
            🎤 شارك في التحدي الآن
          </button>
        )}
        {submitted && (
          <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 10, padding: '12px 20px', color: '#4ade80', fontWeight: 600 }}>
            ✅ تم إرسال مشاركتك بنجاح! في انتظار مراجعة المدرب.
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: 24, maxWidth: 500 }}>
        <button className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`} onClick={() => setActiveTab('info')}>
          📋 الموضوع
        </button>
        {challenge.status === 'active' && (
          <button className={`tab-btn ${activeTab === 'submit' ? 'active' : ''}`} onClick={() => setActiveTab('submit')}>
            🎥 رفع مشاركة
          </button>
        )}
        <button className={`tab-btn ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>
          👀 المشاركات ({submissions.length})
        </button>
      </div>

      {/* Tab: Info */}
      {activeTab === 'info' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Prompt box */}
          <div style={{
            background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: 16, padding: 28,
          }}>
            <h3 style={{ color: '#D4AF37', fontWeight: 700, marginBottom: 12, fontSize: '1.1rem' }}>🎯 موضوع التحدي</h3>
            <p style={{ color: '#ddd', fontSize: '1.1rem', lineHeight: 1.8, fontStyle: 'italic' }}>
              &ldquo;{challenge.prompt}&rdquo;
            </p>
          </div>

          {/* Rules */}
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#fff' }}>📌 شروط المشاركة</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                challenge.minDurationSeconds && `مدة الفيديو: من ${challenge.minDurationSeconds} ثانية (${Math.round(challenge.minDurationSeconds / 60)} دقيقة)`,
                challenge.maxDurationSeconds && `إلى ${challenge.maxDurationSeconds} ثانية (${Math.round(challenge.maxDurationSeconds / 60)} دقيقة)`,
                'يجب أن يكون المحتوى أصيلاً وتسجيلك الشخصي',
                'يجب أن يرتبط الفيديو بموضوع التحدي المحدد',
                `مكافأة الإتمام: ${challenge.pointsReward} نقطة`,
              ].filter(Boolean).map((rule, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, color: '#aaa', fontSize: '0.9rem' }}>
                  <span style={{ color: '#D4AF37', fontWeight: 700, marginTop: 1 }}>•</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {challenge.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {challenge.tags.map((tag: string) => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Submit */}
      {activeTab === 'submit' && challenge.status === 'active' && (
        <div className="card" style={{ padding: 32, maxWidth: 600 }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
              <h2 style={{ color: '#4ade80', marginBottom: 12 }}>تم إرسال مشاركتك!</h2>
              <p style={{ color: '#aaa', marginBottom: 24 }}>ستظهر مشاركتك بعد مراجعة المدرب وستحصل على {challenge.pointsReward} نقطة.</p>
              <button className="btn-gold" onClick={() => setActiveTab('submissions')}>
                👀 شاهد المشاركات
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: 8 }}>🎥 رفع مشاركتك</h2>
              <p style={{ color: '#888', marginBottom: 24, fontSize: '0.9rem' }}>
                الموضوع: <strong style={{ color: '#D4AF37' }}>&ldquo;{challenge.prompt}&rdquo;</strong>
              </p>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <label style={{ display: 'block', color: '#aaa', marginBottom: 8, fontSize: '0.9rem' }}>
                    رابط الفيديو <span style={{ color: '#f87171' }}>*</span>
                  </label>
                  <input
                    type="url"
                    required
                    className="input-field"
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=... أو رابط آخر"
                    style={{ width: '100%' }}
                  />
                  <p style={{ color: '#555', fontSize: '0.78rem', marginTop: 6 }}>
                    يمكنك استخدام YouTube أو Vimeo أو أي منصة أخرى
                  </p>
                </div>

                <div>
                  <label style={{ display: 'block', color: '#aaa', marginBottom: 8, fontSize: '0.9rem' }}>
                    ملاحظة (اختياري)
                  </label>
                  <textarea
                    className="input-field"
                    rows={3}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="أضف وصفاً موجزاً لمشاركتك أو أي ملاحظة..."
                    style={{ width: '100%', resize: 'none' }}
                    maxLength={500}
                  />
                </div>

                {submitError && (
                  <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 10, padding: '10px 16px', color: '#f87171', fontSize: '0.9rem' }}>
                    ⚠️ {submitError}
                  </div>
                )}

                <div style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 12, padding: '14px 18px', fontSize: '0.85rem', color: '#888' }}>
                  ⭐ ستحصل على <strong style={{ color: '#D4AF37' }}>{challenge.pointsReward} نقطة</strong> عند موافقة المدرب
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-gold"
                  style={{ padding: '14px', fontSize: '1rem', opacity: submitting ? 0.7 : 1 }}
                >
                  {submitting ? '⏳ جاري الإرسال...' : '🚀 إرسال المشاركة'}
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Tab: Submissions */}
      {activeTab === 'submissions' && (
        <div>
          {submissions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎤</div>
              <p>لا توجد مشاركات معتمدة بعد. كن أول من يشارك!</p>
              {challenge.status === 'active' && (
                <button className="btn-gold" style={{ marginTop: 20 }} onClick={() => setActiveTab('submit')}>
                  شارك الآن
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {submissions.map((sub, idx) => (
                <div key={sub.id} className="card" style={{
                  padding: 20,
                  borderColor: idx === 0 ? 'rgba(212,175,55,0.3)' : undefined,
                  background: idx === 0 ? 'rgba(212,175,55,0.03)' : undefined,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    {/* Rank */}
                    <div style={{ fontSize: '1.5rem', width: 40, textAlign: 'center', flexShrink: 0 }}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                    </div>

                    {/* Avatar */}
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, color: '#0A0A0A', fontSize: '1rem',
                    }}>
                      {sub.userName?.[0] || 'م'}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: '#fff', marginBottom: 4 }}>{sub.userName}</div>
                      {sub.note && <div style={{ fontSize: '0.8rem', color: '#777', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.note}</div>}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                      <a
                        href={sub.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost"
                        style={{ fontSize: '0.8rem', padding: '6px 14px', textDecoration: 'none' }}
                      >
                        ▶️ مشاهدة
                      </a>
                      <button
                        onClick={() => handleVote(sub.id)}
                        disabled={votingId === sub.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 6,
                          padding: '6px 14px', borderRadius: 8, border: 'none',
                          background: sub.hasVoted ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.05)',
                          color: sub.hasVoted ? '#D4AF37' : '#888',
                          cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem',
                          transition: 'all 0.2s',
                        }}
                      >
                        👍 {sub.votes}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
}
