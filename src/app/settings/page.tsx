'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Prefill form when session loads
  useEffect(() => {
    if (session?.user) {
      setForm(f => ({
        ...f,
        name: session?.user?.name || '',
        email: session?.user?.email || '',
      }));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل في تحديث البيانات');
      }

      setMessage(data.message || 'تم تحديث البيانات بنجاح');
      
      // Update session locally with new name/email
      await update({
        ...session,
        user: {
          ...session?.user,
          name: form.name,
          email: form.email
        }
      });

      // Clear password fields
      setForm(f => ({ ...f, currentPassword: '', newPassword: '' }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <AppLayout>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', padding: '100px 20px' }}>
          <span style={{ display: 'inline-block', animation: 'spin-slow 1s linear infinite', fontSize: '2rem' }}>⏳</span>
        </div>
      </AppLayout>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/auth/login');
    return null;
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 16px',
    background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 10, color: '#fff', fontSize: '0.9rem',
    fontFamily: 'Inter, sans-serif', outline: 'none',
    transition: 'border-color 0.3s ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.85rem', color: '#D4AF37',
    fontWeight: 600, marginBottom: 8,
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>
          <span className="text-gradient">إعدادات الحساب</span> ⚙️
        </h1>
        <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: 30 }}>
          تعديل بياناتك الشخصية وكلمة المرور
        </p>

        {error && (
          <div style={{
            padding: '12px 16px', marginBottom: 20, borderRadius: 10,
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#f87171', fontSize: '0.85rem',
          }}>
            ⚠️ {error}
          </div>
        )}

        {message && (
          <div style={{
            padding: '12px 16px', marginBottom: 20, borderRadius: 10,
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)',
            color: '#10b981', fontSize: '0.85rem',
          }}>
            ✅ {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card-gold" style={{ padding: 30, borderRadius: 20 }}>
          
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>الاسم الكامل</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              style={inputStyle}
              required
            />
          </div>

          <div style={{ marginBottom: 30 }}>
            <label style={labelStyle}>البريد الإلكتروني</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              style={inputStyle}
              required
              dir="ltr"
            />
          </div>

          <div className="divider-gold" style={{ margin: '30px 0' }} />
          <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 20 }}>تغيير كلمة المرور</h2>
          <p style={{ color: '#888', fontSize: '0.75rem', marginBottom: 20 }}>
            اترك هذه الحقول فارغة إذا كنت لا تريد تغيير كلمة المرور.
          </p>

          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>كلمة المرور الحالية</label>
            <input
              type="password"
              value={form.currentPassword}
              onChange={e => setForm({ ...form, currentPassword: e.target.value })}
              style={inputStyle}
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          <div style={{ marginBottom: 30 }}>
            <label style={labelStyle}>كلمة المرور الجديدة</label>
            <input
              type="password"
              value={form.newPassword}
              onChange={e => setForm({ ...form, newPassword: e.target.value })}
              style={inputStyle}
              placeholder="••••••••"
              dir="ltr"
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              className="btn-gold"
              disabled={loading}
              style={{ padding: '12px 32px', fontSize: '1rem', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
