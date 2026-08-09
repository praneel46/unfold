import React, { useState } from 'react';
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  Edit3,
  UserPlus,
  UserCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import EditProfileModal from './EditProfileModal';
import FollowListModal from './FollowListModal';
import { formatMemberSince } from '../../utils/date';

export default function ProfileHeader({ profileUser, onProfileUpdated }) {
  const { user: currentUser, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const isSelf = currentUser && currentUser.id === profileUser.id;
  const [isFollowing, setIsFollowing] = useState(profileUser.isFollowing);
  const [followersCount, setFollowersCount] = useState(
    profileUser.stats?.followersCount || 0
  );
  const [followingCount, setFollowingCount] = useState(
    profileUser.stats?.followingCount || 0
  );
  const [postsCount, setPostsCount] = useState(
    profileUser.stats?.postsCount || 0
  );
  const [isFollowingLoading, setIsFollowingLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [followModalType, setFollowModalType] = useState(null); // 'followers' | 'following' | null

  // Follow/Unfollow Toggle with Optimistic UI
  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      addToast('Please sign in to follow creators', 'info');
      return;
    }

    if (isFollowingLoading) return;
    setIsFollowingLoading(true);

    const prevFollowing = isFollowing;
    const prevCount = followersCount;

    setIsFollowing(!prevFollowing);
    setFollowersCount(prevFollowing ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await api.post(`/api/users/${profileUser.id}/follow`);
      if (res.success) {
        setIsFollowing(res.isFollowing);
        setFollowersCount(res.followersCount);
        setFollowingCount(res.followingCount);
        addToast(
          res.isFollowing
            ? `Now following @${profileUser.username}`
            : `Unfollowed @${profileUser.username}`,
          'info'
        );
      }
    } catch (err) {
      setIsFollowing(prevFollowing);
      setFollowersCount(prevCount);
      addToast(err.message || 'Failed to update follow status', 'error');
    } finally {
      setIsFollowingLoading(false);
    }
  };

  const handleSavedProfile = (updated) => {
    if (onProfileUpdated) {
      onProfileUpdated(updated);
    }
    setEditModalOpen(false);
  };

  return (
    <div className="border-b border-paper-200 dark:border-ink-800 bg-paper-50 dark:bg-ink-950">
      {/* Cover Banner */}
      <div className="h-44 sm:h-60 w-full relative overflow-hidden bg-paper-200 dark:bg-ink-800">
        {profileUser.bannerUrl ? (
          <img
            src={profileUser.bannerUrl}
            alt="Profile cover banner"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-paper-300 to-paper-200 dark:from-ink-800 dark:to-ink-900 opacity-60" />
        )}
      </div>

      {/* Main Profile Info Section */}
      <div className="px-5 sm:px-8 pb-6 relative -mt-16 sm:-mt-20 space-y-4">
        {/* Avatar & Action Button Row */}
        <div className="flex items-end justify-between gap-4">
          <div className="relative">
            <Avatar
              src={profileUser.avatarUrl}
              alt={profileUser.name}
              size="2xl"
              className="ring-4 ring-paper-50 dark:ring-ink-950 shadow-md"
            />
          </div>

          <div className="pb-1">
            {isSelf ? (
              <Button
                onClick={() => setEditModalOpen(true)}
                variant="secondary"
                size="sm"
                icon={Edit3}
              >
                Edit Profile
              </Button>
            ) : (
              <Button
                onClick={handleFollowToggle}
                variant={isFollowing ? 'secondary' : 'primary'}
                size="md"
                disabled={isFollowingLoading}
                icon={isFollowing ? UserCheck : UserPlus}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        </div>

        {/* Identity & Bio */}
        <div className="space-y-2">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink-900 dark:text-ink-50 tracking-tight leading-tight">
              {profileUser.name}
            </h2>
            <p className="text-xs sm:text-sm text-ink-500 dark:text-ink-400 font-mono">
              @{profileUser.username}
            </p>
          </div>

          {profileUser.bio && (
            <p className="text-sm leading-relaxed text-ink-800 dark:text-ink-200 max-w-2xl whitespace-pre-line font-sans">
              {profileUser.bio}
            </p>
          )}

          {/* Metadata Row: Location, Website, Joined Date */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-500 dark:text-ink-400 pt-1">
            {profileUser.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-ink-400" />
                <span>{profileUser.location}</span>
              </div>
            )}

            {profileUser.website && (
              <div className="flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-coral-500" />
                <a
                  href={
                    profileUser.website.startsWith('http')
                      ? profileUser.website
                      : `https://${profileUser.website}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-coral-600 dark:text-coral-400 hover:underline font-medium truncate max-w-xs"
                >
                  {profileUser.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}

            {profileUser.createdAt && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-ink-400" />
                <span>Joined {formatMemberSince(profileUser.createdAt)}</span>
              </div>
            )}
          </div>

          {/* Followers / Following Stats Row */}
          <div className="flex items-center gap-6 pt-2 text-xs select-none">
            <span className="text-ink-900 dark:text-ink-100">
              <strong className="font-bold font-mono text-sm">{postsCount}</strong>{' '}
              <span className="text-ink-500 dark:text-ink-400">Thoughts</span>
            </span>

            <button
              onClick={() => setFollowModalType('following')}
              className="text-ink-900 dark:text-ink-100 hover:underline cursor-pointer"
            >
              <strong className="font-bold font-mono text-sm">{followingCount}</strong>{' '}
              <span className="text-ink-500 dark:text-ink-400">Following</span>
            </button>

            <button
              onClick={() => setFollowModalType('followers')}
              className="text-ink-900 dark:text-ink-100 hover:underline cursor-pointer"
            >
              <strong className="font-bold font-mono text-sm">{followersCount}</strong>{' '}
              <span className="text-ink-500 dark:text-ink-400">Followers</span>
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <EditProfileModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          profile={profileUser}
          onSaved={handleSavedProfile}
        />
      )}

      {/* Followers / Following List Modal */}
      {followModalType && (
        <FollowListModal
          userId={profileUser.id}
          type={followModalType}
          title={followModalType === 'followers' ? 'Followers' : 'Following'}
          isOpen={!!followModalType}
          onClose={() => setFollowModalType(null)}
        />
      )}
    </div>
  );
}
