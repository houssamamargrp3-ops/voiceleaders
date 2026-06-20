'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';

export default function FeedPage() {
  const [activeChallenge, setActiveChallenge] = useState<any>(null);
  const [liveRooms, setLiveRooms] = useState<any[]>([]);
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [challengeRes, roomsRes, leaderRes] = await Promise.all([
          fetch('/api/challenges?status=active&limit=1'),
          fetch('/api/rooms?limit=3'),
          fetch('/api/leaderboard?limit=3'),
        ]);
        const [challengeData, roomsData, leaderData] = await Promise.all([
          challengeRes.json(),
          roomsRes.json(),
          leaderRes.json(),
        ]);
        if (challengeData.success && challengeData.challenges?.length > 0) {
          setActiveChallenge(challengeData.challenges[0]);
        }
        setLiveRooms(roomsData.rooms || []);
        if (leaderData.success) setTopUsers(leaderData.leaderboard || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const getTimeLeft = (deadline: string) => {
    const diff = new Date(deadline).getTime() - Date.now();
    if (diff <= 0) return 'انتهى التحدي';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    return days > 0 ? `${days} يوم متبق` : `${hours} ساعة متبقية`;
  };

  const medalEmojis = ['🥇', '🥈', '🥉'];

  return (
    <AppLayout>
      {/* ── Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            🎤 <span className="text-gradient">الرئيسية</span>
          </h1>
          <p style={{ color: '#666', fontSize: '0.85rem', marginTop: 4 }}>مرحباً! اكتشف التحديات الجديدة والغرف الحية</p>
        </div>
        <Link href="/challenges" className="btn-gold" style={{ textDecoration: 'none', fontSize: '0.85rem' }}>
          🏆 كل التحديات
        </Link>
      </div>

      {/* ── Daily Challenge Banner ── */}
      {!loading && (
        activeChallenge ? (
          <div style={{
            background: 'linear-gradient(135deg, #c0392b, #e67e22)',
            borderRadius: 16, padding: 28, color: '#fff', marginBottom: 32,
            position: 'relative', overflow: 'hidden',
          }}>
            {/* Decorative blur */}
            <div style={{
              position: 'absolute', top: -40, right: -40, width: 180, height: 180,
              background: 'rgba(255,255,255,0.08)', borderRadius: '50%', pointerEvents: 'none',
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <span style={{ background: 'rgba(0,0,0,0.3)', padding: '4px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>
                  🔥 تحدي {activeChallenge.type === 'daily' ? 'اليوم' : 'الأسبوع'}
                </span>
                <h2 style={{ margin: '14px 0 8px', fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 800 }}>
                  &ldquo;{activeChallenge.prompt || activeChallenge.title}&rdquo;
                </h2>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20, fontSize: '0.85rem', opacity: 0.9 }}>
                  <span>⏱️ {getTimeLeft(activeChallenge.deadline)}</span>
                  <span>👥 {activeChallenge.participantsCount} مشاركة</span>
                  <span>⭐ {activeChallenge.pointsReward} نقطة</span>
                </div>
              </div>
              <Link
                href={`/challenges/${activeChallenge.id}`}
                style={{
                  background: '#fff', color: '#c0392b', padding: '10px 24px', borderRadius: 10,
                  fontWeight: 700, textDecoration: 'none', fontSize: '0.9rem', flexShrink: 0,
                  display: 'inline-block',
                }}
              >
                شارك الآن 🎤
              </Link>
            </div>
          </div>
        ) : (
          <div style={{
            background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)',
            borderRadius: 16, padding: 24, marginBottom: 32, textAlign: 'center',
          }}>
            <p style={{ color: '#555' }}>لا يوجد تحدي نشط حالياً</p>
            <Link href="/challenges" style={{ color: '#D4AF37', textDecoration: 'none', fontSize: '0.9rem' }}>
              عرض كل التحديات ←
            </Link>
          </div>
        )
      )}

      {/* ── Live Rooms Strip ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>⚡ غرف حية الآن</h3>
          <Link href="/rooms" style={{ color: '#D4AF37', textDecoration: 'none', fontSize: '0.85rem' }}>عرض الكل ←</Link>
        </div>

        <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8 }}>
          {liveRooms.length > 0 ? liveRooms.map(room => (
            <Link key={room.id} href={`/rooms/${room.id}`} style={{
              background: '#111', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: 18, minWidth: 210, textDecoration: 'none', color: '#fff',
              flexShrink: 0, transition: 'border-color 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{
                  width: 8, height: 8, background: '#ef4444', borderRadius: '50%',
                  display: 'inline-block', boxShadow: '0 0 6px #ef4444',
                }} />
                <span style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{room.participantsCount || 0} مشارك</span>
              </div>
              <h4 style={{ margin: 0, fontSize: '0.95rem', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {room.topic || room.title}
              </h4>
            </Link>
          )) : (
            <div style={{ color: '#666', fontSize: '0.9rem', padding: '16px 0', fontStyle: 'italic' }}>
              لا توجد غرف حية حالياً — كن أول من يفتح غرفة! 🎙️
            </div>
          )}

          {/* Create Room CTA */}
          <Link href="/rooms" style={{
            background: 'transparent', border: '1px dashed rgba(212,175,55,0.3)',
            borderRadius: 14, padding: 18, minWidth: 160, textDecoration: 'none', color: '#D4AF37',
            flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <span style={{ fontSize: '1.5rem' }}>＋</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>افتح غرفة</span>
          </Link>
        </div>
      </div>

      {/* ── Quick Links ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 32 }}>
        {[
          { href: '/courses', icon: '📚', label: 'الدورات', color: '#D4AF37' },
          { href: '/challenges', icon: '🏆', label: 'التحديات', color: '#ef4444' },
          { href: '/rooms', icon: '🎙️', label: 'الغرف', color: '#60a5fa' },
          { href: '/leaderboard', icon: '📊', label: 'المتصدرون', color: '#4ade80' },
        ].map(item => (
          <Link key={item.href} href={item.href} style={{
            background: '#111', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 12, padding: '18px 14px', textDecoration: 'none',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            transition: 'border-color 0.2s, background 0.2s',
          }}>
            <span style={{ fontSize: '1.6rem' }}>{item.icon}</span>
            <span style={{ fontSize: '0.85rem', color: item.color, fontWeight: 600 }}>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* ── Top 3 Leaderboard ── */}
      <div style={{ background: '#111', borderRadius: 16, padding: 24, marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>🏆 نجوم الأسبوع</h3>
          <Link href="/challenges?tab=leaderboard" style={{ color: '#D4AF37', textDecoration: 'none', fontSize: '0.85rem' }}>
            الترتيب الكامل ←
          </Link>
        </div>

        {topUsers.length === 0 ? (
          <div style={{ color: '#555', fontSize: '0.85rem', textAlign: 'center', padding: '20px 0' }}>
            جاري التحميل...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topUsers.map((u, i) => (
              <div key={u.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '10px 14px', borderRadius: 10,
                background: i === 0 ? 'rgba(212,175,55,0.07)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${i === 0 ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.04)'}`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: '1.3rem', width: 28 }}>{medalEmojis[i] || `#${i + 1}`}</span>
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, color: '#0A0A0A', fontSize: '0.9rem',
                  }}>
                    {u.name?.[0] || '?'}
                  </div>
                  <span style={{ fontWeight: 600, color: '#ddd', fontSize: '0.9rem' }}>{u.name}</span>
                </div>
                <span style={{
                  fontWeight: 800, fontSize: '1rem',
                  color: i === 0 ? '#D4AF37' : i === 1 ? '#A0A0A0' : '#CD7F32',
                }}>
                  {u.points?.toLocaleString()} <span style={{ fontSize: '0.7rem', fontWeight: 400, color: '#555' }}>نقطة</span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </AppLayout>
  );
}
