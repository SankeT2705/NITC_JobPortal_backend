import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// ✅ REGISTER USER / ADMIN
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;

    console.log("📩 Registration request:", { name, email, department, role });

    // Check if user exists
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // ❌ Remove manual hashing (handled by pre-save hook)
    const newUser = await User.create({
      name,
      email,
      password, // plain password (auto-hashed by model)
      department,
      role: role === "admin" ? "admin" : "user",
    });

    console.log("✅ User registered:", newUser.email, "-", newUser.role);

    res.status(201).json({
      message: `${newUser.role.toUpperCase()} registered successfully!`,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        department: newUser.department,
        role: newUser.role,
      },
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({
      message: err.message || "Server error during registration",
    });
  }
};

// ✅ LOGIN USER / ADMIN
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("🔐 Login attempt:", email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials: user not found" });
    }

    // ✅ Compare password using model method
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log("❌ Password mismatch for:", email);
      return res.status(401).json({ message: "Invalid password" });
    }

    // ✅ Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log(`✅ ${user.role.toUpperCase()} login successful`);

    res.json({
      message: `${user.role.toUpperCase()} login successful`,
      token,
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
};

// ✅ PROFILE
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
