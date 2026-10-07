const express = require("express");

const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  assignTaskProjectManager,
  assignTaskEmployee,
  updateTaskStatus,
  updateTaskPriority,
  deleteTask,
} = require("../controllers/taskController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Authentication required for all task routes
router.use(authMiddleware);

// GET ALL TASKS
router.get("/", getTasks);

// GET SINGLE TASK
router.get("/:id", getTaskById);

// CREATE TASK
router.post("/", createTask);

// UPDATE TASK
router.put("/:id", updateTask);

// ASSIGN / REASSIGN PROJECT MANAGER
router.patch(
  "/:id/manager",
  assignTaskProjectManager
);

// ASSIGN / REASSIGN EMPLOYEE
router.patch(
  "/:id/employee",
  assignTaskEmployee
);

// UPDATE TASK STATUS
router.patch(
  "/:id/status",
  updateTaskStatus
);

// UPDATE TASK PRIORITY
router.patch(
  "/:id/priority",
  updateTaskPriority
);

// DELETE TASK
router.delete("/:id", deleteTask);

module.exports = router;