import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import Sidebar from "../Sidebar";

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
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#f3f4f6",
      }}
    >
      <Sidebar />

      <div
        style={{
          flex: 1,
          padding: "40px",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "40px",
            maxWidth: "1100px",
            margin: "0 auto",
            boxShadow: "0 10px 30px rgba(0,0,0,.08)",
          }}
        >
          <h2
            style={{
              marginBottom: "8px",
              fontSize: "32px",
            }}
          >
            👨‍💼 Create Manager Account
          </h2>

          <p
            style={{
              color: "#6b7280",
              marginBottom: "35px",
            }}
          >
            Create a new Manager account for your organization.
          </p>

          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "25px",
              }}
            >
              <Input
                label="First Name"
                name="first_name"
                value={form.first_name}
                onChange={handleChange}
              />

              <Input
                label="Last Name"
                name="last_name"
                value={form.last_name}
                onChange={handleChange}
              />

              <Input
                label="Username"
                name="username"
                value={form.username}
                onChange={handleChange}
              />

              <Input
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
              />
            <Input
                label="Age"
                name="age"
                value={form.age}
                onChange={handleChange}
            />

            <div>
  <label
    style={{
      display: "block",
      marginBottom: "8px",
      fontWeight: "600",
      color: "#374151",
    }}
  >
    Designation
  </label>

  <select
    name="designation"
    value={form.designation}
    onChange={handleChange}
    required
    style={{
      width: "100%",
      padding: "14px",
      borderRadius: "10px",
      border: "1px solid #d1d5db",
      outline: "none",
      fontSize: "15px",
      background:"#fff",
    }}
  >

    <option value="">
      Select Designation
    </option>

    <option value="Sales Manager">
      Sales Manager
    </option>

    <option value="Frontend Manager">
      Frontend Manager
    </option>

    <option value="Backend Manager">
      Backend Manager
    </option>

    <option value="MERN Stack Manager">
      MERN Stack Manager
    </option>

    <option value="App Development Manager">
      App Development Manager
    </option>

    <option value="UI/UX Manager">
      UI/UX Manager
    </option>

    <option value="QA Manager">
      QA Manager
    </option>

    <option value="DevOps Manager">
      DevOps Manager
    </option>

  </select>

</div>
              <div style={{ gridColumn: "1 / span 2" }}>
                <Input
                  label="Password"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "15px",
                marginTop: "35px",
              }}
            >
              <button
                type="button"
                onClick={() => navigate("/owner/hr")}
                style={cancelButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={submitButton}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Manager"}
              </button>
            </div>
          </form>
        </div>
      </div>
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
    <div>
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          fontWeight: "600",
          color: "#374151",
        }}
      >
        {label}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: "10px",
          border: "1px solid #d1d5db",
          outline: "none",
          fontSize: "15px",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

const submitButton = {
  background: "#be27ee",
  color: "#fff",
  border: "none",
  padding: "14px 28px",
  borderRadius: "10px",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
};

const cancelButton = {
  background: "#e5e7eb",
  color: "#374151",
  border: "none",
  padding: "14px 28px",
  borderRadius: "10px",
  fontSize: "15px",
  fontWeight: "600",
  cursor: "pointer",
};