const express = require("express");

const {
  getTeamLeaveRequests,
  approveEmployeeLeave,
  rejectEmployeeLeave,
} = require("../controllers/employeeLeaveApprovalController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

/* =====================================================
   PROJECT MANAGER TEAM LEAVES
===================================================== */

router.get(
  "/team",
  authMiddleware,
  roleMiddleware("project_manager"),
  getTeamLeaveRequests
);

/* =====================================================
   APPROVE
===================================================== */

router.patch(
  "/:id/approve",
  authMiddleware,
  roleMiddleware("project_manager"),
  approveEmployeeLeave
);

/* =====================================================
   REJECT
===================================================== */

router.patch(
  "/:id/reject",
  authMiddleware,
  roleMiddleware("project_manager"),
  rejectEmployeeLeave
);

module.exports = router;