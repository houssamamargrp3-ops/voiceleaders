import Link from 'next/link';
import { platformStats } from '@/lib/mockData';

export default function HomePage() {
  const stats = [
    { value: `${(platformStats.totalUsers / 1000).toFixed(1)}K+`, label: 'خطيب مسجّل', icon: '👥' },
    { value: `${platformStats.totalCourses}+`, label: 'دورة احترافية', icon: '📚' },
    { value: `${(platformStats.totalVideos / 1000).toFixed(1)}K+`, label: 'فيديو منشور', icon: '🎥' },
    { value: `${platformStats.countriesCount}+`, label: 'دولة', icon: '🌍' },
  ];

  const features = [
    {
      icon: '🎓',
      title: 'دورات احترافية',
      desc: 'تعلم من أفضل الخطباء والمدربين عبر دورات فيديو منظمة حسب مستواك.',
      color: 'rgba(212,175,55,0.1)',
      border: 'rgba(212,175,55,0.25)',
    },
    {
      icon: '🎥',
      title: 'مجتمع الفيديو',
      desc: 'شارك خطاباتك، احصل على تقييمات من المجتمع، واستفد من آراء الخبراء.',
      color: 'rgba(99,102,241,0.1)',
      border: 'rgba(99,102,241,0.25)',
    },
    {
      icon: '🏆',
      title: 'تحديات أسبوعية',
      desc: 'شارك في تحديات مثيرة، تنافس مع الأعضاء، واربح شارات وشهادات.',
      color: 'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.2)',
    },
    {
      icon: '📅',
      title: 'فعاليات وملتقيات',
      desc: 'سجّل في ورشات وملتقيات حضورية وأونلاين مع نخبة من الخطباء.',
      color: 'rgba(34,197,94,0.08)',
      border: 'rgba(34,197,94,0.2)',
    },
    {
      icon: '🤖',
      title: 'تحليل الذكاء الاصطناعي',
      desc: 'احصل على تحليل دقيق لأدائك: السرعة، الوضوح، التوقفات، مع نصائح فورية.',
      color: 'rgba(168,85,247,0.1)',
      border: 'rgba(168,85,247,0.25)',
    },
    {
      icon: '📜',
      title: 'شهادات معتمدة',
      desc: 'أكمل الدورات واحصل على شهادات PDF قابلة للمشاركة على LinkedIn.',
      color: 'rgba(212,175,55,0.08)',
      border: 'rgba(212,175,55,0.2)',
    },
  ];

  const testimonials = [
    {
      name: 'أحمد المنصور',
      role: 'خطيب TEDx • الرياض',
      text: 'بفضل المنيعة لقادة الإلقاء انتقلت من خائف جداً من المسرح إلى خطيب على منصة مقاطعة المنيعة في 6 أشهر فقط.',
      level: 'متقدم',
      rating: 5,
    },
    {
      name: 'سارة العمري',
      role: 'مدربة تطوير ذاتي • دبي',
      text: 'التحديات الأسبوعية غيّرت طريقة تفكيري. الضغط الإيجابي مع المجتمع الداعم أداة لا مثيل لها.',
      level: 'متوسط',
      rating: 5,
    },
    {
      name: 'محمد الزهراني',
      role: 'طالب هندسة • جدة',
      text: 'الدورات منظمة ومفهومة جداً. بدأت من الصفر وأنا الآن أشارك في التحديات بثقة.',
      level: 'مبتدئ',
      rating: 4,
    },
  ];

  return (
    <div style={{ background: '#0A0A0A', minHeight: '100vh', overflowX: 'hidden' }}>

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
            }}>🎤</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#fff' }}>المنيعة لقادة الإلقاء</div>
              <div style={{ fontSize: '0.65rem', color: '#D4AF37', fontWeight: 600, letterSpacing: '1px' }}>DZ YOUNG LEADERS</div>
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
          <Link href="/auth/register" className="btn-gold" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>
            انضم مجاناً
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero-bg" style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '100px 5% 60px', textAlign: 'center', position: 'relative',
      }}>
        {/* Background decorations */}
        <div className="hero-glow" style={{ top: '10%', left: '50%', transform: 'translateX(-50%)' }} />

        <div className="badge badge-gold" style={{ marginBottom: 24, fontSize: '0.75rem' }}>
          ✨ منصة الخطباء والقادة العرب
        </div>

        <h1 className="font-display animate-fade-up" style={{
          fontSize: 'clamp(2.5rem, 6vw, 5rem)',
          fontWeight: 900, lineHeight: 1.1,
          marginBottom: 24, maxWidth: 800,
        }}>
          <span className="text-gradient-white">طوّر مهاراتك في</span>
          <br />
          <span className="shimmer-text">الخطابة والقيادة</span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)',
          color: '#888', maxWidth: 600, lineHeight: 1.8,
          marginBottom: 40, animationDelay: '0.2s',
        }} className="animate-fade-up">
          انضم إلى أكبر مجتمع رقمي للخطباء والقادة الشباب في الوطن العربي.
          تعلّم، تدرّب، تنافس، وانطلق نحو التميز.
        </p>

        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 60 }}>
          <Link href="/auth/register" className="btn-gold" style={{ fontSize: '1rem', padding: '14px 36px' }}>
            🚀 ابدأ رحلتك مجاناً
          </Link>
          <Link href="/dashboard" className="btn-outline" style={{ fontSize: '1rem', padding: '14px 36px' }}>
            👀 استكشف المنصة
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
      </section>

      {/* FEATURES SECTION */}
      <section style={{ padding: '80px 5%' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div className="badge badge-gold" style={{ marginBottom: 16 }}>الميزات</div>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800 }}>
            كل ما تحتاجه في <span className="text-gradient">مكان واحد</span>
          </h2>
          <p style={{ color: '#666', marginTop: 12, fontSize: '1rem' }}>
            منصة متكاملة صُممت خصيصاً لتطوير خطيب المستقبل
          </p>
        </div>

        <div className="grid-3" style={{ maxWidth: 1100, margin: '0 auto' }}>
          {features.map((f, i) => (
            <div key={i} className="card" style={{
              padding: 28,
              background: f.color,
              borderColor: f.border,
              borderRadius: 18,
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: 14,
                background: 'rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.5rem', marginBottom: 16,
                border: `1px solid ${f.border}`,
              }}>
                {f.icon}
              </div>
              <h3 style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 8, color: '#fff' }}>{f.title}</h3>
              <p style={{ color: '#777', fontSize: '0.875rem', lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '80px 5%', background: 'linear-gradient(180deg, transparent, rgba(212,175,55,0.03), transparent)' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="badge badge-gold" style={{ marginBottom: 16 }}>آراء أعضائنا</div>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 800 }}>
            قصص <span className="text-gradient">نجاح حقيقية</span>
          </h2>
        </div>

        <div className="grid-3" style={{ maxWidth: 1000, margin: '0 auto' }}>
          {testimonials.map((t, i) => (
            <div key={i} className="card-gold" style={{ padding: 28, borderRadius: 18 }}>
              <div className="stars" style={{ fontSize: '1rem', marginBottom: 12 }}>
                {'★'.repeat(t.rating)}
              </div>
              <p style={{ color: '#ccc', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: 20, fontStyle: 'italic' }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, color: '#0A0A0A', fontSize: '1rem',
                  border: '2px solid rgba(212,175,55,0.4)',
                }}>
                  {t.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fff' }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#666' }}>{t.role}</div>
                </div>
                <span className={`badge level-${t.level === 'متقدم' ? 'advanced' : t.level === 'متوسط' ? 'intermediate' : 'beginner'}`} style={{ marginRight: 'auto' }}>
                  {t.level}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={{ padding: '80px 5%', textAlign: 'center' }}>
        <div style={{
          maxWidth: 700, margin: '0 auto',
          padding: '60px 40px',
          background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(212,175,55,0.03))',
          border: '1px solid rgba(212,175,55,0.2)',
          borderRadius: 28,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -80, right: -80,
            width: 300, height: 300,
            background: 'radial-gradient(circle, rgba(212,175,55,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />
          <div className="badge badge-gold" style={{ marginBottom: 20 }}>الانضمام مجاني</div>
          <h2 className="font-display" style={{ fontSize: 'clamp(1.6rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: 16 }}>
            جاهز لتبدأ رحلتك <span className="text-gradient">كخطيب قائد؟</span>
          </h2>
          <p style={{ color: '#777', marginBottom: 32, lineHeight: 1.7 }}>
            انضم إلى أكثر من {(platformStats.totalUsers / 1000).toFixed(1)}K خطيب من {platformStats.countriesCount} دولة.
            ابدأ تعلمك اليوم، مجاناً تماماً.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/auth/register" className="btn-gold" style={{ fontSize: '1rem', padding: '14px 40px' }}>
              🎯 سجّل حسابك الآن
            </Link>
            <Link href="/courses" className="btn-ghost" style={{ fontSize: '0.95rem', padding: '14px 30px' }}>
              استكشف الدورات
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '40px 5%',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, color: '#0A0A0A',
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
