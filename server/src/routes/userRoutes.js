const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  toggleFollow,
  getFollowers,
  getFollowing,
  getUserLikedPosts,
  getUserBookmarks,
  getWhoToFollow,
} = require('../controllers/userController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// User profile & suggestions
router.get('/suggestions/who-to-follow', optionalAuth, getWhoToFollow);
router.get('/profile/:username', optionalAuth, getUserProfile);
router.put(
  '/profile',
  requireAuth,
  upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
  ]),
  updateProfile
);

// Follow / Followers
router.post('/:id/follow', requireAuth, toggleFollow);
router.get('/:id/followers', optionalAuth, getFollowers);
router.get('/:id/following', optionalAuth, getFollowing);

// User content tabs
router.get('/:id/likes', optionalAuth, getUserLikedPosts);
router.get('/bookmarks/saved', requireAuth, getUserBookmarks);

module.exports = router;
