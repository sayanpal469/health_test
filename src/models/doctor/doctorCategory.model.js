import mongoose from "mongoose";

const doctorCategorySchema = new mongoose.Schema({
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


const DoctorCategory = mongoose.model("DoctorCategory", doctorCategorySchema);

export default DoctorCategory;
