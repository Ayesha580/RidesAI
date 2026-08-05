import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp"];

export default function Profile() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
    cnic: "",
    business_name: "",
    business_type: "",
    business_address: "",
  });

  const [docUrl, setDocUrl] = useState(null);
  const [docName, setDocName] = useState("");
  const [newDocFile, setNewDocFile] = useState(null);
  const [newDocPreview, setNewDocPreview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const res = await axiosClient.get("/owner/profile/");
      setForm({
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
        username: res.data.username || "",
        email: res.data.email || "",
        phone: res.data.phone || "",
        cnic: res.data.cnic || "",
        business_name: res.data.business_name || "",
        business_type: res.data.business_type || "",
        business_address: res.data.business_address || "",
      });
      setDocUrl(res.data.registration_docs_url);
      setDocName(res.data.registration_docs_name);
    } catch (err) {
      console.log(err);
      setMessage("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNewDocFile(file);

    const ext = file.name.split(".").pop().toLowerCase();
    if (IMAGE_EXTENSIONS.includes(ext)) {
      setNewDocPreview(URL.createObjectURL(file));
    } else {
      setNewDocPreview(null);
    }
  };

  const isImage = (name) => {
    if (!name) return false;
    const ext = name.split(".").pop().toLowerCase();
    return IMAGE_EXTENSIONS.includes(ext);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const payload = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key !== "username") payload.append(key, value);
      });
      if (newDocFile) {
        payload.append("registration_docs", newDocFile);
      }

      await axiosClient.put("/owner/profile/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Profile updated successfully.");
      loadProfile();
      setNewDocFile(null);
      setNewDocPreview(null);
    } catch (err) {
      setMessage(err.response?.data?.error || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-form">
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>First Name</label>
        <input name="first_name" value={form.first_name} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Last Name</label>
        <input name="last_name" value={form.last_name} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Username</label>
        <input name="username" value={form.username} disabled />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>CNIC</label>
        <input name="cnic" value={form.cnic} onChange={handleChange} />
      </div>

      <hr />

      <div className="form-group">
        <label>Business Name</label>
        <input name="business_name" value={form.business_name} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Business Type</label>
        <input name="business_type" value={form.business_type} onChange={handleChange} />
      </div>

      <div className="form-group">
        <label>Business Address</label>
        <input name="business_address" value={form.business_address} onChange={handleChange} />
      </div>

      {/* -------- Registration Document -------- */}
      <div className="form-group">
        <label>Registration Document</label>

        {docUrl && !newDocPreview && (
          <div style={{ marginBottom: "10px" }}>
            {isImage(docName) ? (
              <img
                src={docUrl}
                alt="Registration Document"
                style={{
                  maxWidth: "220px",
                  borderRadius: "8px",
                  display: "block",
                  marginBottom: "8px",
                }}
              />
            ) : (
              <p style={{ marginBottom: "8px" }}>📄 {docName}</p>
            )}

            <a href={docUrl} target="_blank" rel="noopener noreferrer">
              View Current Document
            </a>
          </div>
        )}

        {newDocPreview && (
          <div style={{ marginBottom: "10px" }}>
            <p>New preview:</p>
            <img
              src={newDocPreview}
              alt="New Document Preview"
              style={{ maxWidth: "220px", borderRadius: "8px" }}
            />
          </div>
        )}

        {newDocFile && !newDocPreview && (
          <p style={{ marginBottom: "10px" }}>📄 Selected: {newDocFile.name}</p>
        )}

        {!docUrl && !newDocFile && (
          <p style={{ color: "#888", marginBottom: "10px" }}>
            No document uploaded yet.
          </p>
        )}

        <input type="file" accept="image/*,.pdf" onChange={handleFileChange} />
      </div>

      {message && <p className="form-message">{message}</p>}

      <button type="submit" disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}