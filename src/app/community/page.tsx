'use client';
import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function CommunityPage() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCommentPost, setActiveCommentPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetch('/api/posts/upload?sort=latest')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPosts(data.posts.map((p: any) => ({
            ...p,
            id: p._id.toString(),
            hasLiked: p.likes.includes(userId),
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userId]);

  const handleLike = async (postId: string) => {
    if (!userId) return alert('يجب تسجيل الدخول للإعجاب');
    
    // التحديث المباشر للواجهة
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          hasLiked: !p.hasLiked,
          likesCount: p.hasLiked ? p.likesCount - 1 : p.likesCount + 1
        };
      }
      return p;
    }));

    try {
      await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
    } catch (e) {
      console.error(e);
    }
  };

  const submitComment = async (postId: string) => {
    if (!userId) return alert('يجب تسجيل الدخول للتعليق');
    if (!commentText.trim()) return;

    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: commentText }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              comments: [...p.comments, data.comment]
            };
          }
          return p;
        }));
        setCommentText('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <AppLayout>
      <div style={{ maxWidth: 600, margin: '0 auto', paddingBottom: 60 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
              🎥 <span className="text-gradient">مجتمع الفيديو</span>
            </h1>
            <p style={{ color: '#666', fontSize: '0.85rem', marginTop: 4 }}>شارك خطاباتك وتفاعل مع القادة</p>
          </div>
          <Link href="/upload" className="btn-gold" style={{ fontSize: '0.85rem' }}>+ رفع فيديو</Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#D4AF37' }}>جاري التحميل...</div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60, background: '#111', borderRadius: 16 }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎬</div>
            <p style={{ color: '#888' }}>لا توجد فيديوهات حالياً. كن أول من يشارك!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {posts.map(post => (
              <div key={post.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Header */}
                <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, color: '#0A0A0A',
                  }}>
                    {post.userName?.[0] || 'م'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{post.userName}</div>
                    <div style={{ fontSize: '0.7rem', color: '#666' }}>{new Date(post.createdAt).toLocaleDateString('ar-EG')}</div>
                  </div>
                  {post.type === 'challenge_entry' && (
                    <span style={{ marginRight: 'auto', fontSize: '0.7rem', background: 'rgba(212,175,55,0.1)', color: '#D4AF37', padding: '4px 10px', borderRadius: 100 }}>
                      مشاركة في تحدي 🏆
                    </span>
                  )}
                </div>

                {/* Video Player (or link) */}
                <div style={{ background: '#000', width: '100%', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {post.videoUrl.includes('youtube.com') || post.videoUrl.includes('youtu.be') ? (
                    <iframe
                      width="100%" height="100%"
                      src={`https://www.youtube.com/embed/${post.videoUrl.split('v=')[1]?.split('&')[0] || post.videoUrl.split('/').pop()}`}
                      frameBorder="0" allowFullScreen
                    />
                  ) : (
                    <video src={post.videoUrl} controls style={{ width: '100%', height: '100%' }} />
                  )}
                </div>

                {/* Info & Actions */}
                <div style={{ padding: '16px 20px' }}>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8, color: '#fff' }}>{post.title}</h3>
                  {post.caption && <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: 16 }}>{post.caption}</p>}
                  
                  {post.tags?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                      {post.tags.map((tag: string) => <span key={tag} className="tag">#{tag}</span>)}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 20, borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 16 }}>
                    <button onClick={() => handleLike(post.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
                      color: post.hasLiked ? '#ef4444' : '#888', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, transition: 'color 0.2s'
                    }}>
                      {post.hasLiked ? '❤️' : '🤍'} {post.likesCount}
                    </button>
                    
                    <button onClick={() => setActiveCommentPost(activeCommentPost === post.id ? null : post.id)} style={{
                      display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none',
                      color: '#888', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600
                    }}>
                      💬 {post.comments?.length || 0}
                    </button>
                  </div>

                  {/* Comments Section */}
                  {activeCommentPost === post.id && (
                    <div style={{ marginTop: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: 16 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 200, overflowY: 'auto', marginBottom: 12 }}>
                        {post.comments?.length === 0 ? (
                          <div style={{ color: '#555', fontSize: '0.8rem', textAlign: 'center' }}>لا توجد تعليقات بعد</div>
                        ) : (
                          post.comments?.map((c: any, i: number) => (
                            <div key={i} style={{ display: 'flex', gap: 10 }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#fff', flexShrink: 0 }}>
                                {c.userName?.[0] || 'م'}
                              </div>
                              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '0 12px 12px 12px', flex: 1 }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#D4AF37', marginBottom: 4 }}>{c.userName}</div>
                                <div style={{ fontSize: '0.85rem', color: '#eee', lineHeight: 1.5 }}>{c.text}</div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input
                          type="text"
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                          placeholder="أضف تعليقاً..."
                          style={{ flex: 1, background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
                          onKeyDown={e => e.key === 'Enter' && submitComment(post.id)}
                        />
                        <button onClick={() => submitComment(post.id)} className="btn-gold" style={{ padding: '0 16px', fontSize: '0.8rem' }}>إرسال</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
