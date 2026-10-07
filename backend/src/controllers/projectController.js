const Project = require("../models/Project");
const User = require("../models/User");

// =========================================
// GET ALL PROJECTS
// =========================================

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate(
        "projectManager",
        "name email department jobTitle status"
      )
      .sort({ createdAt: -1 });

    // Add team size for every project
    const projectsWithTeamSize = await Promise.all(
      projects.map(async (project) => {
        let teamSize = 0;

        if (project.projectManager) {
          teamSize = await User.countDocuments({
            role: "employee",
            projectManager: project.projectManager._id,
          });
        }

        return {
          ...project.toObject(),
          teamSize,
        };
      })
    );

    res.status(200).json({
      message: "Projects fetched successfully",
      projects: projectsWithTeamSize,
    });
  } catch (error) {
    console.error("Get Projects error:", error);

    res.status(500).json({
      message: "Server error while fetching projects",
    });
  }
};

// =========================================
// GET SINGLE PROJECT
// =========================================

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id).populate(
      "projectManager",
      "name email department jobTitle status"
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    let teamSize = 0;

    if (project.projectManager) {
      teamSize = await User.countDocuments({
        role: "employee",
        projectManager: project.projectManager._id,
      });
    }

    res.status(200).json({
      message: "Project fetched successfully",
      project: {
        ...project.toObject(),
        teamSize,
      },
    });
  } catch (error) {
    console.error("Get Project error:", error);

    res.status(500).json({
      message: "Server error while fetching project",
    });
  }
};

// =========================================
// CREATE PROJECT
// =========================================

const createProject = async (req, res) => {
  try {
    const {
      name,
      description,
      startDate,
      endDate,
      projectManager,
      status,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !description ||
      !startDate ||
      !endDate ||
      !projectManager
    ) {
      return res.status(400).json({
        message:
          "Name, description, start date, end date and Project Manager are required",
      });
    }

    // Validate dates
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        message:
          "End date cannot be earlier than start date",
      });
    }

    // Check Project Manager
    const manager = await User.findOne({
      _id: projectManager,
      role: "project_manager",
      status: "active",
    });

    if (!manager) {
      return res.status(400).json({
        message:
          "Selected Project Manager is not available",
      });
    }

    // Create project
    const project = await Project.create({
      name,
      description,
      startDate,
      endDate,
      projectManager,
      status: status || "planning",
    });

    // Populate manager before response
    const populatedProject =
      await Project.findById(project._id).populate(
        "projectManager",
        "name email department jobTitle status"
      );

    const teamSize = await User.countDocuments({
      role: "employee",
      projectManager,
    });

    res.status(201).json({
      message: "Project created successfully",
      project: {
        ...populatedProject.toObject(),
        teamSize,
      },
    });
  } catch (error) {
    console.error("Create Project error:", error);

    res.status(500).json({
      message: "Server error while creating project",
    });
  }
};

// =========================================
// UPDATE PROJECT
// =========================================

const updateProject = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      name,
      description,
      startDate,
      endDate,
    } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // Validate dates if provided
    const newStartDate =
      startDate || project.startDate;

    const newEndDate =
      endDate || project.endDate;

    if (
      new Date(newEndDate) <
      new Date(newStartDate)
    ) {
      return res.status(400).json({
        message:
          "End date cannot be earlier than start date",
      });
    }

    if (name !== undefined) {
      project.name = name;
    }

    if (description !== undefined) {
      project.description = description;
    }

    if (startDate !== undefined) {
      project.startDate = startDate;
    }

    if (endDate !== undefined) {
      project.endDate = endDate;
    }

    await project.save();

    const updatedProject =
      await Project.findById(project._id).populate(
        "projectManager",
        "name email department jobTitle status"
      );

    const teamSize = await User.countDocuments({
      role: "employee",
      projectManager: project.projectManager,
    });

    res.status(200).json({
      message: "Project updated successfully",
      project: {
        ...updatedProject.toObject(),
        teamSize,
      },
    });
  } catch (error) {
    console.error("Update Project error:", error);

    res.status(500).json({
      message: "Server error while updating project",
    });
  }
};

// =========================================
// ASSIGN / REASSIGN PROJECT MANAGER
// =========================================

const assignProjectManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { projectManager } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (!projectManager) {
      return res.status(400).json({
        message: "Project Manager is required",
      });
    }

    const manager = await User.findOne({
      _id: projectManager,
      role: "project_manager",
      status: "active",
    });

    if (!manager) {
      return res.status(400).json({
        message:
          "Selected Project Manager is not available",
      });
    }

    project.projectManager = manager._id;

    await project.save();

    const updatedProject =
      await Project.findById(project._id).populate(
        "projectManager",
        "name email department jobTitle status"
      );

    const teamSize = await User.countDocuments({
      role: "employee",
      projectManager: manager._id,
    });

    res.status(200).json({
      message:
        "Project Manager assigned successfully",
      project: {
        ...updatedProject.toObject(),
        teamSize,
      },
    });
  } catch (error) {
    console.error(
      "Assign Project Manager error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while assigning Project Manager",
    });
  }
};

// =========================================
// UPDATE PROJECT STATUS
// =========================================

const updateProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

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

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    project.status = status;

    await project.save();

    res.status(200).json({
      message: "Project status updated successfully",
      status: project.status,
    });
  } catch (error) {
    console.error(
      "Update Project status error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while updating project status",
    });
  }
};

// =========================================
// DELETE PROJECT
// =========================================

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    await Project.deleteOne({
      _id: id,
    });

    res.status(200).json({
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete Project error:", error);

    res.status(500).json({
      message: "Server error while deleting project",
    });
  }
};

// =========================================
// EXPORT
// =========================================

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  assignProjectManager,
  updateProjectStatus,
  deleteProject,
};