import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const GENRES = ["All", "Action", "Sci-Fi", "Drama", "Adventure", "Crime", "Animation", "Thriller"];

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.get("/movies", {
          params: {
            search: search.trim() || undefined,
            genre: genre !== "All" ? genre : undefined
          }
        });
        setMovies(data.movies || []);
      } catch (e) {
        setError(e.response?.data?.message || "Could not connect to backend API.");
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [search, genre]);

  const featured = movies[0];

  return (
    <div className="container py-3">
      {/* Cinematic Hero Spotlight */}
      <section className="hero-spotlight">
        <div className="row align-items-center">
          <div className="col-lg-7">
            <div className="eyebrow-pill">
              <i className="bi bi-fire"></i> NOW STREAMING ON BIG SCREENS
            </div>
            <h1 className="hero-title">
              Experience Cinema <span>Unleashed.</span>
            </h1>
            <p className="hero-subtitle">
              Book the finest seats in IMAX & Dolby Atmos. Choose your show, pick your spot in real-time, and let the movie magic begin.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <a href="#browse-movies" className="btn btn-cinema btn-lg">
                <i className="bi bi-ticket-perforated-fill"></i> Browse Shows
              </a>
              {featured && (
                <Link to={`/movies/${featured._id}`} className="btn btn-glass btn-lg">
                  <i className="bi bi-play-circle"></i> Spotlight: {featured.title}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Catalog & Filter Section */}
      <section id="browse-movies" className="py-4">
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
          <div>
            <div className="eyebrow-pill mb-1">
              <i className="bi bi-collection-play"></i> EXPLORE CATALOGUE
            </div>
            <h2 className="section-title mb-0">Now Showing in Theatres</h2>
          </div>

          {/* Search Bar */}
          <div className="search-bar-wrap">
            <i className="bi bi-search search-icon-inside"></i>
            <input
              type="text"
              className="form-control-cinema w-100"
              placeholder="Search movies by title..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Genre Filter Pills */}
        <div className="genre-filter-row mb-4">
          {GENRES.map(g => (
            <button
              key={g}
              className={`genre-pill-btn ${genre === g ? "active" : ""}`}
              onClick={() => setGenre(g)}
            >
              {g}
            </button>
          ))}
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger mb-3" role="status"></div>
            <p className="text-dim">Loading movies...</p>
          </div>
        ) : error ? (
          <div className="alert alert-danger bg-dark text-light border-danger p-4 rounded-4">
            <h5><i className="bi bi-exclamation-triangle-fill text-danger me-2"></i> Connection Notice</h5>
            <p className="mb-0">{error}</p>
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-5 border border-secondary border-opacity-25 rounded-4 p-5 bg-dark bg-opacity-50">
            <i className="bi bi-camera-reels display-4 text-muted mb-3 d-block"></i>
            <h3>No movies found</h3>
            <p className="text-dim mb-3">
              {search || genre !== "All"
                ? "Try searching with a different keyword or selecting 'All' genres."
                : "Your movie catalogue is currently empty. Run the demo seeder to load blockbuster movies."}
            </p>
            {(!search && genre === "All") && (
              <p className="small text-muted">
                Run: <code>curl -X POST http://localhost:5000/api/seed</code> to populate demo movies!
              </p>
            )}
          </div>
        ) : (
          <div className="row g-4">
            {movies.map(movie => (
              <div className="col-6 col-md-4 col-lg-3" key={movie._id}>
                <article className="movie-grid-card">
                  <div className="poster-box">
                    {movie.posterUrl ? (
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        loading="lazy"
                        onError={e => { e.currentTarget.style.display = "none"; }}
                      />
                    ) : null}
                    <div className="poster-scrim" />
                    <span className="cert-badge">{movie.certificate || "U/A"}</span>

                    {/* Quick Book Hover Overlay */}
                    <Link to={`/movies/${movie._id}`} className="quick-book-hover text-decoration-none">
                      <span className="btn btn-cinema btn-sm">
                        <i className="bi bi-ticket-fill"></i> Select Seats
                      </span>
                    </Link>
                  </div>

                  <div className="card-content">
                    <h3 className="movie-card-title" title={movie.title}>{movie.title}</h3>

                    <div className="card-meta-chips">
                      <span><i className="bi bi-clock"></i> {movie.durationMinutes}m</span>
                      <span>&bull;</span>
                      <span>{movie.genres?.slice(0, 2).join(", ") || "Cinema"}</span>
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top border-secondary border-opacity-25">
                      <span className="small text-dim">{movie.languages?.[0] || "English"}</span>
                      <Link to={`/movies/${movie._id}`} className="text-danger fw-semibold text-decoration-none small">
                        Shows &rarr;
                      </Link>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
