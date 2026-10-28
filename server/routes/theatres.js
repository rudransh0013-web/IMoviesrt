import { Router } from "express";
import Theatre from "../models/Theatre.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = Router();
router.get("/", async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.location) filter.location = new RegExp(String(req.query.location).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    res.json(await Theatre.find(filter).sort({ name: 1 }));
  } catch (e) { next(e); }
});
router.post("/", protect, adminOnly, async (req, res, next) => {
  try { res.status(201).json(await Theatre.create(req.body)); } catch (e) { next(e); }
});
router.put("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const t = await Theatre.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!t) return res.status(404).json({ message: "Theatre not found" });
    res.json(t);
  } catch (e) { next(e); }
});
router.delete("/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const t = await Theatre.findByIdAndDelete(req.params.id);
    if (!t) return res.status(404).json({ message: "Theatre not found" });
    res.json({ message: "Theatre deleted" });
  } catch (e) { next(e); }
});
export default router;
