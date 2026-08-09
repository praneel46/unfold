import React, { useState, useEffect } from 'react';
import { Sparkles, Users, RefreshCw, Feather } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usePostModal } from '../context/PostModalContext';
import api from '../utils/api';
import TopHeader from '../components/layout/TopHeader';
import InlineComposer from '../components/post/InlineComposer';
import PostCard from '../components/post/PostCard';
import { PostSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import Badge from '../components/common/Badge';

const CATEGORIES = ['All', 'Thought', 'Essay', 'Moment', 'Discovery', 'Story'];

export default function HomePage() {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const { openComposer } = usePostModal();

  const [feedType, setFeedType] = useState('for-you'); // 'for-you' | 'following'
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [feedType, selectedCategory]);

  const fetchPosts = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const params = new URLSearchParams();
      params.append('feed', feedType);
      if (selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }

      const res = await api.get(`/api/posts?${params.toString()}`);
      if (res.success && res.posts) {
        setPosts(res.posts);
      }
    } catch (err) {
      console.error('Failed to fetch feed posts:', err);
      addToast('Failed to load feed', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
  };

  return (
    <div className="min-h-screen">
      {/* Top Header */}
      <TopHeader title="Feed" />

      {/* Feed Type Switcher Tabs */}
      <div className="flex border-b border-paper-200 dark:border-ink-800 bg-paper-50/80 dark:bg-ink-950/80 sticky top-[53px] z-20 backdrop-blur-md">
        <button
          onClick={() => setFeedType('for-you')}
          className={`flex-1 py-3.5 text-xs sm:text-sm font-semibold transition-all relative flex items-center justify-center gap-1.5 ${
            feedType === 'for-you'
              ? 'text-ink-900 dark:text-ink-50'
              : 'text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-coral-500" />
          <span>For You</span>
          {feedType === 'for-you' && (
            <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-coral-500 rounded-full" />
          )}
        </button>

        {isAuthenticated && (
          <button
            onClick={() => setFeedType('following')}
            className={`flex-1 py-3.5 text-xs sm:text-sm font-semibold transition-all relative flex items-center justify-center gap-1.5 ${
              feedType === 'following'
                ? 'text-ink-900 dark:text-ink-50'
                : 'text-ink-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-ink-200'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
            <span>Following</span>
            {feedType === 'following' && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-coral-500 rounded-full" />
            )}
          </button>
        )}
      </div>

      {/* Category Pills Bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-paper-200 dark:border-ink-800 bg-paper-100/40 dark:bg-ink-900/30 overflow-x-auto no-scrollbar flex items-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-ink-900 dark:bg-ink-50 text-paper-50 dark:text-ink-950 font-semibold shadow-xs'
                : 'bg-paper-200/80 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:bg-paper-300 dark:hover:bg-ink-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Inline Composer on Top of Feed */}
      <InlineComposer onPostCreated={handlePostCreated} />

      {/* Feed Stream */}
      <div>
        {loading ? (
          <div>
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={Feather}
            title={
              feedType === 'following'
                ? 'No thoughts from followed creators yet'
                : 'No thoughts found in this category'
            }
            description={
              feedType === 'following'
                ? 'Explore the community to follow architects, writers, designers, and thinkers.'
                : 'Be the first to unfold a thought in this stream!'
            }
            actionLabel={feedType === 'following' ? 'Explore Creators' : 'Unfold a Thought'}
            onAction={() =>
              feedType === 'following' ? setFeedType('for-you') : openComposer(selectedCategory !== 'All' ? selectedCategory : 'Thought', handlePostCreated)
            }
          />
        ) : (
          <div className="divide-y divide-paper-200 dark:divide-ink-800">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostDeleted={handlePostDeleted}
                onCategoryClick={(cat) => setSelectedCategory(cat)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
