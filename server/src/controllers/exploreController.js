const prisma = require('../utils/prisma');

// GET /api/explore
const getExploreData = async (req, res, next) => {
  try {
    const { q, category } = req.query;
    const currentUserId = req.user?.id;

    // 1. If search query exists, return search results
    if (q && q.trim().length > 0) {
      const searchTerm = q.trim();

      const [users, posts] = await Promise.all([
        prisma.user.findMany({
          where: {
            OR: [
              { name: { contains: searchTerm } },
              { username: { contains: searchTerm } },
              { bio: { contains: searchTerm } },
            ],
          },
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
            bio: true,
            _count: {
              select: {
                followers: true,
                posts: true,
              },
            },
            followers: currentUserId ? { where: { followerId: currentUserId } } : false,
          },
          take: 10,
        }),
        prisma.post.findMany({
          where: {
            published: true,
            OR: [
              { content: { contains: searchTerm } },
              { category: { contains: searchTerm } },
            ],
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
          take: 20,
        }),
      ]);

      const formattedUsers = users.map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        followersCount: u._count.followers,
        postsCount: u._count.posts,
        isFollowing: currentUserId && u.followers ? u.followers.length > 0 : false,
        isSelf: currentUserId === u.id,
      }));

      const formattedPosts = posts.map((p) => ({
        id: p.id,
        content: p.content,
        imageUrl: p.imageUrl,
        category: p.category,
        createdAt: p.createdAt,
        author: {
          id: p.author.id,
          name: p.author.name,
          username: p.author.username,
          avatarUrl: p.author.avatarUrl,
        },
        likesCount: p._count.likes,
        commentsCount: p._count.comments,
        bookmarksCount: p._count.bookmarks,
        isLiked: currentUserId && p.likes ? p.likes.length > 0 : false,
        isBookmarked: currentUserId && p.bookmarks ? p.bookmarks.length > 0 : false,
        isAuthor: currentUserId === p.authorId,
      }));

      return res.json({
        success: true,
        isSearch: true,
        searchTerm,
        users: formattedUsers,
        posts: formattedPosts,
      });
    }

    // 2. Default explore view: topics, featured posts, creators
    const [categoryCounts, featuredPosts, topCreators] = await Promise.all([
      prisma.post.groupBy({
        by: ['category'],
        where: { published: true },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
      }),
      prisma.post.findMany({
        where: {
          published: true,
          ...(category && category !== 'All' ? { category } : {}),
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
        orderBy: [
          { likes: { _count: 'desc' } },
          { createdAt: 'desc' },
        ],
        take: 12,
      }),
      prisma.user.findMany({
        where: currentUserId ? { id: { not: currentUserId } } : {},
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
          bio: true,
          _count: {
            select: {
              followers: true,
              posts: true,
            },
          },
          followers: currentUserId ? { where: { followerId: currentUserId } } : false,
        },
        orderBy: {
          followers: { _count: 'desc' },
        },
        take: 5,
      }),
    ]);

    const topics = categoryCounts.map((c) => ({
      name: c.category || 'General',
      count: c._count.id,
    }));

    const formattedFeatured = featuredPosts.map((p) => ({
      id: p.id,
      content: p.content,
      imageUrl: p.imageUrl,
      category: p.category,
      createdAt: p.createdAt,
      author: {
        id: p.author.id,
        name: p.author.name,
        username: p.author.username,
        avatarUrl: p.author.avatarUrl,
        bio: p.author.bio,
      },
      likesCount: p._count.likes,
      commentsCount: p._count.comments,
      bookmarksCount: p._count.bookmarks,
      isLiked: currentUserId && p.likes ? p.likes.length > 0 : false,
      isBookmarked: currentUserId && p.bookmarks ? p.bookmarks.length > 0 : false,
      isAuthor: currentUserId === p.authorId,
    }));

    const formattedCreators = topCreators.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      avatarUrl: u.avatarUrl,
      bio: u.bio,
      followersCount: u._count.followers,
      postsCount: u._count.posts,
      isFollowing: currentUserId && u.followers ? u.followers.length > 0 : false,
      isSelf: currentUserId === u.id,
    }));

    return res.json({
      success: true,
      isSearch: false,
      topics,
      featuredPosts: formattedFeatured,
      topCreators: formattedCreators,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExploreData,
};
