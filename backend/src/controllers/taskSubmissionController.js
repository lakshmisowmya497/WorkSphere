const Task = require("../models/Task");
const User = require("../models/User");

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId
  );
};

// ======================================================
// EMPLOYEE SUBMITS COMPLETED WORK
// ======================================================

const submitTaskForReview = async (req, res) => {
  try {
    const employeeId = getUserId(req);
    const { id } = req.params;

    const {
      evidenceImage,
      completionComment,
    } = req.body;

    if (!employeeId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    if (!evidenceImage) {
      return res.status(400).json({
        message:
          "Please upload a screenshot or photo of the completed work",
      });
    }

    if (!completionComment?.trim()) {
      return res.status(400).json({
        message:
          "Please add a completion comment",
      });
    }

    const employee = await User.findOne({
      _id: employeeId,
      role: "employee",
    });

    if (!employee) {
      return res.status(403).json({
        message: "Employee account not found",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // Employee can only submit their own task
    if (
      !task.assignedEmployee ||
      task.assignedEmployee.toString() !==
        employeeId.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not assigned to this task",
      });
    }

    // Cannot submit an already completed task
    if (task.status === "completed") {
      return res.status(400).json({
        message:
          "This task has already been completed",
      });
    }

    // Image size protection
    // Approximately 8 MB Base64 payload limit
    if (evidenceImage.length > 8 * 1024 * 1024) {
      return res.status(400).json({
        message:
          "Evidence image is too large. Please upload an image below 6 MB.",
      });
    }

    task.submission = {
      submitted: true,
      evidenceImage,
      completionComment:
        completionComment.trim(),
      submittedAt: new Date(),
      reviewedAt: null,
      reviewedBy: null,
      reviewComment: "",
      rejectionReason: "",
    };

    task.status = "review";

    await task.save();

    const updatedTask =
      await Task.findById(task._id)
        .populate(
          "project",
          "name description startDate endDate status"
        )
        .populate(
          "projectManager",
          "name email department jobTitle status"
        )
        .populate(
          "assignedEmployee",
          "name email department jobTitle status"
        )
        .populate(
          "submission.reviewedBy",
          "name email role"
        );

    return res.status(200).json({
      message:
        "Work submitted successfully for Project Manager review",
      task: updatedTask,
    });
  } catch (error) {
    console.error(
      "Submit Task For Review error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while submitting completed work",
    });
  }
};

// ======================================================
// PROJECT MANAGER APPROVES TASK
// ======================================================

const approveTaskSubmission = async (
  req,
  res
) => {
  try {
    const managerId = getUserId(req);
    const { id } = req.params;

    const {
      reviewComment = "",
    } = req.body;

    const manager = await User.findOne({
      _id: managerId,
      role: "project_manager",
    });

    if (!manager) {
      return res.status(403).json({
        message:
          "Only a Project Manager can approve task submissions",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (
      !task.projectManager ||
      task.projectManager.toString() !==
        managerId.toString()
    ) {
      return res.status(403).json({
        message:
          "This task does not belong to your projects",
      });
    }

    if (!task.submission?.submitted) {
      return res.status(400).json({
        message:
          "There is no submitted work to approve",
      });
    }

    task.status = "completed";

    task.submission.reviewedAt =
      new Date();

    task.submission.reviewedBy =
      managerId;

    task.submission.reviewComment =
      reviewComment.trim();

    task.submission.rejectionReason = "";

    await task.save();

    const updatedTask =
      await Task.findById(task._id)
        .populate(
          "project",
          "name description startDate endDate status"
        )
        .populate(
          "projectManager",
          "name email department jobTitle status"
        )
        .populate(
          "assignedEmployee",
          "name email department jobTitle status"
        )
        .populate(
          "submission.reviewedBy",
          "name email role"
        );

    return res.status(200).json({
      message:
        "Task submission approved successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error(
      "Approve Task Submission error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while approving task",
    });
  }
};

// ======================================================
// PROJECT MANAGER REJECTS TASK
// ======================================================

const rejectTaskSubmission = async (
  req,
  res
) => {
  try {
    const managerId = getUserId(req);
    const { id } = req.params;

    const {
      rejectionReason,
    } = req.body;

    if (!rejectionReason?.trim()) {
      return res.status(400).json({
        message:
          "Please provide a rejection reason",
      });
    }

    const manager = await User.findOne({
      _id: managerId,
      role: "project_manager",
    });

    if (!manager) {
      return res.status(403).json({
        message:
          "Only a Project Manager can reject task submissions",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    if (
      !task.projectManager ||
      task.projectManager.toString() !==
        managerId.toString()
    ) {
      return res.status(403).json({
        message:
          "This task does not belong to your projects",
      });
    }

    if (!task.submission?.submitted) {
      return res.status(400).json({
        message:
          "There is no submitted work to reject",
      });
    }

    task.status = "in_progress";

    task.submission.reviewedAt =
      new Date();

    task.submission.reviewedBy =
      managerId;

    task.submission.rejectionReason =
      rejectionReason.trim();

    task.submission.reviewComment = "";

    await task.save();

    const updatedTask =
      await Task.findById(task._id)
        .populate(
          "project",
          "name description startDate endDate status"
        )
        .populate(
          "projectManager",
          "name email department jobTitle status"
        )
        .populate(
          "assignedEmployee",
          "name email department jobTitle status"
        )
        .populate(
          "submission.reviewedBy",
          "name email role"
        );

    return res.status(200).json({
      message:
        "Task submission rejected. Employee can update and resubmit.",
      task: updatedTask,
    });
  } catch (error) {
    console.error(
      "Reject Task Submission error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while rejecting task",
    });
  }
};

// ======================================================
// PROJECT MANAGER GETS PENDING SUBMISSIONS
// ======================================================

const getManagerPendingSubmissions = async (
  req,
  res
) => {
  try {
    const managerId = getUserId(req);

    const manager = await User.findOne({
      _id: managerId,
      role: "project_manager",
    });

    if (!manager) {
      return res.status(403).json({
        message:
          "Only Project Managers can view submissions",
      });
    }

    const tasks = await Task.find({
      projectManager: managerId,
      status: "review",
      "submission.submitted": true,
    })
      .populate(
        "project",
        "name description startDate endDate status"
      )
      .populate(
        "assignedEmployee",
        "name email department jobTitle status"
      )
      .populate(
        "submission.reviewedBy",
        "name email role"
      )
      .sort({
        "submission.submittedAt": -1,
      });

    return res.status(200).json({
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error(
      "Get Manager Pending Submissions error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while loading submissions",
    });
  }
};

module.exports = {
  submitTaskForReview,
  approveTaskSubmission,
  rejectTaskSubmission,
  getManagerPendingSubmissions,
};