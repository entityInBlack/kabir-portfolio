const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Post = require('../../models/Post');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

function isAdmin(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.split(' ')[1];

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { type } = req.query;

  if (type && type !== 'project' && type !== 'blog') {
    return res.status(400).json({ error: 'Type must be "project" or "blog"' });
  }

  const filter = {};

  if (type) {
    filter.type = type;
  }

  if (!isAdmin(req)) {
    filter.published = true;
  }

  try {
    await connectDB();

    const posts = await Post.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({ posts });
  } catch (err) {
    console.error('List posts error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};