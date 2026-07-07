const jwt = require('jsonwebtoken');
const { AppError } = require('./errorHandler');
require('dotenv').config();

const protect = async (req, res, next) => {
  try {
    let token;
    
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Authentication token is required', 401, '06'));
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return next(new AppError('Token is invalid or has expired', 401, '06'));
      }
      
      req.user = decoded; // decoded contains { id, email, role }
      next();
    });
  } catch (error) {
    next(error);
  }
};

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403, '07')
      );
    }
    next();
  };
};

module.exports = {
  protect,
  restrictTo
};
