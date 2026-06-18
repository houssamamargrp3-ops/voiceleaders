'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Lesson {
  _id: string;
  title: string;
  videoUrl: string;
  duration: string;
  order: number;
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
  createdAt: string;
}

const categories = ['الكل', 'خطابة', 'قيادة', 'إعلام', 'نقاش'];
const levels = ['الكل', 'beginner', 'intermediate', 'advanced'];
const levelLabels: Record<string, string> = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' };

const categoryIcons: Record<string, string> = {
  'خطابة': '🎤',
  'قيادة': '🚀',
  'إعلام': '📹',
  'نقاش': '💬',
};

function SkeletonCard() {
  return (
    <div className="course-card" style={{ height: '100%' }}>
      <div className="skeleton" style={{ height: 150, borderRadius: '16px 16px 0 0' }} />
      <div style={{ padding: '16px 18px' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          <div className="skeleton" style={{ width: 60, height: 22, borderRadius: 100 }} />
          <div className="skeleton" style={{ width: 50, height: 22, borderRadius: 100 }} />
        </div>
        <div className="skeleton" style={{ height: 18, marginBottom: 8, width: '80%' }} />
        <div className="skeleton" style={{ height: 14, marginBottom: 6, width: '100%' }} />
        <div className="skeleton" style={{ height: 14, marginBottom: 14, width: '60%' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <div className="skeleton" style={{ width: 26, height: 26, borderRadius: '50%' }} />
          <div className="skeleton" style={{ width: 80, height: 14 }} />
        </div>
        <div className="divider-gold" style={{ marginBottom: 12 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="skeleton" style={{ width: 100, height: 14 }} />
          <div className="skeleton" style={{ width: 60, height: 14 }} />
        </div>
      </div>
    </div>
  );
}

function FeaturedSkeleton() {
  return (
    <div style={{
      width: 300, flexShrink: 0, borderRadius: 16, overflow: 'hidden',
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div className="skeleton" style={{ height: 130, borderRadius: 0 }} />
      <div style={{ padding: '14px 16px' }}>
        <div className="skeleton" style={{ height: 16, marginBottom: 8, width: '70%' }} />
        <div className="skeleton" style={{ height: 12, marginBottom: 10, width: '40%' }} />
        <div style={{ display: 'flex', gap: 8 }}>
          <div className="skeleton" style={{ width: 50, height: 20, borderRadius: 100 }} />
          <div className="skeleton" style={{ width: 60, height: 20 }} />
        </div>
      </div>
    </div>
  );
}

function StarRating({ rating }: { rating: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<span key={i} style={{ color: '#D4AF37' }}>★</span>);
    } else if (i - rating < 1 && i - rating > 0) {
      stars.push(<span key={i} style={{ color: '#D4AF37', opacity: 0.5 }}>★</span>);
    } else {
      stars.push(<span key={i} style={{ color: '#333' }}>★</span>);
    }
  }
  return <span style={{ fontSize: '0.75rem', letterSpacing: 1 }}>{stars}</span>;
}

export default function CoursesPage() {
  const { data: session } = useSession();
  const user = session?.user as { role?: string } | undefined;
  const isTrainerOrAdmin = user?.role === 'trainer' || user?.role === 'admin';

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [activeLevel, setActiveLevel] = useState('الكل');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch('/api/courses');
      if (!res.ok) throw new Error('فشل في تحميل الدورات');
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  const filtered = courses.filter(c => {
    if (activeCategory !== 'الكل' && c.category !== activeCategory) return false;
    if (activeLevel !== 'الكل' && c.level !== activeLevel) return false;
    if (search && !c.title.includes(search) && !c.instructor.includes(search)) return false;
    return true;
  });

  const featured = courses.filter(c => c.featured);

  const getCourseGradient = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return `linear-gradient(135deg, hsl(${hash % 360}, 25%, 12%), hsl(${(hash * 3) % 360}, 20%, 8%))`;
  };

  return (
    <AppLayout>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="badge badge-gold" style={{ marginBottom: 10 }}>📚 مكتبة الدورات</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>
          تعلّم من <span className="text-gradient">أفضل الخبراء</span>
        </h1>
        <p style={{ color: '#666', fontSize: '0.9rem' }}>
          {loading ? 'جارٍ التحميل...' : `${courses.length} دورة احترافية لتطوير مهاراتك في الخطابة والقيادة`}
        </p>
      </div>

      {/* Search */}
      <div className="search-bar" style={{ maxWidth: 500, marginBottom: 28 }}>
        <span style={{ color: '#666', fontSize: '1.1rem' }}>🔍</span>
        <input
          id="courses-search"
          placeholder="ابحث عن دورة أو مدرب..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              background: 'none', border: 'none', color: '#666', cursor: 'pointer',
              fontSize: '1rem', padding: '0 4px', transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = '#D4AF37')}
            onMouseLeave={e => (e.currentTarget.style.color = '#666')}
          >
            ✕
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div style={{
          textAlign: 'center', padding: '40px 20px', marginBottom: 24,
          background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)',
          borderRadius: 16,
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⚠️</div>
          <p style={{ color: '#f87171', fontSize: '1rem', marginBottom: 16 }}>{error}</p>
          <button className="btn-outline" onClick={fetchCourses} style={{ borderColor: '#f87171', color: '#f87171' }}>
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Featured Courses */}
      {!search && activeCategory === 'الكل' && activeLevel === 'الكل' && (
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16, color: '#D4AF37' }}>⭐ الدورات المميزة</h2>
          <div className="scroll-row">
            {loading ? (
              <>
                <FeaturedSkeleton />
                <FeaturedSkeleton />
                <FeaturedSkeleton />
              </>
            ) : featured.length > 0 ? (
              featured.map(course => (
                <Link key={course._id} href={`/courses/${course._id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
                  <div style={{
                    width: 300,
                    background: 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(0,0,0,0.2))',
                    border: '1px solid rgba(212,175,55,0.2)',
                    borderRadius: 16, overflow: 'hidden',
                    transition: 'all 0.3s ease',
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(212,175,55,0.5)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 16px 40px rgba(212,175,55,0.12)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      height: 130,
                      background: course.thumbnail
                        ? `url(${course.thumbnail}) center/cover`
                        : getCourseGradient(course._id),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '3rem', position: 'relative',
                    }}>
                      {!course.thumbnail && (categoryIcons[course.category] || '📖')}
                      <div style={{
                        position: 'absolute', top: 10, right: 10,
                        background: 'rgba(212,175,55,0.9)', color: '#0A0A0A',
                        padding: '3px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700,
                      }}>مميزة ⭐</div>
                    </div>
                    <div style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem', marginBottom: 6 }}>{course.title}</div>
                      <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: 10 }}>{course.instructor}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span className={`badge level-${course.level}`}>{levelLabels[course.level]}</span>
                        <span style={{ fontSize: '0.72rem', color: '#888' }}>⏱️ {course.duration}</span>
                        <StarRating rating={course.rating} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ padding: '20px 0', color: '#555', fontSize: '0.85rem' }}>
                لا توجد دورات مميزة حالياً
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ marginBottom: 20 }}>
        <div className="filter-bar" style={{ marginBottom: 10 }}>
          {categories.map(c => (
            <button key={c} className={`filter-chip ${activeCategory === c ? 'active' : ''}`}
              onClick={() => setActiveCategory(c)}>
              {c}
            </button>
          ))}
        </div>
        <div className="filter-bar">
          {levels.map(l => (
            <button key={l} className={`filter-chip ${activeLevel === l ? 'active' : ''}`}
              onClick={() => setActiveLevel(l)}>
              {l === 'الكل' ? 'كل المستويات' : levelLabels[l]}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!loading && (
        <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: 20 }}>
          {filtered.length} دورة
        </p>
      )}

      {/* Courses Grid - Loading */}
      {loading && (
        <div className="grid-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Courses Grid - Content */}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid-3">
          {filtered.map((course, index) => (
            <Link key={course._id} href={`/courses/${course._id}`} style={{ textDecoration: 'none' }}>
              <div
                className="course-card"
                style={{
                  height: '100%',
                  animation: `fadeInUp 0.5s ease ${index * 0.05}s both`,
                }}
              >
                {/* Thumbnail */}
                <div style={{
                  height: 150,
                  background: course.thumbnail
                    ? `url(${course.thumbnail}) center/cover`
                    : getCourseGradient(course._id),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '3.5rem', position: 'relative',
                }}>
                  {!course.thumbnail && (categoryIcons[course.category] || '📖')}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, height: 40,
                    background: 'linear-gradient(to top, rgba(26,26,26,1), transparent)',
                  }} />
                  {course.featured && (
                    <div style={{
                      position: 'absolute', top: 10, right: 10,
                      background: 'rgba(212,175,55,0.9)', color: '#0A0A0A',
                      padding: '3px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700,
                    }}>مميزة ⭐</div>
                  )}
                </div>

                {/* Body */}
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span className={`badge level-${course.level}`}>{levelLabels[course.level]}</span>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#888' }}>{course.category}</span>
                  </div>
                  <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '0.95rem', marginBottom: 6, lineHeight: 1.4 }}>
                    {course.title}
                  </h3>
                  <p style={{
                    color: '#666', fontSize: '0.78rem', lineHeight: 1.5, marginBottom: 12,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                  }}>
                    {course.description}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', fontWeight: 700, color: '#0A0A0A',
                    }}>
                      {course.instructor[0]}
                    </div>
                    <span style={{ fontSize: '0.78rem', color: '#888' }}>{course.instructor}</span>
                  </div>

                  <div className="divider-gold" style={{ marginBottom: 12 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <span style={{ fontSize: '0.72rem', color: '#666' }}>📖 {course.lessons?.length || 0} درس</span>
                      <span style={{ fontSize: '0.72rem', color: '#666' }}>👥 {course.enrolledStudents?.length || 0}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <StarRating rating={course.rating} />
                      <span style={{ fontSize: '0.75rem', color: '#D4AF37', fontWeight: 600, marginRight: 2 }}>
                        {course.rating?.toFixed(1) || '0.0'}
                      </span>
                      <span style={{ fontSize: '0.68rem', color: '#555' }}>
                        ({course.ratingsCount || 0})
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filtered.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          background: 'rgba(255,255,255,0.02)', borderRadius: 20,
          border: '1px solid rgba(255,255,255,0.04)',
        }}>
          <div style={{
            fontSize: '4rem', marginBottom: 16,
            animation: 'float 3s ease-in-out infinite',
          }}>📭</div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#888', marginBottom: 8 }}>
            {courses.length === 0 ? 'لا توجد دورات بعد' : 'لا توجد دورات بهذه المعايير'}
          </h3>
          <p style={{ color: '#555', fontSize: '0.85rem', marginBottom: 20, maxWidth: 400, margin: '0 auto 20px' }}>
            {courses.length === 0
              ? 'سيتم إضافة دورات جديدة قريباً، ترقبوا!'
              : 'جرّب تغيير معايير البحث أو الفلاتر'
            }
          </p>
          {(search || activeCategory !== 'الكل' || activeLevel !== 'الكل') && (
            <button className="btn-outline" onClick={() => { setSearch(''); setActiveCategory('الكل'); setActiveLevel('الكل'); }}>
              إعادة ضبط الفلاتر
            </button>
          )}
        </div>
      )}

      {/* Floating Create Button for trainers/admins */}
      {isTrainerOrAdmin && (
        <Link href="/courses/create" style={{ textDecoration: 'none' }}>
          <div
            style={{
              position: 'fixed',
              bottom: 90,
              left: 32,
              background: 'linear-gradient(135deg, #A8860F, #D4AF37, #F5D060)',
              color: '#0A0A0A',
              padding: '14px 24px',
              borderRadius: 50,
              fontWeight: 700,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(212,175,55,0.4)',
              transition: 'all 0.3s ease',
              zIndex: 50,
              animation: 'pulse-gold 2s ease infinite',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px) scale(1.05)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(212,175,55,0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(212,175,55,0.4)';
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>+</span>
            إنشاء دورة جديدة
          </div>
        </Link>
      )}
    </AppLayout>
  );
}
