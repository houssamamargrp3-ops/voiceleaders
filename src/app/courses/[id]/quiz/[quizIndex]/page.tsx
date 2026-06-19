'use client';
import { useState, useEffect, use } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function QuizPage({ params }: { params: Promise<{ id: string; quizIndex: string }> }) {
  const { id, quizIndex } = use(params);
  const router = useRouter();

  const [course, setCourse] = useState<any>(null);
  const [quizStatus, setQuizStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // Fetch course for questions
        const courseRes = await fetch(`/api/courses/${id}`);
        const courseData = await courseRes.json();
        if (!courseRes.ok) throw new Error('فشل تحميل الدورة');
        setCourse(courseData.course);

        // Fetch quiz status
        const statusRes = await fetch(`/api/courses/${id}/quiz/${quizIndex}/status`);
        const statusData = await statusRes.json();
        if (!statusRes.ok) throw new Error(statusData.error || 'فشل تحميل حالة الاختبار');
        setQuizStatus(statusData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, quizIndex]);

  // Timer logic
  useEffect(() => {
    if (!quizStarted || submitting || quizResult) return;

    if (timeLeft <= 0) {
      handleNextQuestion(-1); // -1 indicates time out (no answer selected)
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStarted, timeLeft, submitting, quizResult]);

  const handleStart = () => {
    if (!quizStatus?.canRetake) return;
    setQuizStarted(true);
    setCurrentQuestionIdx(0);
    setTimeLeft(quizStatus.timeLimit || 30);
    setAnswers([]);
  };

  const handleNextQuestion = async (selectedOptionIdx: number) => {
    const newAnswers = [...answers, selectedOptionIdx];
    setAnswers(newAnswers);

    const quiz = course.quizzes[parseInt(quizIndex)];

    if (currentQuestionIdx + 1 < quiz.questions.length) {
      setCurrentQuestionIdx(prev => prev + 1);
      setTimeLeft(quizStatus.timeLimit || 30);
    } else {
      // Finish quiz
      await submitQuiz(newAnswers);
    }
  };

  const submitQuiz = async (finalAnswers: number[]) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/courses/${id}/quiz/${quizIndex}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuizResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', padding: '100px 20px' }}>
          <div style={{ fontSize: '3rem', animation: 'spin-slow 2s linear infinite' }}>⏳</div>
          <p style={{ marginTop: 20, color: '#888' }}>جاري التجهيز...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !course) {
    return (
      <AppLayout>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', padding: '100px 20px' }}>
          <h2 style={{ color: '#f87171' }}>⚠️ {error || 'حدث خطأ'}</h2>
          <Link href={`/courses/${id}`} className="btn-outline" style={{ marginTop: 20, display: 'inline-block' }}>العودة للدورة</Link>
        </div>
      </AppLayout>
    );
  }

  const quiz = course.quizzes[parseInt(quizIndex)];
  
  if (quizResult) {
    // Show Result
    const percentage = (quizResult.score / quizResult.totalQuestions) * 100;
    const passingScore = quiz.passingScore || 50;
    const isPassed = percentage >= passingScore;

    return (
      <AppLayout>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
          <div className="card-gold" style={{ padding: 40, borderRadius: 20 }}>
            <div style={{ fontSize: '4rem', marginBottom: 20 }}>{isPassed ? '🏆' : '💪'}</div>
            <h1 style={{ fontSize: '2rem', color: '#fff', marginBottom: 10 }}>نتيجة الاختبار</h1>
            <div style={{ fontSize: '3rem', fontWeight: 900, color: '#D4AF37', marginBottom: 20 }}>
              {quizResult.score} / {quizResult.totalQuestions}
            </div>
            <p style={{ color: '#ccc', marginBottom: 10 }}>
              نسبة النجاح المطلوبة: <strong style={{ color: '#fff' }}>{passingScore}%</strong> | نتيجتك: <strong style={{ color: isPassed ? '#4ade80' : '#f87171' }}>{percentage.toFixed(0)}%</strong>
            </p>
            <p style={{ color: '#ccc', marginBottom: 30, fontSize: '1.1rem' }}>
              {isPassed ? 'عمل رائع! لقد اجتزت الاختبار بنجاح.' : 'حاول مرة أخرى، لم تصل لنسبة النجاح المطلوبة.'}
            </p>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 12, marginBottom: 30, fontSize: '0.9rem', color: '#888' }}>
              يمكنك إعادة هذا الاختبار في:<br/>
              <strong style={{ color: '#fff' }}>{new Date(quizResult.nextRetakeAt).toLocaleString('ar-EG')}</strong>
            </div>
            <Link href={`/courses/${id}`} className="btn-gold" style={{ width: '100%', display: 'inline-block' }}>
              العودة إلى الدورة
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!quizStarted) {
    // Start Screen
    const { canRetake, nextRetakeAt, lastAttempt, timeLimit } = quizStatus;

    return (
      <AppLayout>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
          <div className="card" style={{ padding: 40, borderRadius: 20 }}>
            <h1 style={{ fontSize: '1.8rem', color: '#D4AF37', marginBottom: 10 }}>{quiz.title}</h1>
            <div style={{ color: '#888', marginBottom: 30, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span>عدد الأسئلة: {quiz.questions.length} • الوقت للسؤال: {timeLimit} ثانية</span>
              <span style={{ color: '#D4AF37', fontWeight: 600 }}>نسبة النجاح المطلوبة لاجتياز الاختبار: {quiz.passingScore || 50}%</span>
            </div>

            {lastAttempt && (
              <div style={{ background: 'rgba(212,175,55,0.1)', padding: 16, borderRadius: 12, marginBottom: 30, border: '1px solid rgba(212,175,55,0.2)' }}>
                <h3 style={{ fontSize: '1rem', color: '#D4AF37', marginBottom: 6 }}>نتيجة آخر محاولة</h3>
                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>
                  {lastAttempt.score} / {lastAttempt.totalQuestions}
                </div>
              </div>
            )}

            {!canRetake ? (
              <div style={{ background: 'rgba(248,113,113,0.1)', padding: 20, borderRadius: 12, color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 10 }}>🔒</div>
                <h3 style={{ marginBottom: 6 }}>لا يمكنك إعادة الاختبار الآن</h3>
                <p style={{ fontSize: '0.9rem' }}>
                  سيتاح لك إعادة الاختبار في:<br/>
                  <strong style={{ color: '#fff' }}>{new Date(nextRetakeAt).toLocaleString('ar-EG')}</strong>
                </p>
              </div>
            ) : (
              <button onClick={handleStart} className="btn-gold" style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>
                ▶️ بدء الاختبار الآن
              </button>
            )}
            
            <Link href={`/courses/${id}`} className="btn-ghost" style={{ marginTop: 20, display: 'inline-block' }}>
              العودة للدورة
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Quiz Interface
  const currentQuestion = quiz.questions[currentQuestionIdx];
  const progress = ((currentQuestionIdx) / quiz.questions.length) * 100;
  const timeProgress = (timeLeft / (quizStatus.timeLimit || 30)) * 100;

  return (
    <AppLayout>
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '20px' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ color: '#888', fontSize: '0.9rem' }}>
            سؤال {currentQuestionIdx + 1} من {quiz.questions.length}
          </div>
          <div style={{ 
            background: timeLeft <= 5 ? 'rgba(248,113,113,0.2)' : 'rgba(212,175,55,0.15)',
            color: timeLeft <= 5 ? '#f87171' : '#D4AF37',
            padding: '6px 16px', borderRadius: 100, fontWeight: 700,
            border: `1px solid ${timeLeft <= 5 ? '#f87171' : '#D4AF37'}`,
            display: 'flex', alignItems: 'center', gap: 6
          }}>
            ⏱️ {timeLeft} ثانية
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ height: 4, background: '#111', borderRadius: 2, marginBottom: 10 }}>
          <div style={{ height: '100%', width: `${progress}%`, background: '#D4AF37', transition: 'width 0.3s ease' }} />
        </div>
        <div style={{ height: 2, background: '#111', borderRadius: 1, marginBottom: 40 }}>
          <div style={{ height: '100%', width: `${timeProgress}%`, background: timeLeft <= 5 ? '#f87171' : '#60a5fa', transition: 'width 1s linear' }} />
        </div>

        {/* Question Box */}
        <div className="card" style={{ padding: 30, borderRadius: 20 }}>
          <h2 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: 30, lineHeight: 1.5 }}>
            {currentQuestion.questionText}
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {currentQuestion.options.map((opt: string, idx: number) => (
              <button
                key={idx}
                onClick={() => handleNextQuestion(idx)}
                disabled={submitting}
                className="quiz-option"
                style={{ textAlign: 'right', opacity: submitting ? 0.7 : 1 }}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  );
}
