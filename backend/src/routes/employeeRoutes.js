const express = require("express");

const {
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
} = require("../controllers/employeeController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// AUTHENTICATION
// =====================================================

router.use(authMiddleware);

// =====================================================
// EMPLOYEE SELF-SERVICE
// =====================================================

// Get logged-in employee profile
router.get(
  "/me",
  getMyProfile
);

// Update logged-in employee profile
router.put(
  "/me",
  updateMyProfile
);

// Employee dashboard
router.get(
  "/dashboard",
  getEmployeeDashboard
);

// Logged-in employee tasks
router.get(
  "/tasks",
  getMyTasks
);

// Update logged-in employee task status
router.patch(
  "/tasks/:id/status",
  updateMyTaskStatus
);

// =====================================================
// ADMIN EMPLOYEE MANAGEMENT
// =====================================================

router.get(
  "/",
  getEmployees
);

router.post(
  "/",
  createEmployee
);

router.put(
  "/:id",
  updateEmployee
);

router.patch(
  "/:id/manager",
  assignProjectManager
);

router.patch(
  "/:id/status",
  toggleEmployeeStatus
);

router.delete(
  "/:id",
  deleteEmployee
);

module.exports = router;