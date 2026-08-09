import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Compass, Sparkles, TrendingUp, Users, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import TopHeader from '../components/layout/TopHeader';
import PostCard from '../components/post/PostCard';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { PostSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';

export default function ExplorePage() {
  const { user: currentUser, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const queryParam = searchParams.get('q') || '';
  const categoryParam = searchParams.get('category') || '';

  const [searchInput, setSearchInput] = useState(queryParam);
  const [activeTab, setActiveTab] = useState('thoughts'); // 'thoughts' | 'creators'
  const [exploreData, setExploreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState({});

  useEffect(() => {
    setSearchInput(queryParam);
    fetchExplore(queryParam, categoryParam);
  }, [queryParam, categoryParam]);

  const fetchExplore = async (q, cat) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      if (cat) params.append('category', cat);

      const res = await api.get(`/api/explore?${params.toString()}`);
      if (res.success) {
        setExploreData(res);
      }
    } catch (err) {
      console.error('Explore fetch error:', err);
      addToast('Failed to load exploration stream', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ q: searchInput.trim() });
    } else {
      setSearchParams({});
    }
  };

  const clearSearch = () => {
    setSearchInput('');
    setSearchParams({});
  };

  const handleFollowToggle = async (targetUser) => {
    if (!isAuthenticated) {
      addToast('Please sign in to follow creators', 'info');
      return;
    }

    const currentFollowingState = followingMap[targetUser.id] ?? targetUser.isFollowing;
    const nextState = !currentFollowingState;

    setFollowingMap((prev) => ({ ...prev, [targetUser.id]: nextState }));

    try {
      const res = await api.post(`/api/users/${targetUser.id}/follow`);
      if (res.success) {
        setFollowingMap((prev) => ({ ...prev, [targetUser.id]: res.isFollowing }));
        addToast(
          res.isFollowing
            ? `Now following @${targetUser.username}`
            : `Unfollowed @${targetUser.username}`,
          'info'
        );
      }
    } catch (err) {
      setFollowingMap((prev) => ({ ...prev, [targetUser.id]: currentFollowingState }));
      addToast(err.message || 'Action failed', 'error');
    }
  };

  return (
    <div className="min-h-screen">
      <TopHeader title="Explore & Discover" />

      {/* Search Input Header */}
      <div className="p-4 sm:p-6 border-b border-paper-200 dark:border-ink-800 bg-paper-50/90 dark:bg-ink-950/90 sticky top-[53px] z-20 backdrop-blur-md">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 dark:text-ink-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search keywords, ideas, writers, and photographers..."
            className="w-full pl-11 pr-10 py-3 bg-paper-100 dark:bg-ink-900 border border-paper-300 dark:border-ink-700 rounded-2xl text-sm font-medium text-ink-900 dark:text-ink-50 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-coral-500/30 focus:border-coral-500 transition-all"
          />
          {searchInput && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </form>
      </div>

      {loading ? (
        <div>
          <PostSkeleton />
          <PostSkeleton />
        </div>
      ) : exploreData?.isSearch ? (
        /* SEARCH RESULTS VIEW */
        <div>
          {/* Search Result Subtabs */}
          <div className="flex border-b border-paper-200 dark:border-ink-800 px-6 bg-paper-100/40 dark:bg-ink-900/40">
            <button
              onClick={() => setActiveTab('thoughts')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'thoughts'
                  ? 'border-coral-500 text-coral-600 dark:text-coral-400'
                  : 'border-transparent text-ink-500 hover:text-ink-900 dark:hover:text-ink-200'
              }`}
            >
              Thoughts ({exploreData.posts?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('creators')}
              className={`py-3 px-4 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'creators'
                  ? 'border-coral-500 text-coral-600 dark:text-coral-400'
                  : 'border-transparent text-ink-500 hover:text-ink-900 dark:hover:text-ink-200'
              }`}
            >
              Creators ({exploreData.users?.length || 0})
            </button>
          </div>

          {activeTab === 'thoughts' ? (
            exploreData.posts?.length > 0 ? (
              <div className="divide-y divide-paper-200 dark:divide-ink-800">
                {exploreData.posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Compass}
                title="No thoughts found"
                description={`We couldn't find any thoughts matching "${exploreData.searchTerm}". Try another search keyword.`}
              />
            )
          ) : exploreData.users?.length > 0 ? (
            <div className="p-4 sm:p-6 space-y-3">
              {exploreData.users.map((u) => {
                const isFollowing = followingMap[u.id] ?? u.isFollowing;
                const isSelf = currentUser && currentUser.id === u.id;

                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-paper-100/60 dark:bg-ink-900/60 border border-paper-200 dark:border-ink-800 hover:border-paper-300 dark:hover:border-ink-700 transition-all"
                  >
                    <Link
                      to={`/profile/${u.username}`}
                      className="flex items-center gap-3.5 min-w-0 flex-1 group"
                    >
                      <Avatar src={u.avatarUrl} alt={u.name} size="md" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink-900 dark:text-ink-100 group-hover:text-coral-500 transition-colors truncate">
                          {u.name}
                        </p>
                        <p className="text-xs text-ink-400 dark:text-ink-500 truncate">
                          @{u.username} • {u.followersCount} followers
                        </p>
                        {u.bio && (
                          <p className="text-xs text-ink-600 dark:text-ink-300 truncate mt-1">
                            {u.bio}
                          </p>
                        )}
                      </div>
                    </Link>

                    {!isSelf && (
                      <Button
                        onClick={() => handleFollowToggle(u)}
                        variant={isFollowing ? 'secondary' : 'primary'}
                        size="sm"
                      >
                        {isFollowing ? 'Following' : 'Follow'}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Users}
              title="No creators found"
              description={`We couldn't find any accounts matching "${exploreData.searchTerm}".`}
            />
          )}
        </div>
      ) : (
        /* DEFAULT EXPLORE VIEW: Curated Streams & Featured */
        <div className="space-y-6 p-4 sm:p-6">
          {/* Topics Carousel */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-coral-500" />
              <h2 className="font-serif text-lg font-bold text-ink-900 dark:text-ink-50">
                Editorial Streams
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {exploreData?.topics?.map((topic) => (
                <button
                  key={topic.name}
                  onClick={() => setSearchParams({ category: topic.name })}
                  className="p-3.5 rounded-2xl bg-paper-100 dark:bg-ink-900 border border-paper-200 dark:border-ink-800 hover:border-coral-400/50 hover:bg-paper-200/50 dark:hover:bg-ink-850 text-left transition-all group"
                >
                  <span className="font-semibold text-xs text-ink-900 dark:text-ink-100 group-hover:text-coral-500 block truncate">
                    {topic.name}
                  </span>
                  <span className="text-[11px] text-ink-400 dark:text-ink-500">
                    {topic.count} reflections
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Featured Thoughts */}
          <div className="pt-4 border-t border-paper-200 dark:border-ink-800">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-sage-600 dark:text-sage-400" />
              <h2 className="font-serif text-lg font-bold text-ink-900 dark:text-ink-50">
                Resonant Reflections
              </h2>
            </div>

            <div className="divide-y divide-paper-200 dark:divide-ink-800 -mx-4 sm:-mx-6">
              {exploreData?.featuredPosts?.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
