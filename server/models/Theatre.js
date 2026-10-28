import mongoose from "mongoose";

const theatreSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true, index: true },
  address: { type: String, default: "" },
  screens: { type: Number, default: 1, min: 1 }
}, { timestamps: true });

export default mongoose.model("Theatre", theatreSchema);
