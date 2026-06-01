const jwt = require("jsonwebtoken");

// Access Token ( short life)
const createAccessToken = (user) =>
  jwt.sign(user, process.env.ACCESS_SECRET, {
    expiresIn: "15min",
  });

// Refresh Token (long life)
const createRefreshToken = (user) =>
  jwt.sign(user, process.env.REFRESH_SECRET, {
    expiresIn: "7d",
  });

module.exports = {
  createAccessToken,
  createRefreshToken,
};
