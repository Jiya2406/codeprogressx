const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    cfSubmissionId: { type: Number, required: true },
    problemId: { type: String, required: true },
    problemName: String,
    problemRating: Number,
    problemTags: [String],
    verdict: String,
    programmingLanguage: String,
    passedTestCount: Number,
    contestId: Number,
    submittedAt: { type: Date, index: true }
  },
  { timestamps: true }
);

submissionSchema.index({ userId: 1, cfSubmissionId: 1 }, { unique: true });
submissionSchema.index({ userId: 1, verdict: 1 });
submissionSchema.index({ userId: 1, problemId: 1 });

module.exports = mongoose.model('Submission', submissionSchema);
