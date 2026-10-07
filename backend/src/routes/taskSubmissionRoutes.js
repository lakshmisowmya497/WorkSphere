const express = require("express");

const {
  submitTaskForReview,
  approveTaskSubmission,
  rejectTaskSubmission,
  getManagerPendingSubmissions,
} = require("../controllers/taskSubmissionController");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

// ======================================================
// EMPLOYEE
// ======================================================

router.post(
  "/:id/submit",
  authMiddleware,
  roleMiddleware("employee"),
  submitTaskForReview
);

// ======================================================
// PROJECT MANAGER
// ======================================================

router.get(
  "/manager/pending",
  authMiddleware,
  roleMiddleware("project_manager"),
  getManagerPendingSubmissions
);

router.patch(
  "/:id/approve",
  authMiddleware,
  roleMiddleware("project_manager"),
  approveTaskSubmission
);

router.patch(
  "/:id/reject",
  authMiddleware,
  roleMiddleware("project_manager"),
  rejectTaskSubmission
);

module.exports = router;