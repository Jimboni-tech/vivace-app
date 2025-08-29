const jwt = require('jsonwebtoken');
const User = require('../models/user.js');

const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      message: 'Authentication token required',
      code: 'TOKEN_MISSING'
    });
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token expired',
          code: 'TOKEN_EXPIRED'
        });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Invalid token',
          code: 'TOKEN_INVALID'
        });
      }
      return res.status(401).json({ 
        message: 'Token verification failed',
        code: 'TOKEN_VERIFICATION_FAILED'
      });
    }

    try {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        return res.status(401).json({ 
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(500).json({ 
        message: 'Error verifying user',
        code: 'USER_VERIFICATION_ERROR'
      });
    }
  });
};

const authenticateOptional = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) {
      req.user = null;
      return next();
    }

    try {
      const user = await User.findById(decoded.id).select('-password');
      req.user = user || null;
      next();
    } catch (error) {
      req.user = null;
      next();
    }
  });
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

const requireOwnership = (modelName) => {
  return async (req, res, next) => {
    try {
      const Model = require(`../models/${modelName}.js`);
      const resource = await Model.findById(req.params.id);
      
      if (!resource) {
        return res.status(404).json({ 
          message: 'Resource not found',
          code: 'RESOURCE_NOT_FOUND'
        });
      }

      if (resource.user && resource.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({ 
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        });
      }

      req.resource = resource;
      next();
    } catch (error) {
      return res.status(500).json({ 
        message: 'Error checking resource ownership',
        code: 'OWNERSHIP_CHECK_ERROR'
      });
    }
  };
};

module.exports = {
  authenticateToken,
  authenticateOptional,
  requireRole,
  requireOwnership
};
