const express = require('express');
const router = express.Router();
const {
  getPosts,
  getPostById,
  createPost,
  deletePost,
  toggleLike,
  toggleBookmark,
} = require('../controllers/postController');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public or optional-auth routes
router.get('/', optionalAuth, getPosts);
router.get('/:id', optionalAuth, getPostById);

// Protected routes
router.post('/', requireAuth, upload.single('image'), createPost);
router.delete('/:id', requireAuth, deletePost);
router.post('/:id/like', requireAuth, toggleLike);
router.post('/:id/bookmark', requireAuth, toggleBookmark);

module.exports = router;
