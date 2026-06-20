'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './rooms.module.css';

interface Room {
  id: string;
  name: string;
  topic: string;
  type: string;
  status: string;
  participantsCount: number;
  maxParticipants: number;
  hostName: string;
}

export default function RoomsListPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchRooms();
  }, [filter]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const url = filter ? `/api/rooms?type=${filter}` : '/api/rooms';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (roomId: string) => {
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId, role: 'audience' }), // ينضم كجمهور افتراضياً
      });
      const data = await res.json();
      if (res.ok || data.error === 'أنت بالفعل في هذه الغرفة') {
        router.push(`/rooms/${roomId}`);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('حدث خطأ أثناء الانضمام');
    }
  };

  return (
    <div className={styles.page} dir="rtl">
      <header className={styles.header}>
        <div className={styles.headerTitle}>
          <h1>🎤 غرف التدريب الحية</h1>
          <p>اختر غرفة للانضمام أو قم بإنشاء غرفتك الخاصة</p>
        </div>
        <Link href="/rooms/create" className={styles.createBtn}>
          ➕ إنشاء غرفة
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.filters}>
          <button className={`${styles.filterBtn} ${filter === '' ? styles.active : ''}`} onClick={() => setFilter('')}>الكل</button>
          <button className={`${styles.filterBtn} ${filter === 'open' ? styles.active : ''}`} onClick={() => setFilter('open')}>🌐 مفتوحة</button>
          <button className={`${styles.filterBtn} ${filter === 'practice' ? styles.active : ''}`} onClick={() => setFilter('practice')}>💪 تدريب</button>
          <button className={`${styles.filterBtn} ${filter === 'challenge' ? styles.active : ''}`} onClick={() => setFilter('challenge')}>🎯 تحدي</button>
        </div>

        {loading ? (
          <div className={styles.loading}>جاري تحميل الغرف...</div>
        ) : rooms.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>لا توجد غرف حية حالياً</h2>
            <p>كن أول من ينشئ غرفة ويبدأ التدريب!</p>
            <Link href="/rooms/create" className={styles.createBtnLarge}>
              إنشاء غرفة الآن
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {rooms.map(room => (
              <div key={room.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  {room.status === 'live' ? (
                    <span className={styles.liveBadge}>🔴 LIVE</span>
                  ) : (
                    <span className={styles.waitingBadge}>⏳ انتظار</span>
                  )}
                  <span className={styles.typeIcon}>
                    {room.type === 'challenge' ? '🎯 تحدي' : room.type === 'practice' ? '💪 تدريب' : '🌐 مفتوح'}
                  </span>
                </div>
                
                <h3 className={styles.roomName}>{room.name}</h3>
                <p className={styles.roomTopic}>الموضوع: {room.topic}</p>
                
                <div className={styles.cardFooter}>
                  <div className={styles.hostInfo}>
                    👤 המضيف: {room.hostName}
                  </div>
                  <div className={styles.participantsInfo}>
                    👥 {room.participantsCount} / {room.maxParticipants}
                  </div>
                </div>

                <button 
                  className={styles.joinBtn} 
                  onClick={() => handleJoin(room.id)}
                  disabled={room.participantsCount >= room.maxParticipants}
                >
                  {room.participantsCount >= room.maxParticipants ? 'الغرفة ممتلئة' : 'انضمام ➔'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
