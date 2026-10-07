const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

// ======================================================
// GET ALL TASKS
// ======================================================

const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
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
      .sort({ createdAt: -1 });

    res.status(200).json({
      tasks,
    });
  } catch (error) {
    console.error("Get Tasks error:", error);

    res.status(500).json({
      message: "Server error while fetching tasks",
    });
  }
};

// ======================================================
// GET SINGLE TASK
// ======================================================

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id)
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

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    res.status(200).json({
      task,
    });
  } catch (error) {
    console.error("Get Task error:", error);

    res.status(500).json({
      message: "Server error while fetching task",
    });
  }
};

// ======================================================
// CREATE TASK
// ======================================================

const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      project,
      projectManager,
      assignedEmployee,
      priority,
      status,
      dueDate,
    } = req.body;

    // ----------------------------------------------
    // REQUIRED FIELDS
    // ----------------------------------------------

    if (
      !title ||
      !description ||
      !project ||
      !projectManager ||
      !dueDate
    ) {
      return res.status(400).json({
        message:
          "Title, description, project, project manager and due date are required",
      });
    }

    // ----------------------------------------------
    // FIND PROJECT
    // ----------------------------------------------

    const selectedProject =
      await Project.findById(project);

    if (!selectedProject) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // ----------------------------------------------
    // CHECK PROJECT DATES
    // ----------------------------------------------

    const taskDueDate = new Date(dueDate);

    if (isNaN(taskDueDate.getTime())) {
      return res.status(400).json({
        message: "Invalid due date",
      });
    }

    if (
      taskDueDate < selectedProject.startDate ||
      taskDueDate > selectedProject.endDate
    ) {
      return res.status(400).json({
        message:
          "Task due date must be within the project start and end dates",
      });
    }

    // ----------------------------------------------
    // FIND PROJECT MANAGER
    // ----------------------------------------------

    const manager = await User.findOne({
      _id: projectManager,
      role: "project_manager",
    });

    if (!manager) {
      return res.status(404).json({
        message: "Project Manager not found",
      });
    }

    if (manager.status !== "active") {
      return res.status(400).json({
        message:
          "Selected Project Manager is inactive",
      });
    }

    // ----------------------------------------------
    // PROJECT MUST BELONG TO SELECTED MANAGER
    // ----------------------------------------------

    if (
      selectedProject.projectManager.toString() !==
      manager._id.toString()
    ) {
      return res.status(400).json({
        message:
          "Selected Project Manager is not assigned to this project",
      });
    }

    // ----------------------------------------------
    // VALIDATE EMPLOYEE
    // ----------------------------------------------

    let employeeId = null;

    if (assignedEmployee) {
      const employee = await User.findOne({
        _id: assignedEmployee,
        role: "employee",
      });

      if (!employee) {
        return res.status(404).json({
          message: "Assigned employee not found",
        });
      }

      if (employee.status !== "active") {
        return res.status(400).json({
          message:
            "Assigned employee is inactive",
        });
      }

      if (
        !employee.projectManager ||
        employee.projectManager.toString() !==
          manager._id.toString()
      ) {
        return res.status(400).json({
          message:
            "Employee does not belong to the selected Project Manager",
        });
      }

      employeeId = employee._id;
    }

    // ----------------------------------------------
    // VALIDATE STATUS
    // ----------------------------------------------

    const allowedStatuses = [
      "todo",
      "in_progress",
      "review",
      "completed",
    ];

    const taskStatus = status || "todo";

    if (!allowedStatuses.includes(taskStatus)) {
      return res.status(400).json({
        message: "Invalid task status",
      });
    }

    // ----------------------------------------------
    // VALIDATE PRIORITY
    // ----------------------------------------------

    const allowedPriorities = [
      "low",
      "medium",
      "high",
      "critical",
    ];

    const taskPriority = priority || "medium";

    if (!allowedPriorities.includes(taskPriority)) {
      return res.status(400).json({
        message: "Invalid task priority",
      });
    }

    // ----------------------------------------------
    // CREATE TASK
    // ----------------------------------------------

    const task = await Task.create({
      title: title.trim(),
      description: description.trim(),
      project: selectedProject._id,
      projectManager: manager._id,
      assignedEmployee: employeeId,
      priority: taskPriority,
      status: taskStatus,
      dueDate: taskDueDate,
    });

    // ----------------------------------------------
    // RETURN POPULATED TASK
    // ----------------------------------------------

    const populatedTask =
      await Task.findById(task._id)
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

    res.status(201).json({
      message: "Task created successfully",
      task: populatedTask,
    });
  } catch (error) {
    console.error("Create Task error:", error);

    res.status(500).json({
      message: "Server error while creating task",
    });
  }
};

// ======================================================
// UPDATE TASK
// ======================================================

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      project,
      projectManager,
      assignedEmployee,
      priority,
      status,
      dueDate,
    } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // ----------------------------------------------
    // BASIC VALIDATION
    // ----------------------------------------------

    if (
      !title ||
      !description ||
      !project ||
      !projectManager ||
      !dueDate
    ) {
      return res.status(400).json({
        message:
          "Title, description, project, project manager and due date are required",
      });
    }

    // ----------------------------------------------
    // FIND PROJECT
    // ----------------------------------------------

    const selectedProject =
      await Project.findById(project);

    if (!selectedProject) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // ----------------------------------------------
    // VALIDATE DUE DATE
    // ----------------------------------------------

    const taskDueDate = new Date(dueDate);

    if (isNaN(taskDueDate.getTime())) {
      return res.status(400).json({
        message: "Invalid due date",
      });
    }

    if (
      taskDueDate < selectedProject.startDate ||
      taskDueDate > selectedProject.endDate
    ) {
      return res.status(400).json({
        message:
          "Task due date must be within the project start and end dates",
      });
    }

    // ----------------------------------------------
    // FIND PROJECT MANAGER
    // ----------------------------------------------

    const manager = await User.findOne({
      _id: projectManager,
      role: "project_manager",
    });

    if (!manager) {
      return res.status(404).json({
        message: "Project Manager not found",
      });
    }

    if (manager.status !== "active") {
      return res.status(400).json({
        message:
          "Selected Project Manager is inactive",
      });
    }

    // ----------------------------------------------
    // PROJECT MUST BELONG TO MANAGER
    // ----------------------------------------------

    if (
      selectedProject.projectManager.toString() !==
      manager._id.toString()
    ) {
      return res.status(400).json({
        message:
          "Selected Project Manager is not assigned to this project",
      });
    }

    // ----------------------------------------------
    // VALIDATE EMPLOYEE
    // ----------------------------------------------

    let employeeId = null;

    if (assignedEmployee) {
      const employee = await User.findOne({
        _id: assignedEmployee,
        role: "employee",
      });

      if (!employee) {
        return res.status(404).json({
          message: "Assigned employee not found",
        });
      }

      if (employee.status !== "active") {
        return res.status(400).json({
          message:
            "Assigned employee is inactive",
        });
      }

      if (
        !employee.projectManager ||
        employee.projectManager.toString() !==
          manager._id.toString()
      ) {
        return res.status(400).json({
          message:
            "Employee does not belong to the selected Project Manager",
        });
      }

      employeeId = employee._id;
    }

    // ----------------------------------------------
    // VALIDATE STATUS
    // ----------------------------------------------

    const allowedStatuses = [
      "todo",
      "in_progress",
      "review",
      "completed",
    ];

    let taskStatus = status || task.status;

    // Convert old legacy status values
    if (taskStatus === "pending") {
      taskStatus = "todo";
    }

    if (taskStatus === "in-progress") {
      taskStatus = "in_progress";
    }

    if (!allowedStatuses.includes(taskStatus)) {
      return res.status(400).json({
        message: "Invalid task status",
      });
    }

    // ----------------------------------------------
    // VALIDATE PRIORITY
    // ----------------------------------------------

    const allowedPriorities = [
      "low",
      "medium",
      "high",
      "critical",
    ];

    const taskPriority =
      priority || task.priority;

    if (!allowedPriorities.includes(taskPriority)) {
      return res.status(400).json({
        message: "Invalid task priority",
      });
    }

    // ----------------------------------------------
    // UPDATE
    // ----------------------------------------------

    task.title = title.trim();
    task.description = description.trim();
    task.project = selectedProject._id;
    task.projectManager = manager._id;
    task.assignedEmployee = employeeId;
    task.priority = taskPriority;
    task.status = taskStatus;
    task.dueDate = taskDueDate;

    await task.save();

    // ----------------------------------------------
    // RETURN POPULATED TASK
    // ----------------------------------------------

    const updatedTask =
      await Task.findById(task._id)
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
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Update Task error:", error);

    res.status(500).json({
      message: "Server error while updating task",
    });
  }
};

// ======================================================
// ASSIGN / REASSIGN PROJECT MANAGER
// ======================================================

const assignTaskProjectManager = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { projectManager } = req.body;

    if (!projectManager) {
      return res.status(400).json({
        message:
          "Project Manager is required",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    const manager = await User.findOne({
      _id: projectManager,
      role: "project_manager",
    });

    if (!manager) {
      return res.status(404).json({
        message: "Project Manager not found",
      });
    }

    if (manager.status !== "active") {
      return res.status(400).json({
        message:
          "Selected Project Manager is inactive",
      });
    }

    const selectedProject =
      await Project.findById(task.project);

    if (!selectedProject) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    // ----------------------------------------------
    // MANAGER MUST BE ASSIGNED TO PROJECT
    // ----------------------------------------------

    if (
      selectedProject.projectManager.toString() !==
      manager._id.toString()
    ) {
      return res.status(400).json({
        message:
          "Selected Project Manager is not assigned to this project",
      });
    }

    task.projectManager = manager._id;

    // ----------------------------------------------
    // CHECK EXISTING EMPLOYEE
    // ----------------------------------------------

    if (task.assignedEmployee) {
      const employee = await User.findOne({
        _id: task.assignedEmployee,
        role: "employee",
      });

      if (
        !employee ||
        !employee.projectManager ||
        employee.projectManager.toString() !==
          manager._id.toString()
      ) {
        task.assignedEmployee = null;
      }
    }

    await task.save();

    const updatedTask =
      await Task.findById(task._id)
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
        "Project Manager assigned successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error(
      "Assign Task Project Manager error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while assigning Project Manager",
    });
  }
};

// ======================================================
// ASSIGN / REASSIGN EMPLOYEE
// ======================================================

const assignTaskEmployee = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { assignedEmployee } = req.body;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    // ----------------------------------------------
    // REMOVE EMPLOYEE ASSIGNMENT
    // ----------------------------------------------

    if (!assignedEmployee) {
      task.assignedEmployee = null;

      await task.save();

      const updatedTask =
        await Task.findById(task._id)
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

      return res.status(200).json({
        message:
          "Employee assignment removed successfully",
        task: updatedTask,
      });
    }

    // ----------------------------------------------
    // FIND EMPLOYEE
    // ----------------------------------------------

    const employee = await User.findOne({
      _id: assignedEmployee,
      role: "employee",
    });

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found",
      });
    }

    if (employee.status !== "active") {
      return res.status(400).json({
        message:
          "Selected employee is inactive",
      });
    }

    // ----------------------------------------------
    // EMPLOYEE MUST BELONG TO TASK MANAGER
    // ----------------------------------------------

    if (
      !employee.projectManager ||
      employee.projectManager.toString() !==
        task.projectManager.toString()
    ) {
      return res.status(400).json({
        message:
          "Employee does not belong to the task's Project Manager",
      });
    }

    task.assignedEmployee = employee._id;

    await task.save();

    const updatedTask =
      await Task.findById(task._id)
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
        "Employee assigned successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error(
      "Assign Task Employee error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while assigning employee",
    });
  }
};

// ======================================================
// UPDATE TASK STATUS
// ======================================================

const updateTaskStatus = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = [
      "todo",
      "in_progress",
      "review",
      "completed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid task status",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    await Task.updateOne(
      { _id: id },
      {
        $set: {
          status: status,
        },
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
        "Task status updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error(
      "Update Task Status error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while updating task status",
    });
  }
};

// ======================================================
// UPDATE TASK PRIORITY
// ======================================================

const updateTaskPriority = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    const allowedPriorities = [
      "low",
      "medium",
      "high",
      "critical",
    ];

    if (!allowedPriorities.includes(priority)) {
      return res.status(400).json({
        message: "Invalid task priority",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    task.priority = priority;

    await task.save();

    const updatedTask =
      await Task.findById(task._id)
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
        "Task priority updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error(
      "Update Task Priority error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while updating task priority",
    });
  }
};

// ======================================================
// DELETE TASK
// ======================================================

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found",
      });
    }

    await Task.deleteOne({
      _id: id,
    });

    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Delete Task error:", error);

    res.status(500).json({
      message:
        "Server error while deleting task",
    });
  }
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  assignTaskProjectManager,
  assignTaskEmployee,
  updateTaskStatus,
  updateTaskPriority,
  deleteTask,
};