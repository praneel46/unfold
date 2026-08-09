import React, { useState, useRef, useEffect } from 'react';
import { Image, X, Sparkles, Feather, Loader2, Link2, UploadCloud } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { usePostModal } from '../../context/PostModalContext';
import api from '../../utils/api';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import Button from '../common/Button';

const CATEGORIES = [
  { id: 'Thought', label: 'Thought', desc: 'Bite-sized reflection' },
  { id: 'Story', label: 'Story', desc: 'Personal narrative or encounter' },
  { id: 'Moment', label: 'Moment', desc: 'Visual or sensory observation' },
  { id: 'Discovery', label: 'Discovery', desc: 'Insight from reading or nature' },
  { id: 'Essay', label: 'Essay', desc: 'Deep editorial perspective' },
];

export default function PostComposerModal() {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const { isOpen, closeComposer, defaultCategory, handlePostSuccess } = usePostModal();

  const [content, setContent] = useState('');
  const [category, setCategory] = useState(defaultCategory || 'Thought');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  // Sync defaultCategory when modal opens
  useEffect(() => {
    if (defaultCategory) {
      setCategory(defaultCategory);
    }
  }, [defaultCategory]);

  // Keyboard shortcut: Ctrl+Enter or Cmd+Enter to publish
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (content.trim() && !submitting) {
        handlePublish(e);
      }
    }
  };

  const processFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 10 * 1024 * 1024) {
        addToast('Image size exceeds 10MB limit', 'error');
        return;
      }
      setSelectedFile(file);
      setImageUrl('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const removeImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setImageUrl('');
    setShowUrlInput(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePublish = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    try {
      let res;
      if (selectedFile) {
        const formData = new FormData();
        formData.append('content', content.trim());
        formData.append('category', category);
        formData.append('image', selectedFile);
        res = await api.upload('/api/posts', formData);
      } else {
        res = await api.post('/api/posts', {
          content: content.trim(),
          category,
          imageUrl: imageUrl.trim() || undefined,
        });
      }

      if (res.success && res.post) {
        addToast('Your world unfolded to the community', 'success');
        setContent('');
        removeImage();
        handlePostSuccess(res.post);
      }
    } catch (err) {
      addToast(err.message || 'Failed to publish thought', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const maxChars = 2000;
  const charsRemaining = maxChars - content.length;

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeComposer}
      title="Unfold a Thought"
      subtitle="Share an observation, essay, or moment with the community"
      maxWidth="max-w-2xl"
    >
      <form
        onSubmit={handlePublish}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`space-y-4 transition-colors ${
          isDragging ? 'ring-2 ring-coral-500/50 rounded-xl p-2 bg-coral-50/10' : ''
        }`}
      >
        {/* Category Picker Bar */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-2">
            Select Atmosphere / Stream
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  category === cat.id
                    ? 'bg-coral-500 text-white shadow-xs scale-102 font-semibold'
                    : 'bg-paper-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300 hover:bg-paper-200 dark:hover:bg-ink-700 border border-paper-200 dark:border-ink-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* User identity row & Textarea */}
        <div className="flex items-start gap-3 pt-2">
          {user && <Avatar src={user.avatarUrl} alt={user.name} size="md" />}
          <div className="flex-1 min-w-0">
            <textarea
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What is unfolding in your world today? (Press Ctrl+Enter to publish)"
              maxLength={maxChars}
              autoFocus
              className="w-full bg-transparent text-sm sm:text-base leading-relaxed text-ink-900 dark:text-ink-50 placeholder-ink-400 dark:placeholder-ink-500 focus:outline-none resize-none font-sans"
            />
          </div>
        </div>

        {/* Image Preview */}
        {(imagePreview || imageUrl) && (
          <div className="relative rounded-2xl overflow-hidden border border-paper-300 dark:border-ink-700 max-h-64 bg-paper-100 dark:bg-ink-800">
            <img
              src={imagePreview || imageUrl}
              alt="Attachment preview"
              className="w-full h-auto max-h-64 object-cover"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-3 right-3 p-1.5 bg-ink-950/75 hover:bg-ink-950 text-white rounded-full transition-colors focus:outline-none"
              aria-label="Remove image"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* External Image URL Input */}
        {showUrlInput && !imagePreview && (
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-paper-100 dark:bg-ink-800 border border-paper-200 dark:border-ink-700">
            <Link2 className="w-4 h-4 text-ink-400 shrink-0" />
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste direct image URL (e.g. Unsplash, WebP, PNG)..."
              className="w-full bg-transparent text-xs text-ink-900 dark:text-ink-50 placeholder-ink-400 focus:outline-none"
            />
            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl('')}
                className="text-xs text-ink-400 hover:text-ink-700 dark:hover:text-ink-200"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Bottom Toolbar & Publish Action */}
        <div className="flex items-center justify-between pt-4 border-t border-paper-200 dark:border-ink-800">
          <div className="flex items-center gap-2">
            {/* Local File Upload Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-full text-ink-500 hover:text-coral-500 hover:bg-paper-100 dark:hover:bg-ink-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500"
              title="Attach photo from computer"
              aria-label="Attach photo"
            >
              <Image className="w-4 h-4" />
            </button>

            {/* URL Toggle */}
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className={`p-2 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-coral-500 ${
                showUrlInput
                  ? 'text-coral-500 bg-coral-50 dark:bg-coral-950/40'
                  : 'text-ink-500 hover:text-coral-500 hover:bg-paper-100 dark:hover:bg-ink-800'
              }`}
              title="Attach image by web URL"
              aria-label="Attach image by URL"
            >
              <Link2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Character Counter */}
            <span
              className={`text-xs font-mono select-none ${
                charsRemaining < 100
                  ? 'text-coral-500 font-bold'
                  : 'text-ink-400 dark:text-ink-500'
              }`}
            >
              {charsRemaining}
            </span>

            {/* Publish Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={!content.trim() || submitting}
              loading={submitting}
              icon={Feather}
            >
              Unfold
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
