import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./AddManager.css";

export default function AddManager() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    age: "",
    username: "",
    email: "",
    custom_role: "",
    department: "",
    joining_date: "",
    salary: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      await axiosClient.post("/hr/managers/", form);

      alert("✅ Manager Created Successfully");
      navigate("/owner/managers");
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        "Unable to create Manager. Please try again.";

      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="addmgr_card">
      <h2 className="addmgr_title">👨‍💼 Create Manager Account</h2>

      <p className="addmgr_subtitle">
        Create a new Manager account for your organization.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="addmgr_grid">

          <Input
            label="First Name"
            name="first_name"
            value={form.first_name}
            onChange={handleChange}
            required
          />

          <Input
            label="Last Name"
            name="last_name"
            value={form.last_name}
            onChange={handleChange}
            required
          />

          <Input
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />

          <Input
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <Input
            label="Age"
            name="age"
            type="number"
            value={form.age}
            onChange={handleChange}
            required
          />

          <Input
            label="Department"
            name="department"
            value={form.department}
            onChange={handleChange}
            required
          />

          <Input
            label="Joining Date"
            name="joining_date"
            type="date"
            value={form.joining_date}
            onChange={handleChange}
            required
          />

          <Input
            label="Salary"
            name="salary"
            type="number"
            value={form.salary}
            onChange={handleChange}
            required
          />

          <div className="addmgr_field">
            <label className="addmgr_label">Role</label>

            <input
              type="text"
              name="custom_role"
              value={form.custom_role}
              onChange={handleChange}
              placeholder="e.g. Team Lead, Senior Manager"
              className="addmgr_input"
            />
          </div>

          <div className="addmgr_full-span">
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

        </div>

        <div className="addmgr_actions">
          <button
            type="button"
            onClick={() => navigate("/owner/hr")}
            className="addmgr_btn-cancel"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="addmgr_btn-submit"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Manager"}
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
  required = false,
}) {
  return (
    <div className="addmgr_field">
      <label className="addmgr_label">{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="addmgr_input"
      />
    </div>
  );
}
