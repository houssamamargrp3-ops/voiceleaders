'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function MobileTabBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;
  const role = user?.role || 'trainee';

  const traineeTabs = [
    { href: '/dashboard', label: 'الرئيسية', icon: '🏠' },
    { href: '/courses', label: 'دورات', icon: '📚' },
    { href: '/evaluations', label: 'تقييماتي', icon: '📝' },
    { href: '/challenges', label: 'تحديات', icon: '🏆' },
    { href: '/profile', label: 'حسابي', icon: '👤' },
  ];

  const trainerTabs = [
    { href: '/dashboard', label: 'الرئيسية', icon: '🏠' },
    { href: '/trainer/my-courses', label: 'دوراتي', icon: '👨‍🏫' },
    { href: '/trainer/evaluations', label: 'تقييمات', icon: '📋' },
    { href: '/trainer/challenges', label: 'تحديات', icon: '🏆' },
    { href: '/profile', label: 'حسابي', icon: '👤' },
  ];

  const adminTabs = [
    { href: '/dashboard', label: 'الرئيسية', icon: '🏠' },
    { href: '/admin', label: 'التحكم', icon: '⚙️' },
    { href: '/admin/users', label: 'المستخدمون', icon: '👥' },
    { href: '/trainer/challenges', label: 'تحديات', icon: '🏆' },
    { href: '/profile', label: 'حسابي', icon: '👤' },
  ];

  const tabs = role === 'admin' ? adminTabs : role === 'trainer' ? trainerTabs : traineeTabs;

  return (
    <nav className="mobile-tabbar">
      {tabs.map(tab => {
        const isActive = pathname === tab.href || (tab.href !== '/dashboard' && tab.href !== '/profile' && pathname.startsWith(tab.href));
        return (
          <Link key={tab.href} href={tab.href} className={`tab-item ${isActive ? 'active' : ''}`}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 36, height: 28, borderRadius: 8,
              background: isActive ? 'rgba(212,175,55,0.15)' : 'transparent',
              transition: 'all 0.2s ease',
            }}>
              <span style={{ fontSize: '1.2rem' }}>{tab.icon}</span>
            </div>
            <span style={{ fontSize: '0.6rem', fontWeight: isActive ? 600 : 400 }}>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
