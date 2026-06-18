'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { mockChallenges, mockLeaderboard } from '@/lib/mockData';

const statusColors: Record<string, string> = {
  active: '#4ade80', closed: '#f87171', upcoming: '#60a5fa',
};
const statusLabels: Record<string, string> = {
  active: 'نشط 🔴', closed: 'منتهٍ', upcoming: 'قادم 🔜',
};

export default function ChallengesPage() {
  const [activeTab, setActiveTab] = useState<'challenges' | 'leaderboard'>('challenges');
  const [selectedChallenge, setSelectedChallenge] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/challenges')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setChallenges(data.challenges);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const selected = challenges.find(c => c.id === selectedChallenge);

  return (
    <AppLayout>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div className="badge badge-gold" style={{ marginBottom: 10 }}>🏆 التحديات</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
          تنافس، <span className="text-gradient">تفوّق، وتصدّر</span>
        </h1>
        <p style={{ color: '#666', fontSize: '0.9rem', marginTop: 6 }}>
          شارك في تحديات أسبوعية، احصل على أصوات، وتصدر القائمة الذهبية
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

      {activeTab === 'challenges' && (
        <div>
          {/* Challenge Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#D4AF37' }}>جاري التحميل...</div>
            ) : challenges.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>لا توجد تحديات حالياً.</div>
            ) : challenges.map(challenge => (
              <div key={challenge.id} className="challenge-card">
                {/* Status bar */}
                <div style={{
                  height: 3, background: 'rgba(255,255,255,0.05)', borderRadius: '16px 16px 0 0',
                  marginBottom: 0, position: 'absolute', top: 0, left: 0, right: 0,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', width: challenge.status === 'active' ? '60%' : challenge.status === 'closed' ? '100%' : '0%',
                    background: statusColors[challenge.status], transition: 'width 1s ease',
                  }} />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
                      <span style={{
                        fontSize: '0.72rem', fontWeight: 600,
                        color: statusColors[challenge.status],
                        background: `${statusColors[challenge.status]}18`,
                        border: `1px solid ${statusColors[challenge.status]}40`,
                        padding: '3px 10px', borderRadius: 100,
                      }}>
                        {statusLabels[challenge.status]}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#666' }}>{challenge.week}</span>
                    </div>

                    <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 8, color: '#fff' }}>
                      {challenge.title}
                    </h2>
                    <p style={{ color: '#777', fontSize: '0.85rem', lineHeight: 1.6, marginBottom: 12, maxWidth: 600 }}>
                      {challenge.description}
                    </p>

                    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.8rem', color: '#888' }}>👥 {challenge.participants} مشارك</span>
                      <span style={{ fontSize: '0.8rem', color: '#888' }}>📅 {challenge.deadline}</span>
                      <span style={{ fontSize: '0.8rem', color: '#D4AF37' }}>🏆 {challenge.prize}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    {challenge.status === 'active' && (
                      <button id={`join-${challenge.id}`} className="btn-gold" style={{ fontSize: '0.85rem' }}>
                        🎥 شارك الآن
                      </button>
                    )}
                    {challenge.status === 'upcoming' && (
                      <button className="btn-outline" style={{ fontSize: '0.85rem' }}>
                        🔔 تنبّهني
                      </button>
                    )}
                    {challenge.submissions.length > 0 && (
                      <button
                        id={`view-${challenge.id}`}
                        className="btn-ghost"
                        onClick={() => setSelectedChallenge(selectedChallenge === challenge.id ? null : challenge.id)}
                        style={{ fontSize: '0.8rem' }}>
                        {selectedChallenge === challenge.id ? 'إخفاء' : '👀 عرض النتائج'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Results */}
                {selectedChallenge === challenge.id && selected && (
                  <div style={{ marginTop: 20, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20 }}>
                    <h4 style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 12, color: '#D4AF37' }}>
                      🏅 نتائج التحدي
                    </h4>
                    {selected.submissions.map((sub, i) => (
                      <div key={sub.userId} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '10px 14px', borderRadius: 10, marginBottom: 8,
                        background: i === 0 ? 'rgba(212,175,55,0.08)' : i === 1 ? 'rgba(192,192,192,0.05)' : 'rgba(255,255,255,0.02)',
                        border: `1px solid ${i === 0 ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.04)'}`,
                      }}>
                        <span style={{ fontSize: '1.2rem', width: 30, textAlign: 'center' }}>
                          {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${sub.rank}`}
                        </span>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 700, color: '#0A0A0A',
                        }}>{sub.userName[0]}</div>
                        <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 500, color: '#ddd' }}>{sub.userName}</span>
                        <div style={{ textAlign: 'left' }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#D4AF37' }}>
                            👍 {sub.votes.toLocaleString()} صوت
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div>
          {/* Top 3 Podium */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            gap: 16, marginBottom: 40, flexWrap: 'wrap',
          }}>
            {[mockLeaderboard[1], mockLeaderboard[0], mockLeaderboard[2]].map((u, idx) => {
              const isFirst = idx === 1;
              const podiumHeight = isFirst ? 120 : 90;
              const medals = ['🥈', '🥇', '🥉'];
              return (
                <div key={u.rank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
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
                      {u.user.name[0]}
                    </div>
                    <div style={{ fontSize: isFirst ? '1.5rem' : '1.2rem' }}>{medals[idx]}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#ddd', marginTop: 4 }}>
                      {u.user.name.split(' ')[0]}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#D4AF37' }}>{u.points.toLocaleString()} نقطة</div>
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

          {/* Full Leaderboard Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontWeight: 700 }}>🏆 جدول المتصدرين الكامل</h3>
            </div>
            {mockLeaderboard.map((u, i) => (
              <div key={u.rank} id={`rank-${u.rank}`}
                className={`${i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 20px',
                  borderBottom: i < mockLeaderboard.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                  transition: 'background 0.2s ease',
                  cursor: 'pointer',
                }}>

                {/* Rank */}
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: i < 3 ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.03)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.95rem',
                  color: i === 0 ? '#D4AF37' : i === 1 ? '#A0A0A0' : i === 2 ? '#CD7F32' : '#555',
                }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${u.rank}`}
                </div>

                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, color: '#0A0A0A', flexShrink: 0,
                  border: i < 3 ? '2px solid rgba(212,175,55,0.4)' : '2px solid transparent',
                }}>
                  {u.user.name[0]}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{u.user.name}</div>
                  <div style={{ fontSize: '0.72rem', color: '#666', marginTop: 2 }}>
                    {u.challengesWon} تحدٍّ فائز · {u.videosCount} فيديو
                  </div>
                </div>

                {/* Stats */}
                <div style={{ textAlign: 'left', flexShrink: 0 }}>
                  <div style={{ fontWeight: 800, color: '#D4AF37', fontSize: '1rem' }}>
                    {u.points.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#555' }}>نقطة</div>
                </div>

                {u.badge && <span style={{ fontSize: '1.2rem' }}>{u.badge}</span>}
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 24, color: '#555', fontSize: '0.8rem' }}>
            يتم تحديث الترتيب كل أسبوع بناءً على الأصوات والمشاركات
          </div>
        </div>
      )}
    </AppLayout>
  );
}
