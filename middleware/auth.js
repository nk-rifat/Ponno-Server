const jwt = require("jsonwebtoken");

exports.verifyAccessToken = (req, res, next) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({ message: "Not authenticate" });
  }
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Access token expired"});
  }
};
