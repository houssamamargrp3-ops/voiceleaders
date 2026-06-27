'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Student {
  enrollmentId: string;
  userId: string;
  name: string;
  email: string;
  progress: number;
  completedLessons: string[];
  passedQuizzes: any[];
  enrolledAt: string;
}

export default function CourseStudentsPage() {
  const params = useParams();
  const id = params.id as string;
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const res = await fetch(`/api/trainer/courses/${id}/students`);
      const data = await res.json();
      if (res.ok) {
        setStudents(data.students || []);
      } else {
        alert(data.error || 'حدث خطأ في جلب بيانات المتدربين');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [id]);

  const handleExpel = async (userId: string, name: string) => {
    if (!confirm(`هل أنت متأكد أنك تريد طرد المتدرب "${name}" من هذه الدورة؟\nلا يمكن التراجع عن هذا الإجراء.`)) return;

    try {
      const res = await fetch(`/api/trainer/courses/${id}/students?userId=${userId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      
      if (res.ok) {
        alert('تم طرد المتدرب بنجاح.');
        fetchStudents();
      } else {
        alert(data.error || 'حدث خطأ أثناء الطرد');
      }
    } catch (e) {
      console.error(e);
      alert('فشل الاتصال بالخادم.');
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#D4AF37' }}>جاري تحميل البيانات... ⏳</div>;

  return (
    <div style={{ paddingBottom: 60 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href={`/trainer/my-courses/${id}`} className="btn-ghost" style={{ padding: '6px 12px' }}>&rarr; عودة للدورة</Link>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>إدارة المتدربين</h2>
        </div>
        <div style={{ fontSize: '0.9rem', color: '#888' }}>
          إجمالي المسجلين: <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>{students.length}</span>
        </div>
      </div>

      <div className="card" style={{ padding: 24, overflowX: 'auto' }}>
        {students.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
            لا يوجد أي متدربين مسجلين في هذه الدورة حتى الآن.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '12px 16px', color: '#888', fontWeight: 500 }}>اسم المتدرب</th>
                <th style={{ padding: '12px 16px', color: '#888', fontWeight: 500 }}>البريد الإلكتروني</th>
                <th style={{ padding: '12px 16px', color: '#888', fontWeight: 500 }}>تاريخ التسجيل</th>
                <th style={{ padding: '12px 16px', color: '#888', fontWeight: 500 }}>حالة التقدم</th>
                <th style={{ padding: '12px 16px', color: '#888', fontWeight: 500 }}>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.userId} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px', fontWeight: 600 }}>{student.name}</td>
                  <td style={{ padding: '16px', color: '#ccc', fontSize: '0.9rem' }}>{student.email}</td>
                  <td style={{ padding: '16px', color: '#aaa', fontSize: '0.85rem' }}>
                    {new Date(student.enrolledAt).toLocaleDateString('ar-SA')}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: '#1A1A1A', borderRadius: 3 }}>
                          <div style={{ width: `${student.progress}%`, height: '100%', background: '#4ade80', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 'bold' }}>{Math.round(student.progress)}%</span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {student.progress === 0 ? (
                          <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: '#333', color: '#aaa', borderRadius: 12 }}>
                            لم يبدأ بعد
                          </span>
                        ) : (
                          <>
                            {student.completedLessons && student.completedLessons.length > 0 && (
                              <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(59,130,246,0.1)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12 }}>
                                📚 أكمل {student.completedLessons.length} دروس
                              </span>
                            )}
                            {student.passedQuizzes && student.passedQuizzes.length > 0 && (
                              <span style={{ fontSize: '0.7rem', padding: '2px 8px', background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 12 }}>
                                ✅ نجح في {student.passedQuizzes.length} اختبارات
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <button
                      onClick={() => handleExpel(student.userId, student.name)}
                      className="btn-outline"
                      style={{ padding: '4px 12px', fontSize: '0.8rem', color: '#f87171', borderColor: 'rgba(248,113,113,0.3)' }}
                    >
                      🚫 طرد
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
