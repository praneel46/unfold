const prisma = require('../utils/prisma');

// GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { recipientId: userId },
        include: {
          actor: {
            select: {
              id: true,
              name: true,
              username: true,
              avatarUrl: true,
            },
          },
          post: {
            select: {
              id: true,
              content: true,
              category: true,
            },
          },
          comment: {
            select: {
              id: true,
              content: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.notification.count({ where: { recipientId: userId } }),
      prisma.notification.count({ where: { recipientId: userId, read: false } }),
    ]);

    const formatted = notifications.map((n) => ({
      id: n.id,
      type: n.type,
      read: n.read,
      createdAt: n.createdAt,
      actor: n.actor,
      post: n.post ? {
        id: n.post.id,
        snippet: n.post.content.length > 80 ? n.post.content.substring(0, 80) + '...' : n.post.content,
        category: n.post.category,
      } : null,
      comment: n.comment ? {
        id: n.comment.id,
        content: n.comment.content,
      } : null,
    }));

    return res.json({
      success: true,
      notifications: formatted,
      unreadCount,
      pagination: {
        page: parseInt(page, 10),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
        hasMore: skip + notifications.length < total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/notifications/:id/read
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: {
        id,
        recipientId: userId,
      },
      data: { read: true },
    });

    const unreadCount = await prisma.notification.count({
      where: { recipientId: userId, read: false },
    });

    return res.json({
      success: true,
      message: 'Notification marked as read',
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/notifications/read-all
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await prisma.notification.updateMany({
      where: { recipientId: userId, read: false },
      data: { read: true },
    });

    return res.json({
      success: true,
      message: 'All notifications marked as read',
      unreadCount: 0,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/notifications/unread-count
const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const count = await prisma.notification.count({
      where: { recipientId: userId, read: false },
    });

    return res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
