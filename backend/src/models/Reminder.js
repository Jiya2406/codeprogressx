const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    contestId: { type: Number, required: true },
    contestName: String,
    contestStartTime: { type: Date, required: true, index: true },
    durationSeconds: Number,
    emailSent: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

reminderSchema.index({ userId: 1, contestId: 1 }, { unique: true });

module.exports = mongoose.model('Reminder', reminderSchema);
