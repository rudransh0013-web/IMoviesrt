import mongoose from "mongoose";

const showSchema = new mongoose.Schema({
  movie: { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true, index: true },
  theatre: { type: mongoose.Schema.Types.ObjectId, ref: "Theatre", required: true, index: true },
  screenName: { type: String, default: "Screen 1" },
  startsAt: { type: Date, required: true, index: true },
  price: { type: Number, required: true, min: 0 },
  rows: { type: Number, default: 5, min: 1, max: 20 },
  seatsPerRow: { type: Number, default: 8, min: 1, max: 30 },
  bookedSeats: { type: [String], default: [] }
}, { timestamps: true });

showSchema.index({ movie: 1, startsAt: 1 });
export default mongoose.model("Show", showSchema);
