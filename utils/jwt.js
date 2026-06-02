const jwt = require("jsonwebtoken");

// Access Token (Short Life)
exports.generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.ACCESS_SECRET,
    { expiresIn: "15m" },
  );
};

// Refresh Token (long life)

exports.generateRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

// Email verification Token

exports.generateEmailToken = (user) => {
  return jwt.sign(
    { id: user._id, status: user.isVerified },
    process.env.EMAIL_VERIFICATION_SECRET,
    {
      expiresIn: "1h",
    },
  );
};
