const express = require("express");

const {
  register,
  login,
  changePassword,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// PUBLIC AUTH
// =====================================================

router.post("/register", register);

router.post("/login", login);

// =====================================================
// AUTHENTICATED USER
// =====================================================

router.put(
  "/change-password",
  authMiddleware,
  changePassword
);

module.exports = router;