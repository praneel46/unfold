const prisma = require('../utils/prisma');

// GET /api/posts/:postId/comments
const getComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const currentUserId = req.user?.id;

    const comments = await prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const formatted = comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      author: c.author,
      isAuthor: currentUserId ? c.authorId === currentUserId : false,
    }));

    return res.json({
      success: true,
      comments: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/posts/:postId/comments
const createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment cannot be empty' });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        postId,
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Create notification if comment is not by the post author
    if (post.authorId !== userId) {
      await prisma.notification.create({
        data: {
          type: 'COMMENT',
          recipientId: post.authorId,
          actorId: userId,
          postId: post.id,
          commentId: comment.id,
        },
      }).catch(() => {});
    }

    const commentsCount = await prisma.comment.count({
      where: { postId },
    });

    return res.status(201).json({
      success: true,
      message: 'Comment added',
      comment: {
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        author: comment.author,
        isAuthor: true,
      },
      commentsCount,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/comments/:id
const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await prisma.comment.findUnique({
      where: { id },
      include: {
        post: { select: { authorId: true } },
      },
    });

    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Either comment author or post author can delete
    if (comment.authorId !== userId && comment.post.authorId !== userId) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this comment' });
    }

    await prisma.comment.delete({
      where: { id },
    });

    const commentsCount = await prisma.comment.count({
      where: { postId: comment.postId },
    });

    return res.json({
      success: true,
      message: 'Comment deleted',
      commentsCount,
      postId: comment.postId,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComments,
  createComment,
  deleteComment,
};
