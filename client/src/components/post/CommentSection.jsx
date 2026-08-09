import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../utils/api';
import Avatar from '../common/Avatar';
import { formatRelativeTime } from '../../utils/date';

export default function CommentSection({
  postId,
  initialComments = [],
  onCommentsCountChange,
}) {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const [comments, setComments] = useState(initialComments);
  const [newCommentText, setNewCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || submitting) return;

    if (!isAuthenticated) {
      addToast('Please sign in to join the conversation', 'info');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post(`/api/comments/post/${postId}`, {
        content: newCommentText.trim(),
      });

      if (res.success && res.comment) {
        setComments((prev) => [...prev, res.comment]);
        setNewCommentText('');
        if (onCommentsCountChange) {
          onCommentsCountChange(res.commentsCount);
        }
        addToast('Comment shared', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Failed to post comment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    setDeletingId(commentId);
    try {
      const res = await api.delete(`/api/comments/${commentId}`);
      if (res.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
        if (onCommentsCountChange) {
          onCommentsCountChange(res.commentsCount);
        }
        addToast('Comment removed', 'info');
      }
    } catch (err) {
      addToast(err.message || 'Failed to delete comment', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-paper-200 dark:border-ink-800/80 space-y-4 animate-fade-in">
      {/* Existing Comments List */}
      <div className="space-y-3.5">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex items-start justify-between gap-3 group/comment"
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <Link to={`/profile/${comment.author.username}`} className="shrink-0">
                <Avatar
                  src={comment.author.avatarUrl}
                  alt={comment.author.name}
                  size="xs"
                />
              </Link>
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <Link
                    to={`/profile/${comment.author.username}`}
                    className="text-xs font-semibold text-ink-900 dark:text-ink-100 hover:underline"
                  >
                    {comment.author.name}
                  </Link>
                  <span className="text-[11px] text-ink-400 dark:text-ink-500">
                    @{comment.author.username}
                  </span>
                  <span className="text-[10px] text-ink-400 dark:text-ink-500">
                    • {formatRelativeTime(comment.createdAt)}
                  </span>
                </div>
                <p className="text-xs text-ink-800 dark:text-ink-200 mt-0.5 leading-relaxed break-words whitespace-pre-line">
                  {comment.content}
                </p>
              </div>
            </div>

            {/* Delete button if comment author or current user is post author */}
            {(comment.isAuthor || comment.author?.id === user?.id) && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                disabled={deletingId === comment.id}
                className="opacity-0 group-hover/comment:opacity-100 text-ink-400 hover:text-coral-500 transition-opacity p-1"
                title="Delete comment"
              >
                {deletingId === comment.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        ))}

        {comments.length === 0 && (
          <p className="text-xs text-ink-400 dark:text-ink-500 italic py-1">
            No comments yet. Be the first to share a thought.
          </p>
        )}
      </div>

      {/* Add New Comment Box */}
      {isAuthenticated ? (
        <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2">
          <Avatar src={user.avatarUrl} alt={user.name} size="xs" />
          <div className="relative flex-1">
            <input
              type="text"
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Contribute to this conversation..."
              className="w-full pl-3 pr-10 py-1.5 bg-paper-100 dark:bg-ink-800/80 border border-paper-300 dark:border-ink-700 rounded-xl text-xs text-ink-900 dark:text-ink-100 placeholder-ink-400 focus:outline-none focus:ring-1 focus:ring-coral-500 focus:border-coral-500 transition-all"
            />
            <button
              type="submit"
              disabled={!newCommentText.trim() || submitting}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-coral-500 hover:text-coral-600 disabled:opacity-40 disabled:hover:text-coral-500 transition-colors"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="pt-2 text-center">
          <Link
            to="/auth"
            className="text-xs text-coral-600 dark:text-coral-400 hover:underline font-medium"
          >
            Sign in to contribute to this discussion →
          </Link>
        </div>
      )}
    </div>
  );
}
