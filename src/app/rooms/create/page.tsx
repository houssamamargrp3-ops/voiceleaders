'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './create.module.css';

export default function CreateRoomPage() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('');
  const [type, setType] = useState<'practice' | 'challenge' | 'open'>('open');
  const [maxParticipants, setMaxParticipants] = useState(6);
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [isPrivate, setIsPrivate] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          topic,
          type,
          maxParticipants,
          durationMinutes: durationMinutes === 0 ? null : durationMinutes,
          isPrivate,
          accessCode,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء إنشاء الغرفة');
      }

      // توجيه المستخدم إلى صفحة الغرفة الحية
      router.push(`/rooms/${data.room._id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page} dir="rtl">
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => router.back()}>← عودة</button>
        <h1 className={styles.title}>إنشاء غرفة تدريب جديدة</h1>
      </header>

      <main className={styles.main}>
        <form className={styles.form} onSubmit={handleSubmit}>
          
          <div className={styles.formGroup}>
            <label className={styles.label}>اسم الغرفة *</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="مثال: التدريب على لغة الجسد" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>موضوع الجلسة *</label>
            <input 
              type="text" 
              className={styles.input} 
              placeholder="ما الذي ستناقشونه في هذه الغرفة؟" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>نوع الغرفة</label>
            <div className={styles.cardsRow}>
              <button 
                type="button"
                className={`${styles.typeCard} ${type === 'open' ? styles.activeCard : ''}`}
                onClick={() => setType('open')}
              >
                <span className={styles.typeIcon}>🌐</span>
                <span className={styles.typeName}>مفتوح</span>
              </button>
              <button 
                type="button"
                className={`${styles.typeCard} ${type === 'practice' ? styles.activeCard : ''}`}
                onClick={() => setType('practice')}
              >
                <span className={styles.typeIcon}>💪</span>
                <span className={styles.typeName}>تدريب</span>
              </button>
              <button 
                type="button"
                className={`${styles.typeCard} ${type === 'challenge' ? styles.activeCard : ''}`}
                onClick={() => setType('challenge')}
              >
                <span className={styles.typeIcon}>🎯</span>
                <span className={styles.typeName}>تحدي</span>
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>عدد المشاركين: {maxParticipants}</label>
            <input 
              type="range" 
              min="2" 
              max="10" 
              className={styles.rangeInput}
              value={maxParticipants}
              onChange={(e) => setMaxParticipants(parseInt(e.target.value))}
            />
            <div className={styles.rangeLabels}>
              <span>2</span>
              <span>10</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>الخصوصية</label>
            <div className={styles.toggleRow}>
              <span>🔒 غرفة خاصة؟ (تتطلب رمز دخول)</span>
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          </div>

          {isPrivate && (
            <div className={styles.formGroup}>
              <label className={styles.label}>رمز الدخول</label>
              <input 
                type="text" 
                className={styles.input} 
                placeholder="أدخل رمزاً (مثال: 1234)" 
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                required={isPrivate}
              />
            </div>
          )}

          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.previewCard}>
            <h3>📋 ملخص الغرفة</h3>
            <p><strong>النقاط المكافأة:</strong> {type === 'challenge' ? '50' : '10'} نقطة</p>
            <p><strong>مدة دورة واحدة (تقريباً):</strong> {maxParticipants * 1.5} دقائق</p>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'جاري الإنشاء...' : '🎤 إنشاء الغرفة الآن'}
          </button>
        </form>
      </main>
    </div>
  );
}
