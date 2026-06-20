'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useRoom } from '@/hooks/useRoom';
import styles from './room.module.css';

// ─── ثوابت ────────────────────────────────────
const EMOJIS = ['👏', '🔥', '💯', '😂', '❤️', '🚀'];

// ─── مكوّن شريط التقدم الزمني ─────────────────
function TimerBar({ duration, startedAt }: { duration: number; startedAt: number }) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    const tick = () => {
      const elapsed = (Date.now() - startedAt) / 1000;
      setRemaining(Math.max(0, duration - elapsed));
    };
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [duration, startedAt]);

  const pct = (remaining / duration) * 100;
  const isUrgent = remaining <= 10;

  return (
    <div className={styles.timerWrap}>
      <div className={styles.timerNumbers}>
        <span className={isUrgent ? styles.urgent : ''}>
          {Math.floor(remaining / 60).toString().padStart(2, '0')}:
          {Math.floor(remaining % 60).toString().padStart(2, '0')}
        </span>
        <span className={styles.timerLabel}>/ {Math.floor(duration / 60).toString().padStart(2, '0')}:{(duration % 60).toString().padStart(2, '0')}</span>
      </div>
      <div className={styles.timerTrack}>
        <div
          className={`${styles.timerFill} ${isUrgent ? styles.timerUrgent : ''}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── مكوّن نجوم التقييم ───────────────────────
function StarRating({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className={styles.starRow}>
      <span className={styles.starLabel}>{label}</span>
      <div className={styles.stars}>
        {Array.from({ length: 10 }, (_, i) => (
          <button
            key={i}
            className={`${styles.star} ${i < value ? styles.starFilled : ''}`}
            onClick={() => onChange(i + 1)}
            title={`${i + 1}`}
          >★</button>
        ))}
        <span className={styles.starValue}>{value}/10</span>
      </div>
    </div>
  );
}

// ─── مكوّن بطاقة المشارك ─────────────────────
function ParticipantCard({ p, isSpeaker }: { p: { userId: string; name: string; avatar: string }; isSpeaker: boolean }) {
  return (
    <div className={`${styles.participantCard} ${isSpeaker ? styles.activeSpeaker : ''}`}>
      <div className={styles.participantAvatar}>
        {p.avatar
          ? <img src={p.avatar} alt={p.name} />
          : <span>{p.name.charAt(0).toUpperCase()}</span>
        }
        {isSpeaker && <span className={styles.liveRing} />}
      </div>
      <span className={styles.participantName}>{p.name}</span>
      {isSpeaker && <span className={styles.speakerBadge}>🎤</span>}
    </div>
  );
}

// ─── الصفحة الرئيسية ─────────────────────────
export default function RoomPage() {
  const params  = useParams();
  const router  = useRouter();
  const { data: session } = useSession();
  const roomId  = params?.id as string;

  const userId   = session?.user?.id  || '';
  const userName = session?.user?.name || 'مجهول';

  const {
    connected, phase, participants, currentSpeaker,
    scoringInfo, transition, lastResult, reactions,
    scoreCount, error,
    startRotation, registerSession, submitScore, sendReaction, leaveRoom,
    isCurrentSpeaker,
  } = useRoom(roomId, userId, userName);

  // ── نموذج التقييم ─────────────────────────
  const [scores, setScores] = useState({ clarity: 5, confidence: 5, structure: 5, engagement: 5 });
  const [comment, setComment]   = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [roomInfo, setRoomInfo]   = useState<{ name: string; topic: string; hostId: string } | null>(null);

  // ── ردود الفعل الطائرة ───────────────────
  const [flyReactions, setFlyReactions] = useState<Array<{ id: number; emoji: string }>>([]);
  const flyRef = useRef(0);

  // ── جلب معلومات الغرفة ───────────────────
  useEffect(() => {
    if (!roomId) return;
    fetch(`/api/rooms/${roomId}`)
      .then(r => r.json())
      .then(d => d.room && setRoomInfo(d.room))
      .catch(() => {});
  }, [roomId]);

  // ── إنشاء Session عند بدء الدور ──────────
  useEffect(() => {
    if (phase !== 'speaking' || !isCurrentSpeaker || !roomId) return;
    fetch('/api/sessions/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomId, topic: roomInfo?.topic || 'تحدث بحرية' }),
    })
      .then(r => r.json())
      .then(d => d.session && registerSession(d.session._id))
      .catch(() => {});
  }, [phase, isCurrentSpeaker, roomId, roomInfo, registerSession]);

  // ── إعادة ضبط نموذج التقييم ──────────────
  useEffect(() => {
    if (phase === 'scoring') {
      setScores({ clarity: 5, confidence: 5, structure: 5, engagement: 5 });
      setComment('');
      setSubmitted(false);
    }
  }, [phase, scoringInfo?.sessionId]);

  // ── إرسال ردود الفعل الطائرة ─────────────
  useEffect(() => {
    if (!reactions.length) return;
    const last = reactions[reactions.length - 1];
    const id = flyRef.current++;
    setFlyReactions(prev => [...prev, { id, emoji: last.emoji }]);
    const t = setTimeout(() => setFlyReactions(prev => prev.filter(r => r.id !== id)), 2500);
    return () => clearTimeout(t);
  }, [reactions]);

  // ── handlers ─────────────────────────────
  const handleScoreSubmit = useCallback(() => {
    if (submitted) return;
    submitScore(scores, comment);
    setSubmitted(true);
  }, [submitted, scores, comment, submitScore]);

  const handleReaction = useCallback((emoji: string) => {
    sendReaction(emoji);
  }, [sendReaction]);

  const handleLeave = useCallback(() => {
    leaveRoom();
    router.push('/rooms');
  }, [leaveRoom, router]);

  const isHost = roomInfo?.hostId === userId;

  // ─────────────────────────────────────────
  return (
    <div className={styles.page} dir="rtl">

      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          {phase === 'speaking' || phase === 'scoring'
            ? <span className={styles.livePill}>🔴 LIVE</span>
            : <span className={styles.waitingPill}>⏳ انتظار</span>
          }
          <span className={styles.roomTopic}>{roomInfo?.topic || '...'}</span>
        </div>
        <button className={styles.leaveBtn} onClick={handleLeave}>مغادرة ✕</button>
      </header>

      {/* ── منطقة المتحدث ── */}
      <main className={styles.stage}>

        {/* حالة الانتظار */}
        {phase === 'waiting' && (
          <div className={styles.waitingState}>
            <div className={styles.waitingIcon}>🎤</div>
            <h2>في انتظار المشاركين</h2>
            <p>{participants.length} / {4} مشاركين</p>
            {isHost && participants.length >= 2 && (
              <button className={styles.startBtn} onClick={() => startRotation(60)}>
                🚀 ابدأ الجلسة
              </button>
            )}
            {!isHost && <p className={styles.hint}>المضيف سيبدأ الجلسة قريباً...</p>}
          </div>
        )}

        {/* المتحدث الحالي */}
        {(phase === 'speaking' || phase === 'scoring') && currentSpeaker && (
          <div className={styles.speakerStage}>
            <div className={`${styles.speakerAvatar} ${phase === 'speaking' ? styles.speakerPulse : ''}`}>
              <span>{currentSpeaker.speakerName.charAt(0).toUpperCase()}</span>
            </div>
            <h2 className={styles.speakerName}>{currentSpeaker.speakerName}</h2>
            <p className={styles.speakerSub}>
              متحدث {currentSpeaker.queueIndex + 1} من {currentSpeaker.queueTotal}
            </p>

            {phase === 'speaking' && (
              <TimerBar duration={currentSpeaker.duration} startedAt={currentSpeaker.startedAt} />
            )}

            {phase === 'speaking' && isCurrentSpeaker && (
              <div className={styles.youAreSpeaking}>
                🎤 أنت تتحدث الآن — تحدث بثقة!
              </div>
            )}
          </div>
        )}

        {/* انتقال */}
        {phase === 'transition' && transition && (
          <div className={styles.transitionState}>
            <div className={styles.transitionIcon}>⏭️</div>
            <h2>المتحدث التالي</h2>
            <p className={styles.nextSpeakerName}>{transition.nextSpeakerName}</p>
            <p className={styles.countdownHint}>يبدأ خلال 5 ثوانٍ...</p>
            <p className={styles.remaining}>متبقٍ: {transition.remaining} متحدث</p>
          </div>
        )}

        {/* انتهت الجلسة */}
        {phase === 'ended' && (
          <div className={styles.endedState}>
            <div className={styles.endedIcon}>🏆</div>
            <h2>انتهت الجلسة!</h2>
            <p>أحسنتم جميعاً، لقد تحسنتم اليوم 💪</p>
            <button className={styles.startBtn} onClick={() => router.push('/leaderboard')}>
              عرض النتائج
            </button>
          </div>
        )}

      </main>

      {/* ── نتيجة المتحدث المنتهي ── */}
      {lastResult && (
        <div className={styles.resultToast}>
          <span>🎯 {lastResult.overallAverage.toFixed(1)}/10</span>
          <span>+{lastResult.pointsEarned} نقطة</span>
        </div>
      )}

      {/* ── المشاركون ── */}
      <section className={styles.participantsSection}>
        <h3 className={styles.sectionTitle}>المشاركون ({participants.length})</h3>
        <div className={styles.participantsGrid}>
          {participants.map(p => (
            <ParticipantCard
              key={p.userId}
              p={p}
              isSpeaker={p.userId === currentSpeaker?.speakerId}
            />
          ))}
        </div>
      </section>

      {/* ── لوحة التقييم ── */}
      {phase === 'scoring' && !isCurrentSpeaker && (
        <section className={styles.scoringPanel}>
          <h3 className={styles.sectionTitle}>
            قيّم {currentSpeaker?.speakerName} ✍️
            <span className={styles.scoreProgress}>
              ({scoreCount.received}/{scoreCount.total} قيّموا)
            </span>
          </h3>

          {!submitted ? (
            <>
              <StarRating label="وضوح الفكرة" value={scores.clarity}    onChange={v => setScores(s => ({ ...s, clarity: v }))} />
              <StarRating label="مستوى الثقة" value={scores.confidence} onChange={v => setScores(s => ({ ...s, confidence: v }))} />
              <StarRating label="تنظيم الخطاب" value={scores.structure}  onChange={v => setScores(s => ({ ...s, structure: v }))} />
              <StarRating label="جذب الجمهور" value={scores.engagement} onChange={v => setScores(s => ({ ...s, engagement: v }))} />

              <textarea
                className={styles.commentBox}
                placeholder="أضف تعليقاً بنّاءً (اختياري)..."
                value={comment}
                onChange={e => setComment(e.target.value)}
                maxLength={500}
                rows={2}
              />

              {error && <p className={styles.errorMsg}>{error}</p>}

              <button className={styles.submitBtn} onClick={handleScoreSubmit}>
                إرسال التقييم ✓
              </button>
            </>
          ) : (
            <div className={styles.scoreSent}>
              ✅ تم إرسال تقييمك — شكراً!
            </div>
          )}
        </section>
      )}

      {/* ── ردود الفعل ── */}
      <div className={styles.reactionsBar}>
        {EMOJIS.map(e => (
          <button key={e} className={styles.emojiBtn} onClick={() => handleReaction(e)}>
            {e}
          </button>
        ))}
      </div>

      {/* ── ردود الفعل الطائرة ── */}
      <div className={styles.flyingReactions} aria-hidden>
        {flyReactions.map(r => (
          <span key={r.id} className={styles.flyEmoji}>{r.emoji}</span>
        ))}
      </div>

      {/* ── مؤشر الاتصال ── */}
      {!connected && (
        <div className={styles.disconnected}>⚠️ جاري إعادة الاتصال...</div>
      )}
    </div>
  );
}
