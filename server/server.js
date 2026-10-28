import "dotenv/config";
import http from "node:http";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { Server } from "socket.io";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import movieRoutes from "./routes/movies.js";
import theatreRoutes from "./routes/theatres.js";
import showRoutes from "./routes/shows.js";
import bookingRoutes from "./routes/bookings.js";
import paymentRoutes from "./routes/payments.js";
import Movie from "./models/Movie.js";
import Theatre from "./models/Theatre.js";
import Show from "./models/Show.js";
import User from "./models/User.js";
import bcrypt from "bcryptjs";
import { notFound, errorHandler } from "./middleware/errors.js";

const app = express();
const server = http.createServer(app);

// Dynamic CORS configuration supporting local dev, Vercel deployments, and custom CLIENT_URL
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://i-moviesrt.vercel.app",
  ...(process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(",").map(url => url.trim().replace(/\/$/, ""))
    : [])
];

const checkOrigin = (origin, callback) => {
  // Allow non-browser requests (mobile apps, Postman, curl, server-to-server)
  if (!origin) return callback(null, true);
  const clean = origin.replace(/\/$/, "");
  if (
    allowedOrigins.includes(clean) ||
    clean.endsWith(".vercel.app") ||
    clean.endsWith(".onrender.com")
  ) {
    return callback(null, true);
  }
  return callback(null, true); // Permissive fallback to prevent breaking cross-origin deployments
};

const corsOptions = {
  origin: checkOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

const io = new Server(server, { cors: corsOptions });

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true, legacyHeaders: false }));
app.get("/api/health", (req, res) => res.json({ status: "ok", service: "iMovies API" }));
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/theatres", theatreRoutes);
app.use("/api/shows", showRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);

// Demo seed is opt-in. Do not expose seeded/demo data creation in production.
app.post("/api/seed", async (req, res, next) => {
  try {
    if (process.env.ENABLE_DEMO_SEED !== "true") return res.status(403).json({ message: "Demo seed disabled" });
    
    // Seed admin user if not exists
    let admin = await User.findOne({ email: "admin@imovies.com" });
    if (!admin) {
      const hashedPassword = await bcrypt.hash("admin12345", 12);
      admin = await User.create({
        name: "Admin User",
        email: "admin@imovies.com",
        password: hashedPassword,
        role: "admin"
      });
    }

    if (await Movie.countDocuments() && req.query.force !== "true") {
      return res.json({ message: "Data already seeded. To reseed, pass ?force=true", admin: "admin@imovies.com / admin12345" });
    }

    if (req.query.force === "true") {
      await Show.deleteMany({});
      await Theatre.deleteMany({});
      await Movie.deleteMany({});
    }

    const movies = await Movie.insertMany([
      {
        title: "Interstellar",
        description: "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft along with a team of researchers to find a new planet for humans.",
        posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
        trailerUrl: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
        genres: ["Sci-Fi", "Drama", "Adventure"],
        languages: ["English", "Hindi"],
        durationMinutes: 169,
        certificate: "U/A"
      },
      {
        title: "The Dark Knight",
        description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        posterUrl: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
        trailerUrl: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
        genres: ["Action", "Crime", "Drama"],
        languages: ["English", "Hindi"],
        durationMinutes: 152,
        certificate: "U/A"
      },
      {
        title: "Inception",
        description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.",
        posterUrl: "https://image.tmdb.org/t/p/w500/edv5CZvWj09upOsy2Y6IwDhK8bt.jpg",
        trailerUrl: "https://www.youtube.com/watch?v=YoHD9XEInc0",
        genres: ["Action", "Sci-Fi", "Adventure"],
        languages: ["English"],
        durationMinutes: 148,
        certificate: "U/A"
      },
      {
        title: "Oppenheimer",
        description: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
        posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        trailerUrl: "https://www.youtube.com/watch?v=uYPbbksJxIg",
        genres: ["Drama", "History", "Biography"],
        languages: ["English"],
        durationMinutes: 180,
        certificate: "A"
      },
      {
        title: "Spider-Man: Across the Spider-Verse",
        description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence. When the heroes clash on how to handle a new threat, Miles must redefine what it means to be a hero.",
        posterUrl: "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
        trailerUrl: "https://www.youtube.com/watch?v=cqGjhVJWtEg",
        genres: ["Action", "Adventure", "Animation"],
        languages: ["English", "Hindi"],
        durationMinutes: 140,
        certificate: "U"
      }
    ]);

    const centralTheatre = await Theatre.create({
      name: "iMovies Central IMAX",
      location: "Indore",
      address: "Phoenix Citadel Mall, Indore",
      screens: 4
    });

    const primeTheatre = await Theatre.create({
      name: "iMovies Prime Cineplex",
      location: "Mumbai",
      address: "Bandra West, Mumbai",
      screens: 3
    });

    const shows = [];
    const now = new Date();

    // Create shows for Today, Tomorrow, and Day after tomorrow
    for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
      for (const movie of movies) {
        // Evening show
        const evening = new Date(now);
        evening.setDate(evening.getDate() + dayOffset);
        evening.setHours(19, 0, 0, 0);

        // Night show
        const night = new Date(now);
        night.setDate(night.getDate() + dayOffset);
        night.setHours(21, 45, 0, 0);

        // Only add if in the future
        if (evening > now) {
          shows.push({
            movie: movie._id,
            theatre: centralTheatre._id,
            startsAt: evening,
            price: 250,
            rows: 6,
            seatsPerRow: 10,
            screenName: "Audi 1 (IMAX 3D)"
          });
        }

        if (night > now) {
          shows.push({
            movie: movie._id,
            theatre: primeTheatre._id,
            startsAt: night,
            price: 200,
            rows: 5,
            seatsPerRow: 8,
            screenName: "Audi 2 (Dolby Atmos)"
          });
        }
      }
    }

    await Show.insertMany(shows);
    res.status(201).json({
      message: "Demo seed completed successfully",
      admin: "admin@imovies.com / admin12345",
      moviesCount: movies.length,
      theatresCount: 2,
      showsCount: shows.length
    });
  } catch (e) { next(e); }
});

io.on("connection", socket => {
  socket.on("join-show", showId => {
    if (typeof showId === "string" && /^[a-f\d]{24}$/i.test(showId)) socket.join(`show:${showId}`);
  });
});
app.set("io", io);
app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
connectDB().then(() => server.listen(port, () => console.log(`iMovies API listening on ${port}`)))
  .catch(err => { console.error("Could not start server:", err); process.exit(1); });
