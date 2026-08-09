const { verifyToken } = require('../utils/jwt');
const prisma = require('../utils/prisma');

// Strict auth middleware - denies access if unauthenticated
const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        bio: true,
        location: true,
        website: true,
        avatarUrl: true,
        bannerUrl: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid authentication token' });
  }
};

// Optional auth middleware - populates req.user if valid token provided, but doesn't fail if absent
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          avatarUrl: true,
        },
      });
      if (user) {
        req.user = user;
      }
    }
  } catch (err) {
    // Ignore invalid token in optional auth
  }
  next();
};

module.exports = {
  requireAuth,
  optionalAuth,
};
