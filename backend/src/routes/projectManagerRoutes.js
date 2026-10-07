const express = require("express");

const {
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
} = require("../controllers/projectManagerController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware);

// =====================================================
// PROJECT MANAGER SELF
// =====================================================

router.get("/me", getMyProjectManagerProfile);

router.put("/me", updateMyProjectManagerProfile);

// =====================================================
// PROJECT MANAGER DASHBOARD
// =====================================================

router.get("/dashboard", getProjectManagerDashboard);

// =====================================================
// MY TEAM
// =====================================================

router.get("/team", getMyTeam);

// =====================================================
// MY PROJECTS
// =====================================================

router.get("/projects", getMyProjects);

router.patch(
  "/projects/:id/status",
  updateMyProjectStatus
);

// =====================================================
// ADMIN / PROJECT MANAGER MANAGEMENT
// =====================================================

router.get("/", getProjectManagers);

router.post("/", createProjectManager);

router.get("/:id/team", getProjectManagerTeam);

router.put("/:id", updateProjectManager);

router.patch(
  "/:id/status",
  toggleProjectManagerStatus
);

router.delete("/:id", deleteProjectManager);

module.exports = router;