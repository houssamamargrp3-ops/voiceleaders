'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    level: '', country: '', agreeTerms: false, role: 'trainee'
  });

  const levels = [
    { value: 'beginner', label: 'مبتدئ', desc: 'بداية رحلتي في الخطابة', icon: '🌱' },
    { value: 'intermediate', label: 'متوسط', desc: 'لدي تجربة بسيطة', icon: '⚡' },
    { value: 'advanced', label: 'متقدم', desc: 'لدي خبرة ملحوظة', icon: '🏆' },
  ];

  const goToStep2 = () => {
    if (!form.name || !form.email || !form.password) {
      setError('جميع الحقول مطلوبة'); return;
    }
    if (form.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل'); return;
    }
    if (form.password !== form.confirmPassword) {
      setError('كلمتا المرور غير متطابقتين'); return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { goToStep2(); return; }

    if (!form.level) { setError('يرجى تحديد مستواك'); return; }
    if (!form.agreeTerms) { setError('يرجى الموافقة على الشروط'); return; }

    setLoading(true);
    setError('');

    try {
      // 1. إنشاء الحساب عبر API
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          level: form.level,
          country: form.country,
          role: form.role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'حدث خطأ في التسجيل');
        setLoading(false);
        return;
      }

      // 2. تسجيل الدخول تلقائياً بعد التسجيل
      const signInResult = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        router.push('/auth/login');
      }
    } catch {
      setError('حدث خطأ في الاتصال. تحقق من اتصال الإنترنت.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,175,55,0.12) 0%, transparent 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 44, height: 44, background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
              borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '1.5rem', color: '#0A0A0A', boxShadow: '0 0 20px rgba(212,175,55,0.4)',
            }}>S</div>
            <div><div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>المنيعة لقادة الإلقاء</div><div style={{ fontSize: '0.65rem', color: '#D4AF37', letterSpacing: '2px' }}>PLATFORM</div></div>
          </Link>
        </div>

        <div style={{ background: '#111', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 20, padding: 32 }}>
          {/* Progress */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: '0.75rem', color: '#888' }}>الخطوة {step} من 2</span>
              <span style={{ fontSize: '0.75rem', color: '#D4AF37' }}>{step === 1 ? 'المعلومات الأساسية' : 'مستواك وتفضيلاتك'}</span>
            </div>
            <div style={{ height: 4, background: '#1A1A1A', borderRadius: 2 }}>
              <div style={{ height: '100%', borderRadius: 2, width: `${step * 50}%`, background: 'linear-gradient(90deg, #A8860F, #D4AF37)', transition: 'width 0.4s ease' }} />
            </div>
          </div>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 6, color: '#fff' }}>
            {step === 1 ? 'أنشئ حسابك 🚀' : 'حدد مستواك 🎯'}
          </h1>
          <p style={{ color: '#666', marginBottom: 24, fontSize: '0.875rem' }}>
            {step === 1 ? 'انضم إلى مجتمع خطباء وقادة الغد' : 'سنخصص تجربتك بناءً على مستواك'}
          </p>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 10, marginBottom: 16,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.85rem',
            }}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {step === 1 ? (
              <>
                {/* Role Tabs for Registration */}
                <div style={{
                  display: 'flex', gap: 8, marginBottom: 10, padding: 6,
                  background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  {[
                    { id: 'trainee', label: 'متدرب', icon: '👤' },
                    { id: 'trainer', label: 'مدرب', icon: '👨‍🏫' }
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setForm({ ...form, role: r.id })}
                      style={{
                        flex: 1, padding: '10px 0', border: 'none', borderRadius: 8,
                        fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        background: form.role === r.id ? 'rgba(212,175,55,0.15)' : 'transparent',
                        color: form.role === r.id ? '#D4AF37' : '#888',
                        boxShadow: form.role === r.id ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                      }}
                    >
                      <span style={{ marginLeft: 6 }}>{r.icon}</span>
                      {r.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: 6, fontWeight: 500 }}>الاسم الكامل</label>
                  <input id="reg-name" type="text" className="input" placeholder="أحمد محمد"
                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: 6, fontWeight: 500 }}>البريد الإلكتروني</label>
                  <input id="reg-email" type="email" className="input" placeholder="ahmed@email.com"
                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: 6, fontWeight: 500 }}>كلمة المرور</label>
                  <input id="reg-password" type="password" className="input" placeholder="8 أحرف على الأقل"
                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: 6, fontWeight: 500 }}>تأكيد كلمة المرور</label>
                  <input id="reg-confirm" type="password" className="input" placeholder="أعد كتابة كلمة المرور"
                    value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: 10, fontWeight: 500 }}>مستواك في الخطابة</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {levels.map(l => (
                      <div key={l.value} id={`level-${l.value}`} onClick={() => setForm({ ...form, level: l.value })}
                        style={{
                          padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
                          border: `1px solid ${form.level === l.value ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.07)'}`,
                          background: form.level === l.value ? 'rgba(212,175,55,0.08)' : '#1A1A1A',
                          display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s ease',
                        }}>
                        <span style={{ fontSize: '1.5rem' }}>{l.icon}</span>
                        <div>
                          <div style={{ fontWeight: 600, color: form.level === l.value ? '#D4AF37' : '#fff', fontSize: '0.9rem' }}>{l.label}</div>
                          <div style={{ fontSize: '0.75rem', color: '#666' }}>{l.desc}</div>
                        </div>
                        {form.level === l.value && <span style={{ marginRight: 'auto', color: '#D4AF37', fontWeight: 700 }}>✓</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: 6, fontWeight: 500 }}>الدولة</label>
                  <select id="reg-country" className="input" value={form.country}
                    onChange={e => setForm({ ...form, country: e.target.value })} style={{ background: '#242424' }}>
                    <option value="">اختر دولتك</option>
                    {['السعودية', 'الإمارات', 'مصر', 'الكويت', 'قطر', 'البحرين', 'الأردن', 'لبنان', 'المغرب', 'تونس', 'الجزائر', 'العراق'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" id="agree-terms" style={{ accentColor: '#D4AF37', width: 16, height: 16 }}
                    checked={form.agreeTerms} onChange={e => setForm({ ...form, agreeTerms: e.target.checked })} />
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>
                    أوافق على <a href="#" style={{ color: '#D4AF37' }}>الشروط والأحكام</a>
                  </span>
                </label>
              </>
            )}

            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              {step === 2 && (
                <button type="button" className="btn-ghost" onClick={() => { setStep(1); setError(''); }}
                  style={{ flex: '0 0 auto', padding: '12px 20px' }}>
                  → رجوع
                </button>
              )}
              <button id="reg-submit" type="submit" className="btn-gold"
                style={{ flex: 1, padding: 14, fontSize: '1rem' }}
                disabled={loading || (step === 2 && (!form.level || !form.agreeTerms))}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    <span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#0A0A0A', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                    جاري إنشاء حسابك...
                  </span>
                ) : step === 1 ? 'التالي ←' : '🎉 أنشئ حسابي'}
              </button>
            </div>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <p style={{ color: '#555', fontSize: '0.85rem' }}>
              لديك حساب بالفعل؟{' '}
              <Link href="/auth/login" style={{ color: '#D4AF37', fontWeight: 600, textDecoration: 'none' }}>سجّل الدخول</Link>
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
