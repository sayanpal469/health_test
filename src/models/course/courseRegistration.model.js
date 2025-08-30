import mongoose from "mongoose";

const courseRegistrationSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
});

const CourseRegistration = mongoose.model(
  "courseRegistration",
  courseRegistrationSchema
);

export default CourseRegistration;
