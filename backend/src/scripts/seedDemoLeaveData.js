const mongoose = require("mongoose");
const dotenv = require("dotenv");

const User = require("../models/User");
const LeaveRequest = require("../models/LeaveRequest");

dotenv.config();

const managers = [
  {
    id: "6ab9126485fb0d8c3c3420d4",
    name: "Ananya Sharma",
    pmReason:
      "Attending a family function and requesting planned leave.",
    employees: [
      {
        id: "6ab9126585fb0d8c3c3420d8",
        name: "Vikram Rao",
        reason:
          "Need leave to attend a family wedding.",
        leaveType: "casual",
      },
      {
        id: "6ab9126685fb0d8c3c3420da",
        name: "Kiran Patel",
        reason:
          "Need leave for a scheduled medical check-up.",
        leaveType: "sick",
      },
    ],
  },

  {
    id: "6ab9126485fb0d8c3c3420d5",
    name: "Rahul Verma",
    pmReason:
      "Requesting leave for a personal family commitment.",
    employees: [
      {
        id: "6ab9126885fb0d8c3c3420dd",
        name: "Rohan Gupta",
        reason:
          "Need leave to attend an important family ceremony.",
        leaveType: "casual",
      },
      {
        id: "6ab9126885fb0d8c3c3420df",
        name: "Varun Mehta",
        reason:
          "Requesting work-from-home leave due to a home emergency.",
        leaveType: "work-from-home",
      },
    ],
  },

  {
    id: "6ab9126485fb0d8c3c3420d6",
    name: "Priya Reddy",
    pmReason:
      "Requesting leave for an important personal appointment.",
    employees: [
      {
        id: "6ab9126a85fb0d8c3c3420e2",
        name: "Sanjay Kumar",
        reason:
          "Need leave to attend a close relative's engagement ceremony.",
        leaveType: "casual",
      },
      {
        id: "6ab9126c85fb0d8c3c3420e4",
        name: "Manish Shah",
        reason:
          "Requesting leave due to a minor health issue and rest.",
        leaveType: "sick",
      },
    ],
  },

  {
    id: "6ab9126585fb0d8c3c3420d7",
    name: "Arjun Nair",
    pmReason:
      "Requesting leave for a planned personal commitment.",
    employees: [
      {
        id: "6ab9126d85fb0d8c3c3420e7",
        name: "Naveen Kumar",
        reason:
          "Need leave to attend a university-related appointment.",
        leaveType: "earned",
      },
      {
        id: "6ab9126e85fb0d8c3c3420e9",
        name: "Ravi Teja",
        reason:
          "Requesting leave for an urgent personal matter.",
        leaveType: "casual",
      },
    ],
  },
];

const makeDate = (dateString) => {
  const date = new Date(dateString);

  date.setHours(0, 0, 0, 0);

  return date;
};

const createLeaveIfMissing = async ({
  requesterId,
  employeeId = null,
  projectManagerId = null,
  leaveType,
  fromDate,
  toDate,
  reason,
  visitingLocation = "",
  additionalDetails = "",
  approvalLevel,
}) => {
  const existing = await LeaveRequest.findOne({
    requester: requesterId,
    employee: employeeId,
    projectManager: projectManagerId,
    reason,
    status: "pending",
  });

  if (existing) {
    return {
      created: false,
      leave: existing,
    };
  }

  const leave = await LeaveRequest.create({
    requester: requesterId,
    employee: employeeId,
    projectManager: projectManagerId,
    approvalLevel,
    leaveType,
    fromDate: makeDate(fromDate),
    toDate: makeDate(toDate),
    reason,
    visitingLocation,
    additionalDetails,
    status: "pending",
    managerComment: "",
    adminComment: "",
    reviewedBy: null,
    reviewedAt: null,
  });

  return {
    created: true,
    leave,
  };
};

const run = async () => {
  try {
    console.log("\n========================================");
    console.log("WORKSPHERE DEMO LEAVE DATA SEED");
    console.log("========================================\n");

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected.\n");

    let createdManagerLeaves = 0;
    let createdEmployeeLeaves = 0;

    // ==========================================
    // VERIFY ALL MANAGERS AND TEAMS
    // ==========================================

    for (const managerData of managers) {
      const manager = await User.findOne({
        _id: managerData.id,
        role: "project_manager",
      });

      if (!manager) {
        throw new Error(
          `Project Manager not found: ${managerData.name}`
        );
      }

      console.log(
        `Verified Project Manager: ${manager.name}`
      );

      for (const employee of managerData.employees) {
        const employeeUser = await User.findOne({
          _id: employee.id,
          role: "employee",
          projectManager: managerData.id,
        });

        if (!employeeUser) {
          throw new Error(
            `Employee ${employee.name} is not assigned to ${managerData.name}`
          );
        }
      }

      console.log(
        `Verified selected employees for ${manager.name}`
      );
    }

    // ==========================================
    // PROJECT MANAGER LEAVE REQUESTS
    // PM -> ADMIN
    // ==========================================

    console.log(
      "\n========================================"
    );
    console.log("CREATING PROJECT MANAGER LEAVE REQUESTS");
    console.log("========================================\n");

    for (let index = 0; index < managers.length; index++) {
      const manager = managers[index];

      const startDay = 10 + index * 3;
      const endDay = startDay + 1;

      const fromDate = `2026-10-${String(
        startDay
      ).padStart(2, "0")}`;

      const toDate = `2026-10-${String(
        endDay
      ).padStart(2, "0")}`;

      const result = await createLeaveIfMissing({
        requesterId: manager.id,
        employeeId: null,
        projectManagerId: null,
        leaveType: "casual",
        fromDate,
        toDate,
        reason: manager.pmReason,
        visitingLocation: "Personal",
        additionalDetails:
          "Planned leave request submitted by the Project Manager for Admin approval.",
        approvalLevel: "admin",
      });

      if (result.created) {
        createdManagerLeaves++;

        console.log(
          `${manager.name} -> Admin`
        );
        console.log(
          `  Reason: ${manager.pmReason}`
        );
        console.log(
          `  Dates: ${fromDate} to ${toDate}`
        );
        console.log(
          `  Status: pending\n`
        );
      } else {
        console.log(
          `${manager.name} -> Admin already exists.`
        );
      }
    }

    // ==========================================
    // EMPLOYEE LEAVE REQUESTS
    // Employee -> Project Manager
    // ==========================================

    console.log(
      "\n========================================"
    );
    console.log("CREATING EMPLOYEE LEAVE REQUESTS");
    console.log("========================================\n");

    let employeeIndex = 0;

    for (const manager of managers) {
      for (const employee of manager.employees) {
        const startDay =
          15 + employeeIndex * 2;

        const endDay = startDay;

        const fromDate = `2026-10-${String(
          startDay
        ).padStart(2, "0")}`;

        const toDate = `2026-10-${String(
          endDay
        ).padStart(2, "0")}`;

        const result = await createLeaveIfMissing({
          requesterId: employee.id,
          employeeId: employee.id,
          projectManagerId: manager.id,
          leaveType: employee.leaveType,
          fromDate,
          toDate,
          reason: employee.reason,
          visitingLocation:
            employee.leaveType ===
            "work-from-home"
              ? "Home"
              : "Personal",
          additionalDetails:
            "Demo leave request created for WorkSphere workflow testing.",
          approvalLevel: "project_manager",
        });

        if (result.created) {
          createdEmployeeLeaves++;

          console.log(
            `${employee.name} -> ${manager.name}`
          );
          console.log(
            `  Reason: ${employee.reason}`
          );
          console.log(
            `  Dates: ${fromDate} to ${toDate}`
          );
          console.log(
            `  Status: pending\n`
          );
        } else {
          console.log(
            `${employee.name} -> ${manager.name} already exists.`
          );
        }

        employeeIndex++;
      }
    }

    // ==========================================
    // FINAL VALIDATION
    // ==========================================

    console.log(
      "\n========================================"
    );
    console.log("FINAL LEAVE DATA VALIDATION");
    console.log(
      "========================================\n"
    );

    const adminPendingLeaves =
      await LeaveRequest.find({
        approvalLevel: "admin",
        status: "pending",
      })
        .populate(
          "requester",
          "name email role department"
        )
        .sort({ createdAt: 1 });

    const managerPendingLeaves =
      await LeaveRequest.find({
        approvalLevel: "project_manager",
        status: "pending",
      })
        .populate(
          "requester",
          "name email role department"
        )
        .populate(
          "employee",
          "name email jobTitle"
        )
        .populate(
          "projectManager",
          "name email"
        )
        .sort({ createdAt: 1 });

    console.log(
      `Pending PM -> Admin requests found: ${adminPendingLeaves.length}`
    );

    console.log(
      `Pending Employee -> PM requests found: ${managerPendingLeaves.length}`
    );

    console.log(
      `\nCreated in this run:`
    );

    console.log(
      `  Manager requests: ${createdManagerLeaves}`
    );

    console.log(
      `  Employee requests: ${createdEmployeeLeaves}`
    );

    // ==========================================
    // VERIFY EXACT DEMO REQUESTS
    // ==========================================

    for (const manager of managers) {
      const managerLeave =
        await LeaveRequest.findOne({
          requester: manager.id,
          approvalLevel: "admin",
          status: "pending",
        });

      if (!managerLeave) {
        throw new Error(
          `Validation failed: No pending Admin leave found for ${manager.name}.`
        );
      }

      const employeeLeaves =
        await LeaveRequest.find({
          projectManager: manager.id,
          approvalLevel: "project_manager",
          status: "pending",
          employee: {
            $in: manager.employees.map(
              (employee) => employee.id
            ),
          },
        });

      if (employeeLeaves.length !== 2) {
        throw new Error(
          `Validation failed: Expected 2 employee leave requests for ${manager.name}, found ${employeeLeaves.length}.`
        );
      }

      console.log(
        `Validated ${manager.name}: 1 manager leave + 2 employee leaves`
      );
    }

    // ==========================================
    // SUCCESS
    // ==========================================

    console.log(
      "\n========================================"
    );
    console.log("SUCCESS");
    console.log(
      "========================================"
    );

    console.log(
      "4 Project Managers have pending leave requests for Admin."
    );

    console.log(
      "8 selected employees have pending leave requests for their Project Managers."
    );

    console.log(
      "Each manager has exactly 2 selected employee requests."
    );

    console.log(
      "All seeded requests are pending."
    );

    console.log(
      "Leave data is ready for dashboard testing."
    );

    console.log(
      "========================================\n"
    );

    await mongoose.disconnect();
  } catch (error) {
    console.error(
      "\n========================================"
    );
    console.error("LEAVE SEED FAILED");
    console.error(
      "========================================"
    );
    console.error(error);
    console.error(
      "========================================\n"
    );

    try {
      await mongoose.disconnect();
    } catch {}

    process.exit(1);
  }
};

run();