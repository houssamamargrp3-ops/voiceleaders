import { useState } from 'react';

export default function EvaluateModal({ evaluation, onClose, onSuccess }: { evaluation: any; onClose: () => void; onSuccess: () => void }) {
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!score || Number(score) < 0 || Number(score) > 100) {
      setError('التقييم يجب أن يكون بين 0 و 100');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/submissions/${evaluation.id}/evaluate`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: Number(score), feedback }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء حفظ التقييم');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div className="card" style={{ width: '100%', maxWidth: 600, padding: 30, borderRadius: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>تقييم المتدرب: {evaluation.user}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#D4AF37', marginBottom: 8, fontWeight: 600 }}>
            رابط تطبيق المتدرب
          </label>
          <a href={evaluation.videoUrl} target="_blank" rel="noreferrer" style={{
            display: 'block', padding: 12, background: 'rgba(255,255,255,0.05)', borderRadius: 10,
            color: '#60a5fa', textDecoration: 'none', wordBreak: 'break-all'
          }}>
            🔗 {evaluation.videoUrl}
          </a>
        </div>

        {error && <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: 16 }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#888', marginBottom: 8 }}>التقييم (من 100)</label>
            <input 
              type="number" 
              min="0" max="100" 
              required
              className="input"
              value={score}
              onChange={e => setScore(e.target.value)}
              placeholder="مثال: 85"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#888', marginBottom: 8 }}>ملاحظات التقييم (اختياري)</label>
            <textarea 
              className="input"
              rows={4}
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="اكتب ملاحظاتك التشجيعية والتصحيحية للمتدرب هنا..."
            />
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} className="btn-ghost">إلغاء</button>
            <button type="submit" className="btn-gold" disabled={loading}>
              {loading ? 'جاري الحفظ...' : 'حفظ التقييم'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
