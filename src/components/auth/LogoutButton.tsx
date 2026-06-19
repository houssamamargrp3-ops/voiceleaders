'use client';
import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/auth/login' })} 
      className="btn-outline"
      style={{ padding: '10px 24px', color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}
    >
      🚪 تسجيل الخروج
    </button>
  );
}
