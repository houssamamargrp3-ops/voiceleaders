import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AppLayout from '@/components/layout/AppLayout';

export default async function TrainerLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect('/auth/login');
  }

  const role = (session.user as any).role;

  if (role !== 'trainer' && role !== 'admin') {
    redirect('/dashboard'); // Not authorized
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            <span className="text-gradient">لوحة المدرب</span> 👨‍🏫
          </h1>
          <p style={{ color: '#888', fontSize: '0.9rem', marginTop: 4 }}>
            إدارة دوراتك وتقييم طلابك بسهولة
          </p>
        </div>
        {children}
      </div>
    </AppLayout>
  );
}
