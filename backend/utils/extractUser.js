import jwt from "jsonwebtoken";

const extractUser = (req, res, next) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ message: "Not authorized!" });
  }

  try {
    // Decode the token and extract the user ID
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    req.userId = decoded.userId; // Attach the userId to the request object
    next(); // Call the next middleware/controller
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed!" });
  }
};

export default extractUser;
