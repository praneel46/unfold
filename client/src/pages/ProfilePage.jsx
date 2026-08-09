import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Feather, Heart, Bookmark, Image as ImageIcon, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import TopHeader from '../components/layout/TopHeader';
import ProfileHeader from '../components/profile/ProfileHeader';
import PostCard from '../components/post/PostCard';
import { ProfileSkeleton, PostSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';

export default function ProfilePage() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' | 'likes' | 'media' | 'bookmarks'
  const [posts, setPosts] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);

  const isSelf = currentUser && profileUser && currentUser.id === profileUser.id;

  // 1. Fetch Profile Info
  useEffect(() => {
    fetchProfile();
  }, [username]);

  // 2. Fetch Posts for active tab
  useEffect(() => {
    if (profileUser) {
      fetchTabContent();
    }
  }, [profileUser, activeTab]);

  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await api.get(`/api/users/profile/${username}`);
      if (res.success && res.user) {
        setProfileUser(res.user);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
      addToast('Profile not found', 'error');
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchTabContent = async () => {
    try {
      setLoadingPosts(true);
      if (activeTab === 'posts') {
        const res = await api.get(`/api/posts?username=${profileUser.username}`);
        if (res.success && res.posts) setPosts(res.posts);
      } else if (activeTab === 'likes') {
        const res = await api.get(`/api/users/${profileUser.id}/likes`);
        if (res.success && res.posts) setPosts(res.posts);
      } else if (activeTab === 'bookmarks') {
        const res = await api.get('/api/users/bookmarks/saved');
        if (res.success && res.posts) setPosts(res.posts);
      } else if (activeTab === 'media') {
        const res = await api.get(`/api/posts?username=${profileUser.username}`);
        if (res.success && res.posts) {
          setPosts(res.posts.filter((p) => !!p.imageUrl));
        }
      }
    } catch (err) {
      console.error('Failed to load tab posts:', err);
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleProfileUpdated = (updated) => {
    setProfileUser((prev) => ({ ...prev, ...updated }));
  };

  const handlePostDeleted = (deletedId) => {
    setPosts((prev) => prev.filter((p) => p.id !== deletedId));
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen">
        <TopHeader title="Profile" />
        <ProfileSkeleton />
        <PostSkeleton />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen">
        <TopHeader title="Profile" />
        <EmptyState
          icon={Sparkles}
          title="Creator not found"
          description="The profile you are looking for does not exist on UNFOLD."
          actionLabel="Explore Community"
          onAction={() => navigate('/explore')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <TopHeader title={profileUser.name} />

      {/* Profile Header Block */}
      <ProfileHeader
        profileUser={profileUser}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Profile Navigation Tabs */}
      <div className="flex border-b border-paper-200 dark:border-ink-800 bg-paper-50/80 dark:bg-ink-950/80 sticky top-[53px] z-20 backdrop-blur-md">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition-all relative flex items-center justify-center gap-1.5 ${
            activeTab === 'posts'
              ? 'text-ink-900 dark:text-ink-50'
              : 'text-ink-500 dark:text-ink-400 hover:text-ink-800'
          }`}
        >
          <Feather className="w-3.5 h-3.5" />
          <span>Thoughts</span>
          {activeTab === 'posts' && (
            <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-coral-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('likes')}
          className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition-all relative flex items-center justify-center gap-1.5 ${
            activeTab === 'likes'
              ? 'text-ink-900 dark:text-ink-50'
              : 'text-ink-500 dark:text-ink-400 hover:text-ink-800'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Liked</span>
          {activeTab === 'likes' && (
            <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-coral-500 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('media')}
          className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition-all relative flex items-center justify-center gap-1.5 ${
            activeTab === 'media'
              ? 'text-ink-900 dark:text-ink-50'
              : 'text-ink-500 dark:text-ink-400 hover:text-ink-800'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Visuals</span>
          {activeTab === 'media' && (
            <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-coral-500 rounded-full" />
          )}
        </button>

        {isSelf && (
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex-1 py-3 text-xs sm:text-sm font-semibold transition-all relative flex items-center justify-center gap-1.5 ${
              activeTab === 'bookmarks'
                ? 'text-ink-900 dark:text-ink-50'
                : 'text-ink-500 dark:text-ink-400 hover:text-ink-800'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved</span>
            {activeTab === 'bookmarks' && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-coral-500 rounded-full" />
            )}
          </button>
        )}
      </div>

      {/* Tab Posts Stream */}
      <div>
        {loadingPosts ? (
          <div>
            <PostSkeleton />
            <PostSkeleton />
          </div>
        ) : posts.length === 0 ? (
          <EmptyState
            icon={
              activeTab === 'likes'
                ? Heart
                : activeTab === 'media'
                ? ImageIcon
                : activeTab === 'bookmarks'
                ? Bookmark
                : Feather
            }
            title={
              activeTab === 'likes'
                ? 'No liked thoughts yet'
                : activeTab === 'media'
                ? 'No visual moments shared yet'
                : activeTab === 'bookmarks'
                ? 'Your reading archive is empty'
                : 'No thoughts unfolded yet'
            }
            description={
              isSelf && activeTab === 'posts'
                ? 'Share your first perspective with the community.'
                : `@${profileUser.username} hasn't added any ${activeTab} yet.`
            }
          />
        ) : (
          <div className="divide-y divide-paper-200 dark:divide-ink-800">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPostDeleted={handlePostDeleted}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
