import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = Router();
const makeToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
const safeUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) return res.status(400).json({ message: "Name, email and password are required" });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: "Email is already registered" });
    const user = await User.create({ name: name.trim(), email, password: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: makeToken(user), user: safeUser(user) });
  } catch (e) { next(e); }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: String(email || "").toLowerCase().trim() }).select("+password");
    if (!user || !(await bcrypt.compare(password || "", user.password))) return res.status(401).json({ message: "Invalid email or password" });
    res.json({ token: makeToken(user), user: safeUser(user) });
  } catch (e) { next(e); }
});

router.get("/me", protect, (req, res) => res.json({ user: safeUser(req.user) }));
export default router;
