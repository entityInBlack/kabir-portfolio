const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const Post = require('../../models/Post');
const { deleteImage } = require('../utils/cloudinary');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI);
  isConnected = true;
}

module.exports = async (req, res) => {
  if (req.method !== 'DELETE') {
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

  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Post id is required' });
  }

  try {
    await connectDB();

    const deleted = await Post.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Post is already gone from MongoDB (source of truth) at this point.
    // If Cloudinary cleanup fails here, the image becomes orphaned —
    // an accepted, known scenario, handled later by the planned
    // orphaned-images cleanup admin feature. We don't fail the request over it.
    if (deleted.coverImage && deleted.coverImage.publicId) {
      try {
        await deleteImage(deleted.coverImage.publicId);
      } catch (imgErr) {
        console.error('Cloudinary cleanup failed for', deleted.coverImage.publicId, imgErr);
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Delete post error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};