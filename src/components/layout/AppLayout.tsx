import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import MobileTabBar from '@/components/layout/MobileTabBar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <Sidebar />
      <MobileTabBar />
      <main className="main-content">
        {children}
      </main>
    </>
  );
}
