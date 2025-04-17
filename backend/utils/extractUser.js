import jwt from "jsonwebtoken";

const extractUser = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ message: "Not authorized!" });
  }

  try {
    // Decode the token and extract the user ID
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    // Check if token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTime) {
      return res
        .status(401)
        .json({ message: "Token expired, please login again" });
    }

    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return res.status(401).json({ message: "Not authorized, token failed!" });
  }
};

export default extractUser;
