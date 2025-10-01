import React, { useEffect, useMemo, useState } from "react";
import { api } from "./api";

const emptyClass = {
  title: "",
  subject: "",
  grade: "",
  teacher: "",
  schedule: "",
  room: "",
  capacity: "",
  fee: "",
  currency: "LKR",
  status: "Active",
  startDate: "",
  endDate: "",
};

const STATUS = ["Active", "Inactive"];

function validate(values) {
  const e = {};

  // helpers
  const nonEmpty = (s) => String(s || "").trim().length > 0;
  const isUpper3 = (s) => /^[A-Z]{3}$/.test(String(s || ""));
  const isName = (s) => /^[A-Za-z .'-]{3,60}$/.test(String(s || "").trim());
  const len = (s) => String(s || "").trim().length;

  // title
  if (!nonEmpty(values.title)) e.title = "Title is required";
  else if (len(values.title) < 3 || len(values.title) > 80)
    e.title = "3–80 characters";

  // subject
  if (!nonEmpty(values.subject)) e.subject = "Subject is required";

  // grade (allow 1–13 or text like 'A/L')
  if (!nonEmpty(values.grade)) e.grade = "Grade is required";

  // teacher name
  if (!nonEmpty(values.teacher)) e.teacher = "Teacher is required";
  else if (!isName(values.teacher))
    e.teacher = "Only letters/spaces, 3–60 chars";

  // schedule (free text but required)
  if (!nonEmpty(values.schedule)) e.schedule = "Schedule is required";

  // room
  if (!nonEmpty(values.room)) e.room = "Room is required";

  // capacity (integer 1..500)
  if (values.capacity === "" || values.capacity === null)
    e.capacity = "Capacity is required";
  else {
    const n = Number(values.capacity);
    if (!Number.isInteger(n)) e.capacity = "Must be a whole number";
    else if (n < 1 || n > 500) e.capacity = "Must be between 1 and 500";
  }

  // fee (>= 0, 2 decimals max)
  if (values.fee === "" || values.fee === null) e.fee = "Fee is required";
  else {
    const feeStr = String(values.fee);
    if (!/^\d+(\.\d{1,2})?$/.test(feeStr))
      e.fee = "Use up to 2 decimals (e.g., 1200 or 1200.50)";
    else if (Number(feeStr) < 0) e.fee = "Cannot be negative";
  }

  // currency (ISO-like 3 uppercase letters)
  if (!nonEmpty(values.currency)) e.currency = "Currency is required";
  else if (!isUpper3(values.currency))
    e.currency = "Use 3-letter code (e.g., LKR)";

  // status (enum)
  if (!STATUS.includes(String(values.status))) e.status = "Invalid status";

  // dates (optional; if provided must be valid; end >= start)
  const hasStart = nonEmpty(values.startDate);
  const hasEnd = nonEmpty(values.endDate);
  if (hasStart) {
    const d = new Date(values.startDate);
    if (isNaN(d.getTime())) e.startDate = "Invalid date";
  }
  if (hasEnd) {
    const d = new Date(values.endDate);
    if (isNaN(d.getTime())) e.endDate = "Invalid date";
  }
  if (hasStart && hasEnd) {
    const s = new Date(values.startDate).getTime();
    const en = new Date(values.endDate).getTime();
    if (s > en) {
      e.startDate ||= "Start must be before end";
      e.endDate ||= "End must be after start";
    }
  }

  return e;
}

export default function ClassForm({
  fetchClasses,
  editing,
  setEditing,
  onSaved,
}) {
  const [form, setForm] = useState(emptyClass);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [touched, setTouched] = useState({});
  const errors = useMemo(() => validate(form), [form]);
  const hasErrors = Object.keys(errors).length > 0;

  useEffect(() => {
    if (editing) {
      // normalize for inputs
      setForm({
        ...emptyClass,
        ...editing,
        capacity: editing.capacity ?? "",
        fee: editing.fee ?? "",
      });
    } else {
      setForm(emptyClass);
    }
    setTouched({});
    setMsg("");
  }, [editing]);

  const markTouched = (name) => setTouched((t) => ({ ...t, [name]: true }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const sanitizeForSave = (v) => ({
    ...v,
    title: v.title.trim(),
    subject: v.subject.trim(),
    grade: String(v.grade).trim(),
    teacher: v.teacher.trim(),
    schedule: v.schedule.trim(),
    room: v.room.trim(),
    capacity: Number(v.capacity),
    fee: Number(v.fee),
    currency: v.currency.trim().toUpperCase(),
    status: v.status,
    startDate: v.startDate || null,
    endDate: v.endDate || null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      title: true,
      subject: true,
      grade: true,
      teacher: true,
      schedule: true,
      room: true,
      capacity: true,
      fee: true,
      currency: true,
      status: true,
      startDate: true,
      endDate: true,
    });
    if (Object.keys(validate(form)).length > 0) return;

    setSaving(true);
    setMsg("");
    try {
      const payload = sanitizeForSave(form);
      if (editing) {
        await api.put(`/api/classes/${editing.id}`, payload);
        setMsg("✅ Class updated");
        onSaved?.("updated", payload.title);
        setEditing(null);
      } else {
        await api.post("/api/classes", payload);
        setMsg("✅ Class added");
        onSaved?.("created", payload.title);
      }
      setForm(emptyClass);
      fetchClasses();
    } catch (err) {
      setMsg("❌ Save failed: " + (err.response?.data || err.message));
    } finally {
      setSaving(false);
    }
  };

  const show = (name) => touched[name] && errors[name];

  return (
    <form onSubmit={handleSubmit} className="form" noValidate>
      <div className="form-header">
        <h3>{editing ? "Edit Class" : "Add Class"}</h3>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {hasErrors && (
            <span className="error-chip">
              {Object.keys(errors).length} error(s)
            </span>
          )}
          {editing && (
            <button
              type="button"
              className="btn btn-ghost small"
              onClick={() => setEditing(null)}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Title *</span>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            onBlur={() => markTouched("title")}
            aria-invalid={!!show("title")}
            className={show("title") ? "invalid" : ""}
            required
          />
          {show("title") && <div className="error-text">{errors.title}</div>}
        </label>

        <label className="field">
          <span>Subject *</span>
          <input
            name="subject"
            value={form.subject}
            onChange={handleChange}
            onBlur={() => markTouched("subject")}
            aria-invalid={!!show("subject")}
            className={show("subject") ? "invalid" : ""}
            required
          />
          {show("subject") && (
            <div className="error-text">{errors.subject}</div>
          )}
        </label>

        <label className="field">
          <span>Grade *</span>
          <input
            name="grade"
            value={form.grade}
            onChange={handleChange}
            onBlur={() => markTouched("grade")}
            aria-invalid={!!show("grade")}
            className={show("grade") ? "invalid" : ""}
            placeholder="e.g., 10 or A/L"
            required
          />
          {show("grade") && <div className="error-text">{errors.grade}</div>}
        </label>

        <label className="field">
          <span>Teacher *</span>
          <input
            name="teacher"
            value={form.teacher}
            onChange={handleChange}
            onBlur={() => markTouched("teacher")}
            aria-invalid={!!show("teacher")}
            className={show("teacher") ? "invalid" : ""}
            required
          />
          {show("teacher") && (
            <div className="error-text">{errors.teacher}</div>
          )}
        </label>

        <label className="field">
          <span>Schedule *</span>
          <input
            name="schedule"
            value={form.schedule}
            onChange={handleChange}
            onBlur={() => markTouched("schedule")}
            aria-invalid={!!show("schedule")}
            className={show("schedule") ? "invalid" : ""}
            placeholder="e.g., Mon 3–5 PM"
            required
          />
          {show("schedule") && (
            <div className="error-text">{errors.schedule}</div>
          )}
        </label>

        <label className="field">
          <span>Room *</span>
          <input
            name="room"
            value={form.room}
            onChange={handleChange}
            onBlur={() => markTouched("room")}
            aria-invalid={!!show("room")}
            className={show("room") ? "invalid" : ""}
            required
          />
          {show("room") && <div className="error-text">{errors.room}</div>}
        </label>

        <label className="field">
          <span>Capacity *</span>
          <input
            type="number"
            inputMode="numeric"
            name="capacity"
            value={form.capacity}
            onChange={handleChange}
            onBlur={() => markTouched("capacity")}
            aria-invalid={!!show("capacity")}
            className={show("capacity") ? "invalid" : ""}
            placeholder="e.g., 30"
            min="1"
            max="500"
            required
          />
          {show("capacity") && (
            <div className="error-text">{errors.capacity}</div>
          )}
        </label>

        <label className="field">
          <span>Fee (per term) *</span>
          <input
            type="text"
            name="fee"
            value={form.fee}
            onChange={handleChange}
            onBlur={() => markTouched("fee")}
            aria-invalid={!!show("fee")}
            className={show("fee") ? "invalid" : ""}
            placeholder="e.g., 1500 or 1500.50"
            required
          />
          {show("fee") && <div className="error-text">{errors.fee}</div>}
        </label>

        <label className="field">
          <span>Currency *</span>
          <input
            name="currency"
            value={form.currency}
            onChange={handleChange}
            onBlur={() => markTouched("currency")}
            aria-invalid={!!show("currency")}
            className={show("currency") ? "invalid" : ""}
            placeholder="LKR"
            maxLength={3}
            required
          />
          {show("currency") && (
            <div className="error-text">{errors.currency}</div>
          )}
        </label>

        <label className="field">
          <span>Status *</span>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            onBlur={() => markTouched("status")}
            aria-invalid={!!show("status")}
            className={show("status") ? "invalid" : ""}
          >
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          {show("status") && <div className="error-text">{errors.status}</div>}
        </label>

        <label className="field">
          <span>Start Date</span>
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            onBlur={() => markTouched("startDate")}
            aria-invalid={!!show("startDate")}
            className={show("startDate") ? "invalid" : ""}
          />
          {show("startDate") && (
            <div className="error-text">{errors.startDate}</div>
          )}
        </label>

        <label className="field">
          <span>End Date</span>
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
            onBlur={() => markTouched("endDate")}
            aria-invalid={!!show("endDate")}
            className={show("endDate") ? "invalid" : ""}
          />
          {show("endDate") && (
            <div className="error-text">{errors.endDate}</div>
          )}
        </label>
      </div>

      <button
        className="btn btn-primary"
        type="submit"
        disabled={saving || hasErrors}
      >
        {saving ? "Saving…" : editing ? "Update Class" : "Add Class"}
      </button>

      {msg && (
        <div
          className={`alert ${msg.startsWith("❌") ? "error" : ""}`}
          style={{ marginTop: 8 }}
        >
          {msg}
        </div>
      )}
    </form>
  );
}
