import { logoutAction } from '@/app/actions/auth';

export default function LogoutButton() {
  return (
    <form action={logoutAction} style={{ display: 'inline-block' }}>
      <button 
        type="submit"
        className="btn-outline"
        style={{ padding: '10px 24px', color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}
      >
        🚪 تسجيل الخروج
      </button>
    </form>
  );
}
