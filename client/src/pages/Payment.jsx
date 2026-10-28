import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";

export default function Payment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get("/bookings/my")
      .then(r => setBooking(r.data.find(b => b._id === id) || null))
      .catch(() => {});
  }, [id]);

  const pay = async outcome => {
    setBusy(true);
    try {
      const { data } = await api.post("/payments/demo", { bookingId: id, outcome });
      if (outcome === "success") {
        toast.success("Payment confirmed! Your ticket is ready.");
        navigate("/bookings");
      } else {
        toast.error(data.message || "Payment simulation failed");
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Payment transaction error");
    } finally {
      setBusy(false);
    }
  };

  if (!booking) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-danger mb-3" role="status"></div>
        <p className="text-dim">Retrieving reservation order...</p>
      </div>
    );
  }

  const showDateStr = new Date(booking.startsAt).toLocaleString([], {
    dateStyle: "full",
    timeStyle: "short"
  });

  return (
    <div className="auth-wrapper">
      <div className="ticket-pass p-4" style={{ width: "min(100%, 480px)" }}>
        {/* Pass Header */}
        <div className="text-center mb-3">
          <span className="eyebrow-pill mb-2">
            <i className="bi bi-shield-check"></i> SECURE CHECKOUT
          </span>
          <h2 className="h4 fw-bold mb-1 text-white">{booking.movieTitle}</h2>
          <p className="text-dim small mb-0">
            {booking.theatreName} &middot; {showDateStr}
          </p>
        </div>

        {/* Details Grid */}
        <div className="bg-dark bg-opacity-50 p-3 rounded-3 my-3 border border-secondary border-opacity-25">
          <div className="d-flex justify-content-between mb-2 small">
            <span className="text-dim">Booking Reference:</span>
            <span className="font-monospace text-warning fw-bold">{booking.bookingCode}</span>
          </div>
          <div className="d-flex justify-content-between mb-2 small">
            <span className="text-dim">Reserved Seats:</span>
            <span className="fw-semibold text-white">{booking.seats.join(", ")} ({booking.seats.length} Tickets)</span>
          </div>
          <div className="d-flex justify-content-between pt-2 border-top border-secondary border-opacity-25">
            <span className="fw-bold">Total Payable:</span>
            <span className="h5 mb-0 fw-bold text-danger">&#8377;{booking.totalAmount}</span>
          </div>
        </div>

        {/* Perforated Divider */}
        <div className="ticket-notch-divider" />

        {/* Simulated Barcode */}
        <div className="barcode-sim mb-4">
          ||| | || |||| | | ||| |||| | ||| | |||
          <div style={{ letterSpacing: "1px", fontSize: "0.72rem", marginTop: "4px" }}>
            {booking.bookingCode}
          </div>
        </div>

        {/* Payment Actions */}
        {booking.paymentStatus === "paid" ? (
          <div className="alert alert-success text-center py-3 rounded-3 mb-3">
            <i className="bi bi-check-circle-fill me-2"></i> This booking is already paid!
          </div>
        ) : (
          <div className="d-flex flex-column gap-2 mb-3">
            <button
              disabled={busy}
              className="btn btn-cinema btn-lg w-100"
              onClick={() => pay("success")}
            >
              {busy ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Processing Demo Payment...
                </>
              ) : (
                <>
                  <i className="bi bi-credit-card-2-front-fill"></i> Pay &#8377;{booking.totalAmount} (Simulate Success)
                </>
              )}
            </button>

            <button
              disabled={busy}
              className="btn btn-outline-secondary text-dim btn-sm w-100"
              onClick={() => pay("failed")}
            >
              Simulate Declined / Failed Payment
            </button>
          </div>
        )}

        <div className="text-center">
          <Link to="/bookings" className="text-dim small text-decoration-none">
            &larr; View all my bookings
          </Link>
        </div>
      </div>
    </div>
  );
}
