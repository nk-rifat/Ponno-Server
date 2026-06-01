const admin = require("../config/firebaseAdmin");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const { createAccessToken, createRefreshToken } = require("../utils/jwt");

//Login
exports.login = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    // Verify authenticity against Google/Firebase servers
    const decoded = await admin.auth().verifyIdToken(firebaseToken);

    // Email verification check

    if (!decoded.email_verified) {
      return res.status(403).json({
        message: "Email not verified",
      });
    }

    // Upsert User: Finds existing profile or automatically provisions a new one
    const user = await User.findOneAndUpdate(
      { email: decoded.email },
      { email: decoded.email },
      { upsert: true, new: true },
    );

    const payload = {
      email: decoded.email,
      uid: decoded.uid,
      role: user.role,
    };

    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    // Securely hash the refresh token before placing it in MongoDB
    const hashed = await bcrypt.hash(refreshToken, 10);
    user.refreshTokenHash = hashed;
    await user.save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
    });

    res.json({ accessToken });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// Refresh Token

exports.refresh = async (req, res) => {
  const jwt = require("jsonwebtoken");

  try {
    const token = req.cookies.refreshToken;

    if (!token) return res.sendStatus(401);

    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

    const user = await User.findOne({
      email: decoded.email,
    });

    if (!user?.refreshTokenHash) return res.sendStatus(403);

    const valid = await bcrypt.compare(token, user.refreshTokenHash);

    if (!valid) return res.sendStatus(403);

    const newAccessToken = createAccessToken({
      email: user.email,
      uid: decoded.uid,
      role: user.role,
    });

    res.json({ accessToken: newAccessToken });
  } catch {
    res.sendStatus(403);
  }
};

// Safe session restore

exports.me = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.user.email,
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
