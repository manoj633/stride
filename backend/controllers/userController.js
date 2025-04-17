import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";

//@desc     Auth User & get token
//@route    POST /api/users/login
//@access   Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

//@desc     Register user
//@route    POST /api/users
//@access   Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already Exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    generateToken(res, user._id);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(400);
    throw new Error("Inavlid user data");
  }
});

//@desc     Logout  / clear cookie
//@route    POST /api/users/logout
//@access   Private
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({ message: "Logged out successfully" });
});

//@desc     Get user profile
//@route    GET /api/users/profile
//@access   Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

//@desc     Update user profile
//@route    PUT /api/users/profile
//@access   Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

//@desc     Get users profile
//@route    GET /api/users
//@access   Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  res.send("get users");
});

//@desc     Get users profile by ID
//@route    GET /api/users/:id
//@access   Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  res.send("get user by id");
});

//@desc     Delete users profile
//@route    DELETE /api/users/:id
//@access   Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  res.send("delete users");
});

//@desc     Update users profile
//@route    PUT /api/users/:id
//@access   Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  res.send("update users");
});

//@desc     Refresh User Token
//@route    PUT /api/users/refresh-token
//@access   Private
const refreshToken = async (req, res) => {
  const token = req.cookies.jwt;

  if (!token) {
    return res.status(401).json({ message: "Not authorized!" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    // Generate a new token
    const newToken = jwt.sign({ userId: decoded.userId }, process.env.JWT_KEY, {
      expiresIn: "24h",
    });

    // Set new token in cookie
    res.cookie("jwt", newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    return res.status(200).json({ message: "Token refreshed" });
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export {
  authUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  refreshToken,
};
