const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    path: {
      type: String,
      required: true,
    },

    uploaded: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
  }
);

const verificationSchema = new mongoose.Schema(
  {
    documentsUploaded: {
      type: Boolean,
      default: false,
    },

    filenameValid: {
      type: Boolean,
      default: false,
    },

    signatureConfirmed: {
      type: Boolean,
      default: false,
    },

    requiredFieldsCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    templateName: {
      type: String,
      required: true,
    },

    documents: {
      type: [documentSchema],
      default: [],
    },

    verification: {
      type: verificationSchema,
      default: () => ({}),
    },

    status: {
      type: String,
      enum: ["Pending Verification", "Verified", "Submitted"],
      default: "Pending Verification",
    },

    submittedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Submission", submissionSchema);