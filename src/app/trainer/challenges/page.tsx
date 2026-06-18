'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';

export default function TrainerChallengesPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', description: '', week: '', deadline: '', prize: '', status: 'active'
  });

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/trainer/challenges');
      const data = await res.json();
      if (data.success) {
        setChallenges(data.challenges);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/trainer/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ title: '', description: '', week: '', deadline: '', prize: '', status: 'active' });
        fetchChallenges();
      } else {
        alert('حدث خطأ أثناء إضافة التحدي');
      }
    } catch (err) {
      alert('حدث خطأ في الاتصال');
    }
  };

  return (
    <AppLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="badge badge-gold" style={{ marginBottom: 10 }}>👨‍🏫 لوحة المدرب</div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>
            إدارة <span className="text-gradient">التحديات</span>
          </h1>
          <p style={{ color: '#666', fontSize: '0.85rem', marginTop: 4 }}>أنشئ تحديات جديدة لطلابك وحفزهم على المشاركة</p>
        </div>
        <button className="btn-gold" onClick={() => setIsModalOpen(true)} style={{ fontSize: '0.85rem' }}>
          + إنشاء تحدي جديد
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: '#D4AF37' }}>جاري التحميل...</div>
      ) : challenges.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', background: '#111', borderRadius: 16 }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎯</div>
          <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: 8 }}>لا توجد تحديات حالياً</h3>
          <p style={{ color: '#888', marginBottom: 20 }}>ابدأ بإضافة تحدي جديد لتحفيز متدربيك.</p>
          <button className="btn-gold" onClick={() => setIsModalOpen(true)}>إنشاء تحدي الآن</button>
        </div>
      ) : (
        <div className="grid-2">
          {challenges.map(challenge => (
            <div key={challenge.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className={`badge ${challenge.status === 'active' ? 'badge-gold' : 'badge-red'}`} style={{ fontSize: '0.65rem' }}>
                  {challenge.status === 'active' ? 'نشط' : challenge.status === 'closed' ? 'مغلق' : 'قادم'}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#888' }}>{challenge.week}</span>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: '#fff' }}>{challenge.title}</h3>
              <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: 16, lineHeight: 1.6 }}>{challenge.description}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                <span style={{ color: '#D4AF37' }}>🏆 الجائزة: {challenge.prize}</span>
                <span style={{ color: '#ef4444' }}>⏳ الانتهاء: {challenge.deadline}</span>
              </div>
              
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', color: '#666' }}>👥 {challenge.participantsCount} مشاركات</span>
                <button className="btn-ghost" style={{ fontSize: '0.75rem', padding: '4px 12px' }}>تعديل</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
          <div style={{
            background: '#1A1A1A', padding: 32, borderRadius: 20, width: '100%', maxWidth: 500,
            border: '1px solid rgba(212,175,55,0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>إضافة تحدي جديد</h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: 6 }}>عنوان التحدي</label>
                <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input-field" placeholder="مثال: تحدي الارتجال السريع" />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: 6 }}>الوصف والمطلوب</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-field" rows={3} placeholder="اشرح ما هو المطلوب من المتدربين..." />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: 6 }}>تاريخ الإغلاق</label>
                  <input required type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="input-field" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: 6 }}>الأسبوع</label>
                  <input required value={formData.week} onChange={e => setFormData({...formData, week: e.target.value})} className="input-field" placeholder="الأسبوع 15" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#aaa', marginBottom: 6 }}>الجائزة / النقاط</label>
                <input required value={formData.prize} onChange={e => setFormData({...formData, prize: e.target.value})} className="input-field" placeholder="100 نقطة + شارة التميز" />
              </div>

              <button type="submit" className="btn-gold" style={{ marginTop: 12, padding: '12px' }}>
                نشر التحدي
              </button>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
