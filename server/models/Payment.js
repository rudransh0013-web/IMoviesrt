import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  provider: { type: String, default: "demo" },
  providerReference: { type: String, default: "" },
  status: { type: String, enum: ["created", "success", "failed", "refunded"], default: "created" }
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
