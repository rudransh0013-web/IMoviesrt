import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.get("/bookings/my")
      .then(r => setBookings(r.data || []))
      .catch(e => toast.error(e.response?.data?.message || "Could not retrieve bookings"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const cancel = async id => {
    if (!window.confirm("Are you sure you want to cancel this reservation? The seats will be released.")) return;
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success("Booking cancelled and seats released");
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Cancellation failed");
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="eyebrow-pill mb-1">
            <i className="bi bi-ticket-perforated"></i> CINEMA PASSES
          </div>
          <h1 className="section-title h2 mb-0">My Bookings</h1>
        </div>
        <Link to="/" className="btn btn-glass btn-sm">
          <i className="bi bi-plus-circle me-1"></i> Book More
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-danger mb-3" role="status"></div>
          <p className="text-dim">Loading your tickets...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-5 bg-dark bg-opacity-50 border border-secondary border-opacity-25 rounded-4 p-5">
          <i className="bi bi-ticket-detailed display-3 text-muted mb-3 d-block"></i>
          <h3>No Bookings Yet</h3>
          <p className="text-dim mb-4">Your next movie adventure is just a click away!</p>
          <Link to="/" className="btn btn-cinema">
            Explore Now Showing
          </Link>
        </div>
      ) : (
        <div className="row g-4">
          {bookings.map(b => {
            const isPast = new Date(b.startsAt) <= new Date();
            const isCancelled = b.status === "cancelled";

            return (
              <div className="col-lg-6" key={b._id}>
                <div className="ticket-pass p-4 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <h3 className="h5 fw-bold text-white mb-1">{b.movieTitle}</h3>
                        <p className="text-dim small mb-0">
                          <i className="bi bi-geo-alt text-danger me-1"></i>
                          {b.theatreName}
                        </p>
                      </div>

                      <span className={`badge ${
                        isCancelled
                          ? "bg-danger bg-opacity-25 text-danger border border-danger border-opacity-25"
                          : "bg-success bg-opacity-25 text-success border border-success border-opacity-25"
                      } px-2 py-1`}>
                        {b.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="bg-dark bg-opacity-40 p-3 rounded-3 my-3 border border-secondary border-opacity-25">
                      <div className="row g-2 small">
                        <div className="col-6">
                          <span className="text-muted d-block">Date & Time</span>
                          <span className="fw-semibold text-light">
                            {new Date(b.startsAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                          </span>
                        </div>
                        <div className="col-6">
                          <span className="text-muted d-block">Seats</span>
                          <span className="fw-semibold text-warning">
                            {b.seats.join(", ")}
                          </span>
                        </div>
                        <div className="col-6 pt-2">
                          <span className="text-muted d-block">Amount Paid</span>
                          <span className="fw-semibold text-white">&#8377;{b.totalAmount}</span>
                        </div>
                        <div className="col-6 pt-2">
                          <span className="text-muted d-block">Payment Status</span>
                          <span className="fw-semibold text-light text-capitalize">
                            {b.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="barcode-sim mb-3">
                      {b.bookingCode}
                    </div>

                    <div className="d-flex justify-content-between align-items-center">
                      {b.paymentStatus === "pending" && !isCancelled && (
                        <Link to={`/payment/${b._id}`} className="btn btn-cinema btn-sm">
                          Complete Payment
                        </Link>
                      )}

                      {!isCancelled && !isPast && (
                        <button
                          className="btn btn-outline-danger btn-sm ms-auto"
                          onClick={() => cancel(b._id)}
                        >
                          <i className="bi bi-x-circle me-1"></i> Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
