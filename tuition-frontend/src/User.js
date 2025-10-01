import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api"; // uses your auth setup instead of raw axios

function TeacherAvatar({ name = "" }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .map((p) => p[0]?.toUpperCase())
    .slice(0, 2)
    .join("");
  return <div className="usr-avatar">{initials || "T"}</div>;
}

function useBookmarks() {
  const [setVal, setSetVal] = useState(() => {
    try {
      const raw = localStorage.getItem("bookmarks") || "[]";
      return new Set(JSON.parse(raw));
    } catch {
      return new Set();
    }
  });
  useEffect(() => {
    localStorage.setItem("bookmarks", JSON.stringify([...setVal]));
  }, [setVal]);

  const toggle = (id) =>
    setSetVal((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return { bookmarks: setVal, toggle };
}

function SkeletonCard() {
  return (
    <article className="usr-card skeleton">
      <div className="s-row" />
      <div className="s-title" />
      <div className="s-meta" />
      <div className="s-line" />
      <div className="s-line short" />
      <div className="s-actions" />
    </article>
  );
}

export default function User() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI state
  const [q, setQ] = useState("");
  const [subject, setSubject] = useState("All");
  const [grade, setGrade] = useState("All");
  const [status, setStatus] = useState("Active");
  const [sortBy, setSortBy] = useState("startDate_desc");

  const { bookmarks, toggle } = useBookmarks();

  const fetchClasses = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/classes");
      setClasses(res.data || []);
    } catch (err) {
      setError("Failed to fetch classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const subjects = useMemo(() => {
    const s = new Set(classes.map((c) => c.subject).filter(Boolean));
    return ["All", ...[...s].sort()];
  }, [classes]);

  const grades = useMemo(() => {
    const s = new Set(classes.map((c) => String(c.grade || "")).filter(Boolean));
    return ["All", ...[...s].sort((a, b) => (a + "").localeCompare(b + "", undefined, { numeric: true }))];
  }, [classes]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();

    const base = classes.filter((c) => {
      if (status !== "All" && String(c.status) !== status) return false;
      if (subject !== "All" && c.subject !== subject) return false;
      if (grade !== "All" && String(c.grade) !== grade) return false;
      if (!needle) return true;
      const bag = `${c.title} ${c.teacher} ${c.subject} ${c.schedule} ${c.room}`.toLowerCase();
      return bag.includes(needle);
    });

    const parseDate = (d) => (d ? new Date(d).getTime() : 0);
    const parseNum = (n) => (n == null ? 0 : Number(n));

    return base.sort((a, b) => {
      switch (sortBy) {
        case "startDate_asc":
          return parseDate(a.startDate) - parseDate(b.startDate);
        case "startDate_desc":
          return parseDate(b.startDate) - parseDate(a.startDate);
        case "fee_asc":
          return parseNum(a.fee) - parseNum(b.fee);
        case "fee_desc":
          return parseNum(b.fee) - parseNum(a.fee);
        case "title_asc":
          return String(a.title).localeCompare(String(b.title));
        case "title_desc":
          return String(b.title).localeCompare(String(a.title));
        default:
          return 0;
      }
    });
  }, [classes, q, subject, grade, status, sortBy]);

  const reset = () => {
    setQ("");
    setSubject("All");
    setGrade("All");
    setStatus("Active");
    setSortBy("startDate_desc");
  };

  return (
    <div className="usr-wrap">
      <div className="usr-head">
        <div>
          <h2 className="usr-title">Browse Classes</h2>
          <p className="usr-subtitle">Find and bookmark classes you love</p>
        </div>
        <div className="usr-actions">
          <button className="btn btn-ghost" onClick={fetchClasses} disabled={loading}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </div>

      <div className="usr-toolbar">
        <div className="usr-left">
          <div className="usr-search">
            <input
              placeholder="Search title, teacher, subject, room…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search"
            />
          </div>
          <select value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Filter by subject">
            {subjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select value={grade} onChange={(e) => setGrade(e.target.value)} aria-label="Filter by grade">
            {grades.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            {["Active", "Inactive", "All"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="usr-right">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort">
            <option value="startDate_desc">Start date ↓</option>
            <option value="startDate_asc">Start date ↑</option>
            <option value="fee_desc">Fee ↓</option>
            <option value="fee_asc">Fee ↑</option>
            <option value="title_asc">Title A→Z</option>
            <option value="title_desc">Title Z→A</option>
          </select>
          <button className="btn btn-ghost small" onClick={reset}>Reset</button>
        </div>
      </div>

      {error && <div className="alert error" role="alert">{error}</div>}

      <div className="usr-grid">
        {loading &&
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}

        {!loading && filtered.length === 0 && (
          <div className="muted">No classes match your filters.</div>
        )}

        {!loading &&
          filtered.map((cls) => (
            <article className="usr-card" key={cls.id}>
              <div className="usr-top">
                <span className={`usr-status ${String(cls.status) === "Active" ? "ok" : "bad"}`}>
                  {cls.status || "—"}
                </span>
                <button
                  className={`usr-icon ${bookmarks.has(cls.id) ? "active" : ""}`}
                  onClick={() => toggle(cls.id)}
                  title="Bookmark"
                  aria-label="Bookmark"
                >
                  ★
                </button>
              </div>

              <h3 className="usr-card-title">{cls.title}</h3>

              <div className="usr-meta">
                <TeacherAvatar name={cls.teacher} />
                <div className="usr-meta-lines">
                  <div className="muted">{cls.teacher || "—"}</div>
                  <div className="muted">{cls.subject || "—"} · Grade {cls.grade ?? "—"}</div>
                </div>
              </div>

              <div className="usr-kv">
                <div>
                  <div className="usr-kv-label">Schedule</div>
                  <div className="usr-kv-value">{cls.schedule || "—"}</div>
                </div>
                <div>
                  <div className="usr-kv-label">Room</div>
                  <div className="usr-kv-value">{cls.room || "—"}</div>
                </div>
              </div>

              <div className="usr-kv">
                <div>
                  <div className="usr-kv-label">Capacity</div>
                  <div className="usr-kv-value">{cls.capacity ?? "—"}</div>
                </div>
                <div>
                  <div className="usr-kv-label">Fee</div>
                  <div className="usr-kv-value">{cls.fee} {cls.currency}</div>
                </div>
              </div>

              <div className="usr-dates">
                <span className="usr-chip">Start {cls.startDate || "—"}</span>
                <span className="usr-chip">End {cls.endDate || "—"}</span>
              </div>

              
            </article>
          ))}
      </div>
    </div>
  );
}
