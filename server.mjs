// @ts-check
/**
 * ─────────────────────────────────────────────
 *  SpeakUp Challenge — Custom Next.js Server
 *  يدمج Socket.io مع Next.js لدعم الغرف الحية
 * ─────────────────────────────────────────────
 *
 * ملاحظة: هذا الملف يعمل في بيئة Node.js مباشرة
 *         ولا يمر عبر Next.js compiler.
 *         استخدم CommonJS require() أو ESM مع .mjs
 */

import { createServer } from 'http';
import { Server } from 'socket.io';
import next from 'next';
import fs from 'fs';
import path from 'path';


const port = parseInt(process.env.PORT || '3000', 10);
const dev  = process.env.NODE_ENV !== 'production';
const app  = next({ dev });
const handle = app.getRequestHandler();

// ─── في الذاكرة: حالة الغرف الحية ────────────
/**
 * @typedef {{
 *   speakerQueue: string[],
 *   currentSpeakerIndex: number,
 *   currentSpeakerId: string,
 *   currentSessionId: string,
 *   timerStartedAt: number,
 *   phase: 'waiting'|'speaking'|'scoring'|'transition'|'ended',
 *   pendingScores: Record<string, { clarity:number, confidence:number, structure:number, engagement:number, average:number, comment:string }>,
 *   completedSessions: string[],
 *   activeParticipants: Array<{ userId:string, name:string, avatar:string }>,
 * }} RoomState
 */

/** @type {Map<string, RoomState>} */
const roomStates = new Map();

/** @type {Map<string, ReturnType<typeof setTimeout>>} */
const roomTimers = new Map();

// ─── دوال مساعدة ────────────────────────────

/** خلط مصفوفة عشوائياً (Fisher-Yates) */
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** إلغاء أي Timer موجود للغرفة */
function clearRoomTimer(roomId) {
  const t = roomTimers.get(roomId);
  if (t) { clearTimeout(t); roomTimers.delete(roomId); }
}

/** حساب متوسط نقاط جلسة */
function calcAverage(scores) {
  if (!scores.length) return 0;
  const sum = scores.reduce((s, x) => s + x.average, 0);
  return parseFloat((sum / scores.length).toFixed(2));
}

// ─── منطق الدوران ────────────────────────────

/**
 * بدء دور المتحدث الحالي
 * @param {Server} io
 * @param {string} roomId
 * @param {number} durationSeconds
 */
function startSpeakerTurn(io, roomId, durationSeconds = 60) {
  const state = roomStates.get(roomId);
  if (!state || state.phase === 'ended') return;

  const speaker = state.speakerQueue[state.currentSpeakerIndex];
  if (!speaker) { endRoom(io, roomId); return; }

  state.currentSpeakerId  = speaker;
  state.timerStartedAt    = Date.now();
  state.phase             = 'speaking';
  state.pendingScores     = {};
  state.currentSessionId  = '';   // سيُحدَّث عند إنشاء Session

  roomStates.set(roomId, state);

  const speakerInfo = state.activeParticipants.find(p => p.userId === speaker);

  // أخبر الجميع ببدء الدور
  io.to(roomId).emit('turn:started', {
    speakerId   : speaker,
    speakerName : speakerInfo?.name ?? 'مجهول',
    speakerAvatar: speakerInfo?.avatar ?? '',
    queueIndex  : state.currentSpeakerIndex,
    queueTotal  : state.speakerQueue.length,
    duration    : durationSeconds,
    startedAt   : state.timerStartedAt,
  });

  // Timer على الخادم
  clearRoomTimer(roomId);
  const t = setTimeout(() => onTimerExpired(io, roomId), durationSeconds * 1000);
  roomTimers.set(roomId, t);
}

/**
 * انتهاء وقت الخطاب → فتح نافذة التقييم
 * @param {Server} io
 * @param {string} roomId
 */
function onTimerExpired(io, roomId) {
  const state = roomStates.get(roomId);
  if (!state || state.phase !== 'speaking') return;

  state.phase = 'scoring';
  roomStates.set(roomId, state);

  io.to(roomId).emit('turn:ended', {
    speakerId : state.currentSpeakerId,
    sessionId : state.currentSessionId,
  });

  io.to(roomId).emit('scoring:started', {
    speakerId  : state.currentSpeakerId,
    sessionId  : state.currentSessionId,
    timeLimit  : 20,
  });

  // بعد 20 ثانية → المتحدث التالي
  clearRoomTimer(roomId);
  const t = setTimeout(() => moveToNextSpeaker(io, roomId), 20 * 1000);
  roomTimers.set(roomId, t);
}

/**
 * الانتقال للمتحدث التالي
 * @param {Server} io
 * @param {string} roomId
 */
function moveToNextSpeaker(io, roomId) {
  clearRoomTimer(roomId);
  const state = roomStates.get(roomId);
  if (!state || state.phase === 'ended') return;

  // احسب النتيجة النهائية للمتحدث الحالي
  const scores = Object.values(state.pendingScores);
  const overallAvg = calcAverage(scores);
  const pointsEarned = Math.round(overallAvg * 10);

  // أرسل النتائج
  io.to(roomId).emit('speaker:result', {
    speakerId    : state.currentSpeakerId,
    overallAverage: overallAvg,
    pointsEarned : pointsEarned,
    scores,
  });

  // سجّل الجلسة المنتهية
  if (state.currentSessionId) {
    state.completedSessions.push(state.currentSessionId);
  }

  // انتقل للتالي
  state.currentSpeakerIndex += 1;

  // هل انتهى الجميع؟
  if (state.currentSpeakerIndex >= state.speakerQueue.length) {
    state.phase = 'ended';
    roomStates.set(roomId, state);
    endRoom(io, roomId);
    return;
  }

  // فترة انتقالية 5 ثوانٍ
  state.phase = 'transition';
  roomStates.set(roomId, state);

  const nextSpeakerId   = state.speakerQueue[state.currentSpeakerIndex];
  const nextSpeakerInfo = state.activeParticipants.find(p => p.userId === nextSpeakerId);

  io.to(roomId).emit('transition:next', {
    nextSpeakerId  : nextSpeakerId,
    nextSpeakerName: nextSpeakerInfo?.name ?? 'مجهول',
    remaining      : state.speakerQueue.length - state.currentSpeakerIndex,
    countdown      : 5,
  });

  const t = setTimeout(() => startSpeakerTurn(io, roomId), 5 * 1000);
  roomTimers.set(roomId, t);
}

/**
 * إنهاء الغرفة وإرسال النتائج الكاملة
 * @param {Server} io
 * @param {string} roomId
 */
function endRoom(io, roomId) {
  clearRoomTimer(roomId);
  const state = roomStates.get(roomId);
  if (!state) return;

  state.phase = 'ended';
  roomStates.set(roomId, state);

  io.to(roomId).emit('room:ended', {
    roomId,
    completedSessions: state.completedSessions,
    message: 'انتهت جلسة التدريب! أحسنتم جميعاً 🎉',
  });

  // تنظيف الذاكرة بعد دقيقة
  setTimeout(() => roomStates.delete(roomId), 60 * 1000);
}

// ─── تشغيل الخادم ────────────────────────────

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    // Serve dynamic uploaded files (Next.js standalone doesn't serve them natively)
    if (req.url && req.url.startsWith('/uploads/')) {
      try {
        const urlPath = req.url.split('?')[0];
        // Prevent path traversal
        const safePath = path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, '');
        const filePath = path.join(process.cwd(), 'public', safePath);
        
        fs.stat(filePath, (err, stat) => {
          if (err || !stat.isFile()) return handle(req, res);
          
          const ext = path.extname(filePath).toLowerCase();
          let contentType = 'application/octet-stream';
          if (ext === '.mp4') contentType = 'video/mp4';
          else if (ext === '.mov') contentType = 'video/quicktime';
          else if (ext === '.avi') contentType = 'video/x-msvideo';
          else if (ext === '.png') contentType = 'image/png';
          else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';

          const range = req.headers.range;
          if (range && (ext === '.mp4' || ext === '.mov')) {
            const parts = range.replace(/bytes=/, "").split("-");
            const partialstart = parts[0];
            const partialend = parts[1];
            const start = parseInt(partialstart, 10);
            const end = partialend ? parseInt(partialend, 10) : stat.size - 1;
            const chunksize = (end - start) + 1;
            const fileStream = fs.createReadStream(filePath, {start, end});
            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${stat.size}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize,
              'Content-Type': contentType
            });
            fileStream.pipe(res);
          } else {
            res.writeHead(200, {
              'Content-Length': stat.size,
              'Content-Type': contentType
            });
            fs.createReadStream(filePath).pipe(res);
          }
        });
        return;
      } catch (e) {
        return handle(req, res);
      }
    }
    return handle(req, res);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // ─── Socket.io Events ──────────────────────

  io.on('connection', (socket) => {
    console.log(`🔌 اتصال جديد: ${socket.id}`);

    // ── انضمام لغرفة ─────────────────────────
    socket.on('room:join', ({ roomId, userId, name, avatar }) => {
      if (!roomId || !userId) return;

      socket.join(roomId);
      socket.data.roomId = roomId;
      socket.data.userId = userId;

      // تهيئة حالة الغرفة إن لم تكن موجودة
      if (!roomStates.has(roomId)) {
        roomStates.set(roomId, {
          speakerQueue       : [],
          currentSpeakerIndex: 0,
          currentSpeakerId   : '',
          currentSessionId   : '',
          timerStartedAt     : 0,
          phase              : 'waiting',
          pendingScores      : {},
          completedSessions  : [],
          activeParticipants : [],
        });
      }

      const state = roomStates.get(roomId);

      // أضف المشارك إن لم يكن موجوداً
      const exists = state.activeParticipants.find(p => p.userId === userId);
      if (!exists) {
        state.activeParticipants.push({ userId, name: name || 'مجهول', avatar: avatar || '' });
        roomStates.set(roomId, state);
      }

      // أخبر الجميع
      io.to(roomId).emit('participant:joined', {
        userId,
        name: name || 'مجهول',
        avatar: avatar || '',
        participantsCount: state.activeParticipants.length,
        participants: state.activeParticipants,
      });

      // أرسل للمنضم الجديد الحالة الراهنة
      socket.emit('room:state', {
        phase              : state.phase,
        participants       : state.activeParticipants,
        currentSpeakerId   : state.currentSpeakerId,
        queueIndex         : state.currentSpeakerIndex,
        queueTotal         : state.speakerQueue.length,
      });

      console.log(`👤 ${name} انضم للغرفة ${roomId} (${state.activeParticipants.length} مشاركين)`);
    });

    // ── بدء الدوران (المضيف فقط) ─────────────
    socket.on('rotation:start', ({ roomId, durationSeconds }) => {
      const state = roomStates.get(roomId);
      if (!state || state.phase !== 'waiting') return;

      // بناء قائمة الانتظار مخلوطة
      state.speakerQueue        = shuffle(state.activeParticipants.map(p => p.userId));
      state.currentSpeakerIndex = 0;
      state.phase               = 'speaking';
      roomStates.set(roomId, state);

      io.to(roomId).emit('rotation:started', {
        speakerQueue: state.speakerQueue,
        participants : state.activeParticipants,
      });

      startSpeakerTurn(io, roomId, durationSeconds || 60);
      console.log(`🎤 بدأ الدوران في الغرفة ${roomId} بـ ${state.speakerQueue.length} متحدثين`);
    });

    // ── ربط Session ID بالغرفة ───────────────
    socket.on('session:created', ({ roomId, sessionId }) => {
      const state = roomStates.get(roomId);
      if (!state) return;
      state.currentSessionId = sessionId;
      roomStates.set(roomId, state);
    });

    // ── إرسال تقييم ──────────────────────────
    socket.on('score:submit', ({ roomId, evaluatorId, evaluatorName, scores, comment }) => {
      const state = roomStates.get(roomId);
      if (!state || state.phase !== 'scoring') {
        socket.emit('score:error', { message: 'ليس وقت التقييم الآن' });
        return;
      }

      // لا تقييم للنفس
      if (evaluatorId === state.currentSpeakerId) {
        socket.emit('score:error', { message: 'لا يمكنك تقييم نفسك' });
        return;
      }

      // لا تقييم مزدوج
      if (state.pendingScores[evaluatorId]) {
        socket.emit('score:error', { message: 'لقد قدّمت تقييمك بالفعل' });
        return;
      }

      const { clarity = 5, confidence = 5, structure = 5, engagement = 5 } = scores || {};
      const average = parseFloat(((clarity + confidence + structure + engagement) / 4).toFixed(2));

      state.pendingScores[evaluatorId] = {
        clarity, confidence, structure, engagement, average,
        comment: comment || '',
      };
      roomStates.set(roomId, state);

      socket.emit('score:accepted', { message: 'تم إرسال تقييمك ✓' });

      const totalEvaluators  = state.activeParticipants.length - 1;
      const receivedCount    = Object.keys(state.pendingScores).length;

      io.to(roomId).emit('score:received', {
        evaluatorName,
        receivedCount,
        totalEvaluators,
      });

      // إذا قيّم الجميع → انتقل فوراً
      if (receivedCount >= totalEvaluators && totalEvaluators > 0) {
        clearRoomTimer(roomId);
        moveToNextSpeaker(io, roomId);
      }
    });

    // ── Emoji Reactions ───────────────────────
    socket.on('reaction:send', ({ roomId, emoji, userId, name }) => {
      io.to(roomId).emit('reaction:received', { emoji, userId, name, at: Date.now() });
    });

    // ── مغادرة الغرفة ────────────────────────
    socket.on('room:leave', ({ roomId, userId }) => {
      handleLeave(io, socket, roomId, userId);
    });

    // ── قطع الاتصال ──────────────────────────
    socket.on('disconnect', () => {
      const { roomId, userId } = socket.data;
      if (roomId && userId) {
        handleLeave(io, socket, roomId, userId);
      }
      console.log(`❌ انقطع: ${socket.id}`);
    });
  });

  // ─── معالجة المغادرة ───────────────────────
  function handleLeave(io, socket, roomId, userId) {
    socket.leave(roomId);
    const state = roomStates.get(roomId);
    if (!state) return;

    state.activeParticipants = state.activeParticipants.filter(p => p.userId !== userId);
    roomStates.set(roomId, state);

    io.to(roomId).emit('participant:left', {
      userId,
      participantsCount: state.activeParticipants.length,
      participants: state.activeParticipants,
    });

    // إذا غادر الجميع → أنهِ الغرفة
    if (state.activeParticipants.length === 0) {
      clearRoomTimer(roomId);
      roomStates.delete(roomId);
      return;
    }

    // إذا غادر المتحدث الحالي → انتقل للتالي
    if (userId === state.currentSpeakerId && state.phase === 'speaking') {
      clearRoomTimer(roomId);
      moveToNextSpeaker(io, roomId);
    }
  }

  // ─── تشغيل الخادم ──────────────────────────
  httpServer.listen(port, () => {
    console.log(`\n🎤 SpeakUp Challenge Server`);
    console.log(`🚀 يعمل على: http://localhost:${port}`);
    console.log(`⚡ Socket.io: جاهز`);
    console.log(`🌱 الوضع: ${dev ? 'development' : 'production'}\n`);
  });
});
