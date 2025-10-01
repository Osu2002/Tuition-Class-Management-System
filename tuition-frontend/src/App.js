import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Dashboard from "./Dashboard";
import User from "./User";
import { setApiAuth } from "./api";
import "./App.css";

function ProtectedRoute({ token, children }) {
  return token ? children : <Navigate to="/login" replace />;
}

function Shell({ children, token, onLogout }) {
  const location = useLocation();
  const onDashboard = location.pathname === "/dashboard";

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="logo-dot" />
          Tuition Admin
        </div>
        <nav className="nav-actions">
          {!token && (
            <>
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </>
          )}
          {token && (
            <>
              {!onDashboard && <Link to="/dashboard" className="btn btn-ghost">Dashboard</Link>}
              <Link to="/user" className="btn btn-ghost">For User</Link>
              <button className="btn btn-danger" onClick={onLogout}>Logout</button>
            </>
          )}
        </nav>
      </header>
      <main className="page">{children}</main>
      <footer className="footer">© {new Date().getFullYear()} Tuition Admin</footer>
    </div>
  );
}

export default function App() {
  const [token, setToken] = React.useState(localStorage.getItem("token"));
  React.useEffect(() => setApiAuth(token), [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setApiAuth(null);
  };

  return (
    <BrowserRouter>
      <Shell token={token} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute token={token}>
                <Dashboard token={token} setToken={setToken} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user"
            element={
              <ProtectedRoute token={token}>
                <User />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}
