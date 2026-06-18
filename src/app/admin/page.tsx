'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(json => {
        if (!json.error) setData(json);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div style={{ padding: 40, textAlign: 'center', color: '#D4AF37' }}>جاري تحميل بيانات الإدارة... ⏳</div>
      </AppLayout>
    );
  }

  if (!data) {
    return (
      <AppLayout>
        <div style={{ padding: 40, textAlign: 'center', color: '#f87171' }}>غير مصرح أو حدث خطأ.</div>
      </AppLayout>
    );
  }

  const stats = [
    { label: 'إجمالي المستخدمين', value: data.stats.totalUsers.toLocaleString(), icon: '👥', color: '#60a5fa' },
    { label: 'إجمالي المدربين', value: data.stats.totalTrainers.toLocaleString(), icon: '👨‍🏫', color: '#4ade80' },
    { label: 'إجمالي الدورات', value: data.stats.totalCourses.toLocaleString(), icon: '📚', color: '#D4AF37' },
    { label: 'إجمالي التسجيلات', value: data.stats.totalEnrollments.toLocaleString(), icon: '📝', color: '#a78bfa' },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="badge badge-red" style={{ marginBottom: 8, fontSize: '0.7rem' }}>⚙️ لوحة التحكم</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            لوحة الإدارة <span className="text-gradient">الرئيسية</span>
          </h1>
          <p style={{ color: '#666', fontSize: '0.875rem', marginTop: 4 }}>
            نظرة شاملة على جميع إحصائيات النظام ومستخدميه
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {stats.map((s, i) => (
          <div key={i} className="admin-stat" style={{ padding: 20, background: '#111', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 12,
                background: `${s.color}18`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.3rem', border: `1px solid ${s.color}30`,
              }}>
                {s.icon}
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: '0.78rem', color: '#666' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="admin-grid">

        {/* Users Management */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700 }}>👥 أحدث المستخدمين تسجيلًا</h3>
            <Link href="/admin/users" style={{ color: '#D4AF37', fontSize: '0.78rem', textDecoration: 'none' }}>إدارة الكل</Link>
          </div>
          <div>
            {data.recentUsers.length > 0 ? data.recentUsers.map((user: any, i: number) => (
              <div key={user.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
                borderBottom: i < data.recentUsers.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1A1A2E, #16213E)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, color: '#fff', fontSize: '0.85rem', flexShrink: 0,
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  {user.name?.[0] || 'U'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#ddd', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#555' }}>{user.email}</div>
                </div>
                <span className="badge" style={{ flexShrink: 0, fontSize: '0.65rem', background: 'rgba(212,175,55,0.1)', color: '#D4AF37' }}>
                  {user.role === 'admin' ? 'مدير' : user.role === 'trainer' ? 'مدرب' : 'متدرب'}
                </span>
              </div>
            )) : (
              <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>لا يوجد مستخدمين بعد.</div>
            )}
          </div>
        </div>

        {/* Courses Management */}
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 700 }}>📚 أحدث الدورات المنشورة</h3>
            <Link href="/courses" style={{ color: '#D4AF37', fontSize: '0.78rem', textDecoration: 'none' }}>عرض الكل</Link>
          </div>
          <div>
            {data.recentCourses.length > 0 ? data.recentCourses.map((course: any, i: number) => (
              <div key={course.id} style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px',
                borderBottom: i < data.recentCourses.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
              }}>
                <div style={{
                  width: 48, height: 36, borderRadius: 6,
                  background: '#1A1A1A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0,
                }}>
                  📘
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#ddd', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {course.title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#888' }}>
                    المدرب: <span style={{ color: '#D4AF37' }}>{course.instructor}</span>
                  </div>
                </div>
                <div style={{ flexShrink: 0, textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{course.studentsCount}</div>
                  <div style={{ fontSize: '0.6rem', color: '#666' }}>مسجل</div>
                </div>
              </div>
            )) : (
              <div style={{ padding: 20, textAlign: 'center', color: '#666' }}>لا توجد دورات بعد.</div>
            )}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
