const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    // =========================================
    // PROJECT NAME
    // =========================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    // =========================================
    // PROJECT DESCRIPTION
    // =========================================

    description: {
      type: String,
      required: true,
      trim: true,
    },

    // =========================================
    // START DATE
    // =========================================

    startDate: {
      type: Date,
      required: true,
    },

    // =========================================
    // END DATE
    // =========================================

    endDate: {
      type: Date,
      required: true,
    },

    // =========================================
    // PROJECT MANAGER
    // =========================================

    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // =========================================
    // PROJECT STATUS
    // =========================================

    status: {
      type: String,
      enum: [
        "planning",
        "active",
        "on_hold",
        "completed",
      ],
      default: "planning",
    },
  },
  {
    timestamps: true,
  }
);

// =========================================
// EXPORT MODEL
// =========================================

module.exports = mongoose.model(
  "Project",
  projectSchema
);