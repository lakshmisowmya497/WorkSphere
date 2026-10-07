const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");

// =====================================================
// ROUTES
// =====================================================

const authRoutes = require("./routes/authRoutes");

const projectManagerRoutes = require("./routes/projectManagerRoutes");

const employeeRoutes = require("./routes/employeeRoutes");

const projectRoutes = require("./routes/projectRoutes");

const taskRoutes = require("./routes/taskRoutes");

const leaveRoutes = require("./routes/leaveRoutes");
const taskSubmissionRoutes = require("./routes/taskSubmissionRoutes");
const employeeLeaveApprovalRoutes = require("./routes/employeeLeaveApprovalRoutes");
// =====================================================
// ENVIRONMENT
// =====================================================

dotenv.config();

// =====================================================
// APP
// =====================================================

const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());

// =====================================================
// DATABASE
// =====================================================

connectDB();

// =====================================================
// ROOT
// =====================================================

app.get("/", (req, res) => {
  res.json({
    message: "WorkSphere Backend API is running",
  });
});

// =====================================================
// AUTH
// =====================================================

app.use(
  "/api/auth",
  authRoutes
);

// =====================================================
// PROJECT MANAGER
// =====================================================

// Admin Project Manager routes
app.use(
  "/api/admin/project-managers",
  projectManagerRoutes
);

// Project Manager self-service routes
app.use(
  "/api/project-managers",
  projectManagerRoutes
);

// =====================================================
// EMPLOYEE
// =====================================================

// Admin employee routes
app.use(
  "/api/admin/employees",
  employeeRoutes
);

// Employee self-service routes
app.use(
  "/api/employees",
  employeeRoutes
);

// =====================================================
// PROJECTS
// =====================================================

app.use(
  "/api/admin/projects",
  projectRoutes
);

// =====================================================
// TASKS
// =====================================================

app.use(
  "/api/admin/tasks",
  taskRoutes
);
app.use(
  "/api/task-submissions",
  taskSubmissionRoutes
);
// =====================================================
// LEAVES
// =====================================================

app.use(
  "/api/leaves",
  leaveRoutes
);
app.use(
  "/api/project-manager/leaves",
  employeeLeaveApprovalRoutes
);

// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// =====================================================
// SERVER
// =====================================================

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `WorkSphere backend running on http://localhost:${PORT}`
  );
});