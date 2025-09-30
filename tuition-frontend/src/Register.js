import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { api } from "./api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const u = username.trim();
    const p = password.trim();

    try {
      await api.post("/api/auth/register", { username: u, password: p }, {
        headers: { "Content-Type": "application/json" },
      });
      setMsg("✅ Registration successful! Redirecting to login…");
      setTimeout(() => navigate("/login", { state: { fromRegister: true } }), 900);
    } catch (err) {
      setMsg("❌ Registration failed: " + (err.response?.data || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form onSubmit={handleRegister} className="card">
        <h2 className="card-title">Create your account</h2>
        <p className="card-subtitle">Start managing classes in minutes</p>

        <label className="field">
          <span>Username</span>
          <input
            placeholder="e.g., admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>

        <button className="btn btn-primary w-full" type="submit" disabled={loading}>
          {loading ? "Creating…" : "Register"}
        </button>

        {msg && <div className="alert" role="alert">{msg}</div>}

        <div className="muted">
          Already have an account? <Link to="/login" className="link">Login</Link>
        </div>
      </form>
    </div>
  );
}
