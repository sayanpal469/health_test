import mongoose from "mongoose";

const courseCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: false,
  },
});

const CourseCategory = mongoose.model("CourseCategory", courseCategorySchema);

export default CourseCategory;
