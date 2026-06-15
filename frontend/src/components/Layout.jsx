import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Layout.css";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <button
        className="hamburger btn btn-icon btn-ghost"
        onClick={() => setOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        ☰
      </button>

      <aside className={`sidebar ${open ? "open" : ""}`}>
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <img src="/folio.svg" alt="" width="32" height="32" />
          <span>Folio</span>
        </Link>

        <nav className="nav">
          <NavLink to="/" end className="nav-link" onClick={() => setOpen(false)}>
            <span className="nav-ico">🏠</span> Dashboard
          </NavLink>
          <NavLink
            to="/notes/new"
            className="nav-link"
            onClick={() => setOpen(false)}
          >
            <span className="nav-ico">✨</span> New Note
          </NavLink>
        </nav>

        <div className="sidebar-foot">
          <div className="user-chip">
            <div className="avatar">
              {(user?.username || "?").charAt(0).toUpperCase()}
            </div>
            <div className="user-meta">
              <div className="user-name">{user?.username}</div>
              <div className="user-mail dim">{user?.email || "Signed in"}</div>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </aside>

      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
