const User = require("../models/User");

// Get api me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-password -refreshTokenHash")
      .lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Patch api (update name and profile pic)

exports.updateMe = async (req, res) => {
  try {
    const { firstName, lastName, profilePic } = req.body;

    const updates = {};

    if (firstName !== undefined) {
      const trimmed = firstName.trim();
      if (!trim)
        return res.status(400).json({ message: "First name cannot be empty" });

      updates.firstName = trimmed;
    }

    if (lastName !== undefined) {
      updates.lastName = lastName.trim();
    }

    if (profilePic !== undefined) {
      if (profilePic && !profilePic.startsWih("https://res.cloudinary.com")) {
        return res.status(400).json({ message: "Invalid profile picture URL" });
      }
      updates.profilePic = profilePic;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password -refreshTokenHash");

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
