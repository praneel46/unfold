import React, { useState, useRef } from 'react';
import { Camera, Image, Loader2, Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import Modal from '../common/Modal';
import { Input, Textarea } from '../common/Input';
import Button from '../common/Button';
import Avatar from '../common/Avatar';

export default function EditProfileModal({ isOpen, onClose, profile, onSaved }) {
  const { updateUserProfile } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState(profile.name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [location, setLocation] = useState(profile.location || '');
  const [website, setWebsite] = useState(profile.website || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl || '');
  const [bannerUrl, setBannerUrl] = useState(profile.bannerUrl || '');

  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl || '');
  const [bannerPreview, setBannerPreview] = useState(profile.bannerUrl || '');

  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setBannerPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      addToast('Name is required', 'error');
      return;
    }

    setSaving(true);
    try {
      let res;
      if (avatarFile || bannerFile) {
        const formData = new FormData();
        formData.append('name', name.trim());
        formData.append('bio', bio.trim());
        formData.append('location', location.trim());
        formData.append('website', website.trim());
        if (avatarFile) formData.append('avatar', avatarFile);
        if (bannerFile) formData.append('banner', bannerFile);
        res = await api.put('/api/users/profile', formData);
      } else {
        res = await api.put('/api/users/profile', {
          name: name.trim(),
          bio: bio.trim(),
          location: location.trim(),
          website: website.trim(),
          avatarUrl: avatarUrl.trim(),
          bannerUrl: bannerUrl.trim(),
        });
      }

      if (res.success && res.user) {
        updateUserProfile(res.user);
        addToast('Profile updated', 'success');
        if (onSaved) onSaved(res.user);
      }
    } catch (err) {
      addToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      subtitle="Customize how you appear to others on UNFOLD"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Banner Cover Upload Preview */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600 dark:text-ink-300 mb-1.5">
            Cover Banner
          </label>
          <div className="relative h-28 w-full rounded-xl overflow-hidden bg-paper-200 dark:bg-ink-800 border border-paper-300 dark:border-ink-700 group">
            {bannerPreview ? (
              <img
                src={bannerPreview}
                alt="Banner preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-ink-400">
                No banner set
              </div>
            )}
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerChange}
            />
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="absolute inset-0 bg-ink-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium gap-1.5 transition-opacity"
            >
              <Camera className="w-4 h-4" />
              <span>Change Banner</span>
            </button>
          </div>
        </div>

        {/* Avatar Upload Preview */}
        <div className="flex items-center gap-4 pt-1">
          <div className="relative group">
            <Avatar
              src={avatarPreview}
              alt={name}
              size="xl"
              className="border-2 border-paper-50 dark:border-ink-900"
            />
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-0 bg-ink-950/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
              title="Change avatar"
            >
              <Camera className="w-5 h-5" />
            </button>
          </div>
          <div className="text-xs space-y-1">
            <p className="font-semibold text-ink-800 dark:text-ink-200">
              Profile Photo
            </p>
            <p className="text-ink-400 dark:text-ink-500">
              JPEG, PNG, or WebP. Max 10MB.
            </p>
          </div>
        </div>

        {/* Input Fields */}
        <Input
          label="Display Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          required
        />

        <Textarea
          label="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell others what you think about, write, or observe..."
          rows={3}
          helperText="Max 240 characters recommended"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Kyoto, Japan"
          />
          <Input
            label="Website or Link"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="e.g. https://yoursite.com"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-paper-200 dark:border-ink-800">
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={saving}
            icon={Save}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
