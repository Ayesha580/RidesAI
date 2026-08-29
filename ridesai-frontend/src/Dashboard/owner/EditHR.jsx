import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./EditHR.css";

export default function EditHR() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    age: "",
    department: "",
    role: "",
    joining_date: "",
    salary: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    axiosClient
      .get(`/hr/hr/${id}/edit/`)
      .then((res) => {
        const d = res.data;
        setForm({
          name: d.name || "",
          username: d.username || "",
          email: d.email || "",
          age: d.age ?? "",
          department: d.department || "",
          role: d.role || "",
          joining_date: d.joining_date || "",
          salary: d.salary ?? "",
        });
      })
      .catch((err) => {
        console.log(err);
        alert(err.response?.data?.error || "Unable to load HR details.");
      })
      .finally(() => setFetching(false));
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosClient.put(`/hr/hr/${id}/edit/`, form);
      alert("✅ HR Updated Successfully");
      navigate("/owner/hr");
    } catch (err) {
      const data = err.response?.data;
      const errorMsg =
        (data && (data.error || Object.values(data)[0])) ||
        "Unable to update HR. Please try again.";
      alert(errorMsg);
    }

    setLoading(false);
  }

  if (fetching) {
    return (
      <div className="edithr_card">
        <p className="edithr_loading">Loading HR...</p>
      </div>
    );
  }

  return (
    <div className="edithr_card">
      <h2 className="edithr_title">✏️ Edit HR Account</h2>
      <p className="edithr_subtitle">Update this HR's details.</p>

      <form onSubmit={handleSubmit} className="edithr_form">
        <div className="edithr_grid">
          <Input label="Name" name="name" value={form.name} onChange={handleChange} />
          <Input label="Username" name="username" value={form.username} onChange={handleChange} />
          <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} />
          <Input label="Age" name="age" type="number" value={form.age} onChange={handleChange} required={false} />
          <Input label="Department" name="department" value={form.department} onChange={handleChange} required={false} />
          <Input label="Custom Role" name="role" value={form.role} onChange={handleChange} required={false} />
          <Input label="Joining Date" name="joining_date" type="date" value={form.joining_date} onChange={handleChange} required={false} />
          <Input label="Salary" name="salary" type="number" value={form.salary} onChange={handleChange} required={false} />
        </div>

        <div className="edithr_actions">
          <button
            type="button"
            onClick={() => navigate("/owner/hr")}
            className="edithr_btn-cancel"
            disabled={loading}
          >
            Cancel
          </button>

          <button type="submit" className="edithr_btn-submit" disabled={loading}>
            {loading ? "Updating..." : "Update HR"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text", required = true }) {
  return (
    <div className="edithr_field">
      <label className="edithr_label">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="edithr_input"
      />
    </div>
  );
}