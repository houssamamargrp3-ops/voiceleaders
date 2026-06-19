'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetch('/api/trainer/courses')
      .then(res => res.json())
      .then(data => {
        setCourses(data.courses || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCreateCourse = async () => {
    if (!newTitle.trim()) {
      setError('يرجى كتابة عنوان للدورة أولاً');
      return;
    }
    setCreating(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/trainer/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() }),
      });

      const data = await res.json();
      if (data.success) {
        setCourses([data.course, ...courses]);
        setNewTitle('');
        setSuccess('✅ تم إنشاء الدورة بنجاح!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'فشل في إنشاء الدورة');
      }
    } catch {
      setError('حدث خطأ في الاتصال بالخادم');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div className="badge badge-gold" style={{ marginBottom: 10 }}>👨‍🏫 المدرب</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
          دوراتي <span className="text-gradient">التدريبية</span>
        </h1>
        <p style={{ color: '#666', fontSize: '0.9rem', marginTop: 6 }}>
          أنشئ دوراتك وأضف المحتوى التدريبي لمتدربيك
        </p>
      </div>

      {/* Create Course Card */}
      <div className="card-gold" style={{ padding: 24, marginBottom: 28, borderRadius: 16 }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4, color: '#D4AF37' }}>
          ➕ إنشاء دورة جديدة
        </h3>
        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: 16 }}>
          اكتب عنوان الدورة ثم اضغط على زر الإنشاء
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="text"
            className="input"
            placeholder="مثال: دورة فن الخطابة للمبتدئين..."
            value={newTitle}
            onChange={(e) => {
              setNewTitle(e.target.value);
              setError('');
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleCreateCourse()}
            style={{ fontSize: '0.95rem' }}
          />
          <button
            onClick={handleCreateCourse}
            disabled={creating}
            className="btn-gold"
            style={{
              width: '100%',
              padding: '14px',
              fontSize: '1rem',
              opacity: creating ? 0.7 : 1,
            }}
          >
            {creating ? '⏳ جاري الإنشاء...' : '➕ إنشاء الدورة'}
          </button>
        </div>

        {error && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, color: '#f87171', fontSize: '0.85rem' }}>
            ⚠️ {error}
          </div>
        )}
        {success && (
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: 8, color: '#4ade80', fontSize: '0.85rem' }}>
            {success}
          </div>
        )}
      </div>

      {/* Courses List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
        </div>
      ) : courses.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: '#111', borderRadius: 16,
          border: '1px dashed rgba(212,175,55,0.2)',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>📚</div>
          <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: 8 }}>لا توجد دورات بعد</h3>
          <p style={{ color: '#666', fontSize: '0.85rem' }}>أنشئ أول دورة لك الآن من خلال النموذج أعلاه</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ccc' }}>
            دوراتي ({courses.length})
          </h2>
          {courses.map(course => (
            <div key={course._id} style={{
              background: '#111', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 14, padding: 20,
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', gap: 16, flexWrap: 'wrap',
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1rem', color: '#fff', fontWeight: 700, marginBottom: 6 }}>
                  {course.title}
                </h3>
                <div style={{ color: '#888', fontSize: '0.8rem', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span>📖 {course.lessons?.length || 0} درس</span>
                  <span>👥 {course.enrolledStudents?.length || 0} متدرب</span>
                  <span>⭐ {course.rating?.toFixed(1) || '0.0'}</span>
                </div>
              </div>
              <Link
                href={`/trainer/my-courses/${course._id}`}
                className="btn-outline"
                style={{ fontSize: '0.85rem', padding: '8px 16px', whiteSpace: 'nowrap' }}
              >
                ✏️ تعديل
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
