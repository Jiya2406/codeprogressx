const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const chatSessionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'New chat' },
    messages: [messageSchema]
  },
  { timestamps: true }
);

chatSessionSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
