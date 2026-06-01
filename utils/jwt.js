const jwt = require("jsonwebtoken");

// Access Token ( short life)
const createAccessToken = (payload) => {
  jwt.sign(payload, process.env.ACCESS_SECRET, {
    expiresIn: "15min",
  });
};

// Refresh Token (long life)
const createRefreshToken = (payload) => {
  jwt.sign(payload, process.env.REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

module.exports = {
  createAccessToken,
  createRefreshToken,
};
