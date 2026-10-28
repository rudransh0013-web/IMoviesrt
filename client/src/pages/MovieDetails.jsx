import { useEffect, useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api";

const formatDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => formatDate(new Date()));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // Generate next 7 days for the interactive date carousel
  const upcomingDates = useMemo(() => {
    const list = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      list.push({
        fullDate: formatDate(d),
        dayName: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: d.getDate(),
        monthName: d.toLocaleDateString("en-US", { month: "short" })
      });
    }
    return list;
  }, []);

  useEffect(() => {
    api.get(`/movies/${id}`)
      .then(r => setMovie(r.data))
      .catch(e => setError(e.response?.data?.message || "Could not load movie"));
  }, [id]);

  useEffect(() => {
    setLoading(true);
    api.get("/shows", { params: { movieId: id, date: selectedDate } })
      .then(r => setShows(r.data || []))
      .catch(() => setShows([]))
      .finally(() => setLoading(false));
  }, [id, selectedDate]);

  // Group shows by Theatre
  const theatreMap = useMemo(() => {
    const map = new Map();
    shows.forEach(show => {
      const tId = show.theatre?._id || "unknown";
      if (!map.has(tId)) {
        map.set(tId, {
          theatre: show.theatre,
          shows: []
        });
      }
      map.get(tId).shows.push(show);
    });
    return Array.from(map.values());
  }, [shows]);

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning p-4 rounded-4 mx-auto" style={{ maxWidth: 500 }}>
          <i className="bi bi-exclamation-triangle-fill display-5 mb-3 d-block text-warning"></i>
          <h4>Notice</h4>
          <p>{error}</p>
          <Link to="/" className="btn btn-cinema btn-sm mt-2">Back to Movies</Link>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger mb-3" role="status"></div>
        <p className="text-dim">Loading movie details...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Backdrop Header */}
      <section
        className="backdrop-hero container"
        style={{
          backgroundImage: movie.posterUrl ? `url(${movie.posterUrl})` : "none"
        }}
      >
        <div className="backdrop-scrim-deep" />
      </section>

      {/* Main Content Info */}
      <div className="container">
        <div className="details-content-grid">
          {/* Floating Poster */}
          <div className="detail-floating-poster">
            {movie.posterUrl && (
              <img src={movie.posterUrl} alt={movie.title} />
            )}
          </div>

          {/* Metadata & Shows */}
          <div>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              <span className="cert-badge position-static">{movie.certificate || "U/A"}</span>
              <span className="badge bg-danger bg-opacity-25 text-danger border border-danger border-opacity-25 px-2 py-1">
                {movie.durationMinutes} Minutes
              </span>
              <span className="text-dim small">
                {movie.languages?.join(", ") || "English"}
              </span>
            </div>

            <h1 className="hero-title mb-2">{movie.title}</h1>

            <div className="d-flex flex-wrap gap-2 mb-3">
              {movie.genres?.map(g => (
                <span key={g} className="badge bg-secondary bg-opacity-25 text-light border border-secondary border-opacity-25 px-3 py-2 rounded-pill">
                  {g}
                </span>
              ))}
            </div>

            <p className="hero-subtitle mb-4 text-light text-opacity-75">
              {movie.description}
            </p>

            {movie.trailerUrl && (
              <a
                href={movie.trailerUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-glass mb-4"
              >
                <i className="bi bi-play-circle-fill text-danger fs-5"></i> Watch Official Trailer ↗
              </a>
            )}

            {/* Showtime Selection Section */}
            <div className="mt-4 pt-3 border-top border-secondary border-opacity-25">
              <h3 className="section-title h4 mb-3">
                <i className="bi bi-calendar3 me-2 text-danger"></i> Select Date & Showtime
              </h3>

              {/* Interactive Date Carousel */}
              <div className="date-chips-carousel mb-4">
                {upcomingDates.map(item => (
                  <div
                    key={item.fullDate}
                    className={`date-chip-card ${selectedDate === item.fullDate ? "active" : ""}`}
                    onClick={() => setSelectedDate(item.fullDate)}
                  >
                    <div className="day">{item.dayName}</div>
                    <div className="num">{item.dayNumber}</div>
                    <div className="day">{item.monthName}</div>
                  </div>
                ))}
              </div>

              {/* Theatres & Shows */}
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm text-danger me-2"></div>
                  <span className="text-dim">Checking showtime availability...</span>
                </div>
              ) : theatreMap.length === 0 ? (
                <div className="alert bg-dark border-secondary border-opacity-25 rounded-4 p-4 text-center">
                  <i className="bi bi-calendar-x display-6 text-muted mb-2 d-block"></i>
                  <p className="text-dim mb-1">No upcoming shows scheduled for this date.</p>
                  <span className="small text-muted">Try selecting another date from the tabs above.</span>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {theatreMap.map(({ theatre, shows: tShows }) => (
                    <div className="theatre-show-card" key={theatre?._id || Math.random()}>
                      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3">
                        <div>
                          <h4 className="h5 mb-1 text-white">
                            <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                            {theatre?.name || "Cinema Hall"}
                          </h4>
                          <span className="text-dim small">{theatre?.location || "City Centre"} &middot; {theatre?.address}</span>
                        </div>
                        <span className="badge bg-dark border border-secondary border-opacity-25 text-dim px-2 py-1">
                          {theatre?.screens || 1} Screens
                        </span>
                      </div>

                      {/* Showtimes */}
                      <div className="d-flex flex-wrap gap-2">
                        {tShows.map(show => {
                          const timeStr = new Date(show.startsAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                          });
                          return (
                            <Link
                              key={show._id}
                              to={`/shows/${show._id}/seats`}
                              className="showtime-pill"
                            >
                              <span className="time">{timeStr}</span>
                              <span className="price">&#8377;{show.price} &middot; {show.screenName || "Audi 1"}</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
