import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./api";
import ClassForm from "./ClassForm";

export default function Dashboard({ token, setToken }) {
  const [classes, setClasses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState("");
  const [notice, setNotice] = useState(null); // { type: 'success'|'error', text: string }
  const navigate = useNavigate();

  const showNotice = (text, type = "success", ttl = 2600) => {
    setNotice({ text, type });
    window.clearTimeout(showNotice._t);
    showNotice._t = window.setTimeout(() => setNotice(null), ttl);
  };

  const fetchClasses = async () => {
    try {
      const res = await api.get("/api/classes");
      setClasses(res.data || []);
    } catch (e) {
      // setMsg("Failed to load classes.");
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleDelete = async (id) => {
    const target = classes.find((c) => c.id === id);
    if (!window.confirm(`Delete this class${target?.title ? `: "${target.title}"` : ""}?`)) return;

    try {
      await api.delete(`/api/classes/${id}`);
      showNotice(`✅ Class deleted${target?.title ? `: "${target.title}"` : ""}`);
      if (editing?.id === id) setEditing(null);
      fetchClasses();
    } catch (err) {
      showNotice(`❌ Delete failed: ${err.response?.data || err.message}`, "error", 4000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login", { replace: true });
  };

  return (
    <div className="container">
      {/* Toasts */}
      <div className="toast-stack">
        {notice && <div className={`toast ${notice.type}`}>{notice.text}</div>}
      </div>

      <div className="header-row">
        <div>
          <h2 className="page-title">Class Dashboard</h2>
          <p className="muted">Add, edit, and manage your class catalog</p>
        </div>
        {/* If you want logout here, uncomment:
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        */}
      </div>

      {msg && <div className="alert">{msg}</div>}

      <div className="grid">
        <div className="card">
          <ClassForm
            fetchClasses={fetchClasses}
            editing={editing}
            setEditing={setEditing}
            onSaved={(action, title) => {
              // action: "created" | "updated"
              const verb = action === "created" ? "created" : "updated";
              showNotice(`✅ Class ${verb}${title ? `: "${title}"` : ""}`);
            }}
          />
        </div>

        <div className="card">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th><th>Subject</th><th>Grade</th><th>Teacher</th>
                  <th>Schedule</th><th>Room</th><th>Capacity</th><th>Fee</th>
                  <th>Status</th><th>Start</th><th>End</th><th></th>
                </tr>
              </thead>
              <tbody>
                {classes.length === 0 && (
                  <tr><td colSpan="12" className="muted">No classes yet. Add one on the left.</td></tr>
                )}
                {classes.map((cls) => (
                  <tr key={cls.id}>
                    <td>{cls.title}</td>
                    <td>{cls.subject}</td>
                    <td>{cls.grade}</td>
                    <td>{cls.teacher}</td>
                    <td>{cls.schedule}</td>
                    <td>{cls.room}</td>
                    <td>{cls.capacity}</td>
                    <td>{cls.fee} {cls.currency}</td>
                    <td>{cls.status}</td>
                    <td>{cls.startDate}</td>
                    <td>{cls.endDate}</td>
                    <td className="row-actions">
                      <button className="btn btn-ghost small" onClick={() => setEditing(cls)}>Edit</button>
                      <button className="btn btn-danger small" onClick={() => handleDelete(cls.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
