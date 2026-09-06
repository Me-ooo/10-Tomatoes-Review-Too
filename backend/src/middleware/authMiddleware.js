const { verifyToken, isAdmin, signToken } = require('../middlewares/authMiddleware');

const authenticate = verifyToken;
const requireAdmin = [verifyToken, isAdmin];

module.exports = {
  verifyToken,
  isAdmin,
  authenticate,
  requireAdmin,
  signToken,
};
