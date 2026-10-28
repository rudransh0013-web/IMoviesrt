import { Router } from "express";
import mongoose from "mongoose";
import crypto from "node:crypto";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

async function runWithTxOrDirect(work) {
  let session = null;
  try {
    session = await mongoose.startSession();
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } catch (err) {
    const isTxUnsupported =
      err.message?.includes("replica set") ||
      err.message?.includes("Transaction numbers are only allowed") ||
      err.code === 20;
    if (isTxUnsupported) {
      return await work(null);
    }
    throw err;
  } finally {
    if (session) await session.endSession().catch(() => {});
  }
}

router.post("/", protect, async (req, res, next) => {
  const { showId, seats } = req.body;
  if (!showId || !Array.isArray(seats) || seats.length < 1 || seats.length > 10) {
    return res.status(400).json({ message: "Choose between 1 and 10 seats" });
  }
  if (new Set(seats).size !== seats.length || seats.some(s => typeof s !== "string" || !/^[A-T](?:[1-9]|[12][0-9]|30)$/.test(s))) {
    return res.status(400).json({ message: "Invalid or duplicate seat selection" });
  }
  try {
    const result = await runWithTxOrDirect(async (session) => {
      const showQuery = Show.findById(showId).populate("movie", "title").populate("theatre", "name");
      if (session) showQuery.session(session);
      const show = await showQuery;

      if (!show) throw Object.assign(new Error("Show not found"), { status: 404 });
      if (new Date(show.startsAt) <= new Date()) throw Object.assign(new Error("This show has already started"), { status: 400 });
      const validSeats = new Set();
      for (let r = 0; r < show.rows; r++) {
        for (let n = 1; n <= show.seatsPerRow; n++) validSeats.add(`${String.fromCharCode(65 + r)}${n}`);
      }
      if (seats.some(s => !validSeats.has(s))) throw Object.assign(new Error("Seat does not exist for this show"), { status: 400 });
      if (seats.some(s => show.bookedSeats.includes(s))) throw Object.assign(new Error("One or more seats are no longer available"), { status: 409 });
      
      const updateOpts = session ? { session } : {};
      const updated = await Show.updateOne(
        { _id: show._id, bookedSeats: { $nin: seats } },
        { $addToSet: { bookedSeats: { $each: seats } } },
        updateOpts
      );
      if (updated.modifiedCount !== 1) throw Object.assign(new Error("Seat conflict. Refresh and try again."), { status: 409 });
      
      const createOpts = session ? { session } : {};
      const [booking] = await Booking.create([{
        user: req.user._id, show: show._id, movieTitle: show.movie.title,
        theatreName: show.theatre.name, startsAt: show.startsAt, seats,
        totalAmount: show.price * seats.length, status: "confirmed",
        paymentStatus: "pending", bookingCode: `IM-${crypto.randomBytes(4).toString("hex").toUpperCase()}`
      }], createOpts);
      return booking;
    });

    req.app.get("io")?.to(`show:${showId}`).emit("seats-updated");
    res.status(201).json({ booking: result, message: "Seats reserved. Complete payment to confirm payment status." });
  } catch (e) { next(e); }
});

router.get("/my", protect, async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
    res.json(bookings);
  } catch (e) { next(e); }
});

router.get("/", protect, adminOnly, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const [bookings, total] = await Promise.all([
      Booking.find().populate("user", "name email").sort({ createdAt: -1 }).skip((page - 1) * 25).limit(25),
      Booking.countDocuments()
    ]);
    res.json({ bookings, page, total, pages: Math.ceil(total / 25) });
  } catch (e) { next(e); }
});

router.patch("/:id/cancel", protect, async (req, res, next) => {
  try {
    const result = await runWithTxOrDirect(async (session) => {
      const filter = { _id: req.params.id };
      if (req.user.role !== "admin") filter.user = req.user._id;
      const bookingQuery = Booking.findOne(filter);
      if (session) bookingQuery.session(session);
      const booking = await bookingQuery;

      if (!booking) throw Object.assign(new Error("Booking not found"), { status: 404 });
      if (booking.status === "cancelled") throw Object.assign(new Error("Booking is already cancelled"), { status: 400 });
      if (new Date(booking.startsAt) <= new Date()) throw Object.assign(new Error("Past or started shows cannot be cancelled"), { status: 400 });
      
      const updateOpts = session ? { session } : {};
      await Show.updateOne({ _id: booking.show }, { $pull: { bookedSeats: { $in: booking.seats } } }, updateOpts);
      booking.status = "cancelled";
      booking.paymentStatus = booking.paymentStatus === "paid" ? "refunded" : "not_required";
      const saveOpts = session ? { session } : {};
      await booking.save(saveOpts);
      return booking;
    });
    req.app.get("io")?.to(`show:${result.show}`).emit("seats-updated");
    res.json({ booking: result, message: "Booking cancelled and seats released" });
  } catch (e) { next(e); }
});
export default router;
