const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    // User who submitted the request.
    // For an employee: employee field is also populated.
    // For a project manager: requester is the PM.
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Employee requesting leave.
    // Null when the requester is a Project Manager.
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // For employee leave:
    // request goes to their Project Manager.
    //
    // For PM leave:
    // request goes to Admin, therefore this is null.
    projectManager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Who is expected to review the request.
    approvalLevel: {
      type: String,
      enum: ["project_manager", "admin"],
      required: true,
    },

    leaveType: {
      type: String,
      enum: [
        "casual",
        "sick",
        "earned",
        "work-from-home",
        "other",
      ],
      required: true,
    },

    fromDate: {
      type: Date,
      required: true,
    },

    toDate: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    // Location the person will be visiting.
    visitingLocation: {
      type: String,
      trim: true,
      default: "",
    },

    // Additional information provided by requester.
    additionalDetails: {
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
      ],
      default: "pending",
    },

    managerComment: {
      type: String,
      trim: true,
      default: "",
    },

    adminComment: {
      type: String,
      trim: true,
      default: "",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

leaveRequestSchema.index({
  requester: 1,
  createdAt: -1,
});

leaveRequestSchema.index({
  employee: 1,
  status: 1,
});

leaveRequestSchema.index({
  projectManager: 1,
  status: 1,
});

module.exports = mongoose.model(
  "LeaveRequest",
  leaveRequestSchema
);