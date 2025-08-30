// admin.auth.middleware.js
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";
import Admin from "../models/admin/admin.model.js";

export const authenticateAdmin = asyncHandler(async (req, res, next) => {
  try {
    // 1. Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiResponse(401, null, "Authorization token required");
    }

    // 2. Verify token
    const decoded = verifyAccessToken(token);
    if (!decoded?.userId) {
      throw new ApiResponse(401, null, "Invalid token");
    }

    // 3. Find admin in database
    const admin = await Admin.findById(decoded.userId).select(
      "-password -otp -otp_expires_at"
    );

    if (!admin) {
      throw new ApiResponse(401, null, "Admin not found");
    }

    // 4. Check account status
    if (admin.status !== "active") {
      throw new ApiResponse(403, null, "Admin account is inactive");
    }

    // 5. Attach admin to request
    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiResponse(401, null, "Token expired");
    }
    if (error.name === "JsonWebTokenError") {
      throw new ApiResponse(401, null, "Invalid token");
    }
    throw error;
  }
});
