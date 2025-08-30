import ApiResponse from "../utils/ApiResponse.js";
import handleMongoErrors from "./../utils/mongooseError.js";

const errorHandler = (err, req, res, next) => {
  // Handle known error types
  if (err instanceof ApiResponse) {
    return res.status(err.statusCode).json(err);
  }

  // Handle Mongoose errors
  if (
    err.name === "ValidationError" ||
    err.code === 11000 ||
    err.name === "CastError"
  ) {
    return handleMongoErrors(err, res);
  }

  // Handle unexpected errors
  console.error("Unexpected error:", err);
  return res
    .status(500)
    .json(new ApiResponse(500, null, "Internal server error"));
};

export default errorHandler;
