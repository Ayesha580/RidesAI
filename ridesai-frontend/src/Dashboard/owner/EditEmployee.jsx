import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./EditEmployee.css";

export default function EditEmployee() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    custom_role: "",
    department: "",
    salary: "",
    joining_date: "",
    employment_type: "Full Time",
    gender: "",
    manager: "",
  });

  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    axiosClient
      .get("/hr/managers/list/")
      .then((res) => setManagers(res.data))
      .catch((err) => console.log(err));

    axiosClient
      .get(`/hr/employees/${id}/edit/`)
      .then((res) => {
        const d = res.data;
        setForm({
          first_name: d.first_name || "",
          last_name: d.last_name || "",
          email: d.email || "",
          custom_role: d.custom_role || "",
          department: d.department || "",
          salary: d.salary ?? "",
          joining_date: d.joining_date || "",
          employment_type: d.employment_type || "Full Time",
          gender: d.gender || "",
          manager: d.manager || "",
        });
      })
      .catch((err) => {
        console.log(err);
        alert(err.response?.data?.error || "Unable to load employee details.");
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
      await axiosClient.put(`/hr/employees/${id}/edit/`, form);
      alert("✅ Employee Updated Successfully");
      navigate("/owner/employees");
    } catch (err) {
      const data = err.response?.data;
      const errorMsg =
        (data && (data.error || Object.values(data)[0])) ||
        "Unable to update Employee. Please try again.";
      alert(errorMsg);
    }

    setLoading(false);
  }

  if (fetching) {
    return (
      <div className="editemp_card">
        <p className="editemp_loading">Loading Employee...</p>
      </div>
    );
  }

  return (
    <div className="editemp_card">
      <h2 className="editemp_title">✏️ Edit Employee</h2>
      <p className="editemp_subtitle">Update this employee's details.</p>

      <form onSubmit={handleSubmit}>
        <div className="editemp_grid">
          <Input label="First Name" name="first_name" value={form.first_name} onChange={handleChange} />
          <Input label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} />
          <Input label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} />
          <Input label="Custom Role" name="custom_role" value={form.custom_role} onChange={handleChange} required={false} />
          <Input label="Department" name="department" value={form.department} onChange={handleChange} required={false} />
          <Input label="Salary" name="salary" type="number" value={form.salary} onChange={handleChange} required={false} />
          <Input label="Joining Date" name="joining_date" type="date" value={form.joining_date} onChange={handleChange} required={false} />

          <div className="editemp_field">
            <label className="editemp_label">Employment Type</label>
            <select name="employment_type" value={form.employment_type} onChange={handleChange} className="editemp_select">
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          <div className="editemp_field">
            <label className="editemp_label">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="editemp_select">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="editemp_field">
            <label className="editemp_label">Manager</label>
            <select name="manager" value={form.manager} onChange={handleChange} className="editemp_select">
              <option value="">Not Assigned</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="editemp_actions">
          <button type="button" onClick={() => navigate("/owner/employees")} className="editemp_btn-cancel">
            Cancel
          </button>

          <button type="submit" className="editemp_btn-submit" disabled={loading}>
            {loading ? "Updating..." : "Update Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text", required = true }) {
  return (
    <div className="editemp_field">
      <label className="editemp_label">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="editemp_input"
      />
    </div>
  );
}