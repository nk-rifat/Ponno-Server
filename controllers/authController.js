const admin = require("../config/firebaseAdmin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { createAccessToken, createRefreshToken } = require("../utils/jwt");

//Cookie options

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
};

//Helper: issue tokens and save hash

const issueTokens = async (res, payload) => {
  const accessToken = createAccessToken(payload);
  const refreshToken = createRefreshToken(payload);

  const hashed = await bcrypt.hash(refreshToken, 10);
  await User.findOneAndUpdate(
    { email: payload.email },
    { refreshTokenHash: hashed },
  );

  res.cookie("refreshToken", refreshToken, cookieOptions);

  return accessToken;
};

// Register
exports.register = async (req, res) => {
  try {
    const { firebaseToken, firstName, lastName, profilePic } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({ message: "Firebase token is required" });
    }

    const decoded = await admin.auth().verifyIdToken(firebaseToken);

    if (!decoded.email_verified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    const existing = await User.findOne({ email: decoded.email });

    if (existing) {
      return res
        .status(409)
        .json({ message: "Account already exists. Please log in" });
    }

    await User.create({
      email: decoded.email,
      firstName: firstName || "",
      lastName: lastName || "",
      profilePic: profilePic || "",
    });

    res.status(201).json({ message: "Account created Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Login
exports.login = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({ message: "Firebase token is required" });
    }

    // Verify authenticity against Google/Firebase servers
    const decoded = await admin.auth().verifyIdToken(firebaseToken);

    // Email verification check

    if (!decoded.email_verified) {
      return res.status(403).json({
        message: "Email not verified",
      });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({
        message: "Account not found. Please register first.",
      });
    }

    const payload = {
      email: decoded.email,
      uid: decoded.uid,
      role: user.role,
    };

    const accessToken = await issueTokens(res, payload);

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//Google Auth (Register + Login)

exports.googleAuth = async (req, res) => {
  try {
    const { firebaseToken } = req.body;

    if (!firebaseToken) {
      return res.status(400).json({ message: "Firebase Token is required" });
    }

    const decoded = await admin.auth().verifyIdToken(firebaseToken);

    if (!decoded.email_verified) {
      return res.status(403).json({ message: "Email not verified" });
    }

    let user = await User.findOne({ email: jwt.decode.email });

    let isNewUser = false;

    if (!user) {
      const nameParts = (decoded.name || "").split(" ");

      user = await User.create({
        email: decoded.email,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(" ") || "",
        profilePic: decoded.picture || "",
      });

      isNewUser = true;
    }

    const payload = {
      email: user.email,
      uid: decoded.uid,
      role: user.role,
    };

    const accessToken = await issueTokens(res, payload);

    res.status(200).json({ accessToken, isNewUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
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

    res.status(200).json({ accessToken: newAccessToken });
  } catch {
    res.sendStatus(403);
  }
};

// Me

exports.me = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.user.email,
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      email: user.email,
      role: user.role,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      profilePic: user.profilePic,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
