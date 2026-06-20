'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';

const statusColors: Record<string, string> = {
  active: '#4ade80', closed: '#f87171', upcoming: '#60a5fa',
};
const statusLabels: Record<string, string> = {
  active: 'نشط 🔴', closed: 'منتهٍ', upcoming: 'قادم 🔜',
};
const difficultyColors: Record<string, string> = {
  easy: '#4ade80', medium: '#f59e0b', hard: '#f87171',
};
const difficultyLabels: Record<string, string> = {
  easy: 'سهل', medium: 'متوسط', hard: 'صعب',
};
const typeLabels: Record<string, string> = {
  daily: 'يومي', weekly: 'أسبوعي', special: 'خاص',
};

export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard'>('challenges');
  const [challenges, setChallenges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('active');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    if (typeFilter) params.set('type', typeFilter);

    fetch(`/api/challenges?${params}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) setChallenges(data.challenges);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [statusFilter, typeFilter]);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetch('/api/leaderboard?limit=10')
        .then(res => res.json())
        .then(data => { if (data.success) setLeaderboard(data.leaderboard); })
        .catch(console.error);
    }
  }, [activeTab]);

  const getTimeLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) return 'انتهى';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return days > 0 ? `${days} يوم متبق` : `${hours} ساعة متبقية`;
  };

  return (
    <AppLayout>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="badge badge-gold" style={{ marginBottom: 10 }}>🏆 التحديات</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
          تنافس، <span className="text-gradient">تفوّق، وتصدّر</span>
        </h1>
        <p style={{ color: '#666', fontSize: '0.9rem', marginTop: 6 }}>
          شارك في تحديات يومية وأسبوعية، احصل على نقاط، وتصدر القائمة الذهبية
        </p>
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ maxWidth: 360, marginBottom: 28 }}>
        <button id="tab-challenges" className={`tab-btn ${activeTab === 'challenges' ? 'active' : ''}`}
          onClick={() => setActiveTab('challenges')}>
          🎯 التحديات
        </button>
        <button id="tab-leaderboard" className={`tab-btn ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}>
          📊 المتصدرون
        </button>
      </div>

      {/* ───── Challenges Tab ───── */}
      {activeTab === 'challenges' && (
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            {['active', 'upcoming', 'closed'].map(s => (
              <button key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '6px 16px', borderRadius: 100, fontSize: '0.8rem', cursor: 'pointer',
                  border: `1px solid ${statusFilter === s ? statusColors[s] : 'rgba(255,255,255,0.1)'}`,
                  background: statusFilter === s ? `${statusColors[s]}15` : 'transparent',
                  color: statusFilter === s ? statusColors[s] : '#888',
                  fontWeight: statusFilter === s ? 600 : 400, transition: 'all 0.2s',
                }}
              >
                {statusLabels[s]}
              </button>
            ))}
            <div style={{ width: 1, background: 'rgba(255,255,255,0.1)', margin: '0 4px' }} />
            {['', 'daily', 'weekly', 'special'].map(t => (
              <button key={t}
                onClick={() => setTypeFilter(t)}
                style={{
                  padding: '6px 16px', borderRadius: 100, fontSize: '0.8rem', cursor: 'pointer',
                  border: `1px solid ${typeFilter === t ? '#D4AF37' : 'rgba(255,255,255,0.1)'}`,
                  background: typeFilter === t ? 'rgba(212,175,55,0.1)' : 'transparent',
                  color: typeFilter === t ? '#D4AF37' : '#888',
                  fontWeight: typeFilter === t ? 600 : 400, transition: 'all 0.2s',
                }}
              >
                {t === '' ? 'الكل' : typeLabels[t]}
              </button>
            ))}
          </div>

          {/* Challenge Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#D4AF37' }}>⏳ جاري التحميل...</div>
            ) : challenges.length === 0 ? (
              <div style={{ padding: '60px 20px', textAlign: 'center', background: '#111', borderRadius: 16 }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎯</div>
                <p style={{ color: '#666' }}>لا توجد تحديات بهذا الفلتر حالياً.</p>
              </div>
            ) : challenges.map(challenge => (
              <div key={challenge.id} className="challenge-card" style={{ position: 'relative' }}>
                {/* Status indicator bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                  background: statusColors[challenge.status] || '#333',
                  borderRadius: '16px 16px 0 0', opacity: 0.6,
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                  <div style={{ flex: 1, minWidth: 260 }}>
                    {/* Badges */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 600,
                        color: statusColors[challenge.status],
                        background: `${statusColors[challenge.status]}18`,
                        border: `1px solid ${statusColors[challenge.status]}40`,
                        padding: '3px 10px', borderRadius: 100,
                      }}>
                        {statusLabels[challenge.status]}
                      </span>
                      <span style={{
                        fontSize: '0.72rem', color: difficultyColors[challenge.difficulty],
                        background: `${difficultyColors[challenge.difficulty]}15`,
                        border: `1px solid ${difficultyColors[challenge.difficulty]}30`,
                        padding: '3px 10px', borderRadius: 100, fontWeight: 600,
                      }}>
                        {difficultyLabels[challenge.difficulty] || 'متوسط'}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#888', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', padding: '3px 10px', borderRadius: 100 }}>
                        {typeLabels[challenge.type] || 'تحدي'}
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 6, color: '#fff' }}>
                      {challenge.title}
                    </h2>
                    <p style={{ color: '#777', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 12, maxWidth: 600 }}>
                      {challenge.description}
                    </p>

                    {/* Prompt preview */}
                    {challenge.prompt && (
                      <div style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 8, padding: '8px 14px', marginBottom: 14 }}>
                        <p style={{ color: '#D4AF37', fontSize: '0.85rem', fontStyle: 'italic', margin: 0 }}>
                          🎯 &ldquo;{challenge.prompt}&rdquo;
                        </p>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', color: '#888' }}>👥 {challenge.participantsCount} مشاركة</span>
                      <span style={{ fontSize: '0.8rem', color: getTimeLeft(challenge.deadline) === 'انتهى' ? '#f87171' : '#888' }}>
                        📅 {getTimeLeft(challenge.deadline)}
                      </span>
                      <span style={{ fontSize: '0.8rem', color: '#D4AF37', fontWeight: 600 }}>⭐ {challenge.pointsReward} نقطة</span>
                      {challenge.prize && <span style={{ fontSize: '0.8rem', color: '#888' }}>🏆 {challenge.prize}</span>}
                    </div>

                    {/* Tags */}
                    {challenge.tags?.length > 0 && (
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                        {challenge.tags.slice(0, 4).map((tag: string) => (
                          <span key={tag} className="tag">#{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
                    <Link
                      href={`/challenges/${challenge.id}`}
                      className={challenge.status === 'active' ? 'btn-gold' : 'btn-ghost'}
                      style={{ fontSize: '0.85rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
                    >
                      {challenge.status === 'active' ? '🎤 شارك الآن' : '👁️ عرض التحدي'}
                    </Link>
                    {challenge.status === 'active' && (
                      <Link href={`/challenges/${challenge.id}?tab=submissions`}
                        className="btn-ghost"
                        style={{ fontSize: '0.8rem', textDecoration: 'none' }}>
                        👀 شاهد المشاركات
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ───── Leaderboard Tab ───── */}
      {activeTab === 'leaderboard' && (
        <div>
          {/* Podium */}
          {leaderboard.length >= 3 && (
            <div style={{
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              gap: 16, marginBottom: 40, flexWrap: 'wrap',
            }}>
              {[leaderboard[1], leaderboard[0], leaderboard[2]].map((u, idx) => {
                if (!u) return null;
                const isFirst = idx === 1;
                const podiumHeight = isFirst ? 120 : 90;
                const medals = ['🥈', '🥇', '🥉'];
                return (
                  <div key={u.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{
                        width: isFirst ? 70 : 56, height: isFirst ? 70 : 56, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, fontSize: isFirst ? '1.5rem' : '1.2rem', color: '#0A0A0A',
                        border: `3px solid ${isFirst ? '#D4AF37' : idx === 0 ? '#A0A0A0' : '#CD7F32'}`,
                        boxShadow: isFirst ? '0 0 25px rgba(212,175,55,0.5)' : 'none',
                        margin: '0 auto 6px',
                      }}>
                        {u.name?.[0] || '?'}
                      </div>
                      <div style={{ fontSize: isFirst ? '1.5rem' : '1.2rem' }}>{medals[idx]}</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ddd', marginTop: 4 }}>
                        {u.name?.split(' ')[0]}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#D4AF37' }}>{u.points?.toLocaleString()} نقطة</div>
                    </div>
                    <div style={{
                      width: isFirst ? 100 : 84, height: podiumHeight,
                      background: isFirst
                        ? 'linear-gradient(180deg, rgba(212,175,55,0.25), rgba(212,175,55,0.05))'
                        : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isFirst ? 'rgba(212,175,55,0.3)' : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: '8px 8px 0 0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem',
                    }}>
                      {isFirst ? '👑' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full List */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontWeight: 700 }}>🏆 جدول المتصدرين الكامل</h3>
            </div>
            {leaderboard.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>جاري التحميل...</div>
            ) : leaderboard.map((u, i) => (
              <div key={u.id} id={`rank-${u.rank}`}
                className={`${i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                  borderBottom: i < leaderboard.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: i < 3 ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.95rem',
                  color: i === 0 ? '#D4AF37' : i === 1 ? '#A0A0A0' : i === 2 ? '#CD7F32' : '#555',
                }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${u.rank}`}
                </div>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, color: '#0A0A0A', flexShrink: 0,
                  border: i < 3 ? '2px solid rgba(212,175,55,0.4)' : '2px solid transparent',
                }}>
                  {u.name?.[0] || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{u.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#666', marginTop: 2 }}>
                    المستوى: {u.level === 'advanced' ? 'متقدم' : u.level === 'intermediate' ? 'متوسط' : 'مبتدئ'}
                  </div>
                </div>
                <div style={{ textAlign: 'left', flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, color: '#D4AF37', fontSize: '1rem' }}>
                    {u.points?.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#555' }}>نقطة</div>
                </div>
                {u.badge && <span style={{ fontSize: '1.2rem' }}>{u.badge}</span>}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 24, color: '#555', fontSize: '0.8rem' }}>
            يتم تحديث الترتيب بناءً على النقاط المكتسبة من التحديات والدورات
          </div>
        </div>
      )}
    </AppLayout>
  );
}
