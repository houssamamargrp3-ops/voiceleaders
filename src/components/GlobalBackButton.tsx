'use client';
import { useRouter, usePathname } from 'next/navigation';

export default function GlobalBackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Don't show back button on the landing page
  if (pathname === '/') return null;

  return (
    <button
      onClick={() => router.back()}
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '24px', // left side since it's RTL
        zIndex: 9999,
        background: '#D4AF37',
        color: '#000',
        border: 'none',
        borderRadius: '50%',
        width: '48px',
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(212,175,55,0.4)',
        fontSize: '1.2rem',
        transition: 'transform 0.2s',
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      title="عودة للخلف"
    >
      <span style={{ transform: 'rotate(180deg)' }}>➜</span>
    </button>
  );
}
