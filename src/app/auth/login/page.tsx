'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [roleTab, setRoleTab] = useState('trainee');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        role: roleTab,
        redirect: false,
      });

      if (result?.error) {
        // إذا كان الخطأ مخصصاً من auth.ts (مثل خطأ توافق الصلاحية) سيأتي في result.error
        // لكن أحياناً NextAuth يعيد "CredentialsSignin"، لذا نعالجه:
        const errorMessage = result.error.includes('CredentialsSignin') 
          ? 'البريد الإلكتروني أو كلمة المرور غير صحيحة' 
          : result.error;
        setError(errorMessage);
        setLoading(false);
        return;
      }

      if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('حدث خطأ في الاتصال. يرجى المحاولة مجدداً.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0A0A0A',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
      backgroundImage: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(212,175,55,0.15) 0%, transparent 60%)',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 48, height: 48, background: 'linear-gradient(135deg, #A8860F, #D4AF37, #F5D060)',
              borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 900, fontSize: '1.6rem', color: '#0A0A0A', boxShadow: '0 0 25px rgba(212,175,55,0.4)',
            }}>S</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.2rem', color: '#fff' }}>المنيعة لقادة الإلقاء</div>
              <div style={{ fontSize: '0.65rem', color: '#D4AF37', letterSpacing: '2px' }}>PLATFORM</div>
            </div>
          </Link>
        </div>

        <div style={{
          background: '#111', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 20,
          padding: 32, animation: 'fadeInUp 0.4s ease',
        }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: 6, color: '#fff' }}>أهلاً بك 👋</h1>
          <p style={{ color: '#666', marginBottom: 20, fontSize: '0.875rem' }}>اختر صفتك وسجّل دخولك للوصول إلى منصتك</p>

          {/* Role Tabs */}
          <div style={{
            display: 'flex', gap: 8, marginBottom: 24, padding: 6,
            background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)'
          }}>
            {[
              { id: 'trainee', label: 'متدرب', icon: '👤' },
              { id: 'trainer', label: 'مدرب', icon: '👨‍🏫' },
              { id: 'admin', label: 'مشرف', icon: '⚙️' }
            ].map(role => (
              <button
                key={role.id}
                type="button"
                onClick={() => setRoleTab(role.id)}
                style={{
                  flex: 1, padding: '10px 0', border: 'none', borderRadius: 8,
                  fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  background: roleTab === role.id ? 'rgba(212,175,55,0.15)' : 'transparent',
                  color: roleTab === role.id ? '#D4AF37' : '#888',
                  boxShadow: roleTab === role.id ? '0 4px 12px rgba(0,0,0,0.2)' : 'none',
                }}
              >
                <span style={{ marginLeft: 6 }}>{role.icon}</span>
                {role.label}
              </button>
            ))}
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 10, marginBottom: 16,
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171', fontSize: '0.85rem',
            }}>⚠️ {error}</div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: 6, fontWeight: 500 }}>البريد الإلكتروني</label>
              <input id="login-email" type="email" className="input" placeholder="example@email.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: 6, fontWeight: 500 }}>كلمة المرور</label>
              <input id="login-password" type="password" className="input" placeholder="••••••••"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: '0.8rem', color: '#888' }}>
                <input type="checkbox" style={{ accentColor: '#D4AF37' }} /> تذكرني
              </label>
              <a href="#" style={{ fontSize: '0.8rem', color: '#D4AF37', textDecoration: 'none' }}>نسيت كلمة المرور؟</a>
            </div>

            <button id="login-submit" type="submit" className="btn-gold"
              style={{ width: '100%', marginTop: 8, padding: 14, fontSize: '1rem' }} disabled={loading}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#0A0A0A',
                    borderRadius: '50%', display: 'inline-block',
                    animation: 'spin 0.6s linear infinite',
                  }} />
                  جاري التحقق...
                </span>
              ) : 'تسجيل الدخول'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)', marginBottom: 20 }} />
            <p style={{ color: '#666', fontSize: '0.875rem' }}>
              ليس لديك حساب؟{' '}
              <Link href="/auth/register" style={{ color: '#D4AF37', fontWeight: 600, textDecoration: 'none' }}>سجّل مجاناً</Link>
            </p>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
