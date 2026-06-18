'use client';
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface LessonForm {
  title: string;
  videoUrl: string;
  duration: string;
}

interface MaterialForm {
  title: string;
  url: string;
}

interface QuestionForm {
  questionText: string;
  options: string[];
  correctAnswer: number;
}

interface QuizForm {
  title: string;
  questions: QuestionForm[];
}

const categories = ['خطابة', 'قيادة', 'إعلام', 'نقاش'];
const levelOptions = [
  { value: 'beginner', label: 'مبتدئ' },
  { value: 'intermediate', label: 'متوسط' },
  { value: 'advanced', label: 'متقدم' },
];

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px',
  background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 10, color: '#fff', fontSize: '0.9rem',
  fontFamily: 'Inter, sans-serif', outline: 'none',
  transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.85rem', color: '#D4AF37',
  fontWeight: 600, marginBottom: 8,
};

function handleInputFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)';
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(212,175,55,0.1)';
}

function handleInputBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
  e.currentTarget.style.boxShadow = 'none';
}

export default function CreateCoursePage() {
  const { data: session, status } = useSession();
  const user = session?.user as { role?: string; name?: string } | undefined;
  const isTrainerOrAdmin = user?.role === 'trainer' || user?.role === 'admin';
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [level, setLevel] = useState('beginner');
  const [category, setCategory] = useState('خطابة');
  const [duration, setDuration] = useState('');
  const [tags, setTags] = useState('');
  const [featured, setFeatured] = useState(false);
  const [lessons, setLessons] = useState<LessonForm[]>([]);
  const [materials, setMaterials] = useState<MaterialForm[]>([]);
  const [quizzes, setQuizzes] = useState<QuizForm[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState('');

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'عنوان الدورة مطلوب';
    if (!description.trim()) newErrors.description = 'وصف الدورة مطلوب';
    if (!duration.trim()) newErrors.duration = 'المدة مطلوبة';

    lessons.forEach((lesson, i) => {
      if (!lesson.title.trim()) newErrors[`lesson-${i}-title`] = `عنوان الدرس ${i + 1} مطلوب`;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addLesson = () => {
    setLessons([...lessons, { title: '', videoUrl: '', duration: '' }]);
  };

  const removeLesson = (index: number) => {
    setLessons(lessons.filter((_, i) => i !== index));
  };

  const updateLesson = (index: number, field: keyof LessonForm, value: string) => {
    const updated = [...lessons];
    updated[index] = { ...updated[index], [field]: value };
    setLessons(updated);
    // Clear error
    const errorKey = `lesson-${index}-${field}`;
    if (errors[errorKey]) {
      const newErrors = { ...errors };
      delete newErrors[errorKey];
      setErrors(newErrors);
    }
  };

  const moveLessonUp = (index: number) => {
    if (index <= 0) return;
    const updated = [...lessons];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setLessons(updated);
  };

  const moveLessonDown = (index: number) => {
    if (index >= lessons.length - 1) return;
    const updated = [...lessons];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setLessons(updated);
  };

  const addMaterial = () => setMaterials([...materials, { title: '', url: '' }]);
  const updateMaterial = (index: number, field: keyof MaterialForm, value: string) => {
    const updated = [...materials];
    updated[index] = { ...updated[index], [field]: value };
    setMaterials(updated);
  };
  const removeMaterial = (index: number) => setMaterials(materials.filter((_, i) => i !== index));

  const addQuiz = () => setQuizzes([...quizzes, { title: '', questions: [] }]);
  const updateQuizTitle = (index: number, title: string) => {
    const updated = [...quizzes];
    updated[index].title = title;
    setQuizzes(updated);
  };
  const removeQuiz = (index: number) => setQuizzes(quizzes.filter((_, i) => i !== index));

  const addQuestion = (quizIndex: number) => {
    const updated = [...quizzes];
    updated[quizIndex].questions.push({ questionText: '', options: ['', '', '', ''], correctAnswer: 0 });
    setQuizzes(updated);
  };
  const updateQuestion = (quizIndex: number, qIndex: number, field: 'questionText' | 'correctAnswer', value: any) => {
    const updated = [...quizzes];
    updated[quizIndex].questions[qIndex] = { ...updated[quizIndex].questions[qIndex], [field]: value };
    setQuizzes(updated);
  };
  const updateOption = (quizIndex: number, qIndex: number, optIndex: number, value: string) => {
    const updated = [...quizzes];
    updated[quizIndex].questions[qIndex].options[optIndex] = value;
    setQuizzes(updated);
  };
  const removeQuestion = (quizIndex: number, qIndex: number) => {
    const updated = [...quizzes];
    updated[quizIndex].questions = updated[quizIndex].questions.filter((_, i) => i !== qIndex);
    setQuizzes(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      setGlobalError('');

      const body = {
        title: title.trim(),
        description: description.trim(),
        instructor: user?.name || 'مدرب',
        level,
        category,
        duration: duration.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        featured,
        lessons: lessons.map((l, i) => ({
          title: l.title.trim(),
          videoUrl: l.videoUrl.trim(),
          duration: l.duration.trim(),
          order: i + 1,
        })),
        materials: materials.filter(m => m.title.trim() && m.url.trim()),
        quizzes: quizzes.filter(q => q.title.trim() && q.questions.length > 0),
      };

      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'فشل في إنشاء الدورة');
      }

      // Redirect to the new course
      if (data.course?._id) {
        router.push(`/courses/${data.course._id}`);
      } else {
        router.push('/courses');
      }
    } catch (err: unknown) {
      setGlobalError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <AppLayout>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div className="skeleton" style={{ height: 40, marginBottom: 20, width: '60%' }} />
          <div className="skeleton" style={{ height: 500, borderRadius: 20 }} />
        </div>
      </AppLayout>
    );
  }

  // Unauthorized
  if (!isTrainerOrAdmin) {
    return (
      <AppLayout>
        <div style={{
          textAlign: 'center', padding: '80px 20px',
          maxWidth: 500, margin: '0 auto',
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(239,68,68,0.1)', border: '2px solid rgba(239,68,68,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px', fontSize: '2.5rem',
          }}>
            🔒
          </div>
          <h2 style={{ fontWeight: 800, marginBottom: 12, color: '#f87171', fontSize: '1.4rem' }}>
            غير مصرح
          </h2>
          <p style={{ color: '#666', marginBottom: 28, fontSize: '0.9rem', lineHeight: 1.7 }}>
            هذه الصفحة متاحة فقط للمدربين والمشرفين.
            <br />إذا كنت تعتقد أنه يجب أن يكون لديك صلاحية، تواصل مع الإدارة.
          </p>
          <Link href="/courses">
            <button className="btn-gold" style={{ padding: '12px 32px' }}>العودة للدورات</button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, fontSize: '0.8rem', color: '#666' }}>
            <Link href="/courses" style={{ color: '#D4AF37', textDecoration: 'none' }}>الدورات</Link>
            <span>←</span>
            <span style={{ color: '#888' }}>إنشاء دورة جديدة</span>
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>
            <span className="text-gradient">إنشاء دورة جديدة</span>
          </h1>
          <p style={{ color: '#666', fontSize: '0.88rem' }}>
            أضف دورتك التدريبية مع كل التفاصيل والدروس
          </p>
        </div>

        {/* Global Error */}
        {globalError && (
          <div style={{
            padding: '14px 18px', marginBottom: 20, borderRadius: 12,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
            color: '#f87171', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span>⚠️</span> {globalError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Main Info Card */}
          <div className="card-gold" style={{ padding: 28, borderRadius: 20, marginBottom: 20 }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#D4AF37', marginBottom: 20 }}>
              📋 المعلومات الأساسية
            </h2>

            {/* Title */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>عنوان الدورة *</label>
              <input
                type="text"
                value={title}
                onChange={e => { setTitle(e.target.value); if (errors.title) { const n = { ...errors }; delete n.title; setErrors(n); } }}
                placeholder="مثال: أساسيات الخطابة المؤثرة"
                style={{
                  ...inputStyle,
                  borderColor: errors.title ? '#f87171' : 'rgba(255,255,255,0.08)',
                }}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
              {errors.title && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: 6 }}>⚠️ {errors.title}</p>}
            </div>

            {/* Description */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>وصف الدورة *</label>
              <textarea
                value={description}
                onChange={e => { setDescription(e.target.value); if (errors.description) { const n = { ...errors }; delete n.description; setErrors(n); } }}
                placeholder="اكتب وصفاً تفصيلياً للدورة..."
                rows={4}
                style={{
                  ...inputStyle,
                  resize: 'vertical' as const,
                  minHeight: 100,
                  borderColor: errors.description ? '#f87171' : 'rgba(255,255,255,0.08)',
                }}
                onFocus={handleInputFocus as React.FocusEventHandler<HTMLTextAreaElement>}
                onBlur={handleInputBlur as React.FocusEventHandler<HTMLTextAreaElement>}
              />
              {errors.description && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: 6 }}>⚠️ {errors.description}</p>}
            </div>

            {/* Level & Category Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
              <div>
                <label style={labelStyle}>المستوى</label>
                <select
                  value={level}
                  onChange={e => setLevel(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' as const }}
                  onFocus={handleInputFocus as React.FocusEventHandler<HTMLSelectElement>}
                  onBlur={handleInputBlur as React.FocusEventHandler<HTMLSelectElement>}
                >
                  {levelOptions.map(opt => (
                    <option key={opt.value} value={opt.value} style={{ background: '#1A1A1A' }}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>التصنيف</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  style={{ ...inputStyle, cursor: 'pointer', appearance: 'none' as const }}
                  onFocus={handleInputFocus as React.FocusEventHandler<HTMLSelectElement>}
                  onBlur={handleInputBlur as React.FocusEventHandler<HTMLSelectElement>}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat} style={{ background: '#1A1A1A' }}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Duration & Tags Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
              <div>
                <label style={labelStyle}>المدة الإجمالية *</label>
                <input
                  type="text"
                  value={duration}
                  onChange={e => { setDuration(e.target.value); if (errors.duration) { const n = { ...errors }; delete n.duration; setErrors(n); } }}
                  placeholder="مثال: 5 ساعات"
                  style={{
                    ...inputStyle,
                    borderColor: errors.duration ? '#f87171' : 'rgba(255,255,255,0.08)',
                  }}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
                {errors.duration && <p style={{ color: '#f87171', fontSize: '0.75rem', marginTop: 6 }}>⚠️ {errors.duration}</p>}
              </div>
              <div>
                <label style={labelStyle}>الكلمات المفتاحية</label>
                <input
                  type="text"
                  value={tags}
                  onChange={e => setTags(e.target.value)}
                  placeholder="مفصولة بفواصل: خطابة, إلقاء"
                  style={inputStyle}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
              </div>
            </div>

            {/* Featured checkbox */}
            <div style={{ marginBottom: 4 }}>
              <label style={{
                display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                padding: '10px 14px', borderRadius: 10,
                background: featured ? 'rgba(212,175,55,0.08)' : 'transparent',
                border: `1px solid ${featured ? 'rgba(212,175,55,0.2)' : 'transparent'}`,
                transition: 'all 0.2s ease',
              }}>
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={e => setFeatured(e.target.checked)}
                  style={{
                    width: 18, height: 18, accentColor: '#D4AF37', cursor: 'pointer',
                  }}
                />
                <span style={{ fontSize: '0.88rem', color: featured ? '#D4AF37' : '#888', fontWeight: 500 }}>
                  ⭐ دورة مميزة (تظهر في القسم المميز)
                </span>
              </label>
            </div>
          </div>

          {/* Lessons Section */}
          <div className="card-gold" style={{ padding: 28, borderRadius: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#D4AF37' }}>
                📖 الدروس ({lessons.length})
              </h2>
              <button
                type="button"
                onClick={addLesson}
                className="btn-outline"
                style={{ padding: '8px 18px', fontSize: '0.82rem' }}
              >
                + إضافة درس
              </button>
            </div>

            {lessons.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '40px 20px',
                background: 'rgba(255,255,255,0.02)', borderRadius: 14,
                border: '1px dashed rgba(255,255,255,0.08)',
              }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 10 }}>📝</div>
                <p style={{ color: '#555', fontSize: '0.85rem', marginBottom: 14 }}>
                  لم تضف أي دروس بعد
                </p>
                <button
                  type="button"
                  onClick={addLesson}
                  style={{
                    background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
                    color: '#D4AF37', padding: '8px 20px', borderRadius: 8,
                    cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                    transition: 'all 0.2s ease',
                  }}
                >
                  + إضافة أول درس
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {lessons.map((lesson, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 18, borderRadius: 14,
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      transition: 'all 0.2s ease',
                      animation: `fadeInUp 0.3s ease ${i * 0.05}s both`,
                    }}
                  >
                    {/* Lesson Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: 7,
                          background: 'rgba(212,175,55,0.12)',
                          border: '1px solid rgba(212,175,55,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.75rem', fontWeight: 700, color: '#D4AF37',
                        }}>
                          {i + 1}
                        </div>
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#ddd' }}>الدرس {i + 1}</span>
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          type="button"
                          onClick={() => moveLessonUp(i)}
                          disabled={i === 0}
                          style={{
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 6, width: 28, height: 28, cursor: i === 0 ? 'not-allowed' : 'pointer',
                            color: i === 0 ? '#333' : '#888', fontSize: '0.75rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          onClick={() => moveLessonDown(i)}
                          disabled={i === lessons.length - 1}
                          style={{
                            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                            borderRadius: 6, width: 28, height: 28,
                            cursor: i === lessons.length - 1 ? 'not-allowed' : 'pointer',
                            color: i === lessons.length - 1 ? '#333' : '#888', fontSize: '0.75rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          ▼
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLesson(i)}
                          style={{
                            background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
                            borderRadius: 6, width: 28, height: 28, cursor: 'pointer',
                            color: '#f87171', fontSize: '0.75rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 0.2s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
                            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'rgba(239,68,68,0.06)';
                            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)';
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    {/* Lesson Fields */}
                    <div style={{ marginBottom: 10 }}>
                      <input
                        type="text"
                        value={lesson.title}
                        onChange={e => updateLesson(i, 'title', e.target.value)}
                        placeholder="عنوان الدرس *"
                        style={{
                          ...inputStyle,
                          fontSize: '0.85rem', padding: '10px 14px',
                          borderColor: errors[`lesson-${i}-title`] ? '#f87171' : 'rgba(255,255,255,0.08)',
                        }}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                      />
                      {errors[`lesson-${i}-title`] && (
                        <p style={{ color: '#f87171', fontSize: '0.72rem', marginTop: 4 }}>⚠️ {errors[`lesson-${i}-title`]}</p>
                      )}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
                      <input
                        type="text"
                        value={lesson.videoUrl}
                        onChange={e => updateLesson(i, 'videoUrl', e.target.value)}
                        placeholder="رابط الفيديو (YouTube أو غيره)"
                        style={{ ...inputStyle, fontSize: '0.85rem', padding: '10px 14px' }}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                      />
                      <input
                        type="text"
                        value={lesson.duration}
                        onChange={e => updateLesson(i, 'duration', e.target.value)}
                        placeholder="المدة (مثل: 15 دقيقة)"
                        style={{ ...inputStyle, fontSize: '0.85rem', padding: '10px 14px' }}
                        onFocus={handleInputFocus}
                        onBlur={handleInputBlur}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Materials Section */}
          <div className="card-gold" style={{ padding: 28, borderRadius: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#D4AF37' }}>📚 المرفقات والكتب ({materials.length})</h2>
              <button type="button" onClick={addMaterial} className="btn-outline" style={{ padding: '8px 18px', fontSize: '0.82rem' }}>+ إضافة ملف</button>
            </div>
            {materials.map((mat, i) => (
              <div key={i} style={{ padding: 18, background: 'rgba(255,255,255,0.02)', borderRadius: 14, marginBottom: 10, display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10 }}>
                <input type="text" placeholder="اسم الكتاب/الملف" value={mat.title} onChange={e => updateMaterial(i, 'title', e.target.value)} style={inputStyle} />
                <input type="text" placeholder="رابط الملف (PDF, Drive...)" value={mat.url} onChange={e => updateMaterial(i, 'url', e.target.value)} style={inputStyle} />
                <button type="button" onClick={() => removeMaterial(i)} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'none', borderRadius: 8, padding: '0 15px', cursor: 'pointer' }}>حذف</button>
              </div>
            ))}
          </div>

          {/* Quizzes Section */}
          <div className="card-gold" style={{ padding: 28, borderRadius: 20, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#D4AF37' }}>📝 الاختبارات (QCM) ({quizzes.length})</h2>
              <button type="button" onClick={addQuiz} className="btn-outline" style={{ padding: '8px 18px', fontSize: '0.82rem' }}>+ إضافة اختبار</button>
            </div>
            {quizzes.map((quiz, qzIdx) => (
              <div key={qzIdx} style={{ padding: 20, background: 'rgba(255,255,255,0.02)', borderRadius: 14, marginBottom: 15, border: '1px solid rgba(212,175,55,0.1)' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
                  <input type="text" placeholder="عنوان الاختبار (مثال: اختبار الوحدة الأولى)" value={quiz.title} onChange={e => updateQuizTitle(qzIdx, e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                  <button type="button" onClick={() => removeQuiz(qzIdx)} style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'none', borderRadius: 8, padding: '0 15px', cursor: 'pointer' }}>حذف الاختبار</button>
                </div>
                
                <div style={{ paddingRight: 20, borderRight: '2px solid rgba(212,175,55,0.3)' }}>
                  {quiz.questions.map((q, qIdx) => (
                    <div key={qIdx} style={{ marginBottom: 20, padding: 15, background: 'rgba(0,0,0,0.2)', borderRadius: 10 }}>
                      <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                        <input type="text" placeholder={`السؤال ${qIdx + 1}`} value={q.questionText} onChange={e => updateQuestion(qzIdx, qIdx, 'questionText', e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                        <button type="button" onClick={() => removeQuestion(qzIdx, qIdx)} style={{ color: '#f87171', background: 'transparent', border: 'none', cursor: 'pointer' }}>✖</button>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {q.options.map((opt, oIdx) => (
                          <div key={oIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <input type="radio" name={`correct-${qzIdx}-${qIdx}`} checked={q.correctAnswer === oIdx} onChange={() => updateQuestion(qzIdx, qIdx, 'correctAnswer', oIdx)} />
                            <input type="text" placeholder={`الخيار ${oIdx + 1}`} value={opt} onChange={e => updateOption(qzIdx, qIdx, oIdx, e.target.value)} style={{ ...inputStyle, padding: '8px' }} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  <button type="button" onClick={() => addQuestion(qzIdx)} className="btn-ghost" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>+ إضافة سؤال</button>
                </div>
              </div>
            ))}
          </div>

          {/* Submit Section */}
          <div style={{
            display: 'flex', gap: 12, justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap', marginBottom: 40,
          }}>
            <Link href="/courses" style={{ textDecoration: 'none' }}>
              <button type="button" className="btn-ghost" style={{ padding: '12px 28px' }}>
                ← إلغاء
              </button>
            </Link>
            <button
              type="submit"
              className="btn-gold"
              disabled={submitting}
              style={{
                padding: '14px 40px', fontSize: '1rem',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ animation: 'spin-slow 1s linear infinite', display: 'inline-block' }}>⏳</span>
                  جارٍ الإنشاء...
                </span>
              ) : (
                '✨ إنشاء الدورة'
              )}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
