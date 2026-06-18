'use client';
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { mockEvents } from '@/lib/mockData';

const typeColors: Record<string, string> = {
  ملتقى: '#D4AF37', ورشة: '#60a5fa', مسابقة: '#f87171', ندوة: '#4ade80',
};

export default function EventsPage() {
  const [filter, setFilter] = useState('الكل');
  const [countryFilter, setCountryFilter] = useState('الكل');
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);
  const [showSuccessId, setShowSuccessId] = useState<string | null>(null);

  const types = ['الكل', 'ملتقى', 'ورشة', 'مسابقة', 'ندوة'];
  const countries = ['الكل', 'السعودية', 'الإمارات', 'دولي', 'أونلاين'];

  const filtered = mockEvents.filter(e => {
    if (filter !== 'الكل' && e.type !== filter) return false;
    if (countryFilter !== 'الكل' && e.country !== countryFilter && e.city !== countryFilter) return false;
    return true;
  });

  const featured = mockEvents.filter(e => e.featured);

  const handleRegister = (eventId: string) => {
    if (!registeredIds.includes(eventId)) {
      setRegisteredIds(prev => [...prev, eventId]);
      setShowSuccessId(eventId);
      setTimeout(() => setShowSuccessId(null), 3000);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getMonthDay = (dateStr: string) => {
    const d = new Date(dateStr);
    return {
      day: d.getDate(),
      month: d.toLocaleDateString('ar-SA', { month: 'short' }),
    };
  };

  return (
    <AppLayout>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div className="badge badge-gold" style={{ marginBottom: 10 }}>📅 الفعاليات</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
          ملتقيات وورشات <span className="text-gradient">لا تُفوَّت</span>
        </h1>
        <p style={{ color: '#666', fontSize: '0.9rem', marginTop: 6 }}>
          {mockEvents.length} فعاليات قادمة من {new Set(mockEvents.map(e => e.country)).size} دول
        </p>
      </div>

      {/* Featured Events */}
      {featured.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <h2 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16, color: '#D4AF37' }}>⭐ أبرز الفعاليات</h2>
          <div className="grid-2">
            {featured.map(event => {
              const date = getMonthDay(event.date);
              const isRegistered = registeredIds.includes(event.id);
              const capacity = Math.round((event.registered / event.capacity) * 100);
              return (
                <div key={event.id} style={{
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.06), rgba(0,0,0,0.2))',
                  border: '1px solid rgba(212,175,55,0.2)',
                  borderRadius: 20, overflow: 'hidden',
                }}>
                  {/* Header image area */}
                  <div style={{
                    height: 140,
                    background: `linear-gradient(135deg, hsl(${event.type === 'ملتقى' ? 40 : event.type === 'مسابقة' ? 0 : 220}, 25%, 12%), hsl(${event.type === 'ملتقى' ? 40 : 0}, 15%, 6%))`,
                    position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '4rem',
                  }}>
                    {event.type === 'ملتقى' ? '🎙️' : event.type === 'مسابقة' ? '🏆' : event.online ? '💻' : '📚'}
                    <div style={{
                      position: 'absolute', top: 14, right: 14,
                      background: `${typeColors[event.type]}22`,
                      border: `1px solid ${typeColors[event.type]}60`,
                      color: typeColors[event.type],
                      padding: '4px 12px', borderRadius: 100, fontSize: '0.72rem', fontWeight: 700,
                    }}>
                      {event.type}
                    </div>
                    {event.online && (
                      <div style={{
                        position: 'absolute', top: 14, left: 14,
                        background: 'rgba(96,165,250,0.2)', border: '1px solid rgba(96,165,250,0.4)',
                        color: '#60a5fa', padding: '4px 10px', borderRadius: 100, fontSize: '0.68rem', fontWeight: 600,
                      }}>
                        🌐 أونلاين
                      </div>
                    )}
                  </div>

                  <div style={{ padding: '20px 22px' }}>
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: '#fff', marginBottom: 8, lineHeight: 1.4 }}>
                      {event.title}
                    </h3>
                    <p style={{ color: '#777', fontSize: '0.8rem', lineHeight: 1.6, marginBottom: 14,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {event.description}
                    </p>

                    <div style={{ display: 'flex', gap: 14, marginBottom: 14, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.78rem', color: '#888' }}>📅 {formatDate(event.date)}</span>
                      <span style={{ fontSize: '0.78rem', color: '#888' }}>⏰ {event.time}</span>
                      <span style={{ fontSize: '0.78rem', color: '#888' }}>📍 {event.city}</span>
                    </div>

                    {/* Capacity bar */}
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: '0.72rem', color: '#666' }}>المقاعد المتبقية</span>
                        <span style={{ fontSize: '0.72rem', color: capacity > 80 ? '#f87171' : '#D4AF37' }}>
                          {event.capacity - event.registered} من {event.capacity}
                        </span>
                      </div>
                      <div style={{ height: 4, background: '#1A1A1A', borderRadius: 2 }}>
                        <div style={{
                          height: '100%', borderRadius: 2, width: `${capacity}%`,
                          background: capacity > 80 ? '#f87171' : 'linear-gradient(90deg, #A8860F, #D4AF37)',
                        }} />
                      </div>
                    </div>

                    {isRegistered ? (
                      <div style={{
                        padding: '10px 16px', borderRadius: 8, textAlign: 'center',
                        background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
                        color: '#4ade80', fontSize: '0.85rem', fontWeight: 600,
                      }}>
                        ✅ مسجّل - سيصلك تأكيد على بريدك
                      </div>
                    ) : (
                      <button id={`register-${event.id}`} className="btn-gold"
                        style={{ width: '100%', padding: 11 }}
                        onClick={() => handleRegister(event.id)}>
                        🎟️ سجّل الآن - مجاناً
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ marginBottom: 24 }}>
        <div className="filter-bar" style={{ marginBottom: 10 }}>
          {types.map(t => (
            <button key={t} id={`type-${t}`} className={`filter-chip ${filter === t ? 'active' : ''}`}
              onClick={() => setFilter(t)}>
              {t}
            </button>
          ))}
        </div>
        <div className="filter-bar">
          {countries.map(c => (
            <button key={c} id={`country-${c}`} className={`filter-chip ${countryFilter === c ? 'active' : ''}`}
              onClick={() => setCountryFilter(c)}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {filtered.map(event => {
          const date = getMonthDay(event.date);
          const isRegistered = registeredIds.includes(event.id);
          return (
            <div key={event.id} id={`event-${event.id}`} className="event-card">
              <div style={{ display: 'flex', gap: 16, padding: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Date Badge */}
                <div className="event-date-badge" style={{ flexShrink: 0 }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D4AF37', lineHeight: 1 }}>{date.day}</div>
                  <div style={{ fontSize: '0.68rem', color: '#A8860F', fontWeight: 600, marginTop: 2 }}>{date.month}</div>
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '0.68rem', fontWeight: 700, padding: '3px 10px', borderRadius: 100,
                      background: `${typeColors[event.type]}18`,
                      border: `1px solid ${typeColors[event.type]}40`,
                      color: typeColors[event.type],
                    }}>{event.type}</span>
                    {event.online && (
                      <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>🌐 أونلاين</span>
                    )}
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff', marginBottom: 6 }}>
                    {event.title}
                  </h3>
                  <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>⏰ {event.time} - {event.endTime}</span>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>📍 {event.location}, {event.city}</span>
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>👥 {event.registered}/{event.capacity}</span>
                  </div>
                </div>

                {/* CTA */}
                <div style={{ flexShrink: 0 }}>
                  {isRegistered ? (
                    <div style={{
                      padding: '8px 16px', borderRadius: 8, fontSize: '0.8rem',
                      background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)',
                      color: '#4ade80', fontWeight: 600,
                    }}>✅ مسجّل</div>
                  ) : (
                    <button id={`reg-list-${event.id}`} className="btn-outline"
                      style={{ fontSize: '0.82rem', padding: '9px 20px' }}
                      onClick={() => handleRegister(event.id)}>
                      تسجيل
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: '#444' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>📭</div>
          <p>لا توجد فعاليات بهذه المعايير</p>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessId && (
        <div style={{
          position: 'fixed', bottom: 90, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.4)',
          color: '#4ade80', padding: '14px 28px', borderRadius: 12,
          fontWeight: 600, fontSize: '0.9rem',
          backdropFilter: 'blur(10px)', zIndex: 9999,
          animation: 'fadeInUp 0.3s ease',
          boxShadow: '0 8px 30px rgba(0,0,0,0.4)',
        }}>
          ✅ تم التسجيل بنجاح! سيصلك تأكيد على بريدك الإلكتروني
        </div>
      )}
    </AppLayout>
  );
}
