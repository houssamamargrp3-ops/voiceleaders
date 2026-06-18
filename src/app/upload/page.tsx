'use client';
import { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useRouter } from 'next/navigation';

export default function UploadPage() {
  const router = useRouter();
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [form, setForm] = useState({ title: '', description: '', tags: '', challenge: '' });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith('video/')) setFile(f);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleUpload = async () => {
    if (!file || !form.title) return;
    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('tags', form.tags);
    formData.append('challenge', form.challenge);

    const xhr = new XMLHttpRequest();
    
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      setUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        router.push('/feed');
      } else {
        alert('حدث خطأ أثناء الرفع: ' + xhr.responseText);
      }
    };

    xhr.onerror = () => {
      setUploading(false);
      alert('حدث خطأ في الاتصال أثناء الرفع.');
    };

    xhr.open('POST', '/api/videos/upload');
    xhr.send(formData);
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <div className="badge badge-gold" style={{ marginBottom: 10 }}>📹 رفع فيديو</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
            شارك <span className="text-gradient">خطابتك</span>
          </h1>
          <p style={{ color: '#666', fontSize: '0.9rem', marginTop: 6 }}>
            ارفع فيديو خطابتك وانضم لمجتمع الخطباء
          </p>
        </div>

        {/* Upload Area */}
        {!file ? (
          <div
            id="upload-drop-zone"
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${dragOver ? '#D4AF37' : 'rgba(212,175,55,0.25)'}`,
              borderRadius: 20,
              padding: '60px 40px',
              textAlign: 'center',
              background: dragOver ? 'rgba(212,175,55,0.05)' : 'rgba(255,255,255,0.02)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              marginBottom: 24,
            }}
            onClick={() => document.getElementById('file-input')?.click()}>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎬</div>
            <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 8, color: '#ddd' }}>
              اسحب الفيديو هنا أو انقر للاختيار
            </h3>
            <p style={{ color: '#555', fontSize: '0.85rem', marginBottom: 20 }}>
              MP4, MOV, AVI — بحد أقصى 500 ميجابايت
            </p>
            <button className="btn-outline" style={{ fontSize: '0.9rem' }}>
              📁 اختر ملفاً
            </button>
            <input id="file-input" type="file" accept="video/*" style={{ display: 'none' }} onChange={handleFileChange} />
          </div>
        ) : (
          <div style={{
            padding: 20, borderRadius: 16,
            background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)',
            display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24,
          }}>
            <span style={{ fontSize: '2.5rem' }}>🎥</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: '#4ade80', fontSize: '0.9rem' }}>{file.name}</div>
              <div style={{ color: '#666', fontSize: '0.78rem', marginTop: 2 }}>
                {(file.size / 1024 / 1024).toFixed(1)} MB · جاهز للرفع
              </div>
            </div>
            <button onClick={() => setFile(null)} style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: '0.8rem',
            }}>إزالة</button>
          </div>
        )}

        {/* Form */}
        <div className="card" style={{ padding: 28 }}>
          <h3 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 20, color: '#D4AF37' }}>
            📝 تفاصيل الفيديو
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: 6, fontWeight: 500 }}>
                عنوان الخطابة *
              </label>
              <input id="video-title" className="input" placeholder="أعطِ عنواناً جذاباً لفيديوك..."
                value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: 6, fontWeight: 500 }}>
                الوصف
              </label>
              <textarea id="video-desc" className="input" rows={3}
                placeholder="صف موضوع خطابتك، وما تريد أن يتعلمه المشاهد..."
                style={{ resize: 'vertical', fontFamily: 'Inter, sans-serif' }}
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: 6, fontWeight: 500 }}>
                الوسوم (مفصولة بفاصلة)
              </label>
              <input id="video-tags" className="input" placeholder="خطابة، ارتجال، تحفيز..."
                value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
              {form.tags && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  {form.tags.split('،').map(t => t.trim()).filter(Boolean).map(t => (
                    <span key={t} className="tag">#{t}</span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#888', marginBottom: 6, fontWeight: 500 }}>
                ربط بتحدٍّ (اختياري)
              </label>
              <select id="video-challenge" className="input" value={form.challenge}
                onChange={e => setForm({ ...form, challenge: e.target.value })}
                style={{ background: '#242424' }}>
                <option value="">لا يوجد تحدٍّ</option>
                <option value="c1">تحدي الخطاب التحفيزي 🔥</option>
                <option value="c3">تحدي لغة الجسد 🤝 (قادم)</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Analysis Option */}
        <div style={{
          marginTop: 20, padding: '16px 20px', borderRadius: 14,
          background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.2)',
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <span style={{ fontSize: '1.5rem' }}>🤖</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#c084fc' }}>
              تحليل الذكاء الاصطناعي
            </div>
            <div style={{ fontSize: '0.75rem', color: '#666', marginTop: 2 }}>
              احصل على تحليل فوري لأدائك: السرعة، الوضوح، التوقفات، والنصائح
            </div>
          </div>
          <label style={{ position: 'relative', display: 'inline-block', width: 42, height: 22 }}>
            <input type="checkbox" defaultChecked style={{ opacity: 0, width: 0, height: 0 }} />
            <span style={{
              position: 'absolute', inset: 0, borderRadius: 22, cursor: 'pointer',
              background: 'linear-gradient(90deg, #A8860F, #D4AF37)',
              transition: 'all 0.3s',
            }} />
          </label>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div style={{ marginTop: 20, padding: 20, background: '#111', borderRadius: 14, border: '1px solid rgba(212,175,55,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: '0.85rem', color: '#ddd' }}>جاري الرفع...</span>
              <span style={{ fontSize: '0.85rem', color: '#D4AF37', fontWeight: 700 }}>{uploadProgress}%</span>
            </div>
            <div style={{ height: 6, background: '#1A1A1A', borderRadius: 3 }}>
              <div style={{
                height: '100%', borderRadius: 3, width: `${uploadProgress}%`,
                background: 'linear-gradient(90deg, #A8860F, #D4AF37)',
                transition: 'width 0.1s ease',
              }} />
            </div>
            <div style={{ marginTop: 10 }}>
              <div className="ai-wave" style={{ justifyContent: 'center' }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="ai-wave-bar" style={{ animationDelay: `${i * 0.1}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
          <button className="btn-ghost" style={{ padding: '12px 24px' }}
            onClick={() => router.back()}>
            إلغاء
          </button>
          <button
            id="upload-submit"
            className="btn-gold"
            style={{ flex: 1, padding: 14, fontSize: '1rem' }}
            disabled={!file || !form.title || uploading}
            onClick={handleUpload}>
            {uploading ? `جاري الرفع... ${uploadProgress}%` : '🚀 نشر الفيديو'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
