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
    { href: '/feed', label: 'الرئيسية', icon: '🏠' },
    { href: '/community', label: 'استكشف', icon: '🎥' },
    { href: '/courses', label: 'دورات', icon: '📚' },
    { href: '/challenges', label: 'تحديات', icon: '🏆' },
    { href: '/profile', label: 'حسابي', icon: '👤' },
  ];

  const trainerTabs = [
    { href: '/feed', label: 'الرئيسية', icon: '🏠' },
    { href: '/community', label: 'استكشف', icon: '🎥' },
    { href: '/trainer/evaluations', label: 'تقييمات', icon: '📋' },
    { href: '/trainer/challenges', label: 'تحديات', icon: '🏆' },
    { href: '/profile', label: 'حسابي', icon: '👤' },
  ];

  const adminTabs = [
    { href: '/feed', label: 'الرئيسية', icon: '🏠' },
    { href: '/community', label: 'استكشف', icon: '🎥' },
    { href: '/admin', label: 'التحكم', icon: '⚙️' },
    { href: '/admin/users', label: 'المستخدمون', icon: '👥' },
    { href: '/profile', label: 'حسابي', icon: '👤' },
  ];

  const tabs = role === 'admin' ? adminTabs : role === 'trainer' ? trainerTabs : traineeTabs;

  return (
    <nav className="mobile-tabbar">
      {tabs.map(tab => {
        // Special case to prevent `/feed` from matching `/` exactly if needed, but it's specific
        const isActive = pathname === tab.href || 
                         (tab.href !== '/feed' && tab.href !== '/profile' && pathname.startsWith(tab.href + '/'));
        
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
