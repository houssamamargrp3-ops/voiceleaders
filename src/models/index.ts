/**
 * ─────────────────────────────────────────────
 *  SpeakUp Challenge — Models Index
 *  استيراد جميع النماذج من ملف واحد
 * ─────────────────────────────────────────────
 *
 *  الاستخدام:
 *    import { User, Room, Session, Post, Challenge } from '@/models';
 */

export { default as User }      from './User';
export { default as Room }      from './Room';
export { default as Session }   from './Session';
export { default as Post }      from './Post';
export { default as Challenge } from './Challenge';
export { default as Video }     from './Video';
export { default as Course }    from './Course';
export { default as Enrollment }from './Enrollment';
export { default as QuizAttempt}from './QuizAttempt';
export { default as Submission } from './Submission';

// ─── Type Exports ───────────────────────────
export type { IUser }       from './User';
export type { IRoom, IRoomParticipant } from './Room';
export type { ISession, IScoreEntry }   from './Session';
export type { IPost, IComment }         from './Post';
export type { IChallenge }              from './Challenge';
export type { IVideo }                  from './Video';
