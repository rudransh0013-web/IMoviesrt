import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../api";

const initialMovie = {
  title: "",
  description: "",
  posterUrl: "",
  durationMinutes: 120,
  certificate: "U/A",
  genres: "Drama, Sci-Fi",
  languages: "English, Hindi"
};

export default function Admin() {
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [movie, setMovie] = useState(initialMovie);
  const [theatre, setTheatre] = useState({ name: "", location: "", address: "", screens: 1 });
  const [show, setShow] = useState({ movie: "", theatre: "", startsAt: "", price: 200, rows: 6, seatsPerRow: 10 });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [m, t, s] = await Promise.all([
        api.get("/movies?limit=50"),
        api.get("/theatres"),
        api.get("/shows")
      ]);
      setMovies(m.data.movies || []);
      setTheatres(t.data || []);
      setShows(s.data || []);
      setShow(v => ({
        ...v,
        movie: v.movie || m.data.movies[0]?._id || "",
        theatre: v.theatre || t.data[0]?._id || ""
      }));
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const addMovie = async e => {
    e.preventDefault();
    try {
      await api.post("/movies", {
        ...movie,
        durationMinutes: Number(movie.durationMinutes),
        genres: movie.genres.split(",").map(x => x.trim()).filter(Boolean),
        languages: movie.languages.split(",").map(x => x.trim()).filter(Boolean)
      });
      toast.success("Movie added to catalogue!");
      setMovie(initialMovie);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to add movie");
    }
  };

  const addTheatre = async e => {
    e.preventDefault();
    try {
      await api.post("/theatres", { ...theatre, screens: Number(theatre.screens) });
      toast.success("Cinema Theatre added successfully!");
      setTheatre({ name: "", location: "", address: "", screens: 1 });
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to add theatre");
    }
  };

  const addShow = async e => {
    e.preventDefault();
    try {
      await api.post("/shows", {
        ...show,
        price: Number(show.price),
        rows: Number(show.rows),
        seatsPerRow: Number(show.seatsPerRow),
        startsAt: new Date(show.startsAt).toISOString()
      });
      toast.success("Showtime scheduled successfully!");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Failed to schedule show");
    }
  };

  const removeMovie = async id => {
    if (!window.confirm("Deactivate this movie? Shows will remain archived.")) return;
    try {
      await api.delete(`/movies/${id}`);
      toast.success("Movie deactivated");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="mb-4">
        <div className="eyebrow-pill mb-1">
          <i className="bi bi-shield-lock"></i> MANAGEMENT CONSOLE
        </div>
        <h1 className="section-title h2 mb-1">Cinema Admin Dashboard</h1>
        <p className="text-dim mb-0">Control films, multiplex locations, and auditorium showtimes</p>
      </div>

      {/* Metrics Overview */}
      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="stat-metric-card">
            <div className="stat-icon">🎬</div>
            <div>
              <div className="text-dim small">Active Movies</div>
              <div className="h3 mb-0 fw-bold">{movies.length}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-metric-card">
            <div className="stat-icon" style={{ background: "rgba(99, 102, 241, 0.2)", color: "#818cf8" }}>🏢</div>
            <div>
              <div className="text-dim small">Theatres & Multiplexes</div>
              <div className="h3 mb-0 fw-bold">{theatres.length}</div>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-metric-card">
            <div className="stat-icon" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#34d399" }}>🎟️</div>
            <div>
              <div className="text-dim small">Scheduled Shows</div>
              <div className="h3 mb-0 fw-bold">{shows.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Forms Section */}
      <div className="row g-4">
        {/* Add Movie Form */}
        <div className="col-lg-6">
          <form className="admin-card" onSubmit={addMovie}>
            <h3 className="h5 fw-bold text-white mb-3">
              <i className="bi bi-film text-danger me-2"></i> Add New Movie
            </h3>
            <div className="mb-2">
              <label className="form-label small text-dim">Movie Title</label>
              <input
                className="form-control form-control-cinema"
                placeholder="e.g. Gladiator II"
                required
                value={movie.title}
                onChange={e => setMovie({ ...movie, title: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <label className="form-label small text-dim">Description / Synopsis</label>
              <textarea
                className="form-control form-control-cinema"
                placeholder="Brief plot outline..."
                rows="3"
                required
                value={movie.description}
                onChange={e => setMovie({ ...movie, description: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <label className="form-label small text-dim">Poster Image URL (TMDB / CDN)</label>
              <input
                className="form-control form-control-cinema"
                placeholder="https://image.tmdb.org/..."
                value={movie.posterUrl}
                onChange={e => setMovie({ ...movie, posterUrl: e.target.value })}
              />
            </div>
            <div className="row g-2 mb-2">
              <div className="col-6">
                <label className="form-label small text-dim">Duration (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  className="form-control form-control-cinema"
                  required
                  value={movie.durationMinutes}
                  onChange={e => setMovie({ ...movie, durationMinutes: e.target.value })}
                />
              </div>
              <div className="col-6">
                <label className="form-label small text-dim">Certificate</label>
                <select
                  className="form-select form-control-cinema"
                  value={movie.certificate}
                  onChange={e => setMovie({ ...movie, certificate: e.target.value })}
                >
                  <option value="U">U (Universal)</option>
                  <option value="U/A">U/A (Parental Guidance)</option>
                  <option value="A">A (Adults Only)</option>
                </select>
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label small text-dim">Genres (comma separated)</label>
              <input
                className="form-control form-control-cinema"
                value={movie.genres}
                onChange={e => setMovie({ ...movie, genres: e.target.value })}
              />
            </div>
            <button className="btn btn-cinema w-100">
              <i className="bi bi-plus-lg me-1"></i> Add Movie
            </button>
          </form>
        </div>

        {/* Add Theatre Form */}
        <div className="col-lg-6">
          <form className="admin-card" onSubmit={addTheatre}>
            <h3 className="h5 fw-bold text-white mb-3">
              <i className="bi bi-building text-danger me-2"></i> Register Cinema Multiplex
            </h3>
            <div className="mb-2">
              <label className="form-label small text-dim">Theatre Name</label>
              <input
                className="form-control form-control-cinema"
                placeholder="e.g. iMovies IMAX"
                required
                value={theatre.name}
                onChange={e => setTheatre({ ...theatre, name: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <label className="form-label small text-dim">City / Region</label>
              <input
                className="form-control form-control-cinema"
                placeholder="e.g. Mumbai"
                required
                value={theatre.location}
                onChange={e => setTheatre({ ...theatre, location: e.target.value })}
              />
            </div>
            <div className="mb-2">
              <label className="form-label small text-dim">Full Address</label>
              <input
                className="form-control form-control-cinema"
                placeholder="Mall / Street address"
                value={theatre.address}
                onChange={e => setTheatre({ ...theatre, address: e.target.value })}
              />
            </div>
            <div className="mb-3">
              <label className="form-label small text-dim">Total Screens / Auditoriums</label>
              <input
                type="number"
                min="1"
                className="form-control form-control-cinema"
                value={theatre.screens}
                onChange={e => setTheatre({ ...theatre, screens: e.target.value })}
              />
            </div>
            <button className="btn btn-cinema w-100">
              <i className="bi bi-plus-lg me-1"></i> Add Theatre
            </button>
          </form>
        </div>

        {/* Schedule Show Form */}
        <div className="col-12">
          <form className="admin-card" onSubmit={addShow}>
            <h3 className="h5 fw-bold text-white mb-3">
              <i className="bi bi-calendar-plus text-danger me-2"></i> Schedule Showtime & Auditorium
            </h3>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label small text-dim">Select Movie</label>
                <select
                  className="form-select form-control-cinema"
                  required
                  value={show.movie}
                  onChange={e => setShow({ ...show, movie: e.target.value })}
                >
                  {movies.map(m => (
                    <option key={m._id} value={m._id}>{m.title}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label small text-dim">Select Theatre</label>
                <select
                  className="form-select form-control-cinema"
                  required
                  value={show.theatre}
                  onChange={e => setShow({ ...show, theatre: e.target.value })}
                >
                  {theatres.map(t => (
                    <option key={t._id} value={t._id}>{t.name} &mdash; {t.location}</option>
                  ))}
                </select>
              </div>

              <div className="col-md-4">
                <label className="form-label small text-dim">Start Date & Time</label>
                <input
                  type="datetime-local"
                  className="form-control form-control-cinema"
                  required
                  value={show.startsAt}
                  onChange={e => setShow({ ...show, startsAt: e.target.value })}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small text-dim">Ticket Price (&#8377;)</label>
                <input
                  type="number"
                  min="0"
                  className="form-control form-control-cinema"
                  required
                  value={show.price}
                  onChange={e => setShow({ ...show, price: e.target.value })}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small text-dim">Seating Rows (A to Z)</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  className="form-control form-control-cinema"
                  value={show.rows}
                  onChange={e => setShow({ ...show, rows: e.target.value })}
                />
              </div>

              <div className="col-md-4">
                <label className="form-label small text-dim">Seats Per Row</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  className="form-control form-control-cinema"
                  value={show.seatsPerRow}
                  onChange={e => setShow({ ...show, seatsPerRow: e.target.value })}
                />
              </div>
            </div>

            <button className="btn btn-cinema mt-3">
              <i className="bi bi-clock-history me-1"></i> Create Showtime
            </button>
          </form>
        </div>
      </div>

      {/* Catalogue List & Management */}
      <div className="admin-card mt-4">
        <h3 className="h5 fw-bold text-white mb-3">
          <i className="bi bi-collection-play text-danger me-2"></i> Current Movies ({movies.length})
        </h3>
        <div className="table-responsive">
          <table className="table table-dark table-hover align-middle mb-0" style={{ background: "transparent" }}>
            <thead>
              <tr className="text-dim border-secondary border-opacity-25 small">
                <th>Movie</th>
                <th>Duration</th>
                <th>Certificate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {movies.map(m => (
                <tr key={m._id} className="border-secondary border-opacity-25">
                  <td className="fw-semibold text-white">{m.title}</td>
                  <td className="text-dim">{m.durationMinutes} min</td>
                  <td>
                    <span className="badge bg-secondary bg-opacity-25 text-warning">{m.certificate}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => removeMovie(m._id)}
                    >
                      <i className="bi bi-trash"></i> Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
