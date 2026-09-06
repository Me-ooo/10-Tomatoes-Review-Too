const { User, ROLES } = require('../models/User');
const { signToken } = require('../middlewares/authMiddleware');

async function register(req, res) {
  const { username, email, password } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'username, email, and password are required' });
  }

  const user = await User.create({
    username,
    email,
    password,
    role: ROLES.USER,
  });

  const token = signToken(user);

  return res.status(201).json({
    token,
    user: user.toSafeObject(),
  });
}

async function login(req, res) {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const matches = await user.comparePassword(password);

  if (!matches) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = signToken(user);

  return res.json({
    token,
    user: user.toSafeObject(),
  });
}

async function me(req, res) {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({ user: user.toSafeObject() });
}

module.exports = {
  register,
  login,
  me,
};
