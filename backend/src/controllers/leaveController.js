const LeaveRequest = require("../models/LeaveRequest");
const User = require("../models/User");

// ======================================================
// GET USER ID
// ======================================================

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId
  );
};

// ======================================================
// APPLY LEAVE
// EMPLOYEE + PROJECT MANAGER
// ======================================================

const applyLeave = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    const {
      leaveType,
      fromDate,
      toDate,
      reason,
      visitingLocation = "",
      additionalDetails = "",
    } = req.body;

    if (
      !leaveType ||
      !fromDate ||
      !toDate ||
      !reason?.trim()
    ) {
      return res.status(400).json({
        message:
          "Leave type, from date, to date and reason are required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User account not found",
      });
    }

    if (
      user.role !== "employee" &&
      user.role !== "project_manager"
    ) {
      return res.status(403).json({
        message:
          "Only Employees and Project Managers can apply for leave",
      });
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return res.status(400).json({
        message: "Invalid leave dates",
      });
    }

    if (end < start) {
      return res.status(400).json({
        message:
          "To date cannot be earlier than from date",
      });
    }

    // ==================================================
    // EMPLOYEE
    // Employee leave goes to assigned Project Manager
    // ==================================================

    if (user.role === "employee") {
      if (!user.projectManager) {
        return res.status(400).json({
          message:
            "You are not assigned to a Project Manager. Please contact Admin.",
        });
      }

      const manager = await User.findOne({
        _id: user.projectManager,
        role: "project_manager",
      });

      if (!manager) {
        return res.status(400).json({
          message:
            "Your assigned Project Manager could not be found.",
        });
      }

      const leave = await LeaveRequest.create({
        requester: user._id,
        employee: user._id,
        projectManager: manager._id,

        approvalLevel: "project_manager",

        leaveType,
        fromDate: start,
        toDate: end,
        reason: reason.trim(),
        visitingLocation: visitingLocation.trim(),
        additionalDetails: additionalDetails.trim(),

        status: "pending",
      });

      const populatedLeave =
        await LeaveRequest.findById(leave._id)
          .populate(
            "requester",
            "name email phone department jobTitle role status"
          )
          .populate(
            "employee",
            "name email phone department jobTitle role status"
          )
          .populate(
            "projectManager",
            "name email phone department jobTitle role status"
          );

      return res.status(201).json({
        message:
          "Leave request submitted to your Project Manager",
        leave: populatedLeave,
      });
    }

    // ==================================================
    // PROJECT MANAGER
    // PM leave goes directly to Admin
    // ==================================================

    if (user.role === "project_manager") {
      const leave = await LeaveRequest.create({
        requester: user._id,
        employee: null,
        projectManager: user._id,

        approvalLevel: "admin",

        leaveType,
        fromDate: start,
        toDate: end,
        reason: reason.trim(),
        visitingLocation: visitingLocation.trim(),
        additionalDetails: additionalDetails.trim(),

        status: "pending",
      });

      const populatedLeave =
        await LeaveRequest.findById(leave._id)
          .populate(
            "requester",
            "name email phone department jobTitle role status"
          )
          .populate(
            "projectManager",
            "name email phone department jobTitle role status"
          );

      return res.status(201).json({
        message:
          "Leave request submitted to Admin",
        leave: populatedLeave,
      });
    }
  } catch (error) {
    console.error("Apply Leave error:", error);

    return res.status(500).json({
      message:
        "Server error while submitting leave request",
    });
  }
};

// ======================================================
// GET MY LEAVE REQUESTS
// EMPLOYEE + PROJECT MANAGER
// ======================================================

const getMyLeaves = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User account not found",
      });
    }

    const leaves = await LeaveRequest.find({
      requester: userId,
    })
      .populate(
        "requester",
        "name email phone department jobTitle role status"
      )
      .populate(
        "employee",
        "name email phone department jobTitle role status"
      )
      .populate(
        "projectManager",
        "name email phone department jobTitle role status"
      )
      .populate(
        "reviewedBy",
        "name email role"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: leaves.length,
      leaves,
      leaveRequests: leaves,
    });
  } catch (error) {
    console.error("Get My Leaves error:", error);

    return res.status(500).json({
      message:
        "Server error while retrieving your leave requests",
    });
  }
};

// ======================================================
// GET ALL LEAVE REQUESTS
// ADMIN ONLY
//
// This returns BOTH:
// 1. Project Manager leave requests
// 2. Employee leave requests
// ======================================================

const getAllLeaves = async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({})
      .populate(
        "requester",
        "name email phone department jobTitle role status"
      )
      .populate(
        "employee",
        "name email phone department jobTitle role status"
      )
      .populate(
        "projectManager",
        "name email phone department jobTitle role status"
      )
      .populate(
        "reviewedBy",
        "name email role"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message:
        "All leave requests retrieved successfully",

      count: leaves.length,

      // Main response used by Admin frontend
      leaveRequests: leaves,

      // Compatibility
      requests: leaves,

      leaves,
    });
  } catch (error) {
    console.error("Get All Leaves error:", error);

    return res.status(500).json({
      message:
        "Server error while retrieving all leave requests",
    });
  }
};

// ======================================================
// ADMIN APPROVE
// PROJECT MANAGER LEAVE
// ======================================================

const adminApproveLeave = async (req, res) => {
  try {
    const adminId = getUserId(req);
    const { id } = req.params;

    if (!adminId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    const admin = await User.findOne({
      _id: adminId,
      role: "admin",
    });

    if (!admin) {
      return res.status(403).json({
        message:
          "Only an Admin can approve this leave request",
      });
    }

    const leave = await LeaveRequest.findById(id);

    if (!leave) {
      return res.status(404).json({
        message: "Leave request not found",
      });
    }

    if (leave.approvalLevel !== "admin") {
      return res.status(400).json({
        message:
          "This leave request is not waiting for Admin approval",
      });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({
        message:
          `Leave request is already ${leave.status}`,
      });
    }

    leave.status = "approved";
    leave.adminComment =
      req.body?.adminComment?.trim() || "";
    leave.reviewedBy = adminId;
    leave.reviewedAt = new Date();

    await leave.save();

    const updatedLeave =
      await LeaveRequest.findById(leave._id)
        .populate(
          "requester",
          "name email phone department jobTitle role status"
        )
        .populate(
          "employee",
          "name email phone department jobTitle role status"
        )
        .populate(
          "projectManager",
          "name email phone department jobTitle role status"
        )
        .populate(
          "reviewedBy",
          "name email role"
        );

    return res.status(200).json({
      message:
        "Project Manager leave request approved successfully",
      leave: updatedLeave,
    });
  } catch (error) {
    console.error(
      "Admin Approve Leave error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while approving leave request",
    });
  }
};

// ======================================================
// ADMIN REJECT
// PROJECT MANAGER LEAVE
// ======================================================

const adminRejectLeave = async (req, res) => {
  try {
    const adminId = getUserId(req);
    const { id } = req.params;

    if (!adminId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    const admin = await User.findOne({
      _id: adminId,
      role: "admin",
    });

    if (!admin) {
      return res.status(403).json({
        message:
          "Only an Admin can reject this leave request",
      });
    }

    const leave = await LeaveRequest.findById(id);

    if (!leave) {
      return res.status(404).json({
        message: "Leave request not found",
      });
    }

    if (leave.approvalLevel !== "admin") {
      return res.status(400).json({
        message:
          "This leave request is not waiting for Admin approval",
      });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({
        message:
          `Leave request is already ${leave.status}`,
      });
    }

    leave.status = "rejected";
    leave.adminComment =
      req.body?.adminComment?.trim() || "";
    leave.reviewedBy = adminId;
    leave.reviewedAt = new Date();

    await leave.save();

    const updatedLeave =
      await LeaveRequest.findById(leave._id)
        .populate(
          "requester",
          "name email phone department jobTitle role status"
        )
        .populate(
          "employee",
          "name email phone department jobTitle role status"
        )
        .populate(
          "projectManager",
          "name email phone department jobTitle role status"
        )
        .populate(
          "reviewedBy",
          "name email role"
        );

    return res.status(200).json({
      message:
        "Project Manager leave request rejected successfully",
      leave: updatedLeave,
    });
  } catch (error) {
    console.error(
      "Admin Reject Leave error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while rejecting leave request",
    });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  adminApproveLeave,
  adminRejectLeave,
};