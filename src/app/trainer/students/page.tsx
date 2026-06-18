'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TrainerStudentsPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/trainer/courses')
      .then(res => res.json())
      .then(data => {
        setCourses(data.courses || []);
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>إدارة المتدربين</h2>
      </div>

      <div style={{ marginBottom: 24, color: '#888', fontSize: '0.95rem' }}>
        اختر الدورة التي ترغب في إدارة متدربيها ومتابعة تقدمهم:
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#D4AF37' }}>جاري التحميل... ⏳</div>
      ) : courses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, background: '#111', borderRadius: 12 }}>
          ليس لديك أي دورات بعد لإدارة متدربيها.
        </div>
      ) : (
        <div className="grid-2">
          {courses.map(course => (
            <div key={course._id} style={{
              background: '#111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 20,
              display: 'flex', flexDirection: 'column', gap: 16
            }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: '#D4AF37', marginBottom: 8 }}>{course.title}</h3>
                <div style={{ color: '#888', fontSize: '0.85rem' }}>
                  عدد المسجلين حالياً: <span style={{ color: '#fff', fontWeight: 'bold' }}>{course.enrolledStudents?.length || 0}</span> متدرب
                </div>
              </div>
              <Link href={`/trainer/my-courses/${course._id}/students`} className="btn-outline" style={{ display: 'block', textAlign: 'center', padding: '8px', textDecoration: 'none', marginTop: 'auto' }}>
                👥 إدارة متدربي الدورة
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
