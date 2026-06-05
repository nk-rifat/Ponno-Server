const bcrypt = require("bcrypt");
const crypto = require("crypto");

// Password Utilities

exports.hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

exports.comparePassword = async (password, hashedPassword) => {
  return bcrypt.compare(password, hashedPassword);
};

// Token Utilities

exports.hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

exports.compareToken = async (rawToken, hashToken) => {
  const hashedIncoming = exports.hashToken(rawToken);
  return crypto.timingSafeEqual(
    Buffer.from(hashedIncoming),
    Buffer.from(hashedToken),
  );
};
