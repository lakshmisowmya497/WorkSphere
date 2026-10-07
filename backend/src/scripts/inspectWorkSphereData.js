const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("\n========================================");
    console.log("WORKSPHERE DATABASE INSPECTION");
    console.log("========================================\n");

    const managers = await User.find({
      role: "project_manager",
    })
      .select("_id name email department jobTitle status")
      .lean();

    console.log("PROJECT MANAGERS");
    console.log("========================================");

    for (const manager of managers) {
      const employees = await User.find({
        role: "employee",
        projectManager: manager._id,
      })
        .select("_id name email department jobTitle status")
        .lean();

      console.log({
        id: manager._id.toString(),
        name: manager.name,
        email: manager.email,
        department: manager.department,
        jobTitle: manager.jobTitle,
        status: manager.status,
        teamSize: employees.length,
        employees: employees.map((employee) => ({
          id: employee._id.toString(),
          name: employee.name,
          email: employee.email,
          jobTitle: employee.jobTitle,
          department: employee.department,
          status: employee.status,
        })),
      });
    }

    console.log("\n\nPROJECTS");
    console.log("========================================");

    const projects = await Project.find({})
      .populate(
        "projectManager",
        "name email department jobTitle status"
      )
      .lean();

    for (const project of projects) {
      const taskCount = await Task.countDocuments({
        project: project._id,
      });

      console.log({
        id: project._id.toString(),
        name: project.name,
        description: project.description,
        startDate: project.startDate,
        endDate: project.endDate,
        status: project.status,
        projectManager: project.projectManager
          ? {
              id: project.projectManager._id?.toString(),
              name: project.projectManager.name,
              email: project.projectManager.email,
            }
          : null,
        taskCount,
      });
    }

    console.log("\n\nTASK SUMMARY");
    console.log("========================================");

    const tasks = await Task.find({})
      .populate("project", "name")
      .populate(
        "projectManager",
        "name email"
      )
      .populate(
        "assignedEmployee",
        "name email jobTitle"
      )
      .lean();

    console.log("Total tasks:", tasks.length);

    for (const task of tasks) {
      console.log({
        id: task._id.toString(),
        title: task.title,
        project: task.project
          ? {
              id: task.project._id?.toString(),
              name: task.project.name,
            }
          : null,
        projectManager: task.projectManager
          ? {
              id: task.projectManager._id?.toString(),
              name: task.projectManager.name,
            }
          : null,
        assignedEmployee: task.assignedEmployee
          ? {
              id: task.assignedEmployee._id?.toString(),
              name: task.assignedEmployee.name,
              email: task.assignedEmployee.email,
              jobTitle: task.assignedEmployee.jobTitle,
            }
          : null,
        priority: task.priority,
        status: task.status,
      });
    }

    console.log("\n========================================");
    console.log("INSPECTION COMPLETE");
    console.log("========================================\n");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Inspection error:", error);
    process.exit(1);
  }
};

run();