'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function MobileTabBar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;
  const role = user?.role || 'trainee';

  const baseTabs = [
    { href: '/dashboard', label: 'الرئيسية', icon: '🏠' },
    { href: '/feed', label: 'فيديو', icon: '🎥' },
  ];

  const roleTabs = role === 'admin' 
    ? [{ href: '/admin', label: 'الإدارة', icon: '⚙️' }]
    : role === 'trainer'
    ? [{ href: '/trainer/evaluations', label: 'تقييمات', icon: '📋' }]
    : [{ href: '/courses', label: 'دورات', icon: '📚' }];

  const endTabs = [
    { href: '/challenges', label: 'تحديات', icon: '🏆' },
    { href: '/profile', label: 'حسابي', icon: '👤' },
  ];

  const tabs = [...baseTabs, ...roleTabs, ...endTabs].slice(0, 5); // Keep it to max 5 tabs for UI sanity

  return (
    <nav className="mobile-tabbar">
      {tabs.map(tab => {
        const isActive = pathname === tab.href || (tab.href !== '/dashboard' && pathname.startsWith(tab.href + '/'));
        return (
          <Link key={tab.href} href={tab.href} className={`tab-item ${isActive ? 'active' : ''}`}>
            <div className={isActive ? 'tab-icon-wrap' : ''} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.3rem' }}>{tab.icon}</span>
            </div>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
