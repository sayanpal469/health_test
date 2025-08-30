import mongoose from "mongoose";

const healthCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const HealthCategory = mongoose.model("HealthCategory", healthCategorySchema);

export default HealthCategory;
