import AppLayout from '@/components/layout/AppLayout';
import { mockLeaderboard } from '@/lib/mockData';
import Link from 'next/link';

export default function LeaderboardPage() {
  const top3 = [mockLeaderboard[1], mockLeaderboard[0], mockLeaderboard[2]]; // Silver, Gold, Bronze order for podium

  return (
    <AppLayout>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div className="badge badge-gold" style={{ marginBottom: 12 }}>📊 المتصدرون</div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900 }}>
          قائمة <span className="text-gradient">الأبطال</span>
        </h1>
        <p style={{ color: '#666', marginTop: 8, fontSize: '0.9rem' }}>
          يتم التحديث كل أسبوع — استحق مكانك على القائمة الذهبية
        </p>
      </div>

      {/* Podium */}
      <div style={{
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        gap: 16, marginBottom: 48, flexWrap: 'wrap',
      }}>
        {top3.map((u, idx) => {
          const isFirst = idx === 1;
          const height = isFirst ? 130 : 100;
          const avatarSize = isFirst ? 76 : 60;
          const medals = ['🥈', '🥇', '🥉'];
          const podiumColors = [
            'linear-gradient(180deg, rgba(192,192,192,0.15), rgba(192,192,192,0.03))',
            'linear-gradient(180deg, rgba(212,175,55,0.25), rgba(212,175,55,0.05))',
            'linear-gradient(180deg, rgba(205,127,50,0.18), rgba(205,127,50,0.03))',
          ];
          const borderColors = ['rgba(192,192,192,0.3)', 'rgba(212,175,55,0.4)', 'rgba(205,127,50,0.3)'];

          return (
            <div key={u.rank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ textAlign: 'center', marginBottom: 6 }}>
                <Link href="/profile" style={{ textDecoration: 'none' }}>
                  <div style={{
                    width: avatarSize, height: avatarSize, borderRadius: '50%', margin: '0 auto 8px',
                    background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: avatarSize * 0.35, color: '#0A0A0A',
                    border: `3px solid ${isFirst ? '#D4AF37' : idx === 0 ? '#A0A0A0' : '#CD7F32'}`,
                    boxShadow: isFirst ? '0 0 30px rgba(212,175,55,0.5)' : 'none',
                  }}>{u.user.name[0]}</div>
                </Link>
                <div style={{ fontSize: isFirst ? '1.8rem' : '1.4rem' }}>{medals[idx]}</div>
                <div style={{ fontWeight: 700, fontSize: isFirst ? '0.95rem' : '0.85rem', color: '#fff', marginTop: 4 }}>
                  {u.user.name.split(' ')[0]}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: 700 }}>
                  {u.points.toLocaleString()} نقطة
                </div>
                <div style={{ fontSize: '0.68rem', color: '#555', marginTop: 2 }}>
                  {u.challengesWon} تحدٍّ
                </div>
              </div>
              <div style={{
                width: isFirst ? 110 : 90, height,
                background: podiumColors[idx],
                border: `1px solid ${borderColors[idx]}`,
                borderRadius: '10px 10px 0 0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isFirst ? '1.8rem' : '1.3rem',
              }}>
                {isFirst ? '👑' : ''}
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Rankings Table */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>🏅 الترتيب الكامل</h2>
          <span style={{ fontSize: '0.78rem', color: '#555' }}>آخر تحديث: اليوم</span>
        </div>

        {/* Table Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '60px 1fr 120px 100px 80px',
          padding: '10px 24px', fontSize: '0.72rem', color: '#555', fontWeight: 600, textTransform: 'uppercase',
          borderBottom: '1px solid rgba(255,255,255,0.03)', letterSpacing: '0.5px',
        }}>
          <span>الترتيب</span>
          <span>الخطيب</span>
          <span style={{ textAlign: 'center' }}>النقاط</span>
          <span style={{ textAlign: 'center' }}>تحديات</span>
          <span style={{ textAlign: 'center' }}>فيديوهات</span>
        </div>

        {mockLeaderboard.map((u, i) => (
          <div key={u.rank} id={`lb-row-${u.rank}`}
            className={`${i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''}`}
            style={{
              display: 'grid', gridTemplateColumns: '60px 1fr 120px 100px 80px',
              alignItems: 'center', padding: '14px 24px',
              borderBottom: i < mockLeaderboard.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
              transition: 'background 0.2s ease', cursor: 'pointer',
            }}>

            {/* Rank */}
            <div style={{
              fontWeight: 800, fontSize: '1rem',
              color: i === 0 ? '#D4AF37' : i === 1 ? '#A0A0A0' : i === 2 ? '#CD7F32' : '#444',
            }}>
              {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${u.rank}`}
            </div>

            {/* User */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%',
                background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: '#0A0A0A', fontSize: '0.9rem', flexShrink: 0,
                border: i < 3 ? '2px solid rgba(212,175,55,0.4)' : '2px solid transparent',
              }}>
                {u.user.name[0]}
              </div>
              <div>
                <div style={{ fontWeight: 600, color: '#ddd', fontSize: '0.875rem' }}>{u.user.name}</div>
                <span className={`badge level-${u.user.level}`} style={{ fontSize: '0.62rem' }}>
                  {{ beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' }[u.user.level]}
                </span>
              </div>
              {u.badge && <span style={{ fontSize: '1.1rem', marginRight: 4 }}>{u.badge}</span>}
            </div>

            {/* Points */}
            <div style={{ textAlign: 'center', fontWeight: 800, color: '#D4AF37', fontSize: '0.95rem' }}>
              {u.points.toLocaleString()}
            </div>

            {/* Challenges */}
            <div style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>
              🏆 {u.challengesWon}
            </div>

            {/* Videos */}
            <div style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>
              🎥 {u.videosCount}
            </div>
          </div>
        ))}
      </div>

      {/* Your Rank */}
      <div style={{
        marginTop: 20, padding: '18px 24px',
        background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: 14, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: '1.5rem' }}>📍</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#D4AF37' }}>
            موقعك في الترتيب: #1 🥇
          </div>
          <div style={{ fontSize: '0.78rem', color: '#666', marginTop: 2 }}>
            12,840 نقطة — استمر في رفع فيديوهاتك والمشاركة في التحديات لتبقى في الصدارة
          </div>
        </div>
        <Link href="/challenges" className="btn-gold" style={{ textDecoration: 'none', fontSize: '0.85rem' }}>
          🏆 شارك في تحدٍّ
        </Link>
      </div>
    </AppLayout>
  );
}
