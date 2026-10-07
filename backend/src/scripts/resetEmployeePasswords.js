const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function resetEmployeePasswords() {
  try {
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is missing in .env");
    }

    await mongoose.connect(MONGODB_URI);

    console.log("\n==============================================");
    console.log(" WORKSPHERE EMPLOYEE PASSWORD RESET");
    console.log("==============================================\n");

    const employees = await User.find({
      role: "employee",
    })
      .sort({ createdAt: 1 })
      .limit(20);

    if (employees.length === 0) {
      console.log("No employee accounts found.");
      return;
    }

    console.log(
      `Found ${employees.length} employee account(s).\n`
    );

    const credentials = [];

    for (let i = 0; i < employees.length; i++) {
      const employee = employees[i];

      // Temporary password for this employee
      const temporaryPassword =
        `WorkSphere@${2026 + i + 1}#${String(
          i + 1
        ).padStart(2, "0")}`;

      // Hash password using bcrypt
      const hashedPassword = await bcrypt.hash(
        temporaryPassword,
        10
      );

      // Save ONLY the hash in MongoDB
      employee.password = hashedPassword;

      await employee.save();

      credentials.push({
        number: i + 1,
        name: employee.name,
        email: employee.email,
        password: temporaryPassword,
      });
    }

    console.log("PASSWORD RESET SUCCESSFUL");
    console.log(
      "The passwords below are temporary passwords.\n"
    );

    console.log(
      "--------------------------------------------------------------------------"
    );

    console.log(
      "No. | Name                     | Email                         | Password"
    );

    console.log(
      "--------------------------------------------------------------------------"
    );

    credentials.forEach((employee) => {
      console.log(
        `${String(employee.number).padEnd(3)} | ` +
          `${employee.name.padEnd(24)} | ` +
          `${employee.email.padEnd(29)} | ` +
          `${employee.password}`
      );
    });

    console.log(
      "--------------------------------------------------------------------------"
    );

    console.log("\nIMPORTANT:");
    console.log(
      "MongoDB now contains bcrypt hashes, NOT these plaintext passwords."
    );
    console.log(
      "Use the displayed passwords only for your development/testing login."
    );
    console.log(
      "Take your screenshot now if you need the temporary credentials."
    );
  } catch (error) {
    console.error(
      "\nPassword reset failed:",
      error.message
    );
  } finally {
    await mongoose.disconnect();
    console.log("\nMongoDB connection closed.");
  }
}

resetEmployeePasswords();