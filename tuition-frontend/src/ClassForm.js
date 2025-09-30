import React, { useEffect, useState } from "react";
import { api } from "./api";

const emptyClass = {
  title: "", subject: "", grade: "", teacher: "", schedule: "",
  room: "", capacity: 0, fee: 0, currency: "LKR", status: "Active",
  startDate: "", endDate: ""
};

export default function ClassForm({ fetchClasses, editing, setEditing }) {
  const [form, setForm] = useState(emptyClass);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (editing) setForm(editing);
    else setForm(emptyClass);
    setMsg("");
  }, [editing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    try {
      if (editing) {
        await api.put(`/api/classes/${editing.id}`, form);
        setMsg("✅ Class updated");
        setEditing(null);
      } else {
        await api.post("/api/classes", form);
        setMsg("✅ Class added");
      }
      setForm(emptyClass);
      fetchClasses();
    } catch (err) {
      setMsg("❌ Save failed: " + (err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-header">
        <h3>{editing ? "Edit Class" : "Add Class"}</h3>
        {editing && (
          <button type="button" className="btn btn-ghost small" onClick={() => setEditing(null)}>
            Cancel
          </button>
        )}
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Title</span>
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>

        <label className="field">
          <span>Subject</span>
          <input name="subject" value={form.subject} onChange={handleChange} required />
        </label>

        <label className="field">
          <span>Grade</span>
          <input name="grade" value={form.grade} onChange={handleChange} required />
        </label>

        <label className="field">
          <span>Teacher</span>
          <input name="teacher" value={form.teacher} onChange={handleChange} required />
        </label>

        <label className="field">
          <span>Schedule</span>
          <input name="schedule" value={form.schedule} onChange={handleChange} required />
        </label>

        <label className="field">
          <span>Room</span>
          <input name="room" value={form.room} onChange={handleChange} required />
        </label>

        <label className="field">
          <span>Capacity</span>
          <input type="number" name="capacity" value={form.capacity} onChange={handleChange} required />
        </label>

        <label className="field">
          <span>Fee</span>
          <input type="number" step="0.01" name="fee" value={form.fee} onChange={handleChange} required />
        </label>

        <label className="field">
          <span>Currency</span>
          <input name="currency" value={form.currency} onChange={handleChange} required />
        </label>

        <label className="field">
          <span>Status</span>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </label>

        <label className="field">
          <span>Start Date</span>
          <input type="date" name="startDate" value={form.startDate} onChange={handleChange} />
        </label>

        <label className="field">
          <span>End Date</span>
          <input type="date" name="endDate" value={form.endDate} onChange={handleChange} />
        </label>
      </div>

      <button className="btn btn-primary" type="submit" disabled={saving}>
        {saving ? "Saving…" : editing ? "Update Class" : "Add Class"}
      </button>

      {msg && <div className="small muted" style={{ marginTop: 8 }}>{msg}</div>}
    </form>
  );
}
