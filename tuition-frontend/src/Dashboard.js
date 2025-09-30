import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "./api";
import ClassForm from "./ClassForm";

export default function Dashboard({ token, setToken }) {
  const [classes, setClasses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const fetchClasses = async () => {
    try {
      const res = await api.get("/api/classes");
      setClasses(res.data || []);
    } catch (e) {
      setMsg("Failed to load classes.");
    }
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this class?")) return;
    await api.delete(`/api/classes/${id}`);
    fetchClasses();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login", { replace: true });
  };

  return (
    <div className="container">
      <div className="header-row">
        <div>
          <h2 className="page-title">Class Dashboard</h2>
          <p className="muted">Add, edit, and manage your class catalog</p>
        </div>
        <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
      </div>

      {msg && <div className="alert">{msg}</div>}

      <div className="grid">
        <div className="card">
          <ClassForm fetchClasses={fetchClasses} editing={editing} setEditing={setEditing} />
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
