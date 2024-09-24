const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Get the token from the headers
  if (!token) {
    console.log("No token provided");
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error("Token verification error:", err);
      return res.status(401).json({ message: "Unauthorized" });
    }

    console.log("Decoded Token:", decoded);
    req.user = decoded; // Attach user info to request
    next();
  });
};

module.exports = verifyToken;
