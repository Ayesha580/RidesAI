import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./AddManager.css";

export default function EditManager() {
  const navigate = useNavigate();
  const { id } = useParams();

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
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    axiosClient
      .get("/hr/managers/list/")
      .then((res) => {
        const manager = res.data.find(
          (m) => String(m.id) === String(id)
        );

        if (manager) {
          const [first_name = "", ...rest] = (
            manager.name || ""
          ).split(" ");

          setForm({
            first_name,
            last_name: rest.join(" "),
            age: manager.age || "",
            username: manager.username || "",
            email: manager.email || "",
            custom_role: manager.custom_role || "",
            department: manager.department || "",
            joining_date: manager.joining_date || "",
            salary: manager.salary || "",
          });
        }
      })
      .catch((err) => {
        console.error("Error loading manager:", err);
      })
      .finally(() => {
        setFetching(false);
      });
  }, [id]);

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
      const updateData = {
        ...form,
      };

      // Don't send empty joining date
      if (!updateData.joining_date) {
        delete updateData.joining_date;
      }

      await axiosClient.put(
        `/hr/managers/${id}/update/`,
        updateData
      );

      alert("✅ Manager Updated Successfully");
      navigate("/owner/managers");
    } catch (err) {
      const data = err.response?.data;

      const errorMsg =
        (data &&
          (data.error ||
            Object.values(data)[0])) ||
        "Unable to update Manager. Please try again.";

      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  if (fetching) {
    return <h2>Loading Manager...</h2>;
  }

  return (
    <div className="addmgr_card">
      <h2 className="addmgr_title">
        ✏️ Edit Manager
      </h2>

      <p className="addmgr_subtitle">
        Update this manager's details.
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
            required={false}
          />

          <Input
            label="Joining Date"
            name="joining_date"
            type="date"
            value={form.joining_date}
            onChange={handleChange}
            required={false}
          />

          <Input
            label="Salary"
            name="salary"
            type="number"
            value={form.salary}
            onChange={handleChange}
            required={false}
          />

          <div className="addmgr_field">
            <label className="addmgr_label">
              Role
            </label>

            <input
              type="text"
              name="custom_role"
              value={form.custom_role}
              onChange={handleChange}
              placeholder="e.g. Team Lead, Senior Manager"
              className="addmgr_input"
            />
          </div>

        </div>

        <div className="addmgr_actions">
          <button
            type="button"
            onClick={() =>
              navigate("/owner/managers")
            }
            className="addmgr_btn-cancel"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="addmgr_btn-submit"
            disabled={loading}
          >
            {loading
              ? "Updating..."
              : "Update Manager"}
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
      <label className="addmgr_label">
        {label}
      </label>

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
