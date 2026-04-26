const jwt = require('jsonwebtoken');
const authModel = require('../models/auth.model');

function mapUserForResponse(user) {
  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    role: user.role,
  };
}

function createAuthToken(user) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
    },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

async function register(req, res, next) {
  try {
    const { firstName, lastName, email, password } = req.body;

    const normalizedFirstName = String(firstName || '').trim();
    const normalizedLastName = String(lastName || '').trim();

    if (!normalizedFirstName || !normalizedLastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'firstName, lastName, email and password are required',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await authModel.findUserIdByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email is already registered',
      });
    }

    await authModel.createUser(
      normalizedFirstName,
      normalizedLastName,
      normalizedEmail,
      String(password)
    );

    const createdUser = await authModel.findUserPublicByEmail(normalizedEmail);

    const token = createAuthToken(createdUser);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: mapUserForResponse(createdUser),
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'email and password are required',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await authModel.findUserWithPasswordByEmail(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (user.is_active !== 'true') {
      return res.status(403).json({
        success: false,
        message: 'This account is inactive',
      });
    }

    if (String(password) !== user.password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = createAuthToken(user);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: mapUserForResponse(user),
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function me(req, res, next) {
  try {
    const userId = req.auth.userId;
    const user = await authModel.findActiveUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

  return res.status(200).json({
    success: true,
    data: {
      user: mapUserForResponse(user),
    },
  });
  } catch (error) {
    return next(error);
  }
}

async function upgradeToAdmin(req, res, next) {
  try {
    const userId = req.auth.userId;
    const providedPassword = String(req.body?.adminPassword || '');
    const configuredPassword = String(process.env.ADMIN_PASSWORD || '');

    if (!configuredPassword) {
      return res.status(500).json({
        success: false,
        message: 'ADMIN_PASSWORD is not configured',
      });
    }

    if (!providedPassword) {
      return res.status(400).json({
        success: false,
        message: 'adminPassword is required',
      });
    }

    if (providedPassword !== configuredPassword) {
      return res.status(403).json({
        success: false,
        message: 'Invalid admin password',
      });
    }

    const user = await authModel.findUserById(userId);
    if (!user || user.is_active !== 'true') {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (String(user.role || '').toLowerCase() !== 'admin') {
      await authModel.promoteUserToAdmin(userId);
    }

    const updatedUser = await authModel.findActiveUserById(userId);
    const token = createAuthToken(updatedUser);

    return res.status(200).json({
      success: true,
      message: 'User promoted to admin successfully',
      data: {
        token,
        user: mapUserForResponse(updatedUser),
      },
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  register,
  login,
  me,
  upgradeToAdmin,
};
