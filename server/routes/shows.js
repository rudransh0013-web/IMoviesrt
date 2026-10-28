import { Router } from "express";
import Show from "../models/Show.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();
router.get("/", async (req, res, next) => {
  try {
    const filter = { startsAt: { $gte: new Date() } };
    if (req.query.movieId) filter.movie = req.query.movieId;
    if (req.query.theatreId) filter.theatre = req.query.theatreId;
    if (req.query.date) {
      const parts = req.query.date.split("-").map(Number);
      if (parts.length === 3 && !parts.some(Number.isNaN)) {
        const start = new Date(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0);
        const end = new Date(parts[0], parts[1] - 1, parts[2] + 1, 0, 0, 0, 0);
        const now = new Date();
        const minTime = (start < now && end > now) ? now : start;
        filter.startsAt = { $gte: minTime, $lt: end };
      }
    }
    const shows = await Show.find(filter).populate("movie", "title posterUrl durationMinutes languages genres").populate("theatre", "name location address").sort({ startsAt: 1 });
    res.json(shows);
  } catch (e) { next(e); }
});
router.get("/:id/seats", async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate("movie", "title posterUrl certificate durationMinutes")
      .populate("theatre", "name location address")
      .select("rows seatsPerRow bookedSeats startsAt price screenName movie theatre");
    if (!show) return res.status(404).json({ message: "Show not found" });
    const seats = [];
    for (let r = 0; r < show.rows; r++) {
      const row = String.fromCharCode(65 + r);
      for (let n = 1; n <= show.seatsPerRow; n++) {
        const id = `${row}${n}`;
        seats.push({ id, booked: show.bookedSeats.includes(id) });
      }
    }
    res.json({
      showId: show._id,
      movie: show.movie,
      theatre: show.theatre,
      screenName: show.screenName,
      price: show.price,
      rows: show.rows,
      seatsPerRow: show.seatsPerRow,
      seats,
      startsAt: show.startsAt
    });
  } catch (e) { next(e); }
});
router.post("/", protect, adminOnly, async (req, res, next) => {
  try {
    const { movie, theatre, startsAt, price } = req.body;
    if (!movie || !theatre || !startsAt || price == null) return res.status(400).json({ message: "movie, theatre, startsAt and price are required" });
    res.status(201).json(await Show.create(req.body));
  } catch (e) { next(e); }
});
router.put("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const show = await Show.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!show) return res.status(404).json({ message: "Show not found" });
    res.json(show);
  } catch (e) { next(e); }
});
router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const show = await Show.findByIdAndDelete(req.params.id);
    if (!show) return res.status(404).json({ message: "Show not found" });
    res.json({ message: "Show deleted" });
  } catch (e) { next(e); }
});
export default router;
