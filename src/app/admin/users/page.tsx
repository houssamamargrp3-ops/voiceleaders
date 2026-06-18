'use client';
import { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';

interface UserData {
  id: string;
  name: string;
  email: string;
  level: string;
  role: string;
  country: string;
  points: number;
  videosCount: number;
  createdAt: string;
}

const levelLabels: Record<string, string> = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' };

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '10',
        ...(levelFilter !== 'all' && { level: levelFilter }),
        ...(search && { search }),
      });
      const res = await fetch(`/api/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
      setTotal(data.pagination?.total || 0);
    } catch (e) {
      console.error('Error fetching users:', e);
    } finally {
      setLoading(false);
    }
  }, [page, levelFilter, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const updateRole = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        fetchUsers(); // Refresh the list
      } else {
        alert('حدث خطأ أثناء تحديث الدور');
      }
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء تحديث الدور');
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <Link href="/admin" style={{ color: '#D4AF37', fontSize: '0.8rem', textDecoration: 'none', display: 'block', marginBottom: 6 }}>← لوحة التحكم</Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            👥 إدارة <span className="text-gradient">المستخدمين</span>
          </h1>
          <p style={{ color: '#666', fontSize: '0.85rem', marginTop: 4 }}>{total.toLocaleString()} مستخدم مسجّل</p>
        </div>
        <button className="btn-gold" style={{ fontSize: '0.85rem' }}>+ إضافة مستخدم</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 220, maxWidth: 400 }}>
          <span style={{ color: '#666' }}>🔍</span>
          <input placeholder="ابحث بالاسم أو الدولة..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="filter-bar">
          {['all', 'beginner', 'intermediate', 'advanced'].map(l => (
            <button key={l} className={`filter-chip ${levelFilter === l ? 'active' : ''}`}
              onClick={() => { setLevelFilter(l); setPage(1); }}>
              {l === 'all' ? 'الكل' : levelLabels[l]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
        {/* Table Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 200px 100px 100px 120px 80px',
          padding: '12px 20px', fontSize: '0.72rem', color: '#555', fontWeight: 600,
          borderBottom: '1px solid rgba(255,255,255,0.04)', letterSpacing: '0.5px',
        }}>
          <span>المستخدم</span>
          <span>البريد</span>
          <span style={{ textAlign: 'center' }}>المستوى</span>
          <span style={{ textAlign: 'center' }}>النقاط</span>
          <span style={{ textAlign: 'center' }}>الدور (Role)</span>
          <span style={{ textAlign: 'center' }}>إجراءات</span>
        </div>

        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{
              width: 40, height: 40, border: '3px solid rgba(212,175,55,0.2)', borderTopColor: '#D4AF37',
              borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite',
            }} />
            <p style={{ color: '#555' }}>جاري تحميل المستخدمين...</p>
          </div>
        ) : users.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#444' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>👤</div>
            <p>لا يوجد مستخدمون{search ? ' بهذا البحث' : ' مسجّلون بعد'}</p>
            {!search && <p style={{ fontSize: '0.8rem', marginTop: 8, color: '#333' }}>تأكد من الاتصال بقاعدة البيانات</p>}
          </div>
        ) : users.map((user, i) => (
          <div key={user.id}
            style={{
              display: 'grid', gridTemplateColumns: '1fr 200px 100px 100px 120px 80px',
              alignItems: 'center', padding: '14px 20px',
              borderBottom: i < users.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
              transition: 'background 0.15s',
            }}>

            {/* User Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, color: '#0A0A0A', flexShrink: 0, fontSize: '0.9rem',
              }}>{user.name?.[0]}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#ddd' }}>{user.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#555' }}>{user.country}</div>
              </div>
            </div>

            {/* Email */}
            <div style={{ fontSize: '0.78rem', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {user.email}
            </div>

            {/* Level */}
            <div style={{ textAlign: 'center' }}>
              <span className={`badge level-${user.level}`} style={{ fontSize: '0.65rem' }}>
                {levelLabels[user.level] || user.level}
              </span>
            </div>

            {/* Points */}
            <div style={{ textAlign: 'center', fontWeight: 700, color: '#D4AF37', fontSize: '0.9rem' }}>
              {(user.points || 0).toLocaleString()}
            </div>

            {/* Role (Editable Dropdown) */}
            <div style={{ textAlign: 'center' }}>
              <select
                value={user.role}
                onChange={(e) => updateRole(user.id, e.target.value)}
                style={{
                  background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6, padding: '4px 8px', fontSize: '0.75rem', outline: 'none', cursor: 'pointer',
                  width: '100%',
                }}
              >
                <option value="trainee" style={{ color: '#000' }}>متدرب</option>
                <option value="trainer" style={{ color: '#000' }}>مدرب</option>
                <option value="admin" style={{ color: '#000' }}>مشرف</option>
              </select>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              <button style={{
                padding: '4px 10px', borderRadius: 6, background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', fontSize: '0.7rem', cursor: 'pointer',
              }}>حذف</button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {total > 10 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          <button className="btn-ghost" disabled={page === 1} onClick={() => setPage(p => p - 1)}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}>← السابق</button>
          <span style={{ padding: '8px 16px', color: '#888', fontSize: '0.85rem' }}>
            صفحة {page} من {Math.ceil(total / 10)}
          </span>
          <button className="btn-ghost" disabled={page >= Math.ceil(total / 10)} onClick={() => setPage(p => p + 1)}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}>التالي →</button>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </AppLayout>
  );
}
