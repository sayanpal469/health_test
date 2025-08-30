
import User from "../models/User/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { verifyAccessToken } from "../utils/jwt.js";

export const authenticateUser = asyncHandler(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiResponse(401, null, "Authorization token required");
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify token
    const decoded = verifyAccessToken(token);

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new ApiResponse(401, null, "User no longer exists");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new ApiResponse(403, null, "Account is not active");
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    throw new ApiResponse(401, null, "Invalid or expired token");
  }
});

export const adminOnly = asyncHandler(async (req, res, next) => {
  if (!req.user.role || req.user.role !== "admin") {
    throw new ApiResponse(403, null, "Admin access required");
  }
  next();
});
