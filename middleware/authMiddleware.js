import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Protect Middleware
 * Verifies JWT token, attaches user details to `req.user`
 */
export const protect = async (req, res, next) => {
  let token;

  // Check for Bearer Token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Decode JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find user from DB
      const user = await User.findById(decoded.id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      //  Attach user info (email + role) for easy backend use
      req.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
      };

      next();
    } catch (err) {
      console.error("❌ Token verification failed:", err.message);
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }
  }

  // If no token
  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
};

/**
 *  Admin-Only Middleware
 * Restricts route access to admins only
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Access denied: Admins only" });
  }
};
