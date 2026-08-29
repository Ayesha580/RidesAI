import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import "./HRDashboard.css";

export default function AddEmployee({ onSuccess }) {
  const initialForm = {
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    age: "",
    custom_role: "",
    department: "",
    salary: "",
    joining_date: "",
    employment_type: "Full Time",
    gender: "",
    manager: "",
  };

  const [form, setForm] = useState(initialForm);
  const [managers, setManagers] = useState([]);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axiosClient
      .get("/hr/managers/list/")
      .then((res) => {
        setManagers(res.data);
      })
      .catch((err) => {
        console.error("Managers fetch failed:", err);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setErrors({});

    try {
      const payload = {
        ...form,
        age: Number(form.age),
        salary: Number(form.salary),
        manager: form.manager || "",
      };

      const res = await axiosClient.post(
        "/hr/employees/add/api/",
        payload
      );

      onSuccess?.(res.data);
      setForm(initialForm);
    } catch (err) {
      console.error("Employee creation failed:", err);

      if (err.response?.data) {
        setErrors(err.response.data);
      } else {
        setErrors({
          error: "Failed to create employee.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="employee-form-container">
      <div className="form-title">
        <h2>Add New Employee</h2>
        <p>Fill in the employee information below.</p>
      </div>

      {errors.error && (
        <div className="employee-error-banner">
          {errors.error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-grid">

          <div className="form-group">
            <label>First Name</label>
            <input
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              placeholder="John"
              required
            />
            {errors.first_name && (
              <small>{errors.first_name}</small>
            )}
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              placeholder="Smith"
              required
            />
            {errors.last_name && (
              <small>{errors.last_name}</small>
            )}
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="johnsmith"
              required
            />
            {errors.username && (
              <small>{errors.username}</small>
            )}
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
              required
            />
            {errors.email && (
              <small>{errors.email}</small>
            )}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
            {errors.password && (
              <small>{errors.password}</small>
            )}
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="03001234567"
              required
            />
            {errors.phone && (
              <small>{errors.phone}</small>
            )}
          </div>

          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              name="age"
              min="18"
              max="100"
              value={form.age}
              onChange={handleChange}
              placeholder="25"
              required
            />
            {errors.age && (
              <small>{errors.age}</small>
            )}
          </div>

          <div className="form-group">
            <label>Role</label>
            <input
              type="text"
              name="custom_role"
              value={form.custom_role}
              onChange={handleChange}
              placeholder="Frontend Developer"
              required
            />
            {errors.custom_role && (
              <small>{errors.custom_role}</small>
            )}
          </div>

          <div className="form-group">
            <label>Department</label>
            <input
              type="text"
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="Software Engineering"
              required
            />
            {errors.department && (
              <small>{errors.department}</small>
            )}
          </div>

          <div className="form-group">
            <label>Salary</label>
            <input
              type="number"
              name="salary"
              min="0"
              value={form.salary}
              onChange={handleChange}
              placeholder="90000"
              required
            />
            {errors.salary && (
              <small>{errors.salary}</small>
            )}
          </div>

          <div className="form-group">
            <label>Joining Date</label>
            <input
              type="date"
              name="joining_date"
              value={form.joining_date}
              onChange={handleChange}
              required
            />
            {errors.joining_date && (
              <small>{errors.joining_date}</small>
            )}
          </div>

          <div className="form-group">
            <label>Employment Type</label>
            <select
              name="employment_type"
              value={form.employment_type}
              onChange={handleChange}
              required
            >
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Contract">Contract</option>
            </select>
            {errors.employment_type && (
              <small>{errors.employment_type}</small>
            )}
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select
              name="gender"
              value={form.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            {errors.gender && (
              <small>{errors.gender}</small>
            )}
          </div>

          <div className="form-group">
            <label>Manager</label>
            <select
              name="manager"
              value={form.manager}
              onChange={handleChange}
            >
              <option value="">Not Assigned</option>

              {managers.map((manager) => (
                <option
                  key={manager.id}
                  value={manager.id}
                >
                  {manager.name || manager.username}
                  {manager.custom_role
                    ? ` - ${manager.custom_role}`
                    : ""}
                </option>
              ))}
            </select>

            {errors.manager && (
              <small>{errors.manager}</small>
            )}
          </div>

        </div>

        <button
          type="submit"
          disabled={submitting}
          className="submit-btn"
        >
          {submitting
            ? "Creating Employee..."
            : "Add Employee"}
        </button>
      </form>
    </div>
  );
}