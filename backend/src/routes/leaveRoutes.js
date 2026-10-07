const express = require("express");

const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  adminApproveLeave,
  adminRejectLeave,
} = require("../controllers/leaveController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================================
// APPLY LEAVE
// Employee + Project Manager
// ======================================================

router.post(
  "/",
  authMiddleware,
  roleMiddleware("employee", "project_manager"),
  applyLeave
);

// ======================================================
// MY LEAVE REQUESTS
// Employee + Project Manager
// ======================================================

router.get(
  "/my",
  authMiddleware,
  roleMiddleware("employee", "project_manager"),
  getMyLeaves
);

// ======================================================
// ADMIN - GET ALL LEAVE REQUESTS
//
// IMPORTANT:
// This returns BOTH Employee + Project Manager requests.
// ======================================================

router.get(
  "/all",
  authMiddleware,
  roleMiddleware("admin"),
  getAllLeaves
);

// ======================================================
// ADMIN - APPROVE PROJECT MANAGER LEAVE
// ======================================================

router.patch(
  "/:id/admin-approve",
  authMiddleware,
  roleMiddleware("admin"),
  adminApproveLeave
);

// ======================================================
// ADMIN - REJECT PROJECT MANAGER LEAVE
// ======================================================

router.patch(
  "/:id/admin-reject",
  authMiddleware,
  roleMiddleware("admin"),
  adminRejectLeave
);

module.exports = router;