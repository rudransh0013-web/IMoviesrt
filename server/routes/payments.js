import { Router } from "express";
import Payment from "../models/Payment.js";
import Booking from "../models/Booking.js";
import { protect } from "../middleware/auth.js";

const router = Router();

// Educational demo only. Replace with a real provider's server-side order + verified webhook flow.
const routerInstance = Router();
routerInstance.post("/demo", protect, async (req, res, next) => {
  try {
    const { bookingId, outcome = "success" } = req.body;
    const booking = await Booking.findOne({ _id: bookingId, user: req.user._id });
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status !== "confirmed") return res.status(400).json({ message: "Only active bookings can be paid" });
    if (booking.paymentStatus === "paid") return res.json({ message: "Already paid", booking });
    const success = outcome === "success";
    const payment = await Payment.create({
      booking: booking._id, user: req.user._id, amount: booking.totalAmount,
      provider: "demo", providerReference: `DEMO-${Date.now()}`, status: success ? "success" : "failed"
    });
    if (success) {
      booking.paymentStatus = "paid";
      await booking.save();
    }
    res.status(success ? 200 : 402).json({ message: success ? "Demo payment successful" : "Demo payment failed", payment, booking });
  } catch (e) { next(e); }
});
export default routerInstance;
