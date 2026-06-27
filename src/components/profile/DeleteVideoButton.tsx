'use client';
import { useState } from 'react';

export default function DeleteVideoButton({ videoId }: { videoId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);

  const handleDelete = async () => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا الفيديو بشكل نهائي؟')) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/videos/${videoId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setIsDeleted(true);
      } else {
        alert(data.error || 'حدث خطأ أثناء الحذف');
        setIsDeleting(false);
      }
    } catch (e) {
      console.error(e);
      alert('فشل الاتصال بالخادم');
      setIsDeleting(false);
    }
  };

  if (isDeleted) {
    return (
      <div style={{ padding: '8px 12px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', textAlign: 'center', fontSize: '0.8rem', borderRadius: 8 }}>
        تم الحذف
      </div>
    );
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      style={{
        background: 'rgba(239, 68, 68, 0.1)', border: 'none', color: '#ef4444',
        cursor: isDeleting ? 'not-allowed' : 'pointer', fontSize: '0.8rem', padding: '6px 12px', borderRadius: 8, fontWeight: 600,
        opacity: isDeleting ? 0.5 : 1
      }}
    >
      {isDeleting ? 'جاري الحذف...' : '🗑️ حذف'}
    </button>
  );
}
