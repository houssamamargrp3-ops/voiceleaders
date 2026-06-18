'use client';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';

const levelColors: Record<string, string> = { advanced: '#D4AF37', intermediate: '#60a5fa', beginner: '#4ade80' };
const levelLabels: Record<string, string> = { advanced: 'متقدم', intermediate: 'متوسط', beginner: 'مبتدئ' };

const videoColors = [
  'linear-gradient(135deg, #0f0c29, #302b63)',
  'linear-gradient(135deg, #1a1a2e, #16213e)',
  'linear-gradient(135deg, #0d0d0d, #1a0a00)',
  'linear-gradient(135deg, #0a0a1a, #1a0a2a)',
];

export default function FeedPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('الكل');
  const [activeComment, setActiveComment] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);

  const filters = ['الكل', 'الأكثر إعجاباً', 'الأحدث', 'متابَعون'];

  useEffect(() => {
    fetch('/api/videos')
      .then(res => res.json())
      .then(data => {
        setVideos(data.videos || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching videos:', err);
        setLoading(false);
      });
  }, []);

  const toggleLike = (id: string) => {
    setVideos(prev => prev.map(v => {
      if (v._id === id) {
        const currentLikes = typeof v.likes === 'number' ? v.likes : (v.likes?.length || 0);
        return { ...v, liked: !v.liked, likes: v.liked ? currentLikes - 1 : currentLikes + 1 };
      }
      return v;
    }));
  };

  const formatNumber = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;

  return (
    <AppLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            🎥 مجتمع <span className="text-gradient">الفيديو</span>
          </h1>
          <p style={{ color: '#666', fontSize: '0.85rem', marginTop: 4 }}>
            شاهد، أعجب، وتعلم من خطباء المجتمع
          </p>
        </div>
        <a href="/upload" className="btn-gold" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }}>
          ⬆️ ارفع فيديو
        </a>
      </div>

      {/* Filters */}
      <div className="filter-bar" style={{ marginBottom: 28 }}>
        {filters.map(f => (
          <button key={f} id={`feed-filter-${f}`} className={`filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}>
            {f}
          </button>
        ))}
      </div>

      {/* Video Grid - TikTok style layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
        {videos.map((video, idx) => (
          <div key={video._id} id={`video-${video._id}`} className="feed-video">
            {/* Thumbnail or Video Player */}
            <div style={{
              aspectRatio: '16/9',
              background: videoColors[idx % videoColors.length],
              position: 'relative', overflow: 'hidden', cursor: 'pointer',
            }} onClick={() => setPlayingVideo(playingVideo === video._id ? null : video._id)}>
              {playingVideo === video._id ? (
                <video
                  src={video.url}
                  controls
                  autoPlay
                  style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }}
                  onClick={(e) => e.stopPropagation()} // Prevent closing when clicking video controls
                />
              ) : (
                <>
                  {/* Play button overlay */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '3rem', color: 'rgba(255,255,255,0.15)',
                  }}>
                    🎤
                  </div>
                  <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: '50%',
                      background: 'rgba(212,175,55,0.9)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem', color: '#0A0A0A',
                      boxShadow: '0 4px 20px rgba(212,175,55,0.4)',
                      cursor: 'pointer', transition: 'transform 0.2s ease',
                    }}>▶</div>
                  </div>
                </>
              )}

              {/* Duration */}
              <div style={{
                position: 'absolute', bottom: 8, left: 10,
                background: 'rgba(0,0,0,0.75)', borderRadius: 5,
                padding: '2px 8px', fontSize: '0.72rem', color: '#ddd',
              }}>
                ⏱️ {video.duration || '0:00'}
              </div>

              {/* Views */}
              <div style={{
                position: 'absolute', bottom: 8, right: 10,
                background: 'rgba(0,0,0,0.75)', borderRadius: 5,
                padding: '2px 8px', fontSize: '0.72rem', color: '#ddd',
              }}>
                👁️ {formatNumber(video.views || 0)}
              </div>
            </div>

            {/* Content */}
            <div style={{ padding: 16 }}>
              {/* User info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.85rem', color: '#0A0A0A',
                  flexShrink: 0, border: '2px solid rgba(212,175,55,0.3)',
                }}>
                  {(video.userName || 'م')[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: '#fff' }}>{video.userName}</div>
                  <span style={{ fontSize: '0.65rem', color: levelColors[video.userLevel || 'beginner'], fontWeight: 600 }}>
                    {levelLabels[video.userLevel || 'beginner']}
                  </span>
                </div>
                <button className="btn-ghost" style={{ marginRight: 'auto', fontSize: '0.7rem', padding: '5px 12px' }}>
                  + متابعة
                </button>
              </div>

              {/* Title */}
              <h3 style={{
                fontWeight: 600, fontSize: '0.9rem', color: '#ddd',
                lineHeight: 1.5, marginBottom: 8,
                display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {video.title}
              </h3>

              {/* Tags */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {video.tags?.map((tag: string) => (
                  <span key={tag} className="tag">#{tag}</span>
                ))}
              </div>

              {/* Actions */}
              <div className="divider-gold" style={{ marginBottom: 12 }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {/* Like */}
                <button
                  id={`like-${video._id}`}
                  onClick={() => toggleLike(video._id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '7px 12px', borderRadius: 8, border: 'none',
                    background: video.liked ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)',
                    color: video.liked ? '#f87171' : '#888',
                    cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500,
                    transition: 'all 0.2s ease',
                  }}>
                  <span style={{ fontSize: '1rem' }}>{video.liked ? '❤️' : '🤍'}</span>
                  {formatNumber(typeof video.likes === 'number' ? video.likes : (video.likes?.length || 0))}
                </button>

                {/* Comment */}
                <button
                  id={`comment-${video._id}`}
                  onClick={() => setActiveComment(activeComment === video._id ? null : video._id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '7px 12px', borderRadius: 8, border: 'none',
                    background: 'rgba(255,255,255,0.04)',
                    color: activeComment === video._id ? '#D4AF37' : '#888',
                    cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500,
                  }}>
                  <span>💬</span>
                  {typeof video.comments === 'number' ? video.comments : (video.comments?.length || 0)}
                </button>

                {/* Share */}
                <button style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '7px 12px', borderRadius: 8, border: 'none',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#888', cursor: 'pointer', fontSize: '0.78rem',
                }}>
                  <span>🔗</span>
                </button>

                {/* Rating */}
                <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center', gap: 3 }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <span key={star} style={{ color: star <= 4 ? '#D4AF37' : '#333', fontSize: '0.85rem', cursor: 'pointer' }}>★</span>
                  ))}
                </div>
              </div>

              {/* Comment Box */}
              {activeComment === video.id && (
                <div style={{ marginTop: 12, animation: 'fadeInUp 0.2s ease' }}>
                  <div style={{
                    height: 1, background: 'rgba(255,255,255,0.04)', marginBottom: 12,
                  }} />
                  {/* Sample comments */}
                  <div style={{ marginBottom: 10, maxHeight: 120, overflowY: 'auto' }}>
                    {['رائع جداً! استمر 🔥', 'تعلمت شيئاً جديداً منك'].map((c, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, #A8860F, #D4AF37)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.65rem', fontWeight: 700, color: '#0A0A0A',
                        }}>م</div>
                        <div style={{
                          background: 'rgba(255,255,255,0.03)', borderRadius: 8,
                          padding: '7px 10px', fontSize: '0.78rem', color: '#aaa',
                        }}>{c}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      placeholder="اكتب تعليقاً..."
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      style={{
                        flex: 1, background: '#1A1A1A', border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: '0.8rem',
                        outline: 'none', fontFamily: 'Inter, sans-serif',
                      }}
                    />
                    <button className="btn-gold" style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                      onClick={() => setNewComment('')}>
                      أرسل
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <div style={{ textAlign: 'center', marginTop: 36 }}>
        <button id="load-more" className="btn-ghost" style={{ padding: '12px 40px' }}>
          ⬇️ تحميل المزيد
        </button>
      </div>
    </AppLayout>
  );
}
