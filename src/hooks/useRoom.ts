'use client';

/**
 * ─────────────────────────────────────────────
 *  useSocket — React Hook للاتصال بـ Socket.io
 * ─────────────────────────────────────────────
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

// ─── أنواع البيانات ───────────────────────────

export interface Participant {
  userId : string;
  name   : string;
  avatar : string;
}

export interface ScorePayload {
  clarity    : number;
  confidence : number;
  structure  : number;
  engagement : number;
}

export interface TurnStartedPayload {
  speakerId    : string;
  speakerName  : string;
  speakerAvatar: string;
  queueIndex   : number;
  queueTotal   : number;
  duration     : number;
  startedAt    : number;
}

export interface ScoringStartedPayload {
  speakerId : string;
  sessionId : string;
  timeLimit : number;
}

export interface SpeakerResultPayload {
  speakerId     : string;
  overallAverage: number;
  pointsEarned  : number;
}

export interface TransitionPayload {
  nextSpeakerId  : string;
  nextSpeakerName: string;
  remaining      : number;
  countdown      : number;
}

export interface ReactionPayload {
  emoji  : string;
  userId : string;
  name   : string;
  at     : number;
}

export type RoomPhase =
  | 'waiting'
  | 'speaking'
  | 'scoring'
  | 'transition'
  | 'ended';

// ─── Hook ─────────────────────────────────────

export function useSocket() {
  const socketRef  = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      }
    );

    socketRef.current = socket;

    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    return () => {
      socket.disconnect();
    };
  }, []);

  return { socket: socketRef.current, connected };
}

// ─── Hook الغرفة الكاملة ──────────────────────

export function useRoom(roomId: string, userId: string, userName: string, userAvatar = '') {

  const { socket, connected } = useSocket();

  // ── State ──────────────────────────────────
  const [phase,        setPhase]        = useState<RoomPhase>('waiting');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<TurnStartedPayload | null>(null);
  const [scoringInfo,  setScoringInfo]  = useState<ScoringStartedPayload | null>(null);
  const [transition,   setTransition]   = useState<TransitionPayload | null>(null);
  const [lastResult,   setLastResult]   = useState<SpeakerResultPayload | null>(null);
  const [reactions,    setReactions]    = useState<ReactionPayload[]>([]);
  const [scoreCount,   setScoreCount]   = useState({ received: 0, total: 0 });
  const [error,        setError]        = useState<string>('');

  // ── انضمام للغرفة عند الاتصال ──────────────
  useEffect(() => {
    if (!socket || !connected || !roomId || !userId) return;

    socket.emit('room:join', { roomId, userId, name: userName, avatar: userAvatar });

    // ─── استقبال الأحداث ───────────────────

    socket.on('room:state', (data) => {
      setPhase(data.phase);
      setParticipants(data.participants || []);
    });

    socket.on('participant:joined', (data) => {
      setParticipants(data.participants || []);
    });

    socket.on('participant:left', (data) => {
      setParticipants(data.participants || []);
    });

    socket.on('rotation:started', (data) => {
      setPhase('speaking');
      setParticipants(data.participants || []);
    });

    socket.on('turn:started', (data: TurnStartedPayload) => {
      setPhase('speaking');
      setCurrentSpeaker(data);
      setScoringInfo(null);
      setTransition(null);
      setLastResult(null);
      setScoreCount({ received: 0, total: 0 });
    });

    socket.on('turn:ended', () => {
      // Scoring panel يفتح عند scoring:started
    });

    socket.on('scoring:started', (data: ScoringStartedPayload) => {
      setPhase('scoring');
      setScoringInfo(data);
    });

    socket.on('score:received', (data) => {
      setScoreCount({ received: data.receivedCount, total: data.totalEvaluators });
    });

    socket.on('score:accepted', () => {
      setError('');
    });

    socket.on('score:error', (data) => {
      setError(data.message);
    });

    socket.on('speaker:result', (data: SpeakerResultPayload) => {
      setLastResult(data);
    });

    socket.on('transition:next', (data: TransitionPayload) => {
      setPhase('transition');
      setTransition(data);
      setScoringInfo(null);
    });

    socket.on('room:ended', () => {
      setPhase('ended');
    });

    socket.on('reaction:received', (data: ReactionPayload) => {
      setReactions(prev => [...prev.slice(-19), data]); // آخر 20 ردود فعل
    });

    return () => {
      socket.emit('room:leave', { roomId, userId });
      socket.off('room:state');
      socket.off('participant:joined');
      socket.off('participant:left');
      socket.off('rotation:started');
      socket.off('turn:started');
      socket.off('turn:ended');
      socket.off('scoring:started');
      socket.off('score:received');
      socket.off('score:accepted');
      socket.off('score:error');
      socket.off('speaker:result');
      socket.off('transition:next');
      socket.off('room:ended');
      socket.off('reaction:received');
    };
  }, [socket, connected, roomId, userId, userName, userAvatar]);

  // ─── Actions ───────────────────────────────

  const startRotation = useCallback((durationSeconds = 60) => {
    socket?.emit('rotation:start', { roomId, durationSeconds });
  }, [socket, roomId]);

  const registerSession = useCallback((sessionId: string) => {
    socket?.emit('session:created', { roomId, sessionId });
  }, [socket, roomId]);

  const submitScore = useCallback((scores: ScorePayload, comment = '') => {
    socket?.emit('score:submit', {
      roomId,
      evaluatorId  : userId,
      evaluatorName: userName,
      scores,
      comment,
    });
  }, [socket, roomId, userId, userName]);

  const sendReaction = useCallback((emoji: string) => {
    socket?.emit('reaction:send', { roomId, emoji, userId, name: userName });
  }, [socket, roomId, userId, userName]);

  const leaveRoom = useCallback(() => {
    socket?.emit('room:leave', { roomId, userId });
  }, [socket, roomId, userId]);

  return {
    // State
    connected,
    phase,
    participants,
    currentSpeaker,
    scoringInfo,
    transition,
    lastResult,
    reactions,
    scoreCount,
    error,

    // Actions
    startRotation,
    registerSession,
    submitScore,
    sendReaction,
    leaveRoom,

    // Helpers
    isCurrentSpeaker: currentSpeaker?.speakerId === userId,
  };
}
