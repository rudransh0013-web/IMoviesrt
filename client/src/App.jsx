import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Navbar from "./components/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import MovieDetails from "./pages/MovieDetails.jsx";
import SeatBooking from "./pages/SeatBooking.jsx";
import Payment from "./pages/Payment.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import Admin from "./pages/Admin.jsx";
import api from "./api";

export default function App() {
  const [auth, setAuth] = useState(() => ({
    token: localStorage.getItem("imovies_token"),
    user: JSON.parse(localStorage.getItem("imovies_user") || "null")
  }));

  useEffect(() => {
    if (!auth.token) return;
    api.get("/auth/me").then(({ data }) => {
      setAuth(a => ({ ...a, user: data.user }));
      localStorage.setItem("imovies_user", JSON.stringify(data.user));
    }).catch(() => {
      localStorage.removeItem("imovies_token");
      localStorage.removeItem("imovies_user");
      setAuth({ token: null, user: null });
    });
  }, []);

  const onLogin = ({ token, user }) => {
    localStorage.setItem("imovies_token", token);
    localStorage.setItem("imovies_user", JSON.stringify(user));
    setAuth({ token, user });
  };

  const onLogout = () => {
    localStorage.removeItem("imovies_token");
    localStorage.removeItem("imovies_user");
    setAuth({ token: null, user: null });
    toast.info("You have been signed out");
  };

  return (
    <>
      <Navbar user={auth.user} onLogout={onLogout} />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={onLogin} />} />
          <Route path="/register" element={<Register onLogin={onLogin} />} />
          <Route path="/movies/:id" element={<MovieDetails />} />
          <Route path="/shows/:id/seats" element={<SeatBooking user={auth.user} />} />
          <Route path="/payment/:id" element={<ProtectedRoute user={auth.user}><Payment /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute user={auth.user}><MyBookings /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute user={auth.user} admin><Admin /></ProtectedRoute>} />
          <Route path="*" element={
            <div className="container py-5 text-center">
              <h1 className="hero-title">404</h1>
              <p className="hero-subtitle mx-auto">The movie or page you're looking for doesn't exist.</p>
              <Link to="/" className="btn btn-cinema">Return to Home</Link>
            </div>
          } />
        </Routes>
      </main>

      <footer className="cinema-footer">
        <div className="container d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex align-items-center gap-2">
            <span className="brand-icon">🎬</span>
            <span className="brand-badge fw-bold">iMOVIES</span>
            <span className="text-muted ms-2">| Experience Cinema Like Never Before</span>
          </div>
          <div className="text-dim small">
            Built with MERN Stack + Socket.io &middot; Real-time Seat Booking
          </div>
        </div>
      </footer>

      <ToastContainer position="bottom-right" theme="dark" autoClose={3000} />
    </>
  );
}
