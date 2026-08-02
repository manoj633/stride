import jwt from "jsonwebtoken";

const generateToken = (res, userId) => {
  //receives paylod (userId in our case)
  //A secret stored in .env
  //expires in
  const token = jwt.sign({ userId }, process.env.JWT_KEY, {
    expiresIn: "24h",
  });

  //Set JWT as HTTP only cookie
  res.cookie("jwt", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000, // matches the token's own 24h expiry
  });
};

export default generateToken;
