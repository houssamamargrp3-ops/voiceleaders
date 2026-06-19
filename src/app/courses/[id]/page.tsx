'use client';
import { useState, useEffect, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { use } from 'react';

interface Lesson {
  _id: string;
  title: string;
  videoUrl: string;
  duration: string;
  order: number;
}

interface Review {
  user: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: string;
  instructorId: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  duration: string;
  thumbnail: string;
  tags: string[];
  featured: boolean;
  lessons: Lesson[];
  enrolledStudents: string[];
  rating: number;
  ratingsCount: number;
  reviews: Review[];
  maxStudents: number;
  isRegistrationClosed: boolean;
  createdAt: string;
}

interface Enrollment {
  userId: string;
  courseId: string;
  completedLessons: string[];
  progress: number;
  enrolledAt: string;
  lastAccessedAt: string;
}

const levelLabels: Record<string, string> = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' };
const categoryIcons: Record<string, string> = {
  'خطابة': '🎤', 'قيادة': '🚀', 'إعلام': '📹', 'نقاش': '💬',
};

function StarRatingDisplay({ rating, size = '0.9rem' }: { rating: number; size?: string }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<span key={i} style={{ color: '#D4AF37', fontSize: size }}>★</span>);
    } else if (i - rating < 1 && i - rating > 0) {
      stars.push(<span key={i} style={{ color: '#D4AF37', fontSize: size, opacity: 0.5 }}>★</span>);
    } else {
      stars.push(<span key={i} style={{ color: '#333', fontSize: size }}>★</span>);
    }
  }
  return <span style={{ letterSpacing: 2 }}>{stars}</span>;
}

function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: 4, direction: 'ltr' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '1.6rem', padding: 2,
            color: i <= (hover || value) ? '#D4AF37' : '#333',
            transition: 'all 0.15s ease',
            transform: i <= (hover || value) ? 'scale(1.15)' : 'scale(1)',
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto' }}>
      {/* Breadcrumb skeleton */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <div className="skeleton" style={{ width: 60, height: 16 }} />
        <div className="skeleton" style={{ width: 120, height: 16 }} />
      </div>
      {/* Header skeleton */}
      <div className="skeleton" style={{ height: 280, borderRadius: 20, marginBottom: 28 }} />
      {/* Tabs skeleton */}
      <div className="skeleton" style={{ height: 44, borderRadius: 10, marginBottom: 24 }} />
      {/* Content skeleton */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 64, borderRadius: 12 }} />
        ))}
      </div>
    </div>
  );
}

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'lessons' | 'reviews' | 'evaluation' | 'quizzes'>('lessons');
  const [enrolling, setEnrolling] = useState(false);
  const [completingLesson, setCompletingLesson] = useState<string | null>(null);

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Submission form state
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submittingUrl, setSubmittingUrl] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState('');
  const [submissionError, setSubmissionError] = useState('');

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/courses/${id}`);
      if (!res.ok) throw new Error('فشل في تحميل الدورة');
      const data = await res.json();
      setCourse(data.course);
      setEnrollment(data.enrollment || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const handleEnroll = async () => {
    if (!session) {
      alert('يجب تسجيل الدخول أولاً');
      return;
    }
    try {
      setEnrolling(true);
      const res = await fetch(`/api/courses/${id}/enroll`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'فشل في التسجيل');
      }
      await fetchCourse();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setEnrolling(false);
    }
  };

  const handleUnenroll = async () => {
    if (!confirm('هل أنت متأكد من إلغاء التسجيل؟')) return;
    try {
      setEnrolling(true);
      const res = await fetch(`/api/courses/${id}/enroll`, { method: 'DELETE' });
      if (!res.ok) throw new Error('فشل في إلغاء التسجيل');
      await fetchCourse();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setEnrolling(false);
    }
  };

  const handleToggleLesson = async (lessonId: string, isCompleted: boolean) => {
    try {
      setCompletingLesson(lessonId);
      const method = isCompleted ? 'DELETE' : 'POST';
      const res = await fetch(`/api/courses/${id}/lessons/${lessonId}/complete`, { method });
      if (!res.ok) throw new Error('فشل في تحديث الدرس');
      await fetchCourse();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setCompletingLesson(null);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0) {
      setReviewError('يرجى اختيار تقييم');
      return;
    }
    try {
      setSubmittingReview(true);
      setReviewError('');
      const res = await fetch(`/api/courses/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: reviewRating, comment: reviewComment }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'فشل في إرسال التقييم');
      }
      setReviewSuccess('تم إرسال تقييمك بنجاح! ✨');
      setReviewRating(0);
      setReviewComment('');
      await fetchCourse();
      setTimeout(() => setReviewSuccess(''), 3000);
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submissionUrl) return;
    try {
      setSubmittingUrl(true);
      setSubmissionError('');
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: id, videoUrl: submissionUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل في إرسال التطبيق');
      setSubmissionSuccess('تم إرسال تطبيقك للمدرب بنجاح! سيتم إشعارك عند تقييمه.');
      setSubmissionUrl('');
    } catch (err: unknown) {
      setSubmissionError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setSubmittingUrl(false);
    }
  };

  const getCourseGradient = (courseId: string) => {
    const hash = courseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `linear-gradient(135deg, hsl(${hash % 360}, 25%, 10%), hsl(${(hash * 3) % 360}, 20%, 6%))`;
  };

  if (loading) {
    return (
      <AppLayout>
        <LoadingSkeleton />
      </AppLayout>
    );
  }

  if (error || !course) {
    return (
      <AppLayout>
        <div style={{
          textAlign: 'center', padding: '80px 20px',
          maxWidth: 500, margin: '0 auto',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: 20, animation: 'float 3s ease-in-out infinite' }}>😞</div>
          <h2 style={{ fontWeight: 700, marginBottom: 12, color: '#f87171' }}>
            {error || 'الدورة غير موجودة'}
          </h2>
          <p style={{ color: '#666', marginBottom: 24, fontSize: '0.9rem' }}>
            عذراً، لم نتمكن من العثور على الدورة المطلوبة
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn-outline" onClick={fetchCourse}>إعادة المحاولة</button>
            <Link href="/courses">
              <button className="btn-gold">العودة للدورات</button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const sortedLessons = [...(course.lessons || [])].sort((a, b) => a.order - b.order);
  const role = session?.user?.role || 'trainee';
  const isInstructor = role === 'admin' || (role === 'trainer' && course?.instructorId === session?.user?.id);
  const isEnrolled = !!enrollment;

  return (
    <AppLayout>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 20, fontSize: '0.8rem', color: '#666' }}>
          <Link href="/courses" style={{ color: '#D4AF37', textDecoration: 'none' }}>الدورات</Link>
          <span>←</span>
          <span style={{ color: '#888' }}>{course.title}</span>
        </div>

        {/* Course Header */}
        <div style={{
          background: course.thumbnail
            ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.85)), url(${course.thumbnail}) center/cover`
            : getCourseGradient(course._id),
          border: '1px solid rgba(212,175,55,0.15)',
          borderRadius: 20, padding: 32, marginBottom: 28, position: 'relative', overflow: 'hidden',
          animation: 'fadeInUp 0.6s ease',
        }}>
          <div style={{
            position: 'absolute', top: -60, left: -60,
            width: 250, height: 250, fontSize: '12rem', opacity: 0.05,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {categoryIcons[course.category] || '📖'}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            <span className={`badge level-${course.level}`}>{levelLabels[course.level]}</span>
            <span className="badge badge-gold">{course.category}</span>
            {course.featured && (
              <span className="badge" style={{ background: 'rgba(212,175,55,0.2)', color: '#D4AF37', border: '1px solid rgba(212,175,55,0.4)' }}>
                ⭐ مميزة
              </span>
            )}
          </div>

          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, marginBottom: 12, color: '#fff' }}>
            {course.title}
          </h1>
          <p style={{ color: '#888', lineHeight: 1.7, marginBottom: 20, maxWidth: 600 }}>
            {course.description}
          </p>

          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 24 }}>
            {[
              { label: 'المدة', value: course.duration || '—', icon: '⏱️' },
              { label: 'الدروس', value: `${course.lessons?.length || 0} درس`, icon: '📖' },
              { label: 'الطلاب', value: (course.enrolledStudents?.length || 0).toLocaleString(), icon: '👥' },
              { label: 'التقييم', value: `${course.rating?.toFixed(1) || '0.0'} ★`, icon: '⭐' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', color: '#666' }}>{s.icon} {s.label}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#D4AF37' }}>{s.value}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, color: '#0A0A0A',
            }}>
              {course.instructor?.[0] || '?'}
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{course.instructor}</div>
              <div style={{ fontSize: '0.72rem', color: '#666' }}>المدرب</div>
            </div>
          </div>

          {/* Enroll / Enrolled Button */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {isInstructor ? (
              <div style={{ background: 'rgba(212,175,55,0.1)', padding: 16, borderRadius: 12, textAlign: 'center', marginBottom: 20 }}>
                <div style={{ color: '#D4AF37', fontWeight: 600, marginBottom: 8 }}>👨‍🏫 صلاحيات إدارة الدورة</div>
                <Link href={`/trainer/my-courses/${course._id}`} className="btn-primary" style={{ display: 'inline-block', width: '100%', textDecoration: 'none' }}>
                  إدارة محتوى الدورة
                </Link>
                <Link href={`/trainer/my-courses/${course._id}/students`} className="btn-outline" style={{ display: 'inline-block', width: '100%', marginTop: 8, textDecoration: 'none' }}>
                  إدارة المتدربين
                </Link>
              </div>
            ) : isEnrolled ? (
              <>
                <button
                  className="btn-gold"
                  style={{
                    padding: '12px 32px', fontSize: '0.95rem',
                    background: 'rgba(74,222,128,0.15)', color: '#4ade80',
                    border: '1px solid rgba(74,222,128,0.3)',
                    cursor: 'default',
                  }}
                >
                  ✓ مسجل
                </button>
                <button
                  className="btn-ghost"
                  onClick={handleUnenroll}
                  disabled={enrolling}
                  style={{ fontSize: '0.8rem', color: '#888' }}
                >
                  {enrolling ? 'جارٍ...' : 'إلغاء التسجيل'}
                </button>
              </>
            ) : course.isRegistrationClosed ? (
              <button
                className="btn-gold"
                disabled
                style={{ padding: '12px 32px', fontSize: '0.95rem', opacity: 0.6, cursor: 'not-allowed', background: '#333', color: '#888' }}
              >
                🔒 التسجيل مغلق
              </button>
            ) : (course.maxStudents > 0 && course.enrolledStudents.length >= course.maxStudents) ? (
              <button
                className="btn-gold"
                disabled
                style={{ padding: '12px 32px', fontSize: '0.95rem', opacity: 0.6, cursor: 'not-allowed', background: '#333', color: '#888' }}
              >
                🚫 اكتمل العدد
              </button>
            ) : (
              <button
                className="btn-gold"
                onClick={handleEnroll}
                disabled={enrolling}
                style={{ padding: '12px 32px', fontSize: '0.95rem' }}
              >
                {enrolling ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ animation: 'spin-slow 1s linear infinite', display: 'inline-block' }}>⏳</span>
                    جارٍ التسجيل...
                  </span>
                ) : (
                  '📝 التسجيل في الدورة'
                )}
              </button>
            )}
          </div>

          {/* Progress bar if enrolled */}
          {isEnrolled && !isInstructor && (
            <div style={{ maxWidth: 400, marginTop: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: '0.78rem', color: '#888' }}>تقدمك</span>
                <span style={{ fontSize: '0.78rem', color: '#D4AF37', fontWeight: 600 }}>
                  {enrollment.progress ?? 0}%
                </span>
              </div>
              <div className="course-progress-bar" style={{ height: 6 }}>
                <div className="course-progress-fill" style={{ width: `${enrollment.progress ?? 0}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Tags */}
        {course.tags && course.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            {course.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: 24 }}>
          {[
            { id: 'lessons' as const, label: `📖 الدروس (${course.lessons?.length || 0})` },
            { id: 'quizzes' as const, label: `📝 الاختبارات (${course.quizzes?.length || 0})` },
            { id: 'evaluation' as const, label: '📤 تقييم المدرب' },
            { id: 'reviews' as const, label: `⭐ آراء المتدربين (${course.reviews?.length || 0})` },
          ].map(tab => (
            <button key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as 'lessons' | 'reviews' | 'evaluation' | 'quizzes')}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Lessons Tab */}
        {activeTab === 'lessons' && (
          <div style={{ animation: 'fadeInUp 0.4s ease' }}>
            {sortedLessons.length > 0 ? (
              sortedLessons.map((lesson, i) => {
                const isCompleted = enrollment?.completedLessons?.includes(lesson._id) || false;
                const isToggling = completingLesson === lesson._id;
                return (
                  <div
                    key={lesson._id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: 16,
                      background: isCompleted ? 'rgba(74,222,128,0.04)' : 'rgba(255,255,255,0.02)',
                      borderRadius: 12, marginBottom: 8,
                      border: `1px solid ${isCompleted ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.04)'}`,
                      transition: 'all 0.2s ease',
                      animation: `fadeInUp 0.4s ease ${i * 0.05}s both`,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = isCompleted
                        ? 'rgba(74,222,128,0.08)'
                        : 'rgba(212,175,55,0.04)';
                      e.currentTarget.style.borderColor = isCompleted
                        ? 'rgba(74,222,128,0.2)'
                        : 'rgba(212,175,55,0.15)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = isCompleted
                        ? 'rgba(74,222,128,0.04)'
                        : 'rgba(255,255,255,0.02)';
                      e.currentTarget.style.borderColor = isCompleted
                        ? 'rgba(74,222,128,0.12)'
                        : 'rgba(255,255,255,0.04)';
                    }}
                  >
                    {/* Lesson completion checkbox (only if enrolled) */}
                    {(isEnrolled && !isInstructor) ? (
                      <button
                        onClick={() => handleToggleLesson(lesson._id, isCompleted)}
                        disabled={isToggling}
                        style={{
                          width: 34, height: 34, borderRadius: 8,
                          background: isCompleted ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.04)',
                          border: `1.5px solid ${isCompleted ? '#4ade80' : 'rgba(255,255,255,0.1)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.9rem', flexShrink: 0, cursor: 'pointer',
                          color: isCompleted ? '#4ade80' : '#555',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {isToggling ? '⏳' : isCompleted ? '✓' : `${i + 1}`}
                      </button>
                    ) : (
                      <div style={{
                        width: 34, height: 34, borderRadius: 8,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1.5px solid rgba(255,255,255,0.07)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.85rem', flexShrink: 0, color: '#555',
                      }}>
                        {i + 1}
                      </div>
                    )}
                    <div style={{ flex: 1 }}>
                      {(isEnrolled || isInstructor) ? (
                        <Link href={`/courses/${course._id}/learn?lesson=${lesson._id}`} style={{ textDecoration: 'none' }}>
                          <div style={{
                            fontSize: '0.875rem', fontWeight: 600,
                            color: isCompleted ? '#4ade80' : '#D4AF37',
                            textDecoration: isCompleted ? 'line-through' : 'none',
                            textDecorationColor: 'rgba(74,222,128,0.3)',
                            marginBottom: 4, display: 'inline-flex', alignItems: 'center', gap: 6,
                          }}>
                            ▶️ {lesson.title}
                          </div>
                        </Link>
                      ) : (
                        <div style={{
                          fontSize: '0.875rem', fontWeight: 500,
                          color: isCompleted ? '#4ade80' : '#ddd',
                          textDecoration: isCompleted ? 'line-through' : 'none',
                          textDecorationColor: 'rgba(74,222,128,0.3)',
                        }}>
                          {lesson.title}
                        </div>
                      )}
                      
                      <div style={{ fontSize: '0.72rem', color: '#555', marginTop: 2 }}>
                        ⏱️ {lesson.duration}
                        {lesson.videoUrl && <span style={{ marginRight: 12 }}>🎬 فيديو</span>}
                      </div>
                    </div>
                    {(isEnrolled || isInstructor) && (
                      <Link href={`/courses/${course._id}/learn?lesson=${lesson._id}`} className="btn-outline" style={{ fontSize: '0.75rem', padding: '6px 12px', border: '1px solid rgba(212,175,55,0.3)' }}>
                        شاهد الدرس
                      </Link>
                    )}
                    {isCompleted && (
                      <span style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: 600 }}>مكتمل ✓</span>
                    )}
                  </div>
                );
              })
            ) : (
              <div style={{
                textAlign: 'center', padding: '40px 20px', color: '#555',
                background: 'rgba(255,255,255,0.02)', borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📝</div>
                <p>لم يتم إضافة دروس بعد</p>
              </div>
            )}
          </div>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <div style={{ animation: 'fadeInUp 0.4s ease' }}>
            {course.quizzes && course.quizzes.length > 0 ? (
              course.quizzes.map((quiz: any, i: number) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.02)', padding: 20,
                  borderRadius: 12, marginBottom: 16,
                  border: '1px solid rgba(212,175,55,0.15)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: 16
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: 6 }}>{quiz.title}</h3>
                    <div style={{ fontSize: '0.8rem', color: '#888', display: 'flex', gap: 12 }}>
                      <span>📝 {quiz.questions?.length || 0} أسئلة</span>
                      <span>⏱️ {quiz.timeLimit || 30} ثانية للسؤال</span>
                    </div>
                  </div>
                  {(isEnrolled || isInstructor) ? (
                    <Link href={`/courses/${course._id}/quiz/${i}`} className="btn-outline" style={{ fontSize: '0.85rem', padding: '8px 20px', textDecoration: 'none' }}>
                      ▶️ بدء الاختبار
                    </Link>
                  ) : (
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>سجل بالدورة لاجتياز الاختبار</span>
                  )}
                </div>
              ))
            ) : (
              <div style={{
                textAlign: 'center', padding: '40px 20px', color: '#555',
                background: 'rgba(255,255,255,0.02)', borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📝</div>
                <p>لم يتم إضافة اختبارات بعد</p>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div style={{ animation: 'fadeInUp 0.4s ease' }}>
            {/* Review Form (if enrolled) */}
            {isEnrolled && !isInstructor && (
              <div className="card-gold" style={{ padding: 24, marginBottom: 24, borderRadius: 16 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 16, color: '#D4AF37', fontSize: '1rem' }}>
                  ✍️ أضف تقييمك
                </h3>
                <form onSubmit={handleSubmitReview}>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: '0.85rem', color: '#888', marginBottom: 8, display: 'block' }}>
                      التقييم
                    </label>
                    <StarRatingInput value={reviewRating} onChange={setReviewRating} />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ fontSize: '0.85rem', color: '#888', marginBottom: 8, display: 'block' }}>
                      تعليقك
                    </label>
                    <textarea
                      value={reviewComment}
                      onChange={e => setReviewComment(e.target.value)}
                      placeholder="شاركنا رأيك عن الدورة..."
                      style={{
                        width: '100%', minHeight: 100, padding: 14,
                        background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 12, color: '#fff', fontSize: '0.9rem',
                        fontFamily: 'Inter, sans-serif', resize: 'vertical',
                        outline: 'none', transition: 'border-color 0.3s ease',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                    />
                  </div>
                  {reviewError && (
                    <p style={{ color: '#f87171', fontSize: '0.82rem', marginBottom: 12 }}>⚠️ {reviewError}</p>
                  )}
                  {reviewSuccess && (
                    <p style={{ color: '#4ade80', fontSize: '0.82rem', marginBottom: 12 }}>{reviewSuccess}</p>
                  )}
                  <button
                    type="submit"
                    className="btn-gold"
                    disabled={submittingReview}
                    style={{ padding: '10px 28px', fontSize: '0.9rem' }}
                  >
                    {submittingReview ? 'جارٍ الإرسال...' : '📤 إرسال التقييم'}
                  </button>
                </form>
              </div>
            )}

            {/* Reviews List */}
            {course.reviews && course.reviews.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Summary Card */}
                <div className="card" style={{
                  padding: 24, marginBottom: 8,
                  display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#D4AF37' }}>
                      {course.rating?.toFixed(1) || '0.0'}
                    </div>
                    <StarRatingDisplay rating={course.rating || 0} size="1rem" />
                    <div style={{ fontSize: '0.75rem', color: '#666', marginTop: 4 }}>
                      {course.ratingsCount || course.reviews.length} تقييم
                    </div>
                  </div>
                  <div className="divider-gold" style={{ width: 1, height: 60, opacity: 0.3 }} />
                  <div style={{ flex: 1 }}>
                    {[5, 4, 3, 2, 1].map(star => {
                      const count = course.reviews.filter(r => r.rating === star).length;
                      const pct = course.reviews.length > 0 ? (count / course.reviews.length) * 100 : 0;
                      return (
                        <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: '0.72rem', color: '#888', minWidth: 14, textAlign: 'center' }}>{star}</span>
                          <span style={{ color: '#D4AF37', fontSize: '0.7rem' }}>★</span>
                          <div style={{ flex: 1, height: 4, background: '#1A1A1A', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{
                              width: `${pct}%`, height: '100%',
                              background: 'linear-gradient(90deg, #A8860F, #D4AF37)',
                              borderRadius: 2, transition: 'width 0.5s ease',
                            }} />
                          </div>
                          <span style={{ fontSize: '0.68rem', color: '#555', minWidth: 24 }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Individual Reviews */}
                {course.reviews.map((review, i) => (
                  <div key={i} style={{
                    padding: 18,
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.04)',
                    transition: 'all 0.2s ease',
                    animation: `fadeInUp 0.4s ease ${i * 0.05}s both`,
                  }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.12)')}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.04)')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: '50%',
                        background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, color: '#0A0A0A', fontSize: '0.7rem',
                      }}>
                        {review.userName?.[0] || '?'}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: '#ddd', fontSize: '0.85rem' }}>{review.userName}</div>
                        <div style={{ fontSize: '0.7rem', color: '#555' }}>
                          {new Date(review.createdAt).toLocaleDateString('ar-EG', {
                            year: 'numeric', month: 'long', day: 'numeric',
                          })}
                        </div>
                      </div>
                      <StarRatingDisplay rating={review.rating} size="0.8rem" />
                    </div>
                    {review.comment && (
                      <p style={{ color: '#aaa', fontSize: '0.85rem', lineHeight: 1.7, paddingRight: 42 }}>
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center', padding: '50px 20px',
                background: 'rgba(255,255,255,0.02)', borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>⭐</div>
                <h3 style={{ color: '#888', fontWeight: 600, marginBottom: 6 }}>لا توجد تقييمات بعد</h3>
                <p style={{ color: '#555', fontSize: '0.85rem' }}>
                  {(isEnrolled || isInstructor) ? 'كن أول من يقيّم هذه الدورة!' : 'سجّل في الدورة لتتمكن من تقييمها'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Evaluation Tab */}
        {activeTab === 'evaluation' && (
          <div style={{ animation: 'fadeInUp 0.4s ease' }}>
            {isEnrolled ? (
              <div className="card-gold" style={{ padding: 30, borderRadius: 16 }}>
                <h3 style={{ fontWeight: 800, marginBottom: 8, color: '#fff', fontSize: '1.2rem' }}>
                  🎥 إرسال التطبيق العملي
                </h3>
                <p style={{ color: '#888', marginBottom: 24, fontSize: '0.9rem', lineHeight: 1.6 }}>
                  قم بتصوير نفسك وأنت تؤدي التطبيق المطلوب، ثم ارفع الفيديو على YouTube أو Google Drive، وضع الرابط هنا ليقوم المدرب بمراجعته وتقييم أدائك.
                </p>

                <form onSubmit={handleSubmitVideo}>
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'block', fontSize: '0.85rem', color: '#D4AF37', marginBottom: 8, fontWeight: 600 }}>
                      رابط الفيديو
                    </label>
                    <input 
                      type="url" 
                      required 
                      dir="ltr"
                      value={submissionUrl}
                      onChange={e => setSubmissionUrl(e.target.value)}
                      placeholder="https://youtu.be/..." 
                      style={{
                        width: '100%', padding: '14px 16px',
                        background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 10, color: '#fff', fontSize: '0.9rem',
                        fontFamily: 'Inter, sans-serif', outline: 'none',
                        transition: 'border-color 0.3s ease',
                      }}
                      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(212,175,55,0.4)')}
                      onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                    />
                  </div>

                  {submissionError && <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: 16 }}>⚠️ {submissionError}</div>}
                  {submissionSuccess && <div style={{ color: '#4ade80', fontSize: '0.85rem', marginBottom: 16 }}>✅ {submissionSuccess}</div>}

                  <button 
                    type="submit" 
                    className="btn-gold" 
                    disabled={submittingUrl}
                    style={{ padding: '12px 32px', fontSize: '0.95rem' }}
                  >
                    {submittingUrl ? 'جارٍ الإرسال...' : '📤 إرسال للمدرب'}
                  </button>
                </form>
              </div>
            ) : (
              <div style={{
                textAlign: 'center', padding: '50px 20px', color: '#555',
                background: 'rgba(255,255,255,0.02)', borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.04)',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔒</div>
                <h3 style={{ color: '#888', fontWeight: 600, marginBottom: 6 }}>عذراً، هذه الميزة للمسجلين فقط</h3>
                <p style={{ color: '#555', fontSize: '0.85rem' }}>
                  يجب عليك التسجيل في الدورة أولاً لتتمكن من إرسال التطبيقات العملية وتقييمها من قبل المدرب.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
