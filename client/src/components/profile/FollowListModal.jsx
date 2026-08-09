import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserCheck, UserPlus, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

export default function FollowListModal({
  userId,
  type = 'followers',
  title = 'Followers',
  isOpen,
  onClose,
}) {
  const { user: currentUser, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingMap, setFollowingMap] = useState({});

  useEffect(() => {
    if (isOpen && userId) {
      fetchUsers();
    }
  }, [isOpen, userId, type]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/users/${userId}/${type}`);
      if (res.success && res.users) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error('Failed to load user list:', err);
    } finally {
      setLoading(false);
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
      setFollowingMap((prev) => ({ ...prev, [targetUser.id]: currentFollowingState }));
      addToast(err.message || 'Action failed', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={`People ${type === 'followers' ? 'following this account' : 'this account follows'}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
        {loading ? (
          <div className="py-8 flex justify-center text-coral-500">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-xs text-ink-400 dark:text-ink-500 italic">
            No {type} yet.
          </div>
        ) : (
          users.map((u) => {
            const isFollowing = followingMap[u.id] ?? u.isFollowing;
            const isSelf = currentUser && currentUser.id === u.id;

            return (
              <div
                key={u.id}
                className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors"
              >
                <Link
                  to={`/profile/${u.username}`}
                  onClick={onClose}
                  className="flex items-center gap-3 min-w-0 flex-1 group"
                >
                  <Avatar src={u.avatarUrl} alt={u.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-ink-900 dark:text-ink-100 group-hover:text-coral-500 truncate transition-colors">
                      {u.name}
                    </p>
                    <p className="text-[11px] text-ink-400 dark:text-ink-500 truncate">
                      @{u.username}
                    </p>
                    {u.bio && (
                      <p className="text-[11px] text-ink-600 dark:text-ink-300 truncate mt-0.5">
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
                    className="text-xs px-3 py-1 h-7 shrink-0"
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>
    </Modal>
  );
}
