'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useSession } from 'next-auth/react';

export default function Navbar() {
  const pathname = usePathname();
  const [notifOpen, setNotifOpen] = useState(false);
  const { data: session } = useSession();
  const user = session?.user as any;
  const role = user?.role || 'trainee';

  return (
    <nav className="navbar" style={{ padding: '0 16px' }}>
      {/* Logo */}
      <Link href="/dashboard" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{ fontSize: '1.6rem' }}>🎤</div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#fff', lineHeight: 1.1 }}>المنيعة لقادة الإلقاء</div>
          <div className="navbar-title-sub" style={{ fontSize: '0.5rem', color: '#D4AF37', fontWeight: 600, letterSpacing: '1px' }}>DZ YOUNG LEADERS</div>
        </div>
      </Link>

      {/* Desktop Nav Links - hidden on mobile */}
      <div style={{ display: 'flex', gap: 4, marginRight: 24, flex: 1 }} className="hidden-mobile">
        {[
          { href: '/dashboard', label: 'الرئيسية' },
          { href: '/courses', label: 'الدورات' },
          { href: '/challenges', label: 'التحديات' },
          { href: '/events', label: 'الفعاليات' },
        ].map(link => (
          <Link
            key={link.href}
            href={link.href}
            style={{
              padding: '7px 14px', borderRadius: 8,
              fontSize: '0.85rem', fontWeight: 500,
              textDecoration: 'none',
              color: pathname === link.href ? '#D4AF37' : '#BBBBBB',
              background: pathname === link.href ? 'rgba(212,175,55,0.1)' : 'transparent',
              transition: 'all 0.2s ease',
            }}
          >{link.label}</Link>
        ))}
      </div>

      {/* Right side actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 'auto' }}>

        {/* Notifications - hidden on mobile (accessible via profile tab) */}
        <div className="dropdown hidden-mobile" style={{ position: 'relative' }}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.07)',
              color: '#888', cursor: 'pointer', fontSize: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
            }}
          >
            🔔
            <span className="notif-dot"></span>
          </button>
          {notifOpen && (
            <div className="dropdown-menu" style={{ width: 280 }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#D4AF37' }}>الإشعارات</span>
              </div>
              {[
                { icon: '🏆', text: 'فاز أحمد بتحدي الأسبوع!', time: 'منذ 5 دقائق', unread: true },
                { icon: '📚', text: 'درس جديد في دورة الخطابة', time: 'منذ ساعة', unread: true },
                { icon: '❤️', text: 'سارة أعجبت بفيديوك', time: 'منذ 3 ساعات', unread: false },
              ].map((n, i) => (
                <div key={i} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                  <span style={{ fontSize: '1.2rem' }}>{n.icon}</span>
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#ddd' }}>{n.text}</div>
                    <div style={{ fontSize: '0.7rem', color: '#666', marginTop: 2 }}>{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Button - icon only on mobile */}
        {role !== 'trainer' && (
          <Link
            href="/upload"
            style={{
              padding: '7px 14px', borderRadius: 8,
              background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
              color: '#0A0A0A', fontWeight: 700,
              fontSize: '0.82rem', textDecoration: 'none',
              transition: 'all 0.2s ease', flexShrink: 0,
            }}
          >
            <span className="hidden-mobile">+ رفع فيديو</span>
            <span className="show-mobile">+</span>
          </Link>
        )}

        {/* Avatar */}
        <Link href="/profile">
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.85rem', color: '#0A0A0A',
            border: '2px solid rgba(212,175,55,0.4)',
            cursor: 'pointer', flexShrink: 0,
          }}>
            {user?.name?.[0] || 'م'}
          </div>
        </Link>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: inline !important; }
          .navbar { height: 58px !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </nav>
  );
}
