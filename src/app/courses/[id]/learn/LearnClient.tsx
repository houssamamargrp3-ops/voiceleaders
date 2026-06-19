'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LearnClient({ course, enrollment, initialLessonId, passedQuizzes }: { course: any, enrollment: any, initialLessonId?: string, passedQuizzes?: Record<number, boolean> }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'lessons' | 'materials' | 'quizzes'>('lessons');
  
  // State for what is currently being viewed
  const [viewMode, setViewMode] = useState<'video' | 'quiz'>('video');
  const [currentLessonId, setCurrentLessonId] = useState<string>(initialLessonId || (course.lessons?.[0]?._id));
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<{ score: number, total: number } | null>(null);

  const currentLesson = course.lessons?.find((l: any) => l._id === currentLessonId);

  // Determine YouTube Embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      if (url.includes('youtube.com/watch')) {
        const urlObj = new URL(url);
        const v = urlObj.searchParams.get('v');
        return `https://www.youtube.com/embed/${v}`;
      }
      if (url.includes('youtu.be/')) {
        const v = url.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${v}`;
      }
      if (url.includes('youtube.com/shorts/')) {
        const v = url.split('youtube.com/shorts/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${v}`;
      }
      if (url.includes('youtube.com/embed/')) {
        return url;
      }
      return url; // fallback for normal mp4
    } catch {
      return url;
    }
  };

  // Calculate locked lessons
  const isLessonLocked = (lessonIndex: number) => {
    if (lessonIndex === 0) return false; // First lesson is always unlocked
    // A lesson is locked if ANY of the previous lessons has a linked quiz that wasn't passed
    for (let i = 0; i < lessonIndex; i++) {
      const prevLesson = course.lessons[i];
      // Find quizzes linked to this previous lesson
      const linkedQuizzesIndices = course.quizzes
        ?.map((q: any, idx: number) => q.linkedLessonId === prevLesson._id ? idx : -1)
        .filter((idx: number) => idx !== -1) || [];
      
      // If there are linked quizzes, ALL of them must be passed to proceed
      for (const quizIdx of linkedQuizzesIndices) {
        if (!passedQuizzes?.[quizIdx]) {
          return true; // Previous lesson's quiz is not passed, so current lesson is locked
        }
      }
    }
    return false;
  };

  const handleQuizSubmit = () => {
    if (!currentQuiz) return;
    let score = 0;
    currentQuiz.questions.forEach((q: any, i: number) => {
      if (quizAnswers[i] === q.correctAnswer) score++;
    });
    setQuizResult({ score, total: currentQuiz.questions.length });
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0A0A0A', color: '#fff', overflow: 'hidden' }}>
      
      {/* Sidebar */}
      <div style={{ width: 340, background: '#111', borderLeft: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
        
        {/* Header */}
        <div style={{ padding: 20, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Link href={`/courses/${course._id}`} style={{ color: '#888', textDecoration: 'none', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
            ← العودة لصفحة الدورة
          </Link>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#D4AF37' }}>{course.title}</h2>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <button type="button" onClick={() => setActiveTab('lessons')} style={{ flex: 1, padding: '12px 0', background: activeTab === 'lessons' ? 'rgba(212,175,55,0.1)' : 'transparent', border: 'none', color: activeTab === 'lessons' ? '#D4AF37' : '#888', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>الدروس</button>
          <button type="button" onClick={() => setActiveTab('materials')} style={{ flex: 1, padding: '12px 0', background: activeTab === 'materials' ? 'rgba(212,175,55,0.1)' : 'transparent', border: 'none', color: activeTab === 'materials' ? '#D4AF37' : '#888', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>المرفقات</button>
          <button type="button" onClick={() => setActiveTab('quizzes')} style={{ flex: 1, padding: '12px 0', background: activeTab === 'quizzes' ? 'rgba(212,175,55,0.1)' : 'transparent', border: 'none', color: activeTab === 'quizzes' ? '#D4AF37' : '#888', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>الاختبارات</button>
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
          
          {/* Lessons */}
          {activeTab === 'lessons' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {course.lessons?.map((lesson: any, i: number) => {
                const isLocked = isLessonLocked(i);
                
                // Find quizzes linked to this lesson
                const linkedQuizzes = course.quizzes?.map((q: any, idx: number) => ({...q, originalIndex: idx})).filter((q: any) => q.linkedLessonId === lesson._id) || [];

                return (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <button
                      onClick={() => {
                        if (!isLocked) {
                          setCurrentLessonId(lesson._id);
                          setViewMode('video');
                        }
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 12, padding: 12,
                        background: currentLessonId === lesson._id && viewMode === 'video' ? 'rgba(212,175,55,0.1)' : 'transparent',
                        border: '1px solid',
                        borderColor: currentLessonId === lesson._id && viewMode === 'video' ? 'rgba(212,175,55,0.2)' : 'transparent',
                        borderRadius: 8, cursor: isLocked ? 'not-allowed' : 'pointer', textAlign: 'right', transition: 'all 0.2s',
                        opacity: isLocked ? 0.5 : 1,
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: isLocked ? 'rgba(255,255,255,0.05)' : currentLessonId === lesson._id && viewMode === 'video' ? '#D4AF37' : 'rgba(255,255,255,0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: currentLessonId === lesson._id && viewMode === 'video' ? '#000' : '#888',
                        fontSize: '0.8rem', fontWeight: 700, flexShrink: 0
                      }}>
                        {isLocked ? '🔒' : (i + 1)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.9rem', color: isLocked ? '#666' : currentLessonId === lesson._id && viewMode === 'video' ? '#D4AF37' : '#fff', fontWeight: currentLessonId === lesson._id && viewMode === 'video' ? 700 : 400 }}>
                          {lesson.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#666', marginTop: 4 }}>⏱️ {lesson.duration}</div>
                      </div>
                    </button>
                    
                    {/* Render Linked Quizzes Below the Lesson */}
                    {!isLocked && linkedQuizzes.map((quiz: any, idx: number) => {
                      const isPassed = passedQuizzes?.[quiz.originalIndex];
                      return (
                        <button
                          key={`quiz-${quiz.originalIndex}`}
                          onClick={() => router.push(`/courses/${course._id}/quiz/${quiz.originalIndex}`)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px 8px 32px',
                            background: 'transparent', border: '1px dashed rgba(212,175,55,0.2)',
                            borderRadius: 8, cursor: 'pointer', textAlign: 'right',
                            marginLeft: 16, marginRight: 16,
                          }}
                        >
                          <div style={{ fontSize: '0.8rem', color: isPassed ? '#4ade80' : '#D4AF37', fontWeight: 600 }}>
                            {isPassed ? '✅' : '📝'} اختبار: {quiz.title}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

          {/* Materials */}
          {activeTab === 'materials' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {course.materials?.length > 0 ? course.materials.map((mat: any, i: number) => (
                <a
                  key={i} href={mat.url} target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 10, textDecoration: 'none', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                >
                  <span style={{ fontSize: '0.85rem', color: '#ddd' }}>📄 {mat.title}</span>
                  <span style={{ color: '#D4AF37', fontSize: '1rem' }}>⬇</span>
                </a>
              )) : (
                <div style={{ textAlign: 'center', padding: 30, color: '#666', fontSize: '0.85rem' }}>لا توجد مرفقات لهذه الدورة</div>
              )}
            </div>
          )}

          {/* Quizzes */}
          {activeTab === 'quizzes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {course.quizzes?.length > 0 ? course.quizzes.map((quiz: any, i: number) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => { router.push(`/courses/${course._id}/quiz/${i}`); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
                    padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: 10, cursor: 'pointer', textAlign: 'right', transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '0.85rem', color: '#ddd' }}>📝 {quiz.title}</span>
                  <span style={{ color: '#D4AF37', fontSize: '0.75rem' }}>{quiz.questions.length} أسئلة</span>
                </button>
              )) : (
                <div style={{ textAlign: 'center', padding: 30, color: '#666', fontSize: '0.85rem' }}>لا توجد اختبارات لهذه الدورة</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#050505', position: 'relative' }}>
        
        {viewMode === 'video' && currentLesson ? (
          <>
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <iframe
              src={getEmbedUrl(currentLesson.videoUrl)}
              style={{ width: '100%', height: '100%', border: 'none' }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
            {isLessonLocked(course.lessons?.findIndex((l: any) => l._id === currentLesson._id)) && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                color: '#fff', zIndex: 10
              }}>
                <div style={{ fontSize: '4rem', marginBottom: 20 }}>🔒</div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 12 }}>الدرس مغلق</h2>
                <p style={{ color: '#aaa', fontSize: '1rem', maxWidth: 400, textAlign: 'center' }}>
                  يجب اجتياز الاختبار المرتبط بالدرس السابق بنجاح لتتمكن من مشاهدة هذا الدرس.
                </p>
              </div>
            )}
            </div>
            <div style={{ padding: 24, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>{currentLesson.title}</h1>
              <p style={{ color: '#888', fontSize: '0.9rem' }}>الدرس من دورة: {course.title}</p>
            </div>
          </>
        ) : viewMode === 'quiz' && currentQuiz ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '40px 10%' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#D4AF37', marginBottom: 30, textAlign: 'center' }}>{currentQuiz.title}</h1>
            
            {quizResult ? (
              <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', padding: 40, borderRadius: 20, textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: 20 }}>{quizResult.score === quizResult.total ? '🏆' : '👏'}</div>
                <h2 style={{ color: '#4ade80', fontSize: '1.5rem', marginBottom: 10 }}>النتيجة: {quizResult.score} / {quizResult.total}</h2>
                <button type="button" onClick={() => { setQuizResult(null); setQuizAnswers({}); }} style={{ marginTop: 20, padding: '10px 24px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, color: '#fff', cursor: 'pointer' }}>إعادة الاختبار</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 30 }}>
                {currentQuiz.questions.map((q: any, i: number) => (
                  <div key={i} style={{ background: '#111', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: 20 }}>{i + 1}. {q.questionText}</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {q.options.map((opt: string, optIdx: number) => (
                        <label key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: quizAnswers[i] === optIdx ? 'rgba(212,175,55,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${quizAnswers[i] === optIdx ? 'rgba(212,175,55,0.4)' : 'transparent'}`, borderRadius: 10, cursor: 'pointer', transition: 'all 0.2s' }}>
                          <input type="radio" name={`quiz-${i}`} checked={quizAnswers[i] === optIdx} onChange={() => setQuizAnswers({ ...quizAnswers, [i]: optIdx })} style={{ accentColor: '#D4AF37', width: 18, height: 18 }} />
                          <span style={{ fontSize: '0.95rem', color: quizAnswers[i] === optIdx ? '#fff' : '#aaa' }}>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  <button 
                    type="button"
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length < currentQuiz.questions.length}
                    style={{ padding: '14px 40px', background: 'linear-gradient(135deg, #A8860F, #D4AF37)', border: 'none', borderRadius: 10, color: '#000', fontSize: '1.1rem', fontWeight: 800, cursor: Object.keys(quizAnswers).length < currentQuiz.questions.length ? 'not-allowed' : 'pointer', opacity: Object.keys(quizAnswers).length < currentQuiz.questions.length ? 0.5 : 1 }}
                  >
                    تسليم الإجابات
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            يرجى اختيار درس أو اختبار من القائمة الجانبية
          </div>
        )}
      </div>

    </div>
  );
}
