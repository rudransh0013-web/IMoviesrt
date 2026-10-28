import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, index: true },
  description: { type: String, required: true },
  posterUrl: { type: String, default: "" },
  trailerUrl: { type: String, default: "" },
  genres: [{ type: String, index: true }],
  languages: [{ type: String, index: true }],
  durationMinutes: { type: Number, min: 1, required: true },
  releaseDate: { type: Date },
  certificate: { type: String, default: "U/A" },
  active: { type: Boolean, default: true }
}, { timestamps: true });

movieSchema.index({ title: "text", description: "text" });
export default mongoose.model("Movie", movieSchema);
