'use client';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';

export default function AdminEventsPage() {
  return (
    <AppLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Link href="/admin" style={{ color: '#D4AF37', fontSize: '0.8rem', textDecoration: 'none', display: 'block', marginBottom: 6 }}>← لوحة التحكم</Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            🗓️ إدارة <span className="text-gradient">الفعاليات</span>
          </h1>
          <p style={{ color: '#666', fontSize: '0.85rem', marginTop: 4 }}>إدارة المؤتمرات، اللقاءات المباشرة، والفعاليات الحية</p>
        </div>
        <button className="btn-gold" style={{ fontSize: '0.85rem' }}>+ إضافة فعالية جديدة</button>
      </div>

      <div style={{ padding: '60px 20px', textAlign: 'center', background: '#111', borderRadius: 16, border: '1px dashed rgba(212,175,55,0.2)' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🛠️</div>
        <h3 style={{ fontSize: '1.2rem', color: '#D4AF37', marginBottom: 8 }}>هذا القسم قيد التطوير</h3>
        <p style={{ color: '#888', maxWidth: 400, margin: '0 auto' }}>
          نحن نعمل حالياً على بناء نظام متكامل لإدارة الفعاليات (الحضور الفعلي والأونلاين). سيتم إطلاق هذه الميزة قريباً!
        </p>
      </div>
    </AppLayout>
  );
}
