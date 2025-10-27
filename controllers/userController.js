// controllers/userController.js
import User from "../models/User.js";

/** GET current user's profile */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("❌ getUserProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/** UPDATE name/department */
export const updateUserProfile = async (req, res) => {
  try {
    const { name, department } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (department) user.department = department;

    const updatedUser = await user.save();
    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        department: updatedUser.department,
        skills: updatedUser.skills,
      },
    });
  } catch (err) {
    console.error("❌ updateUserProfile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/** ADD skill */
export const addSkill = async (req, res) => {
  try {
    const { skill } = req.body;
    if (!skill) return res.status(400).json({ message: "Skill is required" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.skills.includes(skill)) {
      user.skills.push(skill);
      await user.save();
    }

    res.json({ message: "Skill added", skills: user.skills });
  } catch (err) {
    console.error("❌ addSkill error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/**DELETE skill */
export const deleteSkill = async (req, res) => {
  try {
    const { skill } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.skills = user.skills.filter((s) => s !== skill);
    await user.save();

    res.json({ message: "Skill removed", skills: user.skills });
  } catch (err) {
    console.error("❌ deleteSkill error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
