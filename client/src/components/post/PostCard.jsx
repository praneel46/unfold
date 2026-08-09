import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Heart,
  MessageSquare,
  Bookmark,
  Share2,
  Trash2,
  ExternalLink,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import CommentSection from './CommentSection';
import { formatRelativeTime } from '../../utils/date';

export default function PostCard({
  post,
  onPostDeleted,
  onCategoryClick,
  showFullComments = false,
}) {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isBookmarked, setIsBookmarked] = useState(post.isBookmarked);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [showComments, setShowComments] = useState(showFullComments);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const isAuthor = user && post.author?.id === user.id;

  // Escape listener for image modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && imageModalOpen) {
        setImageModalOpen(false);
      }
    };
    if (imageModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [imageModalOpen]);

  // Toggle Like with Optimistic UI & Pulse Effect
  const handleLike = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      addToast('Please sign in to like thoughts', 'info');
      navigate('/auth');
      return;
    }

    if (isLiking) return;
    setIsLiking(true);

    const prevLiked = isLiked;
    const prevCount = likesCount;

    setIsLiked(!prevLiked);
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1);

    try {
      const res = await api.post(`/api/posts/${post.id}/like`);
      if (res.success) {
        setIsLiked(res.isLiked);
        setLikesCount(res.likesCount);
      }
    } catch (err) {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      addToast(err.message || 'Failed to update like', 'error');
    } finally {
      setIsLiking(false);
    }
  };

  // Toggle Bookmark with Optimistic UI
  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      addToast('Please sign in to bookmark posts', 'info');
      navigate('/auth');
      return;
    }

    if (isBookmarking) return;
    setIsBookmarking(true);

    const prevBookmarked = isBookmarked;
    setIsBookmarked(!prevBookmarked);

    try {
      const res = await api.post(`/api/posts/${post.id}/bookmark`);
      if (res.success) {
        setIsBookmarked(res.isBookmarked);
        addToast(
          res.isBookmarked ? 'Saved to reading archive' : 'Removed from bookmarks',
          'info'
        );
      }
    } catch (err) {
      setIsBookmarked(prevBookmarked);
      addToast(err.message || 'Failed to bookmark', 'error');
    } finally {
      setIsBookmarking(false);
    }
  };

  // Copy Post Link
  const handleShare = async (e) => {
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        addToast('Thought link copied to clipboard', 'success');
        setTimeout(() => setCopied(false), 2000);
      } else {
        addToast(`Share link: ${url}`, 'info');
      }
    } catch (err) {
      addToast('Failed to copy link', 'error');
    }
  };

  // Delete Post
  const handleDeletePost = async () => {
    setIsDeleting(true);
    try {
      const res = await api.delete(`/api/posts/${post.id}`);
      if (res.success) {
        addToast('Thought deleted', 'info');
        setShowDeleteConfirm(false);
        if (onPostDeleted) {
          onPostDeleted(post.id);
        }
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete thought', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <article className="py-6 px-4 sm:px-6 border-b border-paper-200 dark:border-ink-800 transition-colors hover:bg-paper-100/35 dark:hover:bg-ink-900/35">
      {/* Author Header Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to={`/profile/${post.author.username}`}
            className="shrink-0 group focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 rounded-full"
          >
            <Avatar
              src={post.author.avatarUrl}
              alt={post.author.name}
              size="md"
              className="group-hover:ring-2 group-hover:ring-coral-400/50 transition-all"
            />
          </Link>

          <div className="min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <Link
                to={`/profile/${post.author.username}`}
                className="font-semibold text-sm text-ink-900 dark:text-ink-50 hover:text-coral-600 dark:hover:text-coral-400 transition-colors truncate focus:outline-none focus-visible:underline"
              >
                {post.author.name}
              </Link>
              <span className="text-xs text-ink-500 dark:text-ink-400 font-mono">
                @{post.author.username}
              </span>
              <span className="text-xs text-ink-400 dark:text-ink-500">
                • {formatRelativeTime(post.createdAt)}
              </span>
            </div>
            {post.author.bio && (
              <p className="text-[11px] text-ink-500 dark:text-ink-400 truncate max-w-sm">
                {post.author.bio}
              </p>
            )}
          </div>
        </div>

        {/* Category Badge & Author Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {post.category && (
            <Badge
              category={post.category}
              size="xs"
              onClick={onCategoryClick ? () => onCategoryClick(post.category) : undefined}
            />
          )}

          {isAuthor && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-ink-400 hover:text-coral-500 dark:hover:text-coral-400 p-1.5 rounded-full hover:bg-paper-200/60 dark:hover:bg-ink-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500"
              title="Delete thought"
              aria-label="Delete thought"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Post Text Body with comfortable editorial typography */}
      <div className="pl-0 sm:pl-13 space-y-3">
        <p className="text-ink-800 dark:text-ink-200 text-sm sm:text-base leading-relaxed whitespace-pre-line font-sans break-words selection:bg-coral-100 dark:selection:bg-coral-900/50">
          {post.content}
        </p>

        {/* Optional Media Image */}
        {post.imageUrl && (
          <div className="pt-2 overflow-hidden rounded-2xl border border-paper-300/60 dark:border-ink-800 max-h-[440px] bg-paper-100 dark:bg-ink-900">
            <img
              src={post.imageUrl}
              alt="Visual moment attachment"
              onClick={() => setImageModalOpen(true)}
              className="w-full h-auto max-h-[440px] object-cover cursor-zoom-in hover:opacity-95 transition-opacity"
              loading="lazy"
            />
          </div>
        )}

        {/* Interaction Action Row */}
        <div className="flex items-center justify-between pt-3 text-ink-500 dark:text-ink-400 select-none">
          <div className="flex items-center gap-6">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs font-medium transition-all group p-1 -m-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 ${
                isLiked
                  ? 'text-coral-600 dark:text-coral-400 font-semibold'
                  : 'hover:text-coral-600 dark:hover:text-coral-400'
              }`}
              aria-label={isLiked ? `Liked by ${likesCount} people. Click to unlike` : `Like this thought. Current count: ${likesCount}`}
            >
              <Heart
                className={`w-4 h-4 transition-transform duration-200 group-hover:scale-115 active:scale-90 ${
                  isLiked ? 'fill-coral-500 text-coral-500 scale-105' : 'stroke-[1.8]'
                }`}
              />
              <span className="font-mono">{likesCount > 0 ? likesCount : ''}</span>
            </button>

            {/* Comment Expand Button */}
            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors group p-1 -m-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-400 ${
                showComments
                  ? 'text-ink-900 dark:text-ink-100 font-semibold'
                  : 'hover:text-ink-900 dark:hover:text-ink-100'
              }`}
              aria-label={`Comments thread. Current count: ${commentsCount}`}
            >
              <MessageSquare className="w-4 h-4 transition-transform duration-200 group-hover:scale-110 stroke-[1.8]" />
              <span className="font-mono">{commentsCount > 0 ? commentsCount : ''}</span>
            </button>

            {/* Bookmark Button */}
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1.5 text-xs font-medium transition-colors group p-1 -m-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-sage-500 ${
                isBookmarked
                  ? 'text-sage-700 dark:text-sage-400 font-semibold'
                  : 'hover:text-sage-700 dark:hover:text-sage-400'
              }`}
              aria-label={isBookmarked ? 'Remove from reading archive' : 'Save to reading archive'}
            >
              <Bookmark
                className={`w-4 h-4 transition-transform duration-200 group-hover:scale-115 ${
                  isBookmarked
                    ? 'fill-sage-600 text-sage-600 dark:text-sage-400 dark:fill-sage-400 scale-105'
                    : 'stroke-[1.8]'
                }`}
              />
            </button>
          </div>

          {/* Share & Details Action */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleShare}
              className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors p-1.5 -m-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500"
              title="Copy link to thought"
              aria-label="Share thought link"
            >
              {copied ? (
                <Check className="w-4 h-4 text-sage-600 dark:text-sage-400" />
              ) : (
                <Share2 className="w-4 h-4 stroke-[1.8]" />
              )}
            </button>

            <Link
              to={`/post/${post.id}`}
              className="text-ink-400 hover:text-ink-700 dark:hover:text-ink-200 transition-colors p-1.5 -m-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500"
              title="Open full thought thread"
              aria-label="Open thought thread"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Expandable Conversational Comment Section */}
        {showComments && (
          <CommentSection
            postId={post.id}
            initialComments={post.comments || []}
            onCommentsCountChange={(newCount) => setCommentsCount(newCount)}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 dark:bg-black/80 backdrop-blur-xs animate-fade-in"
        >
          <div className="bg-paper-50 dark:bg-ink-900 rounded-2xl p-6 max-w-sm w-full border border-paper-300 dark:border-ink-700 shadow-unfold-modal space-y-4 animate-unfold">
            <h4 className="font-serif text-lg font-bold text-ink-900 dark:text-ink-50">
              Delete Thought?
            </h4>
            <p className="text-xs text-ink-600 dark:text-ink-300 leading-relaxed">
              This action cannot be undone. This thought and its conversations will be permanently folded away.
            </p>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-medium text-ink-700 dark:text-ink-300 hover:bg-paper-200 dark:hover:bg-ink-800 rounded-full transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Image Modal */}
      {imageModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/85 backdrop-blur-xs cursor-zoom-out animate-fade-in"
          onClick={() => setImageModalOpen(false)}
        >
          <button
            type="button"
            onClick={() => setImageModalOpen(false)}
            className="absolute top-4 right-4 p-2 text-white bg-ink-900/60 hover:bg-ink-900 rounded-full transition-colors"
            aria-label="Close image preview"
          >
            <X className="w-5 h-5" />
          </button>
          <img
            src={post.imageUrl}
            alt="Expanded moment"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-unfold"
          />
        </div>
      )}
    </article>
  );
}
