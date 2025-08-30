import Admin from "../../models/admin/admin.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwt.js";
import handleMongoErrors from "../../utils/mongooseError.js";
import { sendOtpEmail } from "../../services/email.service.js";

// Register Admin
export const registerAdmin = asyncHandler(async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, "Name, email and password are required")
        );
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res
        .status(409)
        .json(
          new ApiResponse(409, null, "Admin already exists with this email")
        );
    }

    // Create new admin
    const admin = new Admin({
      name,
      email,
      password,
      role: "admin",
    });

    await admin.save();

    // Generate tokens
    const accessToken = generateAccessToken(admin._id);
    const refreshToken = generateRefreshToken(admin._id);

    // Remove sensitive data
    const adminWithoutPassword = await Admin.findById(admin._id).select(
      "-password -otp -otpExpiry"
    );

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          admin: adminWithoutPassword,
          accessToken,
          refreshToken,
        },
        "Admin registered successfully"
      )
    );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Login Admin
export const loginAdmin = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Email and password are required"));
    }

    // Check if admin exists
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Invalid email or password"));
    }

    // Check password
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Invalid email or password"));
    }

    // Check if admin is active
    if (admin.status !== "active") {
      return res
        .status(403)
        .json(new ApiResponse(403, null, "Admin account is inactive"));
    }

    // Generate tokens
    const accessToken = generateAccessToken(admin._id);
    const refreshToken = generateRefreshToken(admin._id);

    // Remove sensitive data
    const adminWithoutPassword = await Admin.findById(admin._id).select(
      "-password -otp -otpExpiry"
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          admin: adminWithoutPassword,
          accessToken,
          refreshToken,
        },
        "Admin login successful"
      )
    );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Get Current Admin
export const getCurrentAdmin = asyncHandler(async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select(
      "-password -otp -otpExpiry"
    );

    if (!admin) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Admin not found"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { admin }, "Admin retrieved successfully"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Logout Admin
export const logoutAdmin = asyncHandler(async (req, res) => {
  try {
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Admin logout successful"));
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Refresh Token for Admin
export const refreshAdminToken = asyncHandler(async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Refresh token required"));
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find admin
    const admin = await Admin.findById(decoded.userId);
    if (!admin) {
      return res
        .status(401)
        .json(new ApiResponse(401, null, "Invalid refresh token"));
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(admin._id);
    const newRefreshToken = generateRefreshToken(admin._id);

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

// Forgot Password for Admin
export const forgotAdminPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Email is required"));
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Admin not found"));
    }

    // Generate OTP for password reset
    const otp = admin.generateOTP();
    await admin.save();

    // Send OTP email
    await sendOtpEmail(email, otp);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { email: admin.email },
          "OTP sent for password reset"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Verify OTP for Admin Password Reset
export const verifyAdminOtp = asyncHandler(async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Email and OTP are required"));
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Admin not found"));
    }

    // Check if OTP is expired
    if (admin.otpExpiry < Date.now()) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "OTP has expired"));
    }

    // Verify OTP
    if (admin.otp !== otp) {
      return res.status(400).json(new ApiResponse(400, null, "Invalid OTP"));
    }

    // Clear OTP after verification
    admin.otp = null;
    admin.otpExpiry = null;
    await admin.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { email: admin.email },
          "OTP verified successfully"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Reset Password for Admin
export const resetAdminPassword = asyncHandler(async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json(
          new ApiResponse(400, null, "Email and new password are required")
        );
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Admin not found"));
    }

    // Update password
    admin.password = newPassword;
    await admin.save();

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { email: admin.email },
          "Password reset successfully"
        )
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});

// Resend OTP for Admin
export const resendAdminOtp = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "Email is required"));
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res
        .status(404)
        .json(new ApiResponse(404, null, "Admin not found"));
    }

    // Generate new OTP
    const otp = admin.generateOTP();
    await admin.save();

    // Send OTP email
    await sendOtpEmail(email, otp);

    return res
      .status(200)
      .json(
        new ApiResponse(200, { email: admin.email }, "OTP resent successfully")
      );
  } catch (error) {
    return handleMongoErrors(error, res);
  }
});
