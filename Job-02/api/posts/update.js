const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Post = require('../../models/Post');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

module.exports = async (req, res) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const { id, title, type, excerpt, content, coverImage, published } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Post id is required' });
  }

  if (!title || !type) {
    return res.status(400).json({ error: 'Title and type are required' });
  }

  if (type !== 'project' && type !== 'blog') {
    return res.status(400).json({ error: 'Type must be "project" or "blog"' });
  }

  try {
    await connectDB();

    // slug is deliberately excluded from this $set — never touched on update.
    const updated = await Post.findByIdAndUpdate(
      id,
      { title, type, excerpt, content, coverImage, published: published || false },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.status(200).json({ post: updated });
  } catch (err) {
    console.error('Update post error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};