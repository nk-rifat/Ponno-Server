const User = require("../models/User");
const { sendVerificationEmail } = require("../services/emailService");
const {
  hashPassword,
  comparePassword,
  hashToken,
  compareToken,
} = require("../utils/hash");
const {
  generateEmailToken,
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/jwt");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
};

const jwt = require("jsonwebtoken");

// Register User

exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // 1. Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 2. Hash password
    const hashedPassword = await hashPassword(password);

    // 3. Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      isVerified: false,
    });

    // 4. Generate email verification token (1 hour)
    const emailToken = generateEmailToken(user);

    // 5. Save token in DB
    user.emailVerificationToken = emailToken;
    user.emailVerificationExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // 6. Create verification link
    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${emailToken}`;

    // 7. Send email
    await sendVerificationEmail(email, verifyLink);

    return res.status(201).json({
      success: true,
      message: "User registered successfully. Please verify your email.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
};

// Verify Email

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    // 1. Verify token
    const decoded = jwt.verify(token, process.env.EMAIL_VERIFICATION_SECRET);

    // 2. Find user with token match
    const user = await User.findOne({
      _id: decoded.id,
      emailVerificationToken: token,
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Check expiry
    if (user.emailVerificationExpires < Date.now()) {
      return res.status(400).json({
        message: "Token expired",
      });
    }

    // 4. Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }
    // 5. Verify user
    user.isVerified = true;

    // 6. Invalidate token
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

// Login User

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find User

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 2. verify password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 3. Check email verification

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email before login" });
    }

    // 4. Generate tokens

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // 5. Save refresh token to DB

    user.refreshTokenHash = hashToken(refreshToken);
    await user.save();

    // 6. Set httpOnly cookie

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 7. Return safe user object

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.log("LOGIN ERROR 👉", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout user

exports.logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    // Clear token from DB
    if (refreshToken) {
      const hashedToken = hashToken(refreshToken);
      await User.findOneAndUpdate(
        { refreshTokenHash: hashedToken },
        { refreshTokenHash: null },
      );
    }

    // Clear cookies from browser
    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Refresh access token

exports.refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    // 1. check cookie
    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    // 2. verify jwt signature and expiry
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch {
      return res
        .status(403)
        .json({ message: "Refresh token expired or invalid" });
    }

    // 3. find user

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(403).json({ message: "User not found" });
    }

    // 4. compare raw cookie token with db dash token

    const isTokenValid = await compareToken(
      refreshToken,
      user.refreshTokenHash,
    );

    if (!isTokenValid) {
      return res
        .status(403)
        .json({ message: "Session invalidated. Please login again" });
    }

    // 5. provide new access token
    const newAccessToken = generateAccessToken(user._id);

    res.cookie("accessToken", newAccessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ message: "Token refreshed" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// me

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
