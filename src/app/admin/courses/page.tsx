'use client';
import { useEffect, useState, useCallback } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';

interface CourseData {
  _id: string;
  title: string;
  instructor: string;
  level: string;
  category: string;
  enrolledStudents: string[];
  rating: number;
  createdAt: string;
  lessons: any[];
}

const levelLabels: Record<string, string> = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' };

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (res.ok) setCourses(data.courses || []);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الدورة؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    
    setDeleting(id);
    try {
      const res = await fetch(`/api/courses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCourses(courses.filter(c => c._id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'فشل في حذف الدورة');
      }
    } catch (error) {
      alert('حدث خطأ أثناء החذف');
    } finally {
      setDeleting(null);
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase()) || 
    c.instructor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 30, flexWrap: 'wrap', gap: 20
        }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
              إدارة الدورات 📖
            </h1>
            <p style={{ color: '#888', fontSize: '0.9rem' }}>
              إدارة جميع الدورات في المنصة، وحذف أو تعديل المحتوى.
            </p>
          </div>
          
          <Link href="/courses/create">
            <button className="btn-gold" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
              + إضافة دورة جديدة
            </button>
          </Link>
        </div>

        <div className="card" style={{ padding: 24, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 20 }}>
            <div className="search-bar" style={{ flex: 1, minWidth: 250 }}>
              <span>🔍</span>
              <input
                type="text"
                placeholder="ابحث عن دورة أو مدرب..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)', color: '#888', fontSize: '0.85rem' }}>
                  <th style={{ padding: '16px 12px', fontWeight: 600 }}>الدورة</th>
                  <th style={{ padding: '16px 12px', fontWeight: 600 }}>المدرب</th>
                  <th style={{ padding: '16px 12px', fontWeight: 600 }}>القسم / المستوى</th>
                  <th style={{ padding: '16px 12px', fontWeight: 600, textAlign: 'center' }}>الدروس</th>
                  <th style={{ padding: '16px 12px', fontWeight: 600, textAlign: 'center' }}>الطلاب</th>
                  <th style={{ padding: '16px 12px', fontWeight: 600, textAlign: 'center' }}>التقييم</th>
                  <th style={{ padding: '16px 12px', fontWeight: 600, textAlign: 'left' }}>إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                      <span style={{ display: 'inline-block', animation: 'spin-slow 1s linear infinite' }}>⏳</span> جاري التحميل...
                    </td>
                  </tr>
                ) : filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                      لم يتم العثور على أي دورات.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map(course => (
                    <tr key={course._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{course.title}</div>
                        <div style={{ fontSize: '0.7rem', color: '#666' }}>
                          {new Date(course.createdAt).toLocaleDateString('ar-EG')}
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px', fontSize: '0.85rem', color: '#ccc' }}>
                        {course.instructor}
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <span className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: '#aaa' }}>{course.category}</span>
                          <span className={`badge level-${course.level}`}>{levelLabels[course.level] || course.level}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.9rem', color: '#888' }}>
                        {course.lessons?.length || 0}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center', fontSize: '0.9rem', color: '#888' }}>
                        {course.enrolledStudents?.length || 0}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                        <div style={{ color: '#D4AF37', fontWeight: 600, fontSize: '0.85rem' }}>
                          {course.rating?.toFixed(1) || '0.0'} ★
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <Link href={`/courses/${course._id}`}>
                            <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                              عرض
                            </button>
                          </Link>
                          <button 
                            className="btn-outline" 
                            style={{ padding: '6px 12px', fontSize: '0.75rem', borderColor: '#f87171', color: '#f87171' }}
                            onClick={() => handleDelete(course._id)}
                            disabled={deleting === course._id}
                          >
                            {deleting === course._id ? '⏳' : 'حذف'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
