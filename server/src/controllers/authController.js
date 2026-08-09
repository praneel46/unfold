const bcrypt = require('bcryptjs');
const prisma = require('../utils/prisma');
const { generateToken } = require('../utils/jwt');

// Helper to format user for client
const formatUser = (user, counts = null) => {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    name: user.name,
    bio: user.bio || '',
    location: user.location || '',
    website: user.website || '',
    avatarUrl: user.avatarUrl || '',
    bannerUrl: user.bannerUrl || '',
    createdAt: user.createdAt,
    stats: counts ? {
      postsCount: counts.posts || 0,
      followersCount: counts.followers || 0,
      followingCount: counts.following || 0,
    } : undefined,
  };
};

// POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, username, password } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, username, and password are required',
      });
    }

    const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '');
    const cleanEmail = email.toLowerCase().trim();

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if email or username already taken
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { username: cleanUsername },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === cleanEmail) {
        return res.status(400).json({ success: false, message: 'An account with this email already exists' });
      }
      return res.status(400).json({ success: false, message: 'This username is already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        username: cleanUsername,
        passwordHash,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name.trim())}&backgroundColor=e05638,485c4b,2c2926`,
      },
    });

    // Create a welcoming notification from UNFOLD
    const unfoldFounder = await prisma.user.findFirst({
      where: { username: 'praneel_k' },
    });
    if (unfoldFounder && unfoldFounder.id !== newUser.id) {
      // Create auto-follow from founder & welcome follow
      await prisma.follow.create({
        data: {
          followerId: unfoldFounder.id,
          followingId: newUser.id,
        }
      }).catch(() => {});

      await prisma.notification.create({
        data: {
          type: 'FOLLOW',
          recipientId: newUser.id,
          actorId: unfoldFounder.id,
        }
      }).catch(() => {});
    }

    const token = generateToken({ userId: newUser.id });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: formatUser(newUser, { posts: 0, followers: 1, following: 0 }),
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { loginIdentifier, password } = req.body;

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/Username and password are required',
      });
    }

    const identifier = loginIdentifier.toLowerCase().trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { username: identifier },
        ],
      },
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your email/username and password.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please check your password.',
      });
    }

    const token = generateToken({ userId: user.id });

    return res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: formatUser(user, user._count),
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
            notificationsReceived: {
              where: { read: false },
            },
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({
      success: true,
      user: {
        ...formatUser(user, user._count),
        unreadNotificationsCount: user._count.notificationsReceived || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/auth/update-password
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash },
    });

    return res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updatePassword,
};
