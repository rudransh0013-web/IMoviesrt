import { Router } from "express";
import Movie from "../models/Movie.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { search = "", genre, language, page = "1", limit = "12" } = req.query;
    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const filter = { active: true };
    if (search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } }
      ];
    }
    if (genre) filter.genres = genre;
    if (language) filter.languages = language;
    const [movies, total] = await Promise.all([
      Movie.find(filter).sort({ createdAt: -1 }).skip((p - 1) * l).limit(l),
      Movie.countDocuments(filter)
    ]);
    res.json({ movies, page: p, pages: Math.ceil(total / l), total });
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const movie = await Movie.findOne({ _id: req.params.id, active: true });
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (e) { next(e); }
});

router.post("/", protect, adminOnly, async (req, res, next) => {
  try { res.status(201).json(await Movie.create(req.body)); } catch (e) { next(e); }
});
router.put("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (e) { next(e); }
});
router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const movie = await Movie.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json({ message: "Movie deactivated" });
  } catch (e) { next(e); }
});
export default router;
