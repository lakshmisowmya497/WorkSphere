const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        return res.status(401).json({
          message: "User role not found in authentication token",
        });
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          message: "You are not authorized to access this resource",
        });
      }

      next();
    } catch (error) {
      console.error("Role Middleware Error:", error);

      return res.status(500).json({
        message: "Server error while checking user role",
      });
    }
  };
};

module.exports = roleMiddleware;