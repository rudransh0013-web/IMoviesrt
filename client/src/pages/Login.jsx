import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";

export default function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/auth/login", form);
      onLogin(data);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate("/");
    } catch (e) {
      toast.error(e.response?.data?.message || "Invalid email or password");
    } finally {
      setBusy(false);
    }
  };

  const fillAdmin = () => {
    setForm({ email: "admin@imovies.com", password: "admin12345" });
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-glass-box">
        <div className="text-center mb-4">
          <span className="eyebrow-pill mb-2">
            <i className="bi bi-person-check"></i> WELCOME BACK
          </span>
          <h1 className="h3 fw-bold text-white">Sign In to iMovies</h1>
          <p className="text-dim small mb-0">Continue your cinematic journey</p>
        </div>

        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label small text-dim">Email Address</label>
            <div className="position-relative">
              <input
                className="form-control form-control-cinema w-100"
                style={{ paddingLeft: "1rem" }}
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                required
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label small text-dim">Password</label>
            <input
              className="form-control form-control-cinema w-100"
              style={{ paddingLeft: "1rem" }}
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button className="btn btn-cinema w-100 py-2 mb-3" disabled={busy}>
            {busy ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Signing in...
              </>
            ) : (
              <>
                Sign In <i className="bi bi-arrow-right ms-1"></i>
              </>
            )}
          </button>
        </form>

        {/* Demo Fast Fill */}
        <div className="pt-3 border-top border-secondary border-opacity-25 text-center">
          <button
            type="button"
            className="btn btn-glass btn-sm w-100 mb-3"
            onClick={fillAdmin}
          >
            <i className="bi bi-shield-lock-fill text-warning me-1"></i> Quick Fill Admin Credentials
          </button>

          <p className="text-dim small mb-0">
            Don't have an account yet?{" "}
            <Link to="/register" className="text-danger fw-semibold text-decoration-none">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
