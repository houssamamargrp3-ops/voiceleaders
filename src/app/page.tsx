import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Image from 'next/image';
import connectDB from '@/lib/connectDB';
import User from '@/models/User';
import Challenge from '@/models/Challenge';
import Course from '@/models/Course';
import Post from '@/models/Post';

export default async function LandingPage() {
  const session = await auth();
  
  if (session) {
    redirect('/feed');
  }

  // Fetch real stats from database
  await connectDB();
  const userCount = await User.countDocuments() || 0;
  const challengeCount = await Challenge.countDocuments() || 0;
  const courseCount = await Course.countDocuments() || 0;
  const postCount = await Post.countDocuments() || 0;

  const features = [
    {
      icon: '🎓',
      title: 'دورات احترافية',
      desc: 'تعلم من أفضل الخطباء والمدربين عبر دورات فيديو منظمة حسب مستواك.',
    },
    {
      icon: '🎥',
      title: 'مجتمع الفيديو',
      desc: 'شارك خطاباتك، احصل على تقييمات من المجتمع، واستفد من آراء الخبراء.',
    },
    {
      icon: '🏆',
      title: 'تحديات أسبوعية',
      desc: 'شارك في تحديات مثيرة، تنافس مع الأعضاء، واربح شارات وشهادات.',
    },
  ];

  const stats = [
    { value: userCount.toString(), label: 'خطيب متدرب' },
    { value: (challengeCount + courseCount).toString(), label: 'دورة وتحدي' },
    { value: postCount.toString(), label: 'مشاركة وخطاب' },
  ];

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', overflowX: 'hidden', color: '#fff' }}>
      {/* NAVBAR */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        height: 68,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 5%',
        background: 'rgba(10,10,10,0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(212,175,55,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, background: 'linear-gradient(135deg, #A8860F, #D4AF37)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#0A0A0A', fontSize: '1.2rem'
          }}>S</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>المنيعة لقادة الإلقاء</div>
            <div style={{ fontSize: '0.65rem', color: '#D4AF37', fontWeight: 600, letterSpacing: '1px' }}>PLATFORM</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Link href="/auth/login" style={{
            padding: '8px 20px', borderRadius: 8,
            border: '1px solid rgba(212,175,55,0.4)',
            color: '#D4AF37', fontWeight: 600, fontSize: '0.85rem',
            textDecoration: 'none', transition: 'all 0.2s',
          }}>
            تسجيل الدخول
          </Link>
          <Link href="/auth/register" className="btn-gold" style={{ padding: '8px 20px', fontSize: '0.85rem', textDecoration: 'none' }}>
            انضم إلينا
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '100px 5% 60px', textAlign: 'center', position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
          width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(212,175,55,0.15) 0%, transparent 60%)',
          pointerEvents: 'none', zIndex: 0
        }} />

        <div style={{ zIndex: 1, position: 'relative' }}>
          <div style={{ 
            background: 'rgba(212,175,55,0.1)', color: '#D4AF37', padding: '6px 16px', borderRadius: 20, 
            display: 'inline-block', marginBottom: 24, fontSize: '0.75rem', fontWeight: 600, border: '1px solid rgba(212,175,55,0.2)' 
          }}>
            ✨ منصة الخطباء والقادة العرب
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 900, lineHeight: 1.1,
            marginBottom: 24, maxWidth: 800, margin: '0 auto 24px'
          }}>
            <span style={{ color: '#fff' }}>طوّر مهاراتك في</span>
            <br />
            <span style={{ 
              background: 'linear-gradient(135deg, #F5D060, #D4AF37, #A8860F)', 
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' 
            }}>الخطابة والقيادة</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: '#888', maxWidth: 600, lineHeight: 1.8,
            margin: '0 auto 40px',
          }}>
            انضم إلى أكبر مجتمع رقمي للخطباء والقادة الشباب. 
            اكتشف قدراتك الكامنة، شارك في التحديات، وابنِ ثقتك بنفسك لتتحدث بطلاقة.
          </p>

          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 60 }}>
            <Link href="/auth/register" className="btn-gold" style={{ fontSize: '1rem', padding: '14px 36px', textDecoration: 'none' }}>
              🚀 انضم إلينا
            </Link>
          </div>

          {/* Stats Row */}
          <div style={{
            display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center',
            padding: '24px 40px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(212,175,55,0.12)',
            borderRadius: 20, backdropFilter: 'blur(10px)',
          }}>
            {stats.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0 20px' }}>
                <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#D4AF37' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: '#666', marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section style={{ padding: '80px 5%', background: '#050505' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800 }}>
            كل ما تحتاجه في <span style={{ color: '#D4AF37' }}>مكان واحد</span>
          </h2>
        </div>

        <div style={{ 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 24, maxWidth: 1000, margin: '0 auto' 
        }}>
          {features.map((f, i) => (
            <div key={i} style={{ 
              background: '#111', padding: 32, borderRadius: 20, 
              border: '1px solid rgba(255,255,255,0.05)',
              transition: 'transform 0.3s' 
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 12 }}>{f.title}</h3>
              <p style={{ color: '#888', lineHeight: 1.6, fontSize: '0.95rem' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LEADER SECTION (قائد المشروع) */}
      <section style={{ padding: '100px 5%', position: 'relative' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(212,175,55,0.1), rgba(0,0,0,0))',
            border: '1px solid rgba(212,175,55,0.2)',
            borderRadius: 30, padding: '40px',
            display: 'flex', flexDirection: 'row', gap: 40, alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            {/* Leader Image */}
            <div style={{ 
              width: 200, height: 200, borderRadius: '50%', overflow: 'hidden',
              border: '4px solid #D4AF37', flexShrink: 0, margin: '0 auto',
              background: '#222', position: 'relative'
            }}>
              <Image 
                src="/images/leader.jpg" 
                alt="القائد مبروكي زكرياء" 
                fill
                style={{ objectFit: 'cover' }}
              />
            </div>

            {/* Leader Info */}
            <div style={{ flex: 1, minWidth: 300, textAlign: 'right' }}>
              <div style={{ color: '#D4AF37', fontWeight: 600, fontSize: '0.9rem', marginBottom: 8 }}>
                قائد ومؤسس المشروع
              </div>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 16, color: '#fff' }}>
                الشاب مبروكي زكرياء
              </h2>
              <p style={{ color: '#aaa', fontSize: '1.1rem', lineHeight: 1.8, marginBottom: 20 }}>
                متكون في المعهد العالي لتكوين إطارات الشباب في ورقلة. قائد نادي رواد الإلقاء والخطابة بالمنيعة، فائز في عدة مسابقات في الميكروفون الذهبي والتنشيط.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <span style={{ background: '#111', padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', border: '1px solid #333', color: '#ccc' }}>
                  🏅 الميكروفون الذهبي
                </span>
                <span style={{ background: '#111', padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', border: '1px solid #333', color: '#ccc' }}>
                  🎤 نادي رواد الإلقاء والخطابة
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '40px 5%', textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 32, height: 32, background: 'linear-gradient(135deg, #A8860F, #D4AF37)', borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#0A0A0A',
          }}>S</div>
          <span style={{ fontWeight: 800, color: '#fff' }}>المنيعة لقادة الإلقاء</span>
        </div>
        <div style={{ color: '#666', fontSize: '0.85rem' }}>
          © 2024 المنيعة لقادة الإلقاء. جميع الحقوق محفوظة. منصة الخطباء والقادة الشباب.
        </div>
      </footer>
    </div>
  );
}
