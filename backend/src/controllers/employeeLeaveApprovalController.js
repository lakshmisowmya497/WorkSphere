const LeaveRequest = require("../models/LeaveRequest");
const User = require("../models/User");

// ======================================================
// GET LOGGED-IN USER ID
// ======================================================

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId
  );
};

// ======================================================
// GET TEAM LEAVE REQUESTS
// PROJECT MANAGER
// ======================================================

const getTeamLeaveRequests = async (req, res) => {
  try {
    const managerId = getUserId(req);

    if (!managerId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    const manager = await User.findOne({
      _id: managerId,
      role: "project_manager",
    });

    if (!manager) {
      return res.status(403).json({
        message: "Project Manager account not found",
      });
    }

    // ==================================================
    // FIRST FIND ALL EMPLOYEES ASSIGNED TO THIS PM
    // ==================================================

    const teamMembers = await User.find({
      role: "employee",
      projectManager: managerId,
    }).select("_id name email phone department jobTitle status");

    const teamMemberIds = teamMembers.map(
      (employee) => employee._id
    );

    console.log("==========================================");
    console.log("PROJECT MANAGER TEAM LEAVE CHECK");
    console.log("Manager:", manager.name);
    console.log("Manager ID:", managerId);
    console.log(
      "Team members:",
      teamMembers.length
    );
    console.log(
      "Team member IDs:",
      teamMemberIds.map((id) => id.toString())
    );
    console.log("==========================================");

    // ==================================================
    // FIND LEAVE REQUESTS
    //
    // We check BOTH:
    //
    // 1. employee field belongs to this PM's team
    // 2. projectManager field points to this PM
    //
    // This makes the workflow robust even if an older
    // leave record has one of these fields missing.
    // ==================================================

    const leaves = await LeaveRequest.find({
      $or: [
        {
          employee: {
            $in: teamMemberIds,
          },
        },
        {
          projectManager: managerId,
          approvalLevel: "project_manager",
        },
      ],
    })
      .populate(
        "requester",
        "name email phone department jobTitle role status"
      )
      .populate(
        "employee",
        "name email phone department jobTitle role status projectManager"
      )
      .populate(
        "projectManager",
        "name email phone department jobTitle role status"
      )
      .populate(
        "reviewedBy",
        "name email role"
      )
      .sort({
        createdAt: -1,
      });

    console.log(
      "Team leave requests found:",
      leaves.length
    );

    leaves.forEach((leave) => {
      console.log({
        leaveId: leave._id.toString(),
        employee:
          leave.employee?.name ||
          leave.requester?.name ||
          "Unknown",
        employeeId:
          leave.employee?._id?.toString() ||
          leave.requester?._id?.toString() ||
          null,
        leaveProjectManager:
          leave.projectManager?._id?.toString() ||
          leave.projectManager?.toString() ||
          null,
        approvalLevel: leave.approvalLevel,
        status: leave.status,
      });
    });

    return res.status(200).json({
      message:
        "Team leave requests retrieved successfully",
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    console.error(
      "Get Team Leave Requests error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching team leave requests",
      error: error.message,
    });
  }
};

// ======================================================
// APPROVE EMPLOYEE LEAVE
// ======================================================

const approveEmployeeLeave = async (req, res) => {
  try {
    const managerId = getUserId(req);
    const { id } = req.params;
    const { managerComment = "" } = req.body;

    if (!managerId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    const manager = await User.findOne({
      _id: managerId,
      role: "project_manager",
    });

    if (!manager) {
      return res.status(403).json({
        message:
          "Only a Project Manager can approve employee leave",
      });
    }

    const leave = await LeaveRequest.findById(id);

    if (!leave) {
      return res.status(404).json({
        message: "Leave request not found",
      });
    }

    // ==================================================
    // VERIFY THE EMPLOYEE BELONGS TO THIS PM
    // ==================================================

    let belongsToManager = false;

    if (leave.projectManager) {
      belongsToManager =
        leave.projectManager.toString() ===
        managerId.toString();
    }

    if (!belongsToManager && leave.employee) {
      const employee = await User.findOne({
        _id: leave.employee,
        role: "employee",
        projectManager: managerId,
      });

      belongsToManager = !!employee;
    }

    if (!belongsToManager) {
      return res.status(403).json({
        message:
          "This leave request does not belong to your team",
      });
    }

    if (leave.approvalLevel !== "project_manager") {
      return res.status(400).json({
        message:
          "This leave request is not waiting for Project Manager approval",
      });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({
        message:
          "Only pending leave requests can be approved",
      });
    }

    leave.status = "approved";
    leave.managerComment =
      managerComment?.trim() || "";
    leave.reviewedBy = managerId;
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
        "Employee leave request approved successfully",
      leave: updatedLeave,
    });
  } catch (error) {
    console.error(
      "Approve Employee Leave error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while approving employee leave",
    });
  }
};

// ======================================================
// REJECT EMPLOYEE LEAVE
// ======================================================

const rejectEmployeeLeave = async (req, res) => {
  try {
    const managerId = getUserId(req);
    const { id } = req.params;
    const { managerComment } = req.body;

    if (!managerId) {
      return res.status(401).json({
        message: "User authentication required",
      });
    }

    if (!managerComment?.trim()) {
      return res.status(400).json({
        message:
          "Please provide a reason for rejecting the leave request",
      });
    }

    const manager = await User.findOne({
      _id: managerId,
      role: "project_manager",
    });

    if (!manager) {
      return res.status(403).json({
        message:
          "Only a Project Manager can reject employee leave",
      });
    }

    const leave = await LeaveRequest.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        message: "Leave request not found",
      });
    }

    let belongsToManager = false;

    if (leave.projectManager) {
      belongsToManager =
        leave.projectManager.toString() ===
        managerId.toString();
    }

    if (!belongsToManager && leave.employee) {
      const employee = await User.findOne({
        _id: leave.employee,
        role: "employee",
        projectManager: managerId,
      });

      belongsToManager = !!employee;
    }

    if (!belongsToManager) {
      return res.status(403).json({
        message:
          "This leave request does not belong to your team",
      });
    }

    if (leave.approvalLevel !== "project_manager") {
      return res.status(400).json({
        message:
          "This leave request is not waiting for Project Manager approval",
      });
    }

    if (leave.status !== "pending") {
      return res.status(400).json({
        message:
          "Only pending leave requests can be rejected",
      });
    }

    leave.status = "rejected";
    leave.managerComment =
      managerComment.trim();
    leave.reviewedBy = managerId;
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
        "Employee leave request rejected successfully",
      leave: updatedLeave,
    });
  } catch (error) {
    console.error(
      "Reject Employee Leave error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while rejecting employee leave",
    });
  }
};

module.exports = {
  getTeamLeaveRequests,
  approveEmployeeLeave,
  rejectEmployeeLeave,
};