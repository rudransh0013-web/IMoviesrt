import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  show: { type: mongoose.Schema.Types.ObjectId, ref: "Show", required: true, index: true },
  movieTitle: { type: String, required: true },
  theatreName: { type: String, required: true },
  startsAt: { type: Date, required: true },
  seats: [{ type: String, required: true }],
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "confirmed" },
  paymentStatus: { type: String, enum: ["pending", "paid", "refunded", "not_required"], default: "pending" },
  bookingCode: { type: String, required: true, unique: true }
}, { timestamps: true });

bookingSchema.index({ user: 1, createdAt: -1 });
export default mongoose.model("Booking", bookingSchema);
