import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function RightSidebar() {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [followingMap, setFollowingMap] = useState({});

  useEffect(() => {
    fetchSuggestions();
  }, [user]);

  const fetchSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const res = await api.get('/api/users/suggestions/who-to-follow');
      if (res.success && res.suggestions) {
        setSuggestions(res.suggestions);
      }
    } catch (err) {
      console.error('Failed to load suggestions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleFollowToggle = async (targetUser) => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }

    const currentFollowingState = followingMap[targetUser.id] ?? targetUser.isFollowing;
    const nextState = !currentFollowingState;

    // Optimistic UI
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
      // Revert on error
      setFollowingMap((prev) => ({ ...prev, [targetUser.id]: currentFollowingState }));
      addToast(err.message || 'Action failed', 'error');
    }
  };

  const editorialTopics = [
    { name: 'Essay', count: 12, desc: 'Long-form reflections' },
    { name: 'Thought', count: 28, desc: 'Bite-sized perspectives' },
    { name: 'Moment', count: 19, desc: 'Visual captures & sensory notes' },
    { name: 'Discovery', count: 14, desc: 'Ideas from books & sciences' },
    { name: 'Story', count: 9, desc: 'Human encounters & anecdotes' },
  ];

  return (
    <aside className="hidden lg:block w-80 xl:w-88 py-6 px-5 space-y-6 shrink-0 select-none">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 dark:text-ink-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search thoughts, people, topics..."
          className="w-full pl-10 pr-4 py-2.5 bg-paper-100 dark:bg-ink-800 border border-paper-200 dark:border-ink-700 rounded-full text-xs font-medium text-ink-900 dark:text-ink-100 placeholder-ink-400 dark:placeholder-ink-500 focus:outline-none focus:ring-2 focus:ring-coral-500/30 focus:border-coral-500 transition-all"
        />
      </form>

      {/* Suggested Creators / Who to Follow */}
      {suggestions.length > 0 && (
        <div className="bg-paper-100/70 dark:bg-ink-800/60 rounded-2xl p-4 border border-paper-200/80 dark:border-ink-800">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="font-serif text-sm font-bold text-ink-900 dark:text-ink-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-coral-500" />
              <span>Curated Minds</span>
            </h3>
            <Link
              to="/explore"
              className="text-[11px] font-medium text-coral-600 dark:text-coral-400 hover:underline flex items-center gap-0.5"
            >
              <span>Explore</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {suggestions.slice(0, 4).map((suggested) => {
              const isFollowing =
                followingMap[suggested.id] ?? suggested.isFollowing;

              return (
                <div
                  key={suggested.id}
                  className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-paper-200/50 dark:hover:bg-ink-700/50 transition-colors"
                >
                  <Link
                    to={`/profile/${suggested.username}`}
                    className="flex items-center gap-2.5 min-w-0 flex-1 group"
                  >
                    <Avatar
                      src={suggested.avatarUrl}
                      alt={suggested.name}
                      size="sm"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-ink-900 dark:text-ink-100 group-hover:text-coral-500 dark:group-hover:text-coral-400 truncate transition-colors">
                        {suggested.name}
                      </p>
                      <p className="text-[11px] text-ink-500 dark:text-ink-400 truncate">
                        @{suggested.username}
                      </p>
                    </div>
                  </Link>

                  <Button
                    onClick={() => handleFollowToggle(suggested)}
                    variant={isFollowing ? 'secondary' : 'primary'}
                    size="sm"
                    className="text-xs px-3 py-1 shrink-0 h-7"
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Editorial Topics & Themes */}
      <div className="bg-paper-100/70 dark:bg-ink-800/60 rounded-2xl p-4 border border-paper-200/80 dark:border-ink-800">
        <div className="flex items-center gap-1.5 mb-3 px-1">
          <TrendingUp className="w-3.5 h-3.5 text-sage-600 dark:text-sage-400" />
          <h3 className="font-serif text-sm font-bold text-ink-900 dark:text-ink-100">
            Editorial Streams
          </h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {editorialTopics.map((topic) => (
            <Link
              key={topic.name}
              to={`/explore?category=${encodeURIComponent(topic.name)}`}
            >
              <Badge
                category={topic.name}
                size="sm"
                className="hover:scale-105 transition-transform"
              >
                {topic.name}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Philosophy Manifesto Card */}
      <div className="p-4 rounded-2xl border border-dashed border-paper-300 dark:border-ink-700 bg-paper-50/50 dark:bg-ink-900/30 text-ink-600 dark:text-ink-400 text-xs leading-relaxed space-y-2">
        <p className="font-serif font-bold text-ink-800 dark:text-ink-200 text-sm">
          "Let your world unfold."
        </p>
        <p className="text-[11px] text-ink-500 dark:text-ink-400">
          A digital space designed for stillness, human conversation, and thoughtful craftsmanship. No algorithmic frenzy.
        </p>
      </div>

      {/* Footer Meta */}
      <footer className="px-2 text-[11px] text-ink-400 dark:text-ink-500 space-y-1">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <Link to="/explore" className="hover:underline">Explore</Link>
          <Link to="/settings" className="hover:underline">Settings</Link>
          <span>Privacy</span>
          <span>Terms</span>
          <span>Manifesto</span>
        </div>
        <p>© 2026 UNFOLD Social</p>
      </footer>
    </aside>
  );
}
