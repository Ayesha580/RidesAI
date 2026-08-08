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
    designation: "",
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
      const errorMsg = err.response?.data?.error || "Unable to create Manager. Please try again.";
      alert(errorMsg);
    }

    setLoading(false);
  }

  return (
    <div className="addmgr_card">
      <h2 className="addmgr_title">👨‍💼 Create Manager Account</h2>
      <p className="addmgr_subtitle">Create a new Manager account for your organization.</p>

      <form onSubmit={handleSubmit}>
        <div className="addmgr_grid">
          <Input label="First Name" name="first_name" value={form.first_name} onChange={handleChange} />
          <Input label="Last Name" name="last_name" value={form.last_name} onChange={handleChange} />
          <Input label="Username" name="username" value={form.username} onChange={handleChange} />
          <Input label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} />
          <Input label="Age" name="age" value={form.age} onChange={handleChange} />

          <div className="addmgr_field">
            <label className="addmgr_label">Designation</label>
            <select
              name="designation"
              value={form.designation}
              onChange={handleChange}
              required
              className="addmgr_select"
            >
              <option value="">Select Designation</option>
              <option value="Sales Manager">Sales Manager</option>
              <option value="Frontend Manager">Frontend Manager</option>
              <option value="Backend Manager">Backend Manager</option>
              <option value="MERN Stack Manager">MERN Stack Manager</option>
              <option value="App Development Manager">App Development Manager</option>
              <option value="UI/UX Manager">UI/UX Manager</option>
              <option value="QA Manager">QA Manager</option>
              <option value="DevOps Manager">DevOps Manager</option>
            </select>
          </div>

          <div className="addmgr_full-span">
            <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} />
          </div>
        </div>

        <div className="addmgr_actions">
          <button type="button" onClick={() => navigate("/owner/hr")} className="addmgr_btn-cancel">
            Cancel
          </button>

          <button type="submit" className="addmgr_btn-submit" disabled={loading}>
            {loading ? "Creating..." : "Create Manager"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div className="addmgr_field">
      <label className="addmgr_label">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        className="addmgr_input"
      />
    </div>
  );
}