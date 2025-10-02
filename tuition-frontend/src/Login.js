import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Login({ setToken }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.fromRegister) {
      setMsg("✅ Registration completed. Please log in.");
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const u = username.trim();
    const p = password.trim();

    try {
      // hit a protected endpoint with HTTP Basic
      await axios.get("http://localhost:8081/api/classes", {
        auth: { username: u, password: p },
      });

      const token = btoa(`${u}:${p}`);
      localStorage.setItem("token", token);
      setToken(token);

      setMsg("✅ Login successful! Redirecting…");
      setTimeout(() => navigate("/dashboard"), 700);
    } catch (err) {
      setMsg(
        `❌ Login failed: ${err.response?.status || ""} ${
          err.response?.data || err.message
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <form onSubmit={handleLogin} className="card2">
        <h2 className="card-title">Welcome back</h2>
        <p className="card-subtitle">Sign in to continue</p>

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
          <div className="password-wrap">
            <input
              type={showPw ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="btn btn-ghost small"
              onClick={() => setShowPw((s) => !s)}
              aria-label="Toggle password visibility"
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
        </label>

        <button
          className="btn btn-primary w-full"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in…" : "Login"}
        </button>

        {msg && (
          <div className="alert" role="alert">
            {msg}
          </div>
        )}

        <div className="muted">
          New here?{" "}
          <Link to="/register" className="link">
            Create an account
          </Link>
        </div>
      </form>
    </div>
  );
}
