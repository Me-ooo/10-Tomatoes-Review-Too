const express = require('express');
const { register, login, me } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.get('/me', verifyToken, asyncHandler(me));

module.exports = { authRouter: router };
