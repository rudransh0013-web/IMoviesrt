import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../api";

export default function Register({ onLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/auth/register", form);
      onLogin(data);
      toast.success("Account created successfully! Welcome to iMovies.");
      navigate("/");
    } catch (e) {
      toast.error(e.response?.data?.message || "Registration failed. Try a different email.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-glass-box">
        <div className="text-center mb-4">
          <span className="eyebrow-pill mb-2">
            <i className="bi bi-stars"></i> JOIN THE SHOW
          </span>
          <h1 className="h3 fw-bold text-white">Create an Account</h1>
          <p className="text-dim small mb-0">Join thousands of cinema lovers</p>
        </div>

        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label small text-dim">Full Name</label>
            <input
              className="form-control form-control-cinema w-100"
              style={{ paddingLeft: "1rem" }}
              placeholder="e.g. John Doe"
              required
              maxLength="80"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label small text-dim">Email Address</label>
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

          <div className="mb-4">
            <label className="form-label small text-dim">Password (min 8 characters)</label>
            <input
              className="form-control form-control-cinema w-100"
              style={{ paddingLeft: "1rem" }}
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              minLength="8"
              required
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button className="btn btn-cinema w-100 py-2 mb-3" disabled={busy}>
            {busy ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Creating account...
              </>
            ) : (
              <>
                Get Started <i className="bi bi-arrow-right ms-1"></i>
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-top border-secondary border-opacity-25 text-center">
          <p className="text-dim small mb-0">
            Already have an account?{" "}
            <Link to="/login" className="text-danger fw-semibold text-decoration-none">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
