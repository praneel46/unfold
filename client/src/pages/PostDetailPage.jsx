import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import TopHeader from '../components/layout/TopHeader';
import PostCard from '../components/post/PostCard';
import { PostSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/posts/${id}`);
      if (res.success && res.post) {
        setPost(res.post);
      }
    } catch (err) {
      console.error('Failed to fetch post:', err);
      addToast('Thought not found', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePostDeleted = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen">
      {/* Back button header */}
      <div className="sticky top-0 z-30 bg-paper-50/90 dark:bg-ink-950/90 backdrop-blur-md border-b border-paper-200 dark:border-ink-800 px-4 sm:px-6 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-1.5 -ml-1 rounded-full text-ink-600 dark:text-ink-300 hover:bg-paper-200 dark:hover:bg-ink-800 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-serif text-lg font-bold text-ink-900 dark:text-ink-50">
          Thought Thread
        </h1>
      </div>

      {loading ? (
        <PostSkeleton />
      ) : !post ? (
        <EmptyState
          icon={Sparkles}
          title="Thought not found"
          description="The thought you are looking for might have been folded back or removed."
          actionLabel="Return to Feed"
          onAction={() => navigate('/')}
        />
      ) : (
        <div>
          <PostCard
            post={post}
            onPostDeleted={handlePostDeleted}
            showFullComments={true}
          />
        </div>
      )}
    </div>
  );
}
