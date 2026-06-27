'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setNotifications(data.notifications || []);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));

      // Mark as read after a short delay
      setTimeout(() => {
        fetch('/api/notifications', { method: 'PUT' }).catch(console.error);
      }, 1000);
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  if (loading) {
    return (
      <AppLayout>
        <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>جاري التحميل...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 600, margin: '0 auto', paddingBottom: 60 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0 }}>
            🔔 <span className="text-gradient">الإشعارات</span>
          </h1>
        </div>

        <div style={{ background: '#111', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
          {notifications.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#666' }}>
              لا توجد إشعارات حتى الآن
            </div>
          ) : (
            notifications.map((n, i) => {
              const icon = n.type === 'like' ? '❤️' : n.type === 'comment' ? '💬' : n.type === 'challenge_win' ? '🏆' : '🔔';
              
              const dateObj = new Date(n.createdAt);
              const isToday = dateObj.toDateString() === new Date().toDateString();
              const timeString = isToday 
                ? dateObj.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
                : dateObj.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });

              return (
                <div key={i} style={{
                  padding: '16px 20px',
                  display: 'flex',
                  gap: 16,
                  alignItems: 'center',
                  borderBottom: i === notifications.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)',
                  background: !n.isRead ? 'rgba(212,175,55,0.05)' : 'transparent',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.03)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.2rem', flexShrink: 0
                  }}>
                    {icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', color: !n.isRead ? '#fff' : '#ddd', lineHeight: 1.4 }}>
                      {n.text}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: 4 }}>
                      {timeString}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}
