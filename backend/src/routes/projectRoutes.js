const express = require("express");

const {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  assignProjectManager,
  updateProjectStatus,
  deleteProject,
} = require("../controllers/projectController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =========================================
// AUTHENTICATION
// =========================================

router.use(authMiddleware);

// =========================================
// PROJECT ROUTES
// =========================================

// Get all projects
router.get("/", getProjects);

// Get single project
router.get("/:id", getProjectById);

// Create project
router.post("/", createProject);

// Update project details
router.put("/:id", updateProject);

// Assign / Reassign Project Manager
router.patch(
  "/:id/manager",
  assignProjectManager
);

// Update project status
router.patch(
  "/:id/status",
  updateProjectStatus
);

// Delete project
router.delete("/:id", deleteProject);

module.exports = router;