import { Link, NavLink, useNavigate } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark navbar-custom sticky-top">
      <div className="container">
        <Link className="brand-logo" to="/">
          <span className="brand-icon">🎬</span>
          <span className="brand-badge">iMOVIES</span>
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navLinks"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navLinks">
          <div className="navbar-nav ms-auto align-items-lg-center gap-2">
            <NavLink className="nav-link" to="/">
              <i className="bi bi-film"></i> Movies
            </NavLink>

            {user && (
              <NavLink className="nav-link" to="/bookings">
                <i className="bi bi-ticket-perforated"></i> My Bookings
              </NavLink>
            )}

            {user?.role === "admin" && (
              <NavLink className="nav-link" to="/admin">
                <i className="bi bi-speedometer2"></i> Admin Panel
              </NavLink>
            )}

            {user ? (
              <div className="d-flex align-items-center gap-2 ms-lg-3 mt-2 mt-lg-0">
                <div className="user-pill">
                  <i className="bi bi-person-circle text-danger"></i>
                  <span>{user.name}</span>
                  {user.role === "admin" && <span className="admin-chip">Admin</span>}
                </div>
                <button
                  className="btn btn-sm btn-glass"
                  onClick={() => {
                    onLogout();
                    navigate("/");
                  }}
                  title="Logout"
                >
                  <i className="bi bi-box-arrow-right"></i> Logout
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2 ms-lg-3 mt-2 mt-lg-0">
                <Link className="btn btn-sm btn-glass" to="/login">
                  Sign In
                </Link>
                <Link className="btn btn-sm btn-cinema" to="/register">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
