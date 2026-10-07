const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },

    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },

    status: {
      type: String,
      enum: [
        "todo",
        "in_progress",
        "review",
        "completed",
      ],
      default: "todo",
    },

    dueDate: {
      type: Date,
      required: true,
    },

    // ==================================================
    // TASK SUBMISSION
    // ==================================================

    submission: {
      submitted: {
        type: Boolean,
        default: false,
      },

      evidenceImage: {
        type: String,
        default: "",
      },

      completionComment: {
        type: String,
        default: "",
        trim: true,
      },

      submittedAt: {
        type: Date,
        default: null,
      },

      reviewedAt: {
        type: Date,
        default: null,
      },

      reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },

      reviewComment: {
        type: String,
        default: "",
        trim: true,
      },

      rejectionReason: {
        type: String,
        default: "",
        trim: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);