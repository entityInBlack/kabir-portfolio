const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    type: { type: String, enum: ['project', 'blog'], required: true },
    excerpt: { type: String },
    content: { type: String },
    coverImage: {
      url: { type: String },
      publicId: { type: String },
    },
    published: { type: Boolean, default: false },
  },
  { timestamps: true }
);

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Auto-generate slug from title on create, and re-generate if title changes.
// Appends -2, -3, etc. on collision.
PostSchema.pre('save', async function (next) {
  if (!this.isModified('title') && this.slug) {
    return next();
  }

  const baseSlug = slugify(this.title);
  let candidateSlug = baseSlug;
  let suffix = 2;

  while (
    await this.constructor.findOne({
      slug: candidateSlug,
      _id: { $ne: this._id },
    })
  ) {
    candidateSlug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  this.slug = candidateSlug;
  next();
});

const existing = mongoose.models.Post;
console.log('Existing model type:', typeof existing);
module.exports = existing || mongoose.model('Post', PostSchema);