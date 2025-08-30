import express from "express";
import cors from "cors";
import errorHandler from "./middleware/error.middleware.js";

// Initialize Express app
const app = express();

// Middleware configuration
const corsOptions = {
  origin: function (origin, callback) {
    callback(null, origin);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(errorHandler);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// imports api
import adminApi from "./routes/admin/admin.routes.js";
import healthCenterApi from "./routes/health/healthCare.routes.js";
import healthCategoryApi from "./routes/health/healthCategory.routes.js";
import doctorApi from "./routes/doctor/doctor.routes.js";
import doctorCategoryApi from "./routes/doctor/doctorCategory.routes.js";
import bookingApi from "./routes/bookingAppointment/booking.routes.js";
import jobApi from "./routes/job/job.routes.js";
import jobCategoryApi from "./routes/job/jobCategory.routes.js";
import jobApplicationApi from "./routes/job/jobApplication.routes.js";
import blogApi from "./routes/blog/blog.routes.js";
import courseApi from "./routes/course/course.routes.js";
import courseCategoryApi from "./routes/course/courseCategory.routes.js";
import courseRegistrationApi from "./routes/course/courseRegistration.routes.js";

app.use("/api/v1/admin", adminApi);
app.use("/api/v1/healthcare-centers", healthCenterApi);
app.use("/api/v1/health-categories", healthCategoryApi);
app.use("/api/v1/doctor-categories", doctorCategoryApi);
app.use("/api/v1/doctors", doctorApi);
app.use("/api/v1/blogs", blogApi);
app.use("/api/v1/jobs", jobApi);
app.use("/api/v1/job-categories", jobCategoryApi);
app.use("/api/v1/job-applications", jobApplicationApi);
app.use("/api/v1/bookings", bookingApi);
app.use("/api/v1/courses", courseApi);
app.use("/api/v1/course-categories", courseCategoryApi);
app.use("/api/v1/course-registrations", courseRegistrationApi);

// Home route
app.get("/", (req, res) => {
  res.send("Welcome To HealthCare API!");
});

export default app;
