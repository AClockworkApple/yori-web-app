const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, key] = stored.split(':');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return key === hash;
}

function generateToken(user) {
  return jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
}

function generateRefreshToken(user) {
  return jwt.sign({ userId: user.id, type: 'refresh' }, JWT_SECRET, { expiresIn: '7d' });
}

const authController = {
  async register(req, res) {
    try {
      const { email, password, name, role, restaurantId } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: 'email, password, and name are required' });
      }

      const existingUser = await User.getByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const passwordHash = hashPassword(password);

      const user = await User.create({
        email,
        name,
        passwordHash,
        role: role || 'STAFF',
        restaurantId: restaurantId || null
      });

      const { passwordHash: _, ...safeUser } = user;

      res.status(201).json({
        user: safeUser,
        idToken: generateToken(user),
        refreshToken: generateRefreshToken(user)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'email and password are required' });
      }

      const user = await User.getByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      if (!verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const { passwordHash: _, ...safeUser } = user;

      res.json({
        user: safeUser,
        idToken: generateToken(user),
        refreshToken: generateRefreshToken(user)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async me(req, res) {
    try {
      const { passwordHash, ...safeUser } = req.user;
      res.json({ user: safeUser });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  async refresh(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ error: 'refreshToken is required' });
      }

      const decoded = jwt.verify(refreshToken, JWT_SECRET);
      if (decoded.type !== 'refresh') {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      const user = await User.getById(decoded.userId);
      if (!user) {
        return res.status(401).json({ error: 'User not found' });
      }

      res.json({
        idToken: generateToken(user),
        refreshToken: generateRefreshToken(user),
        expiresIn: 3600
      });
    } catch (error) {
      res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
  }
};

module.exports = authController;