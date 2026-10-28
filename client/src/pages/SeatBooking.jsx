import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import api from "../api";

export default function SeatBooking({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seatData, setSeatData] = useState(null);
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get(`/shows/${id}/seats`);
      setSeatData(data);
      // Remove any previously selected seat if someone else just booked it
      setSelected(s => s.filter(x => !data.seats.find(seat => seat.id === x)?.booked));
    } catch (e) {
      setError(e.response?.data?.message || "Could not load seat map.");
    }
  };

  useEffect(() => {
    load();
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000");
    socket.emit("join-show", id);
    socket.on("seats-updated", () => {
      toast.info("Seat availability just updated in real-time!");
      load();
    });
    return () => socket.disconnect();
  }, [id]);

  const total = useMemo(() => (seatData?.price || 0) * selected.length, [seatData, selected]);

  const toggle = seat => {
    setSelected(s => {
      if (s.includes(seat)) {
        return s.filter(x => x !== seat);
      }
      if (s.length >= 10) {
        toast.info("Maximum 10 seats allowed per booking");
        return s;
      }
      return [...s, seat];
    });
  };

  const book = async () => {
    if (!user) {
      toast.warn("Please sign in to confirm your booking");
      navigate("/login");
      return;
    }
    if (!selected.length) {
      toast.info("Please select at least one seat");
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post("/bookings", { showId: id, seats: selected });
      toast.success("Seats reserved successfully!");
      navigate(`/payment/${data.booking._id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || "Reservation failed. Please try again.");
      await load();
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="container py-5 text-center">
        <div className="alert alert-warning p-4 rounded-4 mx-auto" style={{ maxWidth: 500 }}>
          <i className="bi bi-exclamation-octagon-fill display-5 mb-2 d-block text-warning"></i>
          <h4>Unable to Load Seats</h4>
          <p>{error}</p>
          <Link to="/" className="btn btn-cinema btn-sm">Return Home</Link>
        </div>
      </div>
    );
  }

  if (!seatData) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger mb-3" role="status"></div>
        <p className="text-dim">Loading cinema auditorium layout...</p>
      </div>
    );
  }

  const showTimeStr = new Date(seatData.startsAt).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short"
  });

  return (
    <div className="container py-4">
      {/* Header Info */}
      <div className="text-center mb-4">
        <div className="eyebrow-pill mb-2">
          <i className="bi bi-camera-reels"></i> AUDITORIUM SEATING
        </div>
        <h1 className="hero-title mb-1 h2">
          {seatData.movie?.title || "Select Your Seats"}
        </h1>
        <p className="text-dim mb-0">
          <i className="bi bi-geo-alt text-danger me-1"></i>
          {seatData.theatre?.name} &middot; {seatData.screenName || "Audi 1"} &middot; {showTimeStr}
        </p>
      </div>

      {/* Auditorium Hall */}
      <div className="cinema-hall">
        {/* 3D Curved Screen */}
        <div className="screen-curve-3d">
          <i className="bi bi-display me-2"></i> ALL EYES THIS WAY &bull; SCREEN
        </div>

        {/* Seat Matrix */}
        <div className="seats-matrix">
          {Array.from({ length: seatData.rows }, (_, r) => {
            const rowLetter = String.fromCharCode(65 + r);
            const rowSeats = seatData.seats.filter(s => s.id.startsWith(rowLetter));

            return (
              <div className="seat-row-strip" key={r}>
                <span className="row-tag">{rowLetter}</span>
                {rowSeats.map(s => {
                  const isSelected = selected.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      title={s.booked ? `Seat ${s.id} is already booked` : `Seat ${s.id} (₹${seatData.price})`}
                      disabled={s.booked}
                      onClick={() => toggle(s.id)}
                      className={`cinema-seat ${s.booked ? "booked" : isSelected ? "selected" : ""}`}
                    >
                      {!s.booked && s.id.slice(1)}
                    </button>
                  );
                })}
                <span className="row-tag ms-2 text-start">{rowLetter}</span>
              </div>
            );
          })}
        </div>

        {/* Legend Bar */}
        <div className="seat-legend-bar">
          <div className="legend-item">
            <span className="legend-swatch" style={{ background: "#171f33", border: "1px solid rgba(255,255,255,0.2)" }} />
            <span>Available</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch" style={{ background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
            <span>Selected</span>
          </div>
          <div className="legend-item">
            <span className="legend-swatch" style={{ background: "#1a1f2c", opacity: 0.5 }} />
            <span>Booked</span>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Checkout Dock */}
      <div className="sticky-booking-dock">
        <div>
          <div className="small text-dim mb-1">
            <i className="bi bi-ticket-detailed me-1"></i> Selected Seats ({selected.length}/10)
          </div>
          <div className="d-flex flex-wrap gap-1">
            {selected.length > 0 ? (
              selected.map(st => (
                <span key={st} className="badge bg-success bg-opacity-25 text-success border border-success border-opacity-50 px-2 py-1">
                  {st}
                </span>
              ))
            ) : (
              <span className="text-muted small">Click any seat to add it to your order</span>
            )}
          </div>
        </div>

        <div className="d-flex align-items-center gap-4">
          <div className="text-end">
            <div className="small text-dim">Total Payable</div>
            <div className="h3 mb-0 fw-bold text-white">&#8377;{total}</div>
          </div>

          <button
            className="btn btn-cinema btn-lg"
            disabled={busy || selected.length === 0}
            onClick={book}
          >
            {busy ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Reserving...
              </>
            ) : (
              <>
                Proceed to Checkout <i className="bi bi-arrow-right"></i>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
