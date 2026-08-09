import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageSquare, UserPlus, Bookmark, ArrowRight } from 'lucide-react';
import Avatar from '../common/Avatar';
import { formatRelativeTime } from '../../utils/date';

export default function NotificationItem({ notification, onRead }) {
  const { actor, type, read, createdAt, post, comment } = notification;

  const getNotificationDetails = () => {
    switch (type) {
      case 'LIKE':
        return {
          icon: Heart,
          iconColor: 'text-coral-500 bg-coral-50 dark:bg-coral-950/50',
          text: 'liked your thought',
          link: post ? `/post/${post.id}` : '#',
        };
      case 'COMMENT':
        return {
          icon: MessageSquare,
          iconColor: 'text-sage-600 bg-sage-50 dark:bg-sage-950/50',
          text: 'commented on your thought',
          link: post ? `/post/${post.id}` : '#',
        };
      case 'FOLLOW':
        return {
          icon: UserPlus,
          iconColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/50',
          text: 'started following your journey',
          link: `/profile/${actor.username}`,
        };
      case 'BOOKMARK':
        return {
          icon: Bookmark,
          iconColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50',
          text: 'saved your thought to their archive',
          link: post ? `/post/${post.id}` : '#',
        };
      default:
        return {
          icon: Heart,
          iconColor: 'text-coral-500 bg-coral-50 dark:bg-coral-950/50',
          text: 'interacted with your profile',
          link: '#',
        };
    }
  };

  const details = getNotificationDetails();
  const Icon = details.icon;

  return (
    <Link
      to={details.link}
      onClick={onRead}
      className={`block p-4 sm:p-5 border-b border-paper-200 dark:border-ink-800 transition-colors ${
        !read
          ? 'bg-coral-50/20 dark:bg-coral-950/10 hover:bg-coral-50/40 dark:hover:bg-coral-950/20'
          : 'hover:bg-paper-100/50 dark:hover:bg-ink-900/50'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Type Icon Badge */}
        <div className={`p-2 rounded-full shrink-0 ${details.iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Avatar src={actor.avatarUrl} alt={actor.name} size="xs" />
            <span className="font-semibold text-xs text-ink-900 dark:text-ink-50 hover:underline">
              {actor.name}
            </span>
            <span className="text-xs text-ink-600 dark:text-ink-300">
              {details.text}
            </span>
            <span className="text-[11px] text-ink-400 dark:text-ink-500">
              • {formatRelativeTime(createdAt)}
            </span>
          </div>

          {/* Snippet preview */}
          {post?.snippet && (
            <p className="mt-1.5 text-xs text-ink-500 dark:text-ink-400 italic bg-paper-100 dark:bg-ink-900/80 px-3 py-2 rounded-lg border border-paper-200 dark:border-ink-800 line-clamp-2">
              "{post.snippet}"
            </p>
          )}

          {comment?.content && (
            <p className="mt-1.5 text-xs text-ink-700 dark:text-ink-300 bg-paper-100 dark:bg-ink-900/80 px-3 py-2 rounded-lg border border-paper-200 dark:border-ink-800 line-clamp-2">
              "{comment.content}"
            </p>
          )}
        </div>

        {!read && (
          <div className="w-2 h-2 rounded-full bg-coral-500 shrink-0 mt-2" />
        )}
      </div>
    </Link>
  );
}
