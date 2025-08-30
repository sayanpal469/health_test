import User from "../../models/user/user.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import handleMongoErrors from "../../utils/mongooseError.js";
import { sendOtpEmail } from "../../services/email.service.js";

// Register User with OTP
export const registerUser = asyncHandler(async (req, res) => {
  try {
    const { name, email, password, referralId } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "All fields are required"));
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(409)
        .json(
          new ApiResponse(409, null, "User already exists with this email")
        );
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      referralId: referralId || null,
    });

    // Generate OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    await sendOtpEmail(email, otp);

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          userId: user._id,
          email: user.email,
        },
        "User registered successfully. OTP sent to email."
      )
    );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Verify OTP
export const verifyOtp = asyncHandler(async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Email and OTP are required"));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Check if OTP is expired
    if (user.otpExpiry < Date.now()) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "OTP has expired"));
    }

    // Verify OTP
    if (user.otp !== otp) {
      return res.status(400).json(new ApiResponse(400, null, "Invalid OTP"));
    }

    // Update user verification status
    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Remove sensitive data
    const userWithoutPassword = await User.findById(user._id).select(
      "-password -otp -otpExpiry"
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: userWithoutPassword,
          accessToken,
          refreshToken,
        },
        "OTP verified successfully"
      )
    );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Resend OTP
export const resendOtp = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Email is required"));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Generate new OTP
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    await sendOtpEmail(email, otp);

    return res
      .status(200)
      .json(
        new ApiResponse(200, { email: user.email }, "OTP resent successfully")
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Login User
export const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Email and password are required"));
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Invalid email or password"));
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Invalid email or password"));
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res
        .status(403)
        .json(new ApiResponse(403, null, "Please verify your email first"));
    }

    // Generate tokens
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Remove sensitive data
    const userWithoutPassword = await User.findById(user._id).select(
      "-password -otp -otpExpiry"
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          user: userWithoutPassword,
          accessToken,
          refreshToken,
        },
        "Login successful"
      )
    );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Current User
export const getCurrentUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password -otp -otpExpiry"
    );

    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { user }, "User retrieved successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Logout User
export const logoutUser = asyncHandler(async (req, res) => {
  try {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Logout successful"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Refresh Token
export const refreshToken = asyncHandler(async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Refresh token required"));
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Invalid refresh token"));
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
        "Tokens refreshed successfully"
      )
    );
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Refresh token expired"));
    }

    if (error.name === "JsonWebTokenError") {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Invalid refresh token"));
    }

    return handleMongoErrors(error, res);
  }
});

// Forgot Password
export const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Email is required"));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Generate OTP for password reset
    const otp = user.generateOTP();
    await user.save();

    // Send OTP email
    await sendOtpEmail(email, otp);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { email: user.email },
          "OTP sent for password reset"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Reset Password
export const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, "Email and new password are required")
        );
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Update password
    user.password = newPassword;
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { email: user.email },
          "Password reset successfully"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});
