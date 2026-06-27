import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import connectDB from '@/lib/connectDB';
import User from '@/models/User';

export const revalidate = 0; // Don't cache, show real-time leaderboard

export default async function LeaderboardPage() {
  await connectDB();

  // Fetch top 100 users sorted by points
  const users = await User.find({ role: 'trainee' })
    .select('name avatar level points badges videosCount coursesCompleted')
    .sort({ points: -1 })
    .limit(100)
    .lean();

  const leaderboard = users.map((u: any, index) => ({
    rank: index + 1,
    id: u._id.toString(),
    name: u.name,
    avatar: u.avatar || '',
    level: u.level,
    points: u.points || 0,
    badge: (u.badges as string[])?.[0] || null,
    videosCount: u.videosCount || 0,
    challengesWon: u.coursesCompleted?.length || 0, // Using courses completed as a proxy for now
  }));

  // Ensure we have at least 3 users for the podium
  const top3 = [];
  if (leaderboard.length >= 1) top3[1] = leaderboard[0]; // Gold
  if (leaderboard.length >= 2) top3[0] = leaderboard[1]; // Silver
  if (leaderboard.length >= 3) top3[2] = leaderboard[2]; // Bronze

  return (
    <AppLayout>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
        <div className="badge badge-gold" style={{ marginBottom: 12 }}>📊 المتصدرون</div>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900 }}>
          قائمة <span className="text-gradient">الأبطال</span>
        </h1>
        <p style={{ color: '#666', marginTop: 8, fontSize: '0.9rem' }}>
          استحق مكانك على القائمة الذهبية بجمع أكبر عدد من النقاط!
        </p>
      </div>

      {/* Points Guide Box */}
      <div style={{
        maxWidth: 600, margin: '0 auto 40px', background: 'rgba(212,175,55,0.08)',
        border: '1px solid rgba(212,175,55,0.3)', borderRadius: 16, padding: 20,
        display: 'flex', flexDirection: 'column', gap: 12
      }}>
        <h3 style={{ color: '#D4AF37', fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>💡</span> كيف تجمع النقاط؟
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12 }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>🎥</div>
            <div style={{ fontSize: '0.8rem', color: '#ccc' }}>نشر فيديو</div>
            <div style={{ fontSize: '0.9rem', color: '#D4AF37', fontWeight: 700 }}>+10 نقاط</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>🏆</div>
            <div style={{ fontSize: '0.8rem', color: '#ccc' }}>مشاركة بتحدي</div>
            <div style={{ fontSize: '0.9rem', color: '#D4AF37', fontWeight: 700 }}>+15 نقطة</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>📚</div>
            <div style={{ fontSize: '0.8rem', color: '#ccc' }}>إكمال درس</div>
            <div style={{ fontSize: '0.9rem', color: '#D4AF37', fontWeight: 700 }}>+5 نقاط</div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: 12, borderRadius: 10, textAlign: 'center' }}>
            <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>📝</div>
            <div style={{ fontSize: '0.8rem', color: '#ccc' }}>اجتياز اختبار</div>
            <div style={{ fontSize: '0.9rem', color: '#D4AF37', fontWeight: 700 }}>+20 نقطة</div>
          </div>
        </div>
      </div>

      {/* Podium */}
      {top3.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          gap: 16, marginBottom: 48, flexWrap: 'wrap',
        }}>
          {top3.map((u, idx) => {
            if (!u) return null;
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
                  <Link href={`/profile?id=${u.id}`} style={{ textDecoration: 'none' }}>
                    <div style={{
                      width: avatarSize, height: avatarSize, borderRadius: '50%', margin: '0 auto 8px',
                      background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: avatarSize * 0.35, color: '#0A0A0A',
                      border: `3px solid ${isFirst ? '#D4AF37' : idx === 0 ? '#A0A0A0' : '#CD7F32'}`,
                      boxShadow: isFirst ? '0 0 30px rgba(212,175,55,0.5)' : 'none',
                    }}>{u.name[0]}</div>
                  </Link>
                  <div style={{ fontSize: isFirst ? '1.8rem' : '1.4rem' }}>{medals[idx]}</div>
                  <div style={{ fontWeight: 700, fontSize: isFirst ? '0.95rem' : '0.85rem', color: '#fff', marginTop: 4 }}>
                    {u.name.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: 700 }}>
                    {u.points.toLocaleString()} نقطة
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
      )}

      {/* Full Rankings Table */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{ fontWeight: 700, fontSize: '1rem' }}>🏅 الترتيب الكامل</h2>
          <span style={{ fontSize: '0.78rem', color: '#555' }}>يتم تحديثه فوراً</span>
        </div>

        {/* Table Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '60px 1fr 120px 80px',
          padding: '10px 24px', fontSize: '0.72rem', color: '#555', fontWeight: 600, textTransform: 'uppercase',
          borderBottom: '1px solid rgba(255,255,255,0.03)', letterSpacing: '0.5px',
        }}>
          <span>الترتيب</span>
          <span>الخطيب</span>
          <span style={{ textAlign: 'center' }}>النقاط</span>
          <span style={{ textAlign: 'center' }}>فيديوهات</span>
        </div>

        {leaderboard.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>لا يوجد متصدرين بعد. كن أول من يجمع النقاط!</div>
        ) : (
          leaderboard.map((u, i) => (
            <div key={u.rank} id={`lb-row-${u.rank}`}
              className={`${i === 0 ? 'rank-1' : i === 1 ? 'rank-2' : i === 2 ? 'rank-3' : ''}`}
              style={{
                display: 'grid', gridTemplateColumns: '60px 1fr 120px 80px',
                alignItems: 'center', padding: '14px 24px',
                borderBottom: i < leaderboard.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                transition: 'background 0.2s ease',
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
                  {u.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#ddd', fontSize: '0.875rem' }}>{u.name}</div>
                  <span className={`badge level-${u.level}`} style={{ fontSize: '0.62rem' }}>
                    {{ beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' }[u.level] || 'متدرب'}
                  </span>
                </div>
                {u.badge && <span style={{ fontSize: '1.1rem', marginRight: 4 }}>{u.badge}</span>}
              </div>

              {/* Points */}
              <div style={{ textAlign: 'center', fontWeight: 800, color: '#D4AF37', fontSize: '0.95rem' }}>
                {u.points.toLocaleString()}
              </div>

              {/* Videos */}
              <div style={{ textAlign: 'center', color: '#888', fontSize: '0.85rem' }}>
                🎥 {u.videosCount}
              </div>
            </div>
          ))
        )}
      </div>

    </AppLayout>
  );
}
