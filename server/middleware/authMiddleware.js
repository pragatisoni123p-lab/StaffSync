const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - verifies JWT
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "staffsync_jwt_secret_token_key_2026_antigravity"
      );
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ message: "User not found or deactivated" });
      }

      if (!req.user.isActive) {
        return res.status(403).json({ message: "User account has been deactivated" });
      }

      next();
    } catch (error) {
      console.error("Auth Middleware Error:", error.message);
      return res.status(401).json({ message: "Not authorized, token invalid or expired" });
    }
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no bearer token provided" });
  }
};

// Authorize roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Role '${req.user ? req.user.role : "Unknown"}' does not have access to this resource`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
