const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String },
    googleId: { type: String, index: true },
    avatar: { type: String },
    name: { type: String, trim: true },
    cfHandle: { type: String, trim: true },
    cfData: {
      rating: Number,
      maxRating: Number,
      rank: String,
      maxRank: String,
      avatar: String,
      titlePhoto: String,
      contribution: Number,
      lastFetched: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
