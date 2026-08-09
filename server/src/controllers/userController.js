const prisma = require('../utils/prisma');

// GET /api/users/profile/:username
const getUserProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      include: {
        _count: {
          select: {
            posts: { where: { published: true } },
            followers: true,
            following: true,
          },
        },
        followers: currentUserId ? { where: { followerId: currentUserId } } : false,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isFollowing = currentUserId
      ? user.followers?.some((f) => f.followerId === currentUserId) || false
      : false;

    const isSelf = currentUserId === user.id;

    return res.json({
      success: true,
      user: {
        id: user.id,
        email: isSelf ? user.email : undefined,
        name: user.name,
        username: user.username,
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        avatarUrl: user.avatarUrl || '',
        bannerUrl: user.bannerUrl || '',
        createdAt: user.createdAt,
        stats: {
          postsCount: user._count.posts,
          followersCount: user._count.followers,
          followingCount: user._count.following,
        },
        isFollowing,
        isSelf,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, bio, location, website, avatarUrl, bannerUrl } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (bio !== undefined) updateData.bio = bio.trim();
    if (location !== undefined) updateData.location = location.trim();
    if (website !== undefined) updateData.website = website.trim();
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl.trim();
    if (bannerUrl !== undefined) updateData.bannerUrl = bannerUrl.trim();

    // Check if uploaded files present in req.files
    if (req.files) {
      if (req.files.avatar && req.files.avatar[0]) {
        updateData.avatarUrl = `/uploads/${req.files.avatar[0].filename}`;
      }
      if (req.files.banner && req.files.banner[0]) {
        updateData.bannerUrl = `/uploads/${req.files.banner[0].filename}`;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        username: updatedUser.username,
        bio: updatedUser.bio,
        location: updatedUser.location,
        website: updatedUser.website,
        avatarUrl: updatedUser.avatarUrl,
        bannerUrl: updatedUser.bannerUrl,
        createdAt: updatedUser.createdAt,
        stats: {
          postsCount: updatedUser._count.posts,
          followersCount: updatedUser._count.followers,
          followingCount: updatedUser._count.following,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/users/:id/follow
const toggleFollow = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });

    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    let isFollowing = false;

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      });
      // Delete follow notification
      await prisma.notification.deleteMany({
        where: {
          type: 'FOLLOW',
          recipientId: targetUserId,
          actorId: currentUserId,
        },
      }).catch(() => {});
      isFollowing = false;
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      });
      isFollowing = true;

      // Trigger follow notification
      await prisma.notification.create({
        data: {
          type: 'FOLLOW',
          recipientId: targetUserId,
          actorId: currentUserId,
        },
      }).catch(() => {});
    }

    const [followersCount, followingCount] = await Promise.all([
      prisma.follow.count({ where: { followingId: targetUserId } }),
      prisma.follow.count({ where: { followerId: targetUserId } }),
    ]);

    return res.json({
      success: true,
      isFollowing,
      followersCount,
      followingCount,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id/followers
const getFollowers = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    const followRecords = await prisma.follow.findMany({
      where: { followingId: id },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            username: true,
            bio: true,
            avatarUrl: true,
            followers: currentUserId ? { where: { followerId: currentUserId } } : false,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const followers = followRecords.map((r) => ({
      id: r.follower.id,
      name: r.follower.name,
      username: r.follower.username,
      bio: r.follower.bio,
      avatarUrl: r.follower.avatarUrl,
      isFollowing: currentUserId
        ? r.follower.followers?.some((f) => f.followerId === currentUserId) || false
        : false,
      isSelf: currentUserId === r.follower.id,
    }));

    return res.json({ success: true, users: followers });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id/following
const getFollowing = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    const followRecords = await prisma.follow.findMany({
      where: { followerId: id },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            username: true,
            bio: true,
            avatarUrl: true,
            followers: currentUserId ? { where: { followerId: currentUserId } } : false,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const following = followRecords.map((r) => ({
      id: r.following.id,
      name: r.following.name,
      username: r.following.username,
      bio: r.following.bio,
      avatarUrl: r.following.avatarUrl,
      isFollowing: currentUserId
        ? r.following.followers?.some((f) => f.followerId === currentUserId) || false
        : false,
      isSelf: currentUserId === r.following.id,
    }));

    return res.json({ success: true, users: following });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id/likes (Posts liked by user)
const getUserLikedPosts = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.id;

    const likes = await prisma.like.findMany({
      where: { userId: id },
      include: {
        post: {
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
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const posts = likes.map((l) => {
      const p = l.post;
      return {
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
          isFollowing: currentUserId && p.author.followers ? p.author.followers.length > 0 : false,
        },
        likesCount: p._count.likes,
        commentsCount: p._count.comments,
        bookmarksCount: p._count.bookmarks,
        isLiked: currentUserId && p.likes ? p.likes.length > 0 : false,
        isBookmarked: currentUserId && p.bookmarks ? p.bookmarks.length > 0 : false,
        isAuthor: currentUserId === p.authorId,
      };
    });

    return res.json({ success: true, posts });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/bookmarks (Current user's bookmarked posts)
const getUserBookmarks = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
                username: true,
                avatarUrl: true,
                bio: true,
                followers: { where: { followerId: userId } },
              },
            },
            likes: { where: { userId } },
            bookmarks: { where: { userId } },
            _count: {
              select: {
                likes: true,
                comments: true,
                bookmarks: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const posts = bookmarks.map((b) => {
      const p = b.post;
      return {
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
          isFollowing: p.author.followers?.length > 0,
        },
        likesCount: p._count.likes,
        commentsCount: p._count.comments,
        bookmarksCount: p._count.bookmarks,
        isLiked: p.likes?.length > 0,
        isBookmarked: true,
        isAuthor: p.authorId === userId,
      };
    });

    return res.json({ success: true, posts });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/suggestions/who-to-follow
const getWhoToFollow = async (req, res, next) => {
  try {
    const currentUserId = req.user?.id;
    let excludedIds = [];

    if (currentUserId) {
      const followedRecords = await prisma.follow.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
      });
      excludedIds = [currentUserId, ...followedRecords.map((f) => f.followingId)];
    }

    const suggestions = await prisma.user.findMany({
      where: {
        id: { notIn: excludedIds },
      },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        avatarUrl: true,
        _count: {
          select: {
            followers: true,
            posts: true,
          },
        },
      },
      take: 5,
    });

    const formatted = suggestions.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      bio: u.bio,
      avatarUrl: u.avatarUrl,
      followersCount: u._count.followers,
      postsCount: u._count.posts,
      isFollowing: false,
    }));

    return res.json({ success: true, suggestions: formatted });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
  updateProfile,
  toggleFollow,
  getFollowers,
  getFollowing,
  getUserLikedPosts,
  getUserBookmarks,
  getWhoToFollow,
};
