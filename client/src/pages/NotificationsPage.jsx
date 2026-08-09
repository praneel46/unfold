import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';
import TopHeader from '../components/layout/TopHeader';
import NotificationItem from '../components/notifications/NotificationItem';
import Button from '../components/common/Button';
import EmptyState from '../components/common/EmptyState';

export default function NotificationsPage() {
  const { resetUnreadNotificationCount, decrementUnreadNotificationCount } = useAuth();
  const { addToast } = useToast();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/notifications');
      if (res.success) {
        setNotifications(res.notifications);
        setUnreadCount(res.unreadCount);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
      addToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0 || markingAll) return;
    setMarkingAll(true);
    try {
      const res = await api.put('/api/notifications/read-all');
      if (res.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        resetUnreadNotificationCount();
        addToast('All notifications marked as read', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to mark all as read', 'error');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = async (notifId, readStatus) => {
    if (!readStatus) {
      try {
        await api.put(`/api/notifications/${notifId}/read`);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notifId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        decrementUnreadNotificationCount();
      } catch (err) {
        // Silent fail
      }
    }
  };

  return (
    <div className="min-h-screen">
      <TopHeader title="Notifications" />

      {/* Header Toolbar */}
      <div className="p-4 sm:p-6 border-b border-paper-200 dark:border-ink-800 flex items-center justify-between bg-paper-100/40 dark:bg-ink-900/30">
        <div>
          <h2 className="font-serif text-lg font-bold text-ink-900 dark:text-ink-50 flex items-center gap-2">
            <span>Interactions & Moments</span>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold bg-coral-500 text-white rounded-full">
                {unreadCount} new
              </span>
            )}
          </h2>
          <p className="text-xs text-ink-500 dark:text-ink-400 mt-0.5">
            Real-time echoes from the UNFOLD community
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            onClick={handleMarkAllAsRead}
            variant="secondary"
            size="sm"
            loading={markingAll}
            icon={CheckCheck}
          >
            Mark all read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="p-12 flex justify-center text-coral-500">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up"
          description="When members like your thoughts, comment on your essays, or follow your journey, they will appear here."
        />
      ) : (
        <div className="divide-y divide-paper-200 dark:divide-ink-800">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={() => handleNotificationClick(notification.id, notification.read)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
