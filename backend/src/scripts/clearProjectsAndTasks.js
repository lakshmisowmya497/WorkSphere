require("dotenv").config();

const mongoose = require("mongoose");
const Project = require("../models/Project");
const Task = require("../models/Task");

async function clearProjectsAndTasks() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    const taskResult = await Task.deleteMany({});
    const projectResult = await Project.deleteMany({});

    console.log("");
    console.log("=================================");
    console.log("WORKSPHERE PROJECT/TASK CLEANUP");
    console.log("=================================");
    console.log(`Tasks deleted: ${taskResult.deletedCount}`);
    console.log(`Projects deleted: ${projectResult.deletedCount}`);
    console.log("");
    console.log("Users were NOT deleted.");
    console.log("Project Managers were NOT deleted.");
    console.log("Employees were NOT deleted.");
    console.log("Team assignments were NOT deleted.");
    console.log("");
    console.log("Database is ready for manual project/task creation.");
    console.log("=================================");

    await mongoose.disconnect();
  } catch (error) {
    console.error("Cleanup failed:", error);
    process.exit(1);
  }
}

clearProjectsAndTasks();
