const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");
const bcrypt = require("bcryptjs");

// =========================================
// GET LOGGED-IN PROJECT MANAGER PROFILE
// =========================================

const getMyProjectManagerProfile = async (req, res) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User ID not found in authentication token",
      });
    }

    const manager = await User.findOne({
      _id: userId,
      role: "project_manager",
    }).select("-password");

    if (!manager) {
      return res.status(404).json({
        message: "Project Manager profile not found",
      });
    }

    const teamSize = await User.countDocuments({
      role: "employee",
      projectManager: manager._id,
    });

    res.status(200).json({
      message: "Project Manager profile fetched successfully",

      projectManager: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
        location: manager.location,
        department: manager.department,
        jobTitle: manager.jobTitle,
        role: manager.role,
        status: manager.status,
        teamSize,
      },
    });
  } catch (error) {
    console.error(
      "Get my Project Manager profile error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching Project Manager profile",
    });
  }
};

// =========================================
// UPDATE LOGGED-IN PROJECT MANAGER PROFILE
// =========================================

const updateMyProjectManagerProfile = async (
  req,
  res
) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User ID not found in authentication token",
      });
    }

    const manager = await User.findOne({
      _id: userId,
      role: "project_manager",
    });

    if (!manager) {
      return res.status(404).json({
        message: "Project Manager profile not found",
      });
    }

    /*
     * Project Manager is allowed to update
     * only personal/contact information.
     *
     * Name
     * Email
     * Role
     * Department
     * Job Title
     * Status
     *
     * are intentionally NOT updated here.
     */

    const {
      phone,
      location,
    } = req.body;

    if (phone !== undefined) {
      manager.phone = phone;
    }

    if (location !== undefined) {
      manager.location = location;
    }

    await manager.save();

    const teamSize = await User.countDocuments({
      role: "employee",
      projectManager: manager._id,
    });

    res.status(200).json({
      message:
        "Project Manager profile updated successfully",

      projectManager: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
        location: manager.location,
        department: manager.department,
        jobTitle: manager.jobTitle,
        role: manager.role,
        status: manager.status,
        teamSize,
      },
    });
  } catch (error) {
    console.error(
      "Update my Project Manager profile error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while updating Project Manager profile",
    });
  }
};

// =========================================
// PROJECT MANAGER DASHBOARD
// =========================================

const getProjectManagerDashboard = async (
  req,
  res
) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User ID not found in authentication token",
      });
    }

    const manager = await User.findOne({
      _id: userId,
      role: "project_manager",
    }).select("-password");

    if (!manager) {
      return res.status(404).json({
        message: "Project Manager not found",
      });
    }

    // Team members belonging to this PM
    const teamMembers = await User.countDocuments({
      role: "employee",
      projectManager: manager._id,
    });

    // Projects assigned to this PM
    const activeProjects = await Project.countDocuments({
      projectManager: manager._id,
      status: "active",
    });

    const totalProjects = await Project.countDocuments({
      projectManager: manager._id,
    });

    // Tasks assigned to this PM
    const pendingTasks = await Task.countDocuments({
      projectManager: manager._id,
      status: {
        $in: ["todo", "in_progress", "review"],
      },
    });

    const totalTasks = await Task.countDocuments({
      projectManager: manager._id,
    });

    /*
     * Leave Requests will be connected when the
     * LeaveRequest model/module is finalized.
     *
     * For now this remains 0 rather than querying
     * a model that may not exist yet.
     */

    const pendingLeaves = 0;

    res.status(200).json({
      message:
        "Project Manager dashboard fetched successfully",

      dashboard: {
        teamMembers,
        activeProjects,
        pendingTasks,
        pendingLeaves,

        team: {
          totalMembers: teamMembers,
        },

        projects: {
          total: totalProjects,
          active: activeProjects,
        },

        tasks: {
          total: totalTasks,
          pending: pendingTasks,
        },

        leaves: {
          pending: pendingLeaves,
        },
      },
    });
  } catch (error) {
    console.error(
      "Get Project Manager dashboard error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching Project Manager dashboard",
    });
  }
};

// =========================================
// GET ALL PROJECT MANAGERS
// =========================================

const getProjectManagers = async (req, res) => {
  try {
    const managers = await User.find({
      role: "project_manager",
    })
      .select("-password")
      .sort({ createdAt: -1 });

    const managersWithTeamSize =
      await Promise.all(
        managers.map(async (manager) => {
          const teamSize =
            await User.countDocuments({
              role: "employee",
              projectManager: manager._id,
            });

          return {
            ...manager.toObject(),
            teamSize,
          };
        })
      );

    res.status(200).json({
      message:
        "Project Managers fetched successfully",
      projectManagers: managersWithTeamSize,
    });
  } catch (error) {
    console.error(
      "Get Project Managers error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching Project Managers",
    });
  }
};

// =========================================
// CREATE PROJECT MANAGER
// =========================================

const createProjectManager = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      location,
      department,
      jobTitle,
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

    const existingUser = await User.findOne({
      email,
    });

    if (existingUser) {
      return res.status(409).json({
        message:
          "User with this email already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const manager = await User.create({
      name,
      email,
      password: hashedPassword,
      phone,
      location: location || "",
      role: "project_manager",
      department:
        department || "Engineering",
      jobTitle:
        jobTitle || "Project Manager",
      status: "active",
    });

    res.status(201).json({
      message:
        "Project Manager created successfully",

      projectManager: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
        location: manager.location,
        department: manager.department,
        jobTitle: manager.jobTitle,
        role: manager.role,
        status: manager.status,
        teamSize: 0,
      },
    });
  } catch (error) {
    console.error(
      "Create Project Manager error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while creating Project Manager",
    });
  }
};

// =========================================
// UPDATE PROJECT MANAGER — ADMIN
// =========================================

const updateProjectManager = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      email,
      phone,
      location,
      department,
      jobTitle,
    } = req.body;

    const manager = await User.findOne({
      _id: id,
      role: "project_manager",
    });

    if (!manager) {
      return res.status(404).json({
        message: "Project Manager not found",
      });
    }

    if (
      email &&
      email !== manager.email
    ) {
      const existingUser =
        await User.findOne({ email });

      if (existingUser) {
        return res.status(409).json({
          message:
            "Another user already uses this email",
        });
      }

      manager.email = email;
    }

    if (name !== undefined) {
      manager.name = name;
    }

    if (phone !== undefined) {
      manager.phone = phone;
    }

    if (location !== undefined) {
      manager.location = location;
    }

    if (department !== undefined) {
      manager.department = department;
    }

    if (jobTitle !== undefined) {
      manager.jobTitle = jobTitle;
    }

    await manager.save();

    const teamSize =
      await User.countDocuments({
        role: "employee",
        projectManager: manager._id,
      });

    res.status(200).json({
      message:
        "Project Manager updated successfully",

      projectManager: {
        id: manager._id,
        name: manager.name,
        email: manager.email,
        phone: manager.phone,
        location: manager.location,
        department: manager.department,
        jobTitle: manager.jobTitle,
        role: manager.role,
        status: manager.status,
        teamSize,
      },
    });
  } catch (error) {
    console.error(
      "Update Project Manager error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while updating Project Manager",
    });
  }
};

// =========================================
// ACTIVATE / DEACTIVATE PROJECT MANAGER
// =========================================

const toggleProjectManagerStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const manager = await User.findOne({
      _id: id,
      role: "project_manager",
    });

    if (!manager) {
      return res.status(404).json({
        message: "Project Manager not found",
      });
    }

    manager.status =
      manager.status === "active"
        ? "inactive"
        : "active";

    await manager.save();

    res.status(200).json({
      message: `Project Manager ${
        manager.status === "active"
          ? "activated"
          : "deactivated"
      } successfully`,

      status: manager.status,
    });
  } catch (error) {
    console.error(
      "Toggle Project Manager status error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while updating Project Manager status",
    });
  }
};

// =========================================
// GET TEAM OF SPECIFIC PROJECT MANAGER
// =========================================

const getProjectManagerTeam = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const manager = await User.findOne({
      _id: id,
      role: "project_manager",
    }).select("-password");

    if (!manager) {
      return res.status(404).json({
        message:
          "Project Manager not found",
      });
    }

    const employees = await User.find({
      role: "employee",
      projectManager: id,
    })
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message:
        "Project Manager team fetched successfully",

      projectManager: manager,

      teamSize: employees.length,

      employees,
    });
  } catch (error) {
    console.error(
      "Get Project Manager team error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while fetching Project Manager team",
    });
  }
};

// =========================================
// DELETE PROJECT MANAGER
// =========================================

const deleteProjectManager = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const manager = await User.findOne({
      _id: id,
      role: "project_manager",
    });

    if (!manager) {
      return res.status(404).json({
        message:
          "Project Manager not found",
      });
    }

    await User.updateMany(
      {
        role: "employee",
        projectManager: id,
      },
      {
        $set: {
          projectManager: null,
        },
      }
    );

    await User.deleteOne({
      _id: id,
      role: "project_manager",
    });

    res.status(200).json({
      message:
        "Project Manager deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Project Manager error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while deleting Project Manager",
    });
  }
};
// =====================================================
// GET MY TEAM
// PROJECT MANAGER
// =====================================================

const getMyTeam = async (req, res) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication information not found",
      });
    }

    // Verify logged-in user is a Project Manager
    const projectManager = await User.findOne({
      _id: userId,
      role: "project_manager",
    }).select("_id name email department jobTitle status");

    if (!projectManager) {
      return res.status(403).json({
        message: "Project Manager account not found",
      });
    }

    // Find employees assigned to this Project Manager
    const teamMembers = await User.find({
      role: "employee",
      projectManager: projectManager._id,
    })
      .select(
        "name email phone location department jobTitle role status projectManager createdAt"
      )
      .sort({
        name: 1,
      });

    return res.status(200).json({
      message: "Team members retrieved successfully",
      count: teamMembers.length,
      projectManager: {
        id: projectManager._id,
        name: projectManager.name,
        email: projectManager.email,
      },
      teamMembers,
    });
  } catch (error) {
    console.error("Get My Team error:", error);

    return res.status(500).json({
      message: "Server error while retrieving team members",
    });
  }
};
// =====================================================
// GET MY PROJECTS
// PROJECT MANAGER
// =====================================================

const getMyProjects = async (req, res) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication information not found",
      });
    }

    const projects = await Project.find({
      projectManager: userId,
    })
      .populate(
        "projectManager",
        "name email department jobTitle status"
      )
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Projects retrieved successfully",
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get My Projects error:", error);

    return res.status(500).json({
      message: "Server error while retrieving projects",
    });
  }
};


// =====================================================
// UPDATE MY PROJECT STATUS
// PROJECT MANAGER
// =====================================================

const updateMyProjectStatus = async (req, res) => {
  try {
    const userId =
      req.user?.id ||
      req.user?._id ||
      req.user?.userId;

    const { id } = req.params;
    const { status } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "User authentication information not found",
      });
    }

    const allowedStatuses = [
      "planning",
      "active",
      "on_hold",
      "completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid project status",
      });
    }

    const project = await Project.findOne({
      _id: id,
      projectManager: userId,
    });

    if (!project) {
      return res.status(404).json({
        message:
          "Project not found or not assigned to you",
      });
    }

    project.status = status;

    await project.save();

    const updatedProject = await Project.findById(
      project._id
    ).populate(
      "projectManager",
      "name email department jobTitle status"
    );

    return res.status(200).json({
      message: "Project status updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    console.error(
      "Update My Project Status error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while updating project status",
    });
  }
};
// =========================================
// EXPORT
// =========================================

module.exports = {
  getMyProjectManagerProfile,
  updateMyProjectManagerProfile,
  getProjectManagerDashboard,
  getMyTeam,
  getMyProjects,
  updateMyProjectStatus,
  getProjectManagers,
  createProjectManager,
  updateProjectManager,
  toggleProjectManagerStatus,
  getProjectManagerTeam,
  deleteProjectManager,
};