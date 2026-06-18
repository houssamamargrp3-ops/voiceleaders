import AppLayout from '@/components/layout/AppLayout';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import TraineeDashboard from '@/components/dashboard/TraineeDashboard';
import TrainerDashboard from '@/components/dashboard/TrainerDashboard';

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/auth/login');
  }

  const user = session.user as any;
  const isTrainer = user.role === 'trainer';

  return (
    <AppLayout>
      {isTrainer ? (
        <TrainerDashboard user={user} />
      ) : (
        <TraineeDashboard user={user} />
      )}
    </AppLayout>
  );
}
