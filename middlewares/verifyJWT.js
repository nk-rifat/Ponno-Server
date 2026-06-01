const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  try {
    const auth = req.headers.authorization;

    if (!auth) {
      return res.status(401).json({
        message: "NO token provided",
      });
    }

    const token = auth.split(" ")[1];

    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({
      message: "Invalid token",
    });
  }
};

module.exports = verifyJWT;
