const express = require('express');
const router = express.Router();
const {
  getComments,
  createComment,
  deleteComment,
} = require('../controllers/commentController');
const { requireAuth, optionalAuth } = require('../middleware/auth');

router.get('/post/:postId', optionalAuth, getComments);
router.post('/post/:postId', requireAuth, createComment);
router.delete('/:id', requireAuth, deleteComment);

module.exports = router;
