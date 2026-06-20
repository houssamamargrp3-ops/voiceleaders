'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

const traineeLinks = [
  { href: '/feed', label: 'الرئيسية', icon: '🏠' },
  { href: '/community', label: 'استكشف', icon: '🎥' },
  { href: '/courses', label: 'الدورات', icon: '📚' },
  { href: '/evaluations', label: 'تقييماتي', icon: '📝' },
  { href: '/challenges', label: 'التحديات', icon: '🏆' },
];

const trainerLinks = [
  { href: '/feed', label: 'الرئيسية', icon: '🏠' },
  { href: '/community', label: 'استكشف', icon: '🎥' },
  { href: '/trainer/my-courses', label: 'إدارة دوراتي', icon: '👨‍🏫' },
  { href: '/trainer/students', label: 'إدارة المتدربين', icon: '👥' },
  { href: '/trainer/evaluations', label: 'طلبات التقييم', icon: '📋' },
  { href: '/trainer/challenges', label: 'إدارة التحديات', icon: '🏆' },
];

const adminLinks = [
  { href: '/admin', label: 'لوحة التحكم', icon: '⚙️' },
  { href: '/admin/users', label: 'المستخدمون', icon: '👥' },
  { href: '/admin/courses', label: 'إدارة الدورات', icon: '📖' },
  { href: '/trainer/challenges', label: 'إدارة التحديات', icon: '🏆' },
  { href: '/admin/events', label: 'إدارة الفعاليات', icon: '🗓️' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;
  const role = user?.role || 'trainee';

  const links = role === 'trainer' ? trainerLinks : traineeLinks;

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: 8 }}>
        <p style={{ fontSize: '0.65rem', color: '#555', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 14px', marginBottom: 8 }}>
          القائمة الرئيسية
        </p>
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`sidebar-link ${pathname === link.href || (link.href !== '/feed' && link.href !== '/community' && pathname.startsWith(link.href + '/')) ? 'active' : ''}`}
          >
            <span style={{ fontSize: '1rem' }}>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </div>
      {role === 'admin' && (
        <>
          <div className="divider-gold" style={{ margin: '16px 0' }} />
          <div>
            <p style={{ fontSize: '0.65rem', color: '#555', fontWeight: 600, letterSpacing: '1.5px', textTransform: 'uppercase', padding: '0 14px', marginBottom: 8 }}>
              الإدارة
            </p>
            {adminLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
              >
                <span style={{ fontSize: '1rem' }}>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Bottom user mini card */}
      <div style={{ marginTop: 'auto', paddingTop: 20 }}>
        <div className="divider-gold" style={{ marginBottom: 16 }} />
        {user ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 14px', borderRadius: 10,
            background: 'rgba(212,175,55,0.06)',
            border: '1px solid rgba(212,175,55,0.12)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.8rem', color: '#0A0A0A',
              flexShrink: 0,
            }}>
              {user.name?.[0] || 'م'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: '0.65rem', color: '#D4AF37' }}>
                {role === 'admin' ? 'مشرف' : role === 'trainer' ? 'مدرب' : 'متدرب'}
              </div>
            </div>
            
            <div style={{ marginRight: 'auto', display: 'flex', gap: 6 }}>
              <Link href="/settings" title="الإعدادات" style={{
                color: '#888', fontSize: '0.9rem', padding: '4px', textDecoration: 'none',
                transition: 'color 0.2s',
              }} onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = '#888'}>
                ⚙️
              </Link>
              <button 
                onClick={() => import('next-auth/react').then(m => m.signOut({ callbackUrl: '/auth/login' }))} 
                title="تسجيل الخروج"
                style={{
                  background: 'none', border: 'none', color: '#f87171', fontSize: '0.9rem', cursor: 'pointer',
                  padding: '4px', transition: 'color 0.2s', opacity: 0.8
                }} 
                onMouseEnter={e => e.currentTarget.style.opacity = '1'} 
                onMouseLeave={e => e.currentTarget.style.opacity = '0.8'}
              >
                🚪
              </button>
            </div>
          </div>
        ) : (
          <Link href="/auth/login" className="btn-ghost" style={{ display: 'block', textAlign: 'center', fontSize: '0.8rem' }}>
            تسجيل الدخول
          </Link>
        )}
      </div>
    </aside>
  );
}
