'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    fetch('/api/trainer/courses')
      .then(res => res.json())
      .then(data => {
        setCourses(data.courses || []);
        setLoading(false);
      });
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);

    const res = await fetch('/api/trainer/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle }),
    });

    const data = await res.json();
    if (data.success) {
      setCourses([data.course, ...courses]);
      setNewTitle('');
    } else {
      alert(data.error);
    }
    setCreating(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>دوراتي التدريبية</h2>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 30 }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: 16 }}>إضافة دورة جديدة</h3>
        <form onSubmit={handleCreateCourse} style={{ display: 'flex', gap: 12 }}>
          <input
            type="text"
            className="input"
            placeholder="أدخل عنوان الدورة الجديدة..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-gold" disabled={creating || !newTitle.trim()}>
            {creating ? 'جاري الإنشاء...' : '➕ إنشاء دورة'}
          </button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>جاري التحميل...</div>
      ) : courses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, background: '#111', borderRadius: 12 }}>
          ليس لديك أي دورات بعد. قم بإنشاء أول دورة لك!
        </div>
      ) : (
        <div className="grid-2">
          {courses.map(course => (
            <div key={course._id} style={{
              background: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 20
            }}>
              <h3 style={{ fontSize: '1.2rem', color: '#D4AF37', marginBottom: 8 }}>{course.title}</h3>
              <div style={{ color: '#888', fontSize: '0.85rem', marginBottom: 16 }}>
                المستوى: {course.level} • {course.lessons?.length || 0} دروس
              </div>
              <Link href={`/trainer/my-courses/${course._id}`} className="btn-outline" style={{ display: 'block', textAlign: 'center', padding: '8px' }}>
                ✏️ تعديل محتوى الدورة
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
