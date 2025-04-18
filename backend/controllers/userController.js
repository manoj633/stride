import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/userModel.js";
import generateToken from "../utils/generateToken.js";
import PasswordReset from "../models/passwordResetModel.js";
import sendEmail from "../utils/emailService.js";

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

// @desc    Request password reset
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("No account with that email exists");
  }

  // Delete any existing reset tokens for this user
  await PasswordReset.deleteMany({ userId: user._id });

  // Generate new token
  const resetToken = PasswordReset.generateToken();

  // Save the reset token
  await PasswordReset.create({
    userId: user._id,
    token: resetToken,
  });

  // Create reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // Create email content
  const html = `
    <!-- For forgot-password email -->
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 8px; background-color: #f9f9f9;">
  <div style="text-align: center; padding: 15px 0; margin-bottom: 20px;">
    <h1 style="color: #4a6cf7; margin: 0; font-size: 24px;">Password Reset Request</h1>
  </div>
  
  <div style="background-color: white; padding: 25px; border-radius: 6px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
    <p style="color: #333; font-size: 16px; margin-top: 0;">Hi ${user.name},</p>
    
    <p style="color: #555; font-size: 15px; line-height: 1.5;">You requested a password reset for your Stride account. Please click the button below to reset your password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #4a6cf7; color: white; font-weight: bold; text-decoration: none; padding: 12px 30px; border-radius: 4px; font-size: 16px;">Reset Your Password</a>
    </div>
    
    <p style="color: #777; font-size: 14px; margin-bottom: 5px;">This link will expire in 1 hour.</p>
    <p style="color: #777; font-size: 14px;">If you didn't request this, please ignore this email.</p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 14px;">
      <p style="margin: 0;">Thanks,<br>The Stride Team</p>
    </div>
  </div>
  
  <div style="text-align: center; padding: 15px; color: #999; font-size: 12px; margin-top: 20px;">
    <p>&copy; 2024 Stride. All rights reserved.</p>
  </div>
</div>
  `;

  // Send email
  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password Reset Link (Valid for 1 hour)",
      html,
    });

    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    await PasswordReset.deleteMany({ userId: user._id });
    res.status(500);
    throw new Error("Email could not be sent");
  }
});

// @desc    Reset password
// @route   POST /api/users/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Find valid reset token
  const passwordReset = await PasswordReset.findOne({ token });

  if (!passwordReset) {
    res.status(400);
    throw new Error("Invalid or expired reset token");
  }

  // Find user
  const user = await User.findById(passwordReset.userId);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Update password
  user.password = password;
  await user.save();

  // Delete the reset token
  await PasswordReset.deleteMany({ userId: user._id });

  // Send confirmation email
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333333;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
    }
    .email-header {
      background-color: #007AFF;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .email-logo {
      font-size: 28px;
      font-weight: bold;
      color: white;
    }
    .email-body {
      background-color: white;
      padding: 30px;
      border-radius: 0 0 8px 8px;
      border: 1px solid #e5e5e5;
      border-top: none;
    }
    .email-title {
      font-size: 24px;
      font-weight: 600;
      color: #007AFF;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .email-content {
      margin-bottom: 25px;
    }
    .alert-box {
      background-color: #fff8e1;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .email-footer {
      text-align: left;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      color: #666666;
      font-size: 14px;
    }
    .support-link {
      color: #007AFF;
      text-decoration: none;
      font-weight: 500;
    }
    .support-link:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <div class="email-logo">Stride</div>
    </div>
    <div class="email-body">
      <h1 class="email-title">Password Reset Successful</h1>
      <div class="email-content">
        <p>Hi ${user.name},</p>
        <p>Your password for your Stride account has been successfully reset.</p>
        
        <div class="alert-box">
          <p><strong>Important:</strong> If you didn't make this change, please contact our support team immediately as your account may have been compromised.</p>
        </div>
        
        <p>You can now log in to your account with your new password. For security reasons, we recommend not sharing your password with anyone.</p>
      </div>
      
      <div class="email-footer">
        <p>Thanks,<br>The Stride Team</p>
        <p>Need help? Contact us at <a href="mailto:support@stride.com" class="support-link">support@stride.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;

  await sendEmail({
    email: user.email,
    subject: "Your password has been reset",
    html,
  });

  res.status(200).json({ message: "Password reset successful" });
});

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
  forgotPassword,
  resetPassword,
};
