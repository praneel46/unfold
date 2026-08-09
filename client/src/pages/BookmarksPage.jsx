import React, { useState, useEffect } from 'react';
import { Bookmark, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import TopHeader from '../components/layout/TopHeader';
import PostCard from '../components/post/PostCard';
import { PostSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';

export default function BookmarksPage() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/users/bookmarks/saved');
      if (res.success && res.posts) {
        setBookmarks(res.posts);
      }
    } catch (err) {
      console.error('Failed to load bookmarks:', err);
      addToast('Failed to load reading archive', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePostDeleted = (deletedId) => {
    setBookmarks((prev) => prev.filter((p) => p.id !== deletedId));
  };

  return (
    <div className="min-h-screen">
      <TopHeader title="Reading Archive" />

      <div className="p-4 sm:p-6 border-b border-paper-200 dark:border-ink-800 bg-paper-100/40 dark:bg-ink-900/30">
        <h2 className="font-serif text-lg font-bold text-ink-900 dark:text-ink-50">
          Saved Perspectives
        </h2>
        <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
          Thoughts, moments, and essays you have bookmarked for slow reading.
        </p>
      </div>

      {loading ? (
        <div>
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : bookmarks.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Your archive is quiet"
          description="Bookmark thoughts in your feed to revisit them whenever you need stillness or inspiration."
        />
      ) : (
        <div className="divide-y divide-paper-200 dark:divide-ink-800">
          {bookmarks.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onPostDeleted={handlePostDeleted}
            />
          ))}
        </div>
      )}
    </div>
  );
}
