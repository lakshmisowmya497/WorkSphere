const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const connectDB = require("./config/db");

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log("Connected to MongoDB");

    // Remove the previous demo accounts
    await User.deleteMany({
      email: {
        $in: [
          "admin@worksphere.com",

          "ananya.sharma@worksphere.com",
          "rahul.verma@worksphere.com",
          "priya.reddy@worksphere.com",
          "arjun.nair@worksphere.com",

          "employee1@worksphere.com",
          "employee2@worksphere.com",
          "employee3@worksphere.com",
          "employee4@worksphere.com",
          "employee5@worksphere.com",
          "employee6@worksphere.com",
          "employee7@worksphere.com",
          "employee8@worksphere.com",
          "employee9@worksphere.com",
          "employee10@worksphere.com",
          "employee11@worksphere.com",
          "employee12@worksphere.com",
          "employee13@worksphere.com",
          "employee14@worksphere.com",
          "employee15@worksphere.com",
          "employee16@worksphere.com",
          "employee17@worksphere.com",
          "employee18@worksphere.com",
          "employee19@worksphere.com",
          "employee20@worksphere.com",
        ],
      },
    });

    // =====================================================
    // ADMIN
    // =====================================================

    const adminPassword = "Admin@2026#01";

    const admin = await User.create({
      name: "Aravind Kumar",
      email: "admin@worksphere.com",
      password: await bcrypt.hash(adminPassword, 10),
      phone: "9876500001",
      role: "admin",
      location: "Vijayawada",
      department: "Administration",
      jobTitle: "Organization Administrator",
      status: "active",
    });

    // =====================================================
    // PROJECT MANAGERS
    // =====================================================

    const managerData = [
      {
        name: "Ananya Sharma",
        email: "ananya.sharma@worksphere.com",
        password: "Ananya@2026#02",
        phone: "9876500002",
        location: "Hyderabad",
      },
      {
        name: "Rahul Verma",
        email: "rahul.verma@worksphere.com",
        password: "Rahul@2026#03",
        phone: "9876500003",
        location: "Bengaluru",
      },
      {
        name: "Priya Reddy",
        email: "priya.reddy@worksphere.com",
        password: "Priya@2026#04",
        phone: "9876500004",
        location: "Chennai",
      },
      {
        name: "Arjun Nair",
        email: "arjun.nair@worksphere.com",
        password: "Arjun@2026#05",
        phone: "9876500005",
        location: "Pune",
      },
    ];

    const managers = [];

    for (const manager of managerData) {
      const createdManager = await User.create({
        name: manager.name,
        email: manager.email,
        password: await bcrypt.hash(manager.password, 10),
        phone: manager.phone,
        role: "project_manager",
        location: manager.location,
        department: "Engineering",
        jobTitle: "Project Manager",
        status: "active",
      });

      managers.push(createdManager);
    }

    // =====================================================
    // EMPLOYEES
    // =====================================================

    const employeeData = [
      // Team 1
      {
        name: "Vikram Rao",
        email: "employee1@worksphere.com",
        password: "Vikram@2026#06",
        jobTitle: "Senior Developer",
      },
      {
        name: "Sneha Iyer",
        email: "employee2@worksphere.com",
        password: "Sneha@2026#07",
        jobTitle: "Developer",
      },
      {
        name: "Kiran Patel",
        email: "employee3@worksphere.com",
        password: "Kiran@2026#08",
        jobTitle: "Junior Developer",
      },
      {
        name: "Meera Das",
        email: "employee4@worksphere.com",
        password: "Meera@2026#09",
        jobTitle: "Intern",
      },
      {
        name: "Aditya Singh",
        email: "employee5@worksphere.com",
        password: "Aditya@2026#10",
        jobTitle: "QA Engineer",
      },

      // Team 2
      {
        name: "Rohan Gupta",
        email: "employee6@worksphere.com",
        password: "Rohan@2026#11",
        jobTitle: "Senior Developer",
      },
      {
        name: "Nisha Kapoor",
        email: "employee7@worksphere.com",
        password: "Nisha@2026#12",
        jobTitle: "Developer",
      },
      {
        name: "Varun Mehta",
        email: "employee8@worksphere.com",
        password: "Varun@2026#13",
        jobTitle: "Junior Developer",
      },
      {
        name: "Aarav Joshi",
        email: "employee9@worksphere.com",
        password: "Aarav@2026#14",
        jobTitle: "Intern",
      },
      {
        name: "Ishita Rao",
        email: "employee10@worksphere.com",
        password: "Ishita@2026#15",
        jobTitle: "QA Engineer",
      },

      // Team 3
      {
        name: "Sanjay Kumar",
        email: "employee11@worksphere.com",
        password: "Sanjay@2026#16",
        jobTitle: "Senior Developer",
      },
      {
        name: "Divya Menon",
        email: "employee12@worksphere.com",
        password: "Divya@2026#17",
        jobTitle: "Developer",
      },
      {
        name: "Manish Shah",
        email: "employee13@worksphere.com",
        password: "Manish@2026#18",
        jobTitle: "Junior Developer",
      },
      {
        name: "Pooja Nair",
        email: "employee14@worksphere.com",
        password: "Pooja@2026#19",
        jobTitle: "Intern",
      },
      {
        name: "Akash Reddy",
        email: "employee15@worksphere.com",
        password: "Akash@2026#20",
        jobTitle: "QA Engineer",
      },

      // Team 4
      {
        name: "Naveen Kumar",
        email: "employee16@worksphere.com",
        password: "Naveen@2026#21",
        jobTitle: "Senior Developer",
      },
      {
        name: "Keerthi Rao",
        email: "employee17@worksphere.com",
        password: "Keerthi@2026#22",
        jobTitle: "Developer",
      },
      {
        name: "Ravi Teja",
        email: "employee18@worksphere.com",
        password: "Ravi@2026#23",
        jobTitle: "Junior Developer",
      },
      {
        name: "Harini Das",
        email: "employee19@worksphere.com",
        password: "Harini@2026#24",
        jobTitle: "Intern",
      },
      {
        name: "Siddharth Jain",
        email: "employee20@worksphere.com",
        password: "Siddharth@2026#25",
        jobTitle: "QA Engineer",
      },
    ];

    const locations = [
      "Vijayawada",
      "Hyderabad",
      "Bengaluru",
      "Chennai",
      "Pune",
    ];

    for (let i = 0; i < employeeData.length; i++) {
      const employee = employeeData[i];

      // Every 5 employees belong to one Project Manager
      const managerIndex = Math.floor(i / 5);

      await User.create({
        name: employee.name,
        email: employee.email,
        password: await bcrypt.hash(employee.password, 10),
        phone: `98765${String(10006 + i).padStart(5, "0")}`,
        role: "employee",
        location: locations[i % locations.length],
        department: "Engineering",
        jobTitle: employee.jobTitle,
        projectManager: managers[managerIndex]._id,
        status: "active",
      });
    }

    // =====================================================
    // SUCCESS
    // =====================================================

    console.log("");
    console.log("=================================");
    console.log("WorkSphere database seeded!");
    console.log("=================================");
    console.log("Admin:             1");
    console.log("Project Managers:  4");
    console.log("Employees:         20");
    console.log("Total Users:       25");
    console.log("=================================");
    console.log("");

    console.log("ADMIN LOGIN");
    console.log("Email:    admin@worksphere.com");
    console.log("Password: Admin@2026#01");
    console.log("");

    console.log("PROJECT MANAGER LOGINS");
    console.log("---------------------------------");
    console.log("Ananya:  ananya.sharma@worksphere.com");
    console.log("         Ananya@2026#02");

    console.log("Rahul:   rahul.verma@worksphere.com");
    console.log("         Rahul@2026#03");

    console.log("Priya:   priya.reddy@worksphere.com");
    console.log("         Priya@2026#04");

    console.log("Arjun:   arjun.nair@worksphere.com");
    console.log("         Arjun@2026#05");
    console.log("");

    console.log("EMPLOYEE PASSWORDS");
    console.log("---------------------------------");

    employeeData.forEach((employee) => {
      console.log(`${employee.email} → ${employee.password}`);
    });

    console.log("");

    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
};

seedDatabase();