export default function CandidateModal({ form, setForm, onClose, onSubmit, saving }) {
  function handleChange(field, value) {
    setForm({ ...form, [field]: value });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "15px",
          padding: "30px",
          width: "420px",
          maxWidth: "90vw",
          boxShadow: "0 8px 25px rgba(0,0,0,.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: "22px", marginBottom: "20px", color: "#111827" }}>
          Add Candidate
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <input
            placeholder="Full Name"
            value={form.full_name}
            onChange={(e) => handleChange("full_name", e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Designation"
            value={form.designation}
            onChange={(e) => handleChange("designation", e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Department"
            value={form.department}
            onChange={(e) => handleChange("department", e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Salary"
            value={form.salary}
            onChange={(e) => handleChange("salary", e.target.value)}
            style={inputStyle}
          />
          <input
            type="date"
            value={form.joining_date}
            onChange={(e) => handleChange("joining_date", e.target.value)}
            style={inputStyle}
          />
          <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) =>
                setForm({
                  ...form,
                  resume: e.target.files[0],
                })
              }
              style={inputStyle}
            />
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            marginTop: "25px",
          }}
        >
          <button onClick={onClose} style={cancelBtn}>
            Cancel
          </button>
          <button onClick={onSubmit} disabled={saving} style={saveBtn}>
            {saving ? "Saving..." : "Save Candidate"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  padding: "10px 12px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  fontSize: "14px",
};

const cancelBtn = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  background: "#f1f5f9",
  color: "#334155",
  cursor: "pointer",
};

const saveBtn = {
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  background: "#FF77FF",
  color: "#000",
  cursor: "pointer",
};