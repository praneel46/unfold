const prisma = require('../utils/prisma');

// Helper to format post with user interaction flags
const formatPost = (post, currentUserId = null) => {
  const isLiked = currentUserId
    ? post.likes?.some((like) => like.userId === currentUserId) || false
    : false;

  const isBookmarked = currentUserId
    ? post.bookmarks?.some((bm) => bm.userId === currentUserId) || false
    : false;

  const isFollowingAuthor = currentUserId && post.author?.followers
    ? post.author.followers.some((f) => f.followerId === currentUserId)
    : false;

  return {
    id: post.id,
    content: post.content,
    imageUrl: post.imageUrl,
    category: post.category || 'Thought',
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: {
      id: post.author.id,
      name: post.author.name,
      username: post.author.username,
      avatarUrl: post.author.avatarUrl,
      bio: post.author.bio,
      isFollowing: isFollowingAuthor,
    },
    likesCount: post._count?.likes ?? (post.likes ? post.likes.length : 0),
    commentsCount: post._count?.comments ?? (post.comments ? post.comments.length : 0),
    bookmarksCount: post._count?.bookmarks ?? (post.bookmarks ? post.bookmarks.length : 0),
    isLiked,
    isBookmarked,
    isAuthor: currentUserId ? post.authorId === currentUserId : false,
    comments: post.comments?.map((c) => ({
      id: c.id,
      content: c.content,
      createdAt: c.createdAt,
      author: {
        id: c.author.id,
        name: c.author.name,
        username: c.author.username,
        avatarUrl: c.author.avatarUrl,
      },
      isAuthor: currentUserId ? c.authorId === currentUserId : false,
    })),
  };
};

// GET /api/posts
const getPosts = async (req, res, next) => {
  try {
    const { feed = 'for-you', category, username, search, page = 1, limit = 15 } = req.query;
    const currentUserId = req.user?.id;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    let whereClause = { published: true };

    if (category && category !== 'All') {
      whereClause.category = category;
    }

    if (username) {
      whereClause.author = { username: username.toLowerCase() };
    }

    if (search) {
      whereClause.OR = [
        { content: { contains: search } },
        { author: { name: { contains: search } } },
        { author: { username: { contains: search } } },
      ];
    }

    // Following feed filter
    if (feed === 'following' && currentUserId) {
      const followingRecords = await prisma.follow.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
      });
      const followingIds = followingRecords.map((f) => f.followingId);
      // Include own posts and followed users
      whereClause.authorId = { in: [...followingIds, currentUserId] };
    }

    const [posts, totalCount] = await Promise.all([
      prisma.post.findMany({
        where: whereClause,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
              bio: true,
              followers: currentUserId ? { where: { followerId: currentUserId } } : false,
            },
          },
          likes: currentUserId ? { where: { userId: currentUserId } } : false,
          bookmarks: currentUserId ? { where: { userId: currentUserId } } : false,
          _count: {
            select: {
              likes: true,
              comments: true,
              bookmarks: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.post.count({ where: whereClause }),
    ]);

    const formattedPosts = posts.map((p) => formatPost(p, currentUserId));

    return res.json({
      success: true,
      posts: formattedPosts,
      pagination: {
        page: parseInt(page, 10),
        limit: take,
        total: totalCount,
        totalPages: Math.ceil(totalCount / take),
        hasMore: skip + posts.length < totalCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/posts/:id
const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            bio: true,
            followers: currentUserId ? { where: { followerId: currentUserId } } : false,
          },
        },
        likes: currentUserId ? { where: { userId: currentUserId } } : false,
        bookmarks: currentUserId ? { where: { userId: currentUserId } } : false,
        comments: {
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
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    return res.json({
      success: true,
      post: formatPost(post, currentUserId),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/posts
const createPost = async (req, res, next) => {
  try {
    const { content, category = 'Thought' } = req.body;
    let imageUrl = req.body.imageUrl || null;

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Post content cannot be empty' });
    }

    const post = await prisma.post.create({
      data: {
        content: content.trim(),
        category: category.trim(),
        imageUrl: imageUrl ? imageUrl.trim() : null,
        authorId: req.user.id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            bio: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
            bookmarks: true,
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Post published successfully',
      post: formatPost(post, req.user.id),
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/posts/:id
const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id },
      select: { authorId: true },
    });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    if (post.authorId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You are not authorized to delete this post' });
    }

    await prisma.post.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/posts/:id/like
const toggleLike = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true, authorId: true },
    });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    let isLiked = false;

    if (existingLike) {
      // Unlike
      await prisma.like.delete({
        where: { id: existingLike.id },
      });
      // Remove notification if any
      await prisma.notification.deleteMany({
        where: {
          type: 'LIKE',
          recipientId: post.authorId,
          actorId: userId,
          postId,
        },
      }).catch(() => {});
      isLiked = false;
    } else {
      // Like
      await prisma.like.create({
        data: {
          userId,
          postId,
        },
      });
      isLiked = true;

      // Trigger notification for author if not liking own post
      if (post.authorId !== userId) {
        await prisma.notification.create({
          data: {
            type: 'LIKE',
            recipientId: post.authorId,
            actorId: userId,
            postId,
          },
        }).catch(() => {});
      }
    }

    const likesCount = await prisma.like.count({
      where: { postId },
    });

    return res.json({
      success: true,
      isLiked,
      likesCount,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/posts/:id/bookmark
const toggleBookmark = async (req, res, next) => {
  try {
    const { id: postId } = req.params;
    const userId = req.user.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const existingBookmark = await prisma.bookmark.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    let isBookmarked = false;

    if (existingBookmark) {
      await prisma.bookmark.delete({
        where: { id: existingBookmark.id },
      });
      isBookmarked = false;
    } else {
      await prisma.bookmark.create({
        data: {
          userId,
          postId,
        },
      });
      isBookmarked = true;
    }

    const bookmarksCount = await prisma.bookmark.count({
      where: { postId },
    });

    return res.json({
      success: true,
      isBookmarked,
      bookmarksCount,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPostById,
  createPost,
  deletePost,
  toggleLike,
  toggleBookmark,
};
