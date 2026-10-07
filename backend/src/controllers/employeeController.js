const User = require("../models/User");
const Task = require("../models/Task");
const Project = require("../models/Project");

// =====================================================
// HELPER
// =====================================================

const getUserId = (req) => {
  return (
    req.user?.id ||
    req.user?._id ||
    req.user?.userId
  );
};

// =====================================================
// ADMIN - GET ALL EMPLOYEES
// =====================================================

const getEmployees = async (req, res) => {
  try {
    const employees = await User.find({
      role: "employee",
    })
      .select("-password")
      .populate(
        "projectManager",
        "name email department jobTitle status"
      )
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Employees fetched successfully",
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error(
      "Get employees error:",
      error
    );

    res.status(500).json({
      message: "Failed to fetch employees",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN - CREATE EMPLOYEE
// =====================================================

const createEmployee = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      location,
      department,
      jobTitle,
      projectManager,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !phone
    ) {
      return res.status(400).json({
        message:
          "Name, email, password and phone are required",
      });
    }

    const existingUser =
      await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        message:
          "A user with this email already exists",
      });
    }

    const bcrypt = require("bcryptjs");

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const employee = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      location: location || "",
      department: department || "",
      jobTitle: jobTitle || "",
      role: "employee",
      projectManager:
        projectManager || null,
      status: "active",
    });

    const safeEmployee =
      employee.toObject();

    delete safeEmployee.password;

    res.status(201).json({
      message:
        "Employee created successfully",
      employee: safeEmployee,
    });
  } catch (error) {
    console.error(
      "Create employee error:",
      error
    );

    res.status(500).json({
      message: "Failed to create employee",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN - UPDATE EMPLOYEE
// =====================================================

const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      phone,
      location,
      department,
      jobTitle,
      projectManager,
      status,
    } = req.body;

    const employee =
      await User.findOne({
        _id: id,
        role: "employee",
      });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    if (name !== undefined) {
      employee.name = name;
    }

    if (email !== undefined) {
      employee.email = email;
    }

    if (phone !== undefined) {
      employee.phone = phone;
    }

    if (location !== undefined) {
      employee.location = location;
    }

    if (department !== undefined) {
      employee.department =
        department;
    }

    if (jobTitle !== undefined) {
      employee.jobTitle = jobTitle;
    }

    if (projectManager !== undefined) {
      employee.projectManager =
        projectManager || null;
    }

    if (status !== undefined) {
      employee.status = status;
    }

    await employee.save();

    const updatedEmployee =
      await User.findById(id)
        .select("-password")
        .populate(
          "projectManager",
          "name email department jobTitle status"
        );

    res.status(200).json({
      message:
        "Employee updated successfully",
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error(
      "Update employee error:",
      error
    );

    res.status(500).json({
      message: "Failed to update employee",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN - ASSIGN PROJECT MANAGER
// =====================================================

const assignProjectManager = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      projectManager,
    } = req.body;

    if (!projectManager) {
      return res.status(400).json({
        message:
          "Project Manager ID is required",
      });
    }

    const manager =
      await User.findOne({
        _id: projectManager,
        role: "project_manager",
      });

    if (!manager) {
      return res.status(404).json({
        message:
          "Project Manager not found",
      });
    }

    const employee =
      await User.findOne({
        _id: id,
        role: "employee",
      });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    employee.projectManager =
      projectManager;

    await employee.save();

    const updatedEmployee =
      await User.findById(id)
        .select("-password")
        .populate(
          "projectManager",
          "name email department jobTitle status"
        );

    res.status(200).json({
      message:
        "Project Manager assigned successfully",
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error(
      "Assign project manager error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to assign Project Manager",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN - TOGGLE EMPLOYEE STATUS
// =====================================================

const toggleEmployeeStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const employee =
      await User.findOne({
        _id: id,
        role: "employee",
      });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    employee.status =
      employee.status === "active"
        ? "inactive"
        : "active";

    await employee.save();

    const updatedEmployee =
      await User.findById(id)
        .select("-password")
        .populate(
          "projectManager",
          "name email department jobTitle status"
        );

    res.status(200).json({
      message:
        `Employee ${employee.status === "active" ? "activated" : "deactivated"} successfully`,
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error(
      "Toggle employee status error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update employee status",
      error: error.message,
    });
  }
};

// =====================================================
// ADMIN - DELETE EMPLOYEE
// =====================================================

const deleteEmployee = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const employee =
      await User.findOneAndDelete({
        _id: id,
        role: "employee",
      });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    res.status(200).json({
      message:
        "Employee deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete employee error:",
      error
    );

    res.status(500).json({
      message: "Failed to delete employee",
      error: error.message,
    });
  }
};

// =====================================================
// EMPLOYEE - GET MY PROFILE
// =====================================================

const getMyProfile = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "User ID not found in token",
      });
    }

    const employee =
      await User.findOne({
        _id: userId,
        role: "employee",
      })
        .select("-password")
        .populate(
          "projectManager",
          "name email department jobTitle status"
        );

    if (!employee) {
      return res.status(404).json({
        message:
          "Employee profile not found",
      });
    }

    res.status(200).json({
      message:
        "Employee profile fetched successfully",
      employee,
    });
  } catch (error) {
    console.error(
      "Get my profile error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch employee profile",
      error: error.message,
    });
  }
};

// =====================================================
// EMPLOYEE - UPDATE MY PROFILE
// =====================================================

const updateMyProfile = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "User ID not found in token",
      });
    }

    const {
      phone,
      location,
    } = req.body;

    const employee =
      await User.findOne({
        _id: userId,
        role: "employee",
      });

    if (!employee) {
      return res.status(404).json({
        message:
          "Employee profile not found",
      });
    }

    if (phone !== undefined) {
      employee.phone = phone;
    }

    if (location !== undefined) {
      employee.location =
        location;
    }

    await employee.save();

    const updatedEmployee =
      await User.findById(userId)
        .select("-password")
        .populate(
          "projectManager",
          "name email department jobTitle status"
        );

    res.status(200).json({
      message:
        "Employee profile updated successfully",
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error(
      "Update my profile error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update employee profile",
      error: error.message,
    });
  }
};

// =====================================================
// EMPLOYEE - DASHBOARD
// =====================================================

const getEmployeeDashboard = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "User ID not found in token",
      });
    }

    const employee =
      await User.findOne({
        _id: userId,
        role: "employee",
      }).select("-password");

    if (!employee) {
      return res.status(404).json({
        message:
          "Employee account not found",
      });
    }

    const [
      totalTasks,
      completedTasks,
      pendingTasks,
      activeProjects,
    ] = await Promise.all([
      Task.countDocuments({
        assignedEmployee: userId,
      }),

      Task.countDocuments({
        assignedEmployee: userId,
        status: "completed",
      }),

      Task.countDocuments({
        assignedEmployee: userId,
        status: {
          $ne: "completed",
        },
      }),

      Project.countDocuments({
        projectManager:
          employee.projectManager,
        status: "active",
      }),
    ]);

    res.status(200).json({
      message:
        "Employee dashboard fetched successfully",

      dashboard: {
        assignedTasks: totalTasks,
        completedTasks,
        pendingTasks,
        activeProjects,

        // Leave module can be connected
        // here when employee leave APIs
        // are fully wired.
        pendingLeaves: 0,

        tasks: {
          total: totalTasks,
          completed: completedTasks,
          pending: pendingTasks,
        },

        projects: {
          active: activeProjects,
        },

        leaves: {
          pending: 0,
        },
      },
    });
  } catch (error) {
    console.error(
      "Employee dashboard error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load employee dashboard",
      error: error.message,
    });
  }
};

// =====================================================
// EMPLOYEE - GET MY TASKS
// =====================================================

const getMyTasks = async (
  req,
  res
) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({
        message: "User ID not found in token",
      });
    }

    const tasks =
      await Task.find({
        assignedEmployee: userId,
      })
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
        .sort({
          dueDate: 1,
          createdAt: -1,
        });

    res.status(200).json({
      message:
        "Employee tasks fetched successfully",
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error(
      "Get my tasks error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to fetch employee tasks",
      error: error.message,
    });
  }
};

// =====================================================
// EMPLOYEE - UPDATE MY TASK STATUS
// =====================================================

const updateMyTaskStatus = async (
  req,
  res
) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId;

    const { id } = req.params;

    const {
      status,
      completionComment,
      completionImages,
    } = req.body;

    if (!userId) {
      return res.status(401).json({
        message:
          "User ID not found in token",
      });
    }

    const allowedStatuses = [
      "todo",
      "in_progress",
      "review",
      "completed",
    ];

    if (
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        message:
          "Invalid task status",
      });
    }

    const task =
      await Task.findOne({
        _id: id,
        assignedEmployee: userId,
      });

    if (!task) {
      return res.status(404).json({
        message:
          "Task not found or not assigned to you",
      });
    }

    const updateData = {
      status,
    };

    if (status === "completed") {
      updateData.completionComment =
        completionComment || "";

      updateData.completionImages =
        Array.isArray(
          completionImages
        )
          ? completionImages.slice(0, 3)
          : [];

      updateData.completedAt =
        new Date();

      updateData.completedBy =
        userId;
    } else {
      updateData.completionComment =
        completionComment || "";

      updateData.completionImages =
        Array.isArray(
          completionImages
        )
          ? completionImages.slice(0, 3)
          : [];
    }

    await Task.updateOne(
      {
        _id: id,
        assignedEmployee: userId,
      },
      {
        $set: updateData,
      }
    );

    const updatedTask =
      await Task.findById(id)
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
        );

    res.status(200).json({
      message:
        status === "completed"
          ? "Task completed successfully"
          : "Task status updated successfully",

      task: updatedTask,
    });
  } catch (error) {
    console.error(
      "Update my task status error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to update task status",
      error: error.message,
    });
  }
};
// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  // Admin
  getEmployees,
  createEmployee,
  updateEmployee,
  assignProjectManager,
  toggleEmployeeStatus,
  deleteEmployee,

  // Employee self-service
  getMyProfile,
  updateMyProfile,
  getEmployeeDashboard,
  getMyTasks,
  updateMyTaskStatus,
};