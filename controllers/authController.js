const User = require("../models/User");
const { hashPassword } = require("../utils/password");
const { generateEmailToken } = require("../utils/token");
const { sendVerificationEmail } = require("../services/emailService");
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

    // 5. Create verification link
    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${emailToken}`;

    // 6. Send email
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
