'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

export default function CourseEditorPage() {
  const router = useRouter();
  const params = useParams();
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/trainer/courses')
      .then(res => res.json())
      .then(data => {
        const found = data.courses?.find((c: any) => c._id === params.id);
        if (found) setCourse(found);
        setLoading(false);
      });
  }, [params.id]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/trainer/courses/${course._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course),
    });
    const data = await res.json();
    setSaving(false);
    if (data.success) {
      alert('تم الحفظ بنجاح!');
    } else {
      alert(data.error || 'حدث خطأ');
    }
  };

  const addLesson = () => {
    setCourse({
      ...course,
      lessons: [...(course.lessons || []), { title: 'درس جديد', videoUrl: '', duration: '0:00', order: (course.lessons?.length || 0) + 1 }]
    });
  };

  const addMaterial = () => {
    setCourse({
      ...course,
      materials: [...(course.materials || []), { title: 'كتاب جديد', url: '' }]
    });
  };

  const addQuiz = () => {
    setCourse({
      ...course,
      quizzes: [...(course.quizzes || []), { title: 'اختبار جديد', timeLimit: 30, retakeAfterDays: 1, passingScore: 50, linkedLessonId: '', questions: [{ questionText: 'سؤال', options: ['خيار 1', 'خيار 2'], correctAnswer: 0 }] }]
    });
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>جاري التحميل...</div>;
  if (!course) return <div style={{ padding: 40, textAlign: 'center' }}>لم يتم العثور على الدورة</div>;

  const inputStyle = { width: '100%', padding: '10px 14px', background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' };

  return (
    <div style={{ paddingBottom: 60 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/trainer/my-courses" className="btn-ghost" style={{ padding: '6px 12px' }}>&rarr; عودة</Link>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>تحرير الدورة</h2>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href={`/trainer/my-courses/${course._id}/students`} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px' }}>
            👥 إدارة المتدربين
          </Link>
          <button className="btn-gold" onClick={handleSave} disabled={saving}>
            {saving ? 'جاري الحفظ...' : '💾 حفظ التغييرات'}
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: 16, color: '#D4AF37' }}>المعلومات الأساسية</h3>
        <div className="grid-2">
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem' }}>عنوان الدورة</label>
            <input type="text" style={inputStyle} value={course.title} onChange={e => setCourse({...course, title: e.target.value})} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem' }}>المستوى</label>
            <select style={{...inputStyle, background: '#1A1A1A'}} value={course.level} onChange={e => setCourse({...course, level: e.target.value})}>
              <option value="beginner">مبتدئ</option>
              <option value="intermediate">متوسط</option>
              <option value="advanced">متقدم</option>
            </select>
          </div>
        </div>
        <div className="grid-2" style={{ marginTop: 16 }}>
          <div>
            <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem' }}>العدد الأقصى للمتدربين (0 = غير محدود)</label>
            <input type="number" min="0" style={inputStyle} value={course.maxStudents || 0} onChange={e => setCourse({...course, maxStudents: Number(e.target.value)})} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 28 }}>
            <input type="checkbox" id="close-reg" checked={course.isRegistrationClosed || false} onChange={e => setCourse({...course, isRegistrationClosed: e.target.checked})} style={{ width: 18, height: 18, accentColor: '#D4AF37' }} />
            <label htmlFor="close-reg" style={{ fontSize: '0.9rem', color: '#f87171', fontWeight: 600, cursor: 'pointer' }}>إغلاق التسجيل يدوياً</label>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem' }}>وصف الدورة</label>
          <textarea rows={4} style={inputStyle} value={course.description} onChange={e => setCourse({...course, description: e.target.value})} />
        </div>
      </div>

      {/* الدروس */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.1rem', color: '#D4AF37' }}>الفيديوهات والدروس</h3>
          <button onClick={addLesson} className="btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>+ إضافة درس</button>
        </div>
        {course.lessons?.map((lesson: any, i: number) => (
          <div key={i} style={{ background: '#111', padding: 16, borderRadius: 8, marginBottom: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="grid-2">
              <input type="text" style={inputStyle} placeholder="عنوان الدرس" value={lesson.title} onChange={e => {
                const newLessons = [...course.lessons];
                newLessons[i].title = e.target.value;
                setCourse({...course, lessons: newLessons});
              }} />
              <input type="text" style={inputStyle} placeholder="رابط الفيديو (URL) / أو مسار الرفع" value={lesson.videoUrl} onChange={e => {
                const newLessons = [...course.lessons];
                newLessons[i].videoUrl = e.target.value;
                setCourse({...course, lessons: newLessons});
              }} />
            </div>
            <button onClick={() => {
              const newLessons = course.lessons.filter((_: any, idx: number) => idx !== i);
              setCourse({...course, lessons: newLessons});
            }} style={{ background: 'none', border: 'none', color: '#f87171', marginTop: 10, cursor: 'pointer', fontSize: '0.8rem' }}>
              🗑️ حذف الدرس
            </button>
          </div>
        ))}
        {(!course.lessons || course.lessons.length === 0) && <p style={{ fontSize: '0.85rem', color: '#888' }}>لا يوجد دروس مضافة بعد.</p>}
      </div>

      {/* المرفقات والكتب */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.1rem', color: '#D4AF37' }}>الكتب والمرفقات</h3>
          <button onClick={addMaterial} className="btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>+ إضافة ملف/كتاب</button>
        </div>
        {course.materials?.map((mat: any, i: number) => (
          <div key={i} style={{ background: '#111', padding: 16, borderRadius: 8, marginBottom: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="grid-2">
              <input type="text" style={inputStyle} placeholder="اسم الكتاب أو المرفق" value={mat.title} onChange={e => {
                const newMats = [...course.materials];
                newMats[i].title = e.target.value;
                setCourse({...course, materials: newMats});
              }} />
              <input type="text" style={inputStyle} placeholder="رابط الملف (PDF, Link)" value={mat.url} onChange={e => {
                const newMats = [...course.materials];
                newMats[i].url = e.target.value;
                setCourse({...course, materials: newMats});
              }} />
            </div>
            <button onClick={() => {
              const newMats = course.materials.filter((_: any, idx: number) => idx !== i);
              setCourse({...course, materials: newMats});
            }} style={{ background: 'none', border: 'none', color: '#f87171', marginTop: 10, cursor: 'pointer', fontSize: '0.8rem' }}>
              🗑️ حذف الملف
            </button>
          </div>
        ))}
      </div>

      {/* الاختبارات QCM */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.1rem', color: '#D4AF37' }}>الاختبارات (QCM)</h3>
          <button onClick={addQuiz} className="btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }}>+ إضافة اختبار</button>
        </div>
        {course.quizzes?.map((quiz: any, qIdx: number) => (
          <div key={qIdx} style={{ background: '#111', padding: 20, borderRadius: 8, marginBottom: 20, border: '1px solid rgba(255,255,255,0.1)' }}>
            <input type="text" style={{...inputStyle, marginBottom: 16, fontSize: '1.05rem', fontWeight: 'bold'}} placeholder="عنوان الاختبار (مثال: اختبار الوحدة الأولى)" value={quiz.title} onChange={e => {
              const newQuizzes = [...course.quizzes];
              newQuizzes[qIdx].title = e.target.value;
              setCourse({...course, quizzes: newQuizzes});
            }} />
            
            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: '#ccc' }}>الوقت المخصص لكل سؤال (بالثواني)</label>
                <input type="number" min="5" max="300" style={inputStyle} value={quiz.timeLimit ?? 30} onChange={e => {
                  const newQuizzes = [...course.quizzes];
                  newQuizzes[qIdx].timeLimit = Number(e.target.value);
                  setCourse({...course, quizzes: newQuizzes});
                }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: '#ccc' }}>مدة الانتظار لإعادة الاختبار (بالأيام)</label>
                <input type="number" min="0" max="365" style={inputStyle} value={quiz.retakeAfterDays ?? 1} onChange={e => {
                  const newQuizzes = [...course.quizzes];
                  newQuizzes[qIdx].retakeAfterDays = Number(e.target.value);
                  setCourse({...course, quizzes: newQuizzes});
                }} />
              </div>
            </div>

            <div className="grid-2" style={{ marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: '#ccc' }}>نسبة النجاح المطلوبة (%)</label>
                <input type="number" min="1" max="100" style={inputStyle} value={quiz.passingScore ?? 50} onChange={e => {
                  const newQuizzes = [...course.quizzes];
                  newQuizzes[qIdx].passingScore = Number(e.target.value);
                  setCourse({...course, quizzes: newQuizzes});
                }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 6, fontSize: '0.85rem', color: '#ccc' }}>ربط الاختبار بدرس (شرط الاجتياز)</label>
                <select style={{...inputStyle, padding: '11px'}} value={quiz.linkedLessonId || ''} onChange={e => {
                  const newQuizzes = [...course.quizzes];
                  newQuizzes[qIdx].linkedLessonId = e.target.value;
                  setCourse({...course, quizzes: newQuizzes});
                }}>
                  <option value="">-- بدون ربط --</option>
                  {course.lessons?.map((lesson: any) => (
                    <option key={lesson._id || Math.random().toString()} value={lesson._id}>
                      {lesson.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <h4 style={{ fontSize: '0.9rem', marginBottom: 10, color: '#ccc' }}>الأسئلة:</h4>
            {quiz.questions?.map((q: any, i: number) => (
              <div key={i} style={{ background: '#1A1A1A', padding: 16, borderRadius: 8, marginBottom: 12 }}>
                <input type="text" style={{...inputStyle, marginBottom: 10}} placeholder="نص السؤال..." value={q.questionText} onChange={e => {
                  const newQuizzes = [...course.quizzes];
                  newQuizzes[qIdx].questions[i].questionText = e.target.value;
                  setCourse({...course, quizzes: newQuizzes});
                }} />
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {q.options.map((opt: string, optIdx: number) => (
                    <div key={optIdx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input type="radio" name={`correct-${qIdx}-${i}`} checked={q.correctAnswer === optIdx} onChange={() => {
                        const newQuizzes = [...course.quizzes];
                        newQuizzes[qIdx].questions[i].correctAnswer = optIdx;
                        setCourse({...course, quizzes: newQuizzes});
                      }} />
                      <input type="text" style={{...inputStyle, padding: '6px 10px'}} value={opt} onChange={e => {
                        const newQuizzes = [...course.quizzes];
                        newQuizzes[qIdx].questions[i].options[optIdx] = e.target.value;
                        setCourse({...course, quizzes: newQuizzes});
                      }} />
                    </div>
                  ))}
                </div>
                
                <div style={{ marginTop: 10, display: 'flex', gap: 10 }}>
                  <button onClick={() => {
                    const newQuizzes = [...course.quizzes];
                    newQuizzes[qIdx].questions[i].options.push(`خيار ${q.options.length + 1}`);
                    setCourse({...course, quizzes: newQuizzes});
                  }} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '0.8rem' }}>
                    + إضافة خيار
                  </button>
                  <button onClick={() => {
                    const newQuizzes = [...course.quizzes];
                    newQuizzes[qIdx].questions = newQuizzes[qIdx].questions.filter((_: any, idx: number) => idx !== i);
                    setCourse({...course, quizzes: newQuizzes});
                  }} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem', marginLeft: 'auto' }}>
                    حذف السؤال
                  </button>
                </div>
              </div>
            ))}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16 }}>
              <button onClick={() => {
                const newQuizzes = [...course.quizzes];
                newQuizzes[qIdx].questions.push({ questionText: 'سؤال جديد', options: ['خيار 1', 'خيار 2'], correctAnswer: 0 });
                setCourse({...course, quizzes: newQuizzes});
              }} className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                + سؤال جديد للاختبار
              </button>

              <button onClick={() => {
                const newQuizzes = course.quizzes.filter((_: any, idx: number) => idx !== qIdx);
                setCourse({...course, quizzes: newQuizzes});
              }} style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '0.8rem' }}>
                🗑️ حذف الاختبار بالكامل
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
