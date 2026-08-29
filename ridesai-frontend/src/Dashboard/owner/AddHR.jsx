import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./AddHR.css";

export default function AddHR() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    age: "",
    department: "",
    role: "",
    joining_date: "",
    salary: "",
  });

  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setLoading(true);

    try {
      await axiosClient.post("/hr/add-hr/", form);

      alert("✅ HR Created Successfully");
      navigate("/owner/hr");
    } catch (err) {
      alert(
        err.response?.data?.error ||
          "Unable to create HR. Please try again."
      );
    } finally {
      isSubmittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="addhr_card">
      <h2 className="addhr_title">👨‍💼 Create HR Account</h2>

      <p className="addhr_subtitle">
        Create a new HR account for your organization.
      </p>

      <form onSubmit={handleSubmit} className="addhr_form">
        <div className="addhr_grid">

          <Input
            label="Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <Input
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
          />


          <Input
            label="Age"
            name="age"
            type="number"
            value={form.age}
            onChange={handleChange}
          />

          <Input
            label="Department"
            name="department"
            value={form.department}
            onChange={handleChange}
          />

          <Input
            label="Role"
            name="role"
            value={form.role}
            onChange={handleChange}
          />

          <Input
            label="Joining Date"
            name="joining_date"
            type="date"
            value={form.joining_date}
            onChange={handleChange}
          />

          <Input
            label="Salary"
            name="salary"
            type="number"
            value={form.salary}
            onChange={handleChange}
          />
          <Input
          label="Password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
        />

        </div>

        <div className="addhr_actions">
          <button
            type="button"
            onClick={() => navigate("/owner/hr")}
            className="addhr_btn-cancel"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="addhr_btn-submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create HR"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
}) {
  return (
    <div className="addhr_field">
      <label className="addhr_label">
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="addhr_input"
      />
    </div>
  );
}