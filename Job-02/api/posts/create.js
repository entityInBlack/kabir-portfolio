const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Post = require('../../models/Post');


// Reuse connection across invocations (serverless best practice)
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
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

  const { title, type, excerpt, content, coverImage, published } = req.body;

  if (!title || !type) {
    return res.status(400).json({ error: 'Title and type are required' });
  }

  if (type !== 'project' && type !== 'blog') {
    return res.status(400).json({ error: 'Type must be "project" or "blog"' });
  }

  try {
    await connectDB();

    const post = new Post({
      title,
      type,
      excerpt,
      content,
      coverImage,
      published: published || false,
    });

    await post.save();

    return res.status(200).json({ post });
  } catch (err) {
    console.error('Create post error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};