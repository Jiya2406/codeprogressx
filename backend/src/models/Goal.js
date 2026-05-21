const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['rating', 'solved', 'tag'], required: true },
    target: { type: Number, required: true },
    tag: String,
    title: String,
    deadline: Date,
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Goal', goalSchema);
