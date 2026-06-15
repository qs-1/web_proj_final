import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Auth.css";

export default function Register() {
  const { register, isAuthed, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthed) {
    return <Navigate to="/" replace />;
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.username.trim() || !form.password) {
      setError("Username and password are required.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      await register(form.username.trim(), form.email.trim(), form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-icon">
            <img src="/folio.svg" alt="" width="20" height="20" />
          </div>
          Folio
        </div>
        <p className="auth-sub">Create an account to start building notes.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="error-banner">{error}</div>}
          <div className="field">
            <label className="label" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className="input"
              value={form.username}
              onChange={set("username")}
              autoComplete="username"
              autoFocus
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="email">
              Email <span className="dim">(optional)</span>
            </label>
            <input
              id="email"
              type="email"
              className="input"
              value={form.email}
              onChange={set("email")}
              autoComplete="email"
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input"
              value={form.password}
              onChange={set("password")}
              autoComplete="new-password"
            />
          </div>
          <div className="field">
            <label className="label" htmlFor="confirm">
              Confirm password
            </label>
            <input
              id="confirm"
              type="password"
              className="input"
              value={form.confirm}
              onChange={set("confirm")}
              autoComplete="new-password"
            />
          </div>
          <button className="btn btn-primary" disabled={submitting}>
            {submitting ? <span className="spinner" /> : "Create account"}
          </button>
        </form>

        <p className="auth-foot">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
