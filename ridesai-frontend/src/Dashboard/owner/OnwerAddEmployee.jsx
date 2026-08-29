import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./OwnerAddEmployee.css";

export default function AddEmployee() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    age: "",
    custom_role: "",
    department: "",
    joining_date: "",
    salary: "",
    employment_type: "Full Time",
    gender: "",
    manager: "",
  });

  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axiosClient
      .get("/hr/managers/list/")
      .then((res) => setManagers(res.data))
      .catch((err) => console.log(err));
  }, []);

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
      await axiosClient.post("/hr/employees/add/api/", form);
      alert("✅ Employee Added Successfully");
      navigate("/owner/employees");
    } catch (err) {
      const data = err.response?.data;
      const errorMsg =
        (data && (data.error || Object.values(data)[0])) ||
        "Unable to add Employee. Please try again.";
      alert(errorMsg);
    }

    setLoading(false);
  }

  return (
    <div className="addemp_card">
      <h2 className="addemp_title">👤 Add Employee</h2>
      <p className="addemp_subtitle">Create a new Employee account for your organization.</p>

      <form onSubmit={handleSubmit}>
        <div className="addemp_grid">
          <Input label="First Name" name="first_name" value={form.first_name} onChange={handleChange} />
          <Input label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} />
          <Input label="Username" name="username" value={form.username} onChange={handleChange} />
          <Input label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} />
          <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} />
          <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} />
          <Input label="Age" name="age" value={form.age} onChange={handleChange} />
          <Input label="Role" name="custom_role" value={form.custom_role} onChange={handleChange} />
          <Input label="Department" name="department" value={form.department} onChange={handleChange} />
          <Input label="Salary" name="salary" type="number" value={form.salary} onChange={handleChange} />
          <Input label="Joining Date" name="joining_date" type="date" value={form.joining_date} onChange={handleChange} />

          <div className="addemp_field">
            <label className="addemp_label">Employment Type</label>
            <select name="employment_type" value={form.employment_type} onChange={handleChange} className="addemp_select">
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
              <option value="Contract">Contract</option>
            </select>
          </div>

          <div className="addemp_field">
            <label className="addemp_label">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="addemp_select">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div className="addemp_field">
            <label className="addemp_label">Manager</label>
            <select name="manager" value={form.manager} onChange={handleChange} className="addemp_select">
              <option value="">Not Assigned</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="addemp_actions">
          <button type="button" onClick={() => navigate("/owner/employees")} className="addemp_btn-cancel">
            Cancel
          </button>

          <button type="submit" className="addemp_btn-submit" disabled={loading}>
            {loading ? "Adding..." : "Add Employee"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div className="addemp_field">
      <label className="addemp_label">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="addemp_input"
      />
    </div>
  );
}