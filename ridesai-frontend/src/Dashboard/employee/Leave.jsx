import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./Leave.css";

export default function Leave() {
  const initialForm = {
  leave_type: "Annual",
  start_date: "",
  end_date: "",
  reason: "",
  attachment: null,
};

const [form, setForm] = useState(initialForm);

const [loading, setLoading] = useState(false);

const [leaves, setLeaves] = useState([]);

const [summary, setSummary] = useState({
  total: 0,
  approved: 0,
  pending: 0,
  rejected: 0,
});
useEffect(() => {
  loadLeaves();
}, []);

const loadLeaves = async () => {
  try {
    const res = await axiosClient.get("/hr/employee/leaves/");

    setLeaves(res.data);

    setSummary({
      total: res.data.length,
      approved: res.data.filter((x) => x.status === "Approved").length,
      pending: res.data.filter((x) => x.status === "Pending").length,
      rejected: res.data.filter((x) => x.status === "Rejected").length,
    });
  } catch (err) {
    console.log(err);
  }
};
  const handleChange = (e) => {
  const { name, value, files } = e.target;

  setForm((prev) => ({
    ...prev,
    [name]: files ? files[0] : value,
  }));
};

  const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);

  try {
    const data = new FormData();

    data.append("leave_type", form.leave_type);
    data.append("start_date", form.start_date);
    data.append("end_date", form.end_date);
    data.append("reason", form.reason);

    if (form.attachment) {
      data.append("attachment", form.attachment);
    }

    const res = await axiosClient.post(
      "/hr/employee/leaves/apply/",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    alert(res.data.message);

    setForm(initialForm);

    loadLeaves();
  } catch (err) {
    alert(err.response?.data?.error || "Unable to apply leave.");
  }

  setLoading(false);
};

  return (
    <div className="leave-page">
      <div className="leave-card">

        <div className="leave-header">
          <h2>Apply for leave</h2>
          <p>
            You can apply 2 paid leaves.
          </p>
        </div>
        <div className="leave-summary">

  <div className="summary-card">
    <h5>Total</h5>
    <h2>{summary.total}</h2>
  </div>

  <div className="summary-card approved">
    <h5>Approved</h5>
    <h2>{summary.approved}</h2>
  </div>

  <div className="summary-card pending">
    <h5>Pending</h5>
    <h2>{summary.pending}</h2>
  </div>

  <div className="summary-card rejected">
    <h5>Rejected</h5>
    <h2>{summary.rejected}</h2>
  </div>

</div>

        <form onSubmit={handleSubmit}>

          {/* Leave Type */}
          <div className="form-section">
            <label className="section-label">LEAVE TYPE</label>

            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="leave_type"
                  value="Annual"
                  checked={form.leave_type === "Annual"}
                  onChange={handleChange}
                />
                <span>Annual</span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="leave_type"
                  value="Sick"
                  checked={form.leave_type === "Sick"}
                  onChange={handleChange}
                />
                <span>Sick</span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="leave_type"
                  value="Casual"
                  checked={form.leave_type === "Casual"}
                  onChange={handleChange}
                />
                <span>Casual</span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="leave_type"
                  value="Emergency"
                  checked={form.leave_type === "Emergency"}
                  onChange={handleChange}
                />
                <span>Emergency</span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="leave_type"
                  value="Unpaid"
                  checked={form.leave_type === "Unpaid"}
                  onChange={handleChange}
                />
                <span>Unpaid</span>
              </label>
            </div>
          </div>

          {/* Dates */}
          <div className="date-grid">

            <div className="form-group">
              <label className="section-label">FROM</label>

              <div className="date-input">
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="section-label">TO</label>

              <div className="date-input">
                <input
                  type="date"
                  name="end_date"
                  value={form.end_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

          </div>


          {/* Reason */}
          <div className="form-section">
            <label className="section-label">REASON</label>

            <textarea
              name="reason"
              rows="5"
              value={form.reason}
              onChange={handleChange}
              placeholder="Type the leave reason..."
              required
            />
          </div>

          {/* Attachment */}
          <div className="form-section">
            <label className="section-label">
              ATTACHMENT <span>(OPTIONAL)</span>
            </label>

            <input
              className="file-input"
              type="file"
              name="attachment"
              onChange={handleChange}
            />
          </div>

          {/* Buttons */}
          <div className="form-actions">
            <button
              type="submit"
              className="apply-btn"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Apply Leave"}
            </button>

            <button
              type="button"
              className="cancel-btn"
              onClick={() =>
                setForm({
                  leave_type: "Annual",
                  start_date: "",
                  end_date: "",
                  reason: "",
                  attachment: null,
                  notify: "",
                })
              }
            >
              Cancel
            </button>
          </div>

        </form>
        <div className="leave-history">

  <h3>My Leave History</h3>

  <table>

    <thead>

      <tr>

        <th>Type</th>
        <th>From</th>
        <th>To</th>
        <th>Total Days</th>
        <th>Status</th>
        <th>HR Comment</th>

      </tr>

    </thead>

    <tbody>

      {leaves.length > 0 ? (

        leaves.map((leave) => (

          <tr key={leave.id}>

            <td>{leave.leave_type}</td>

            <td>{leave.start_date}</td>

            <td>{leave.end_date}</td>

            <td>{leave.total_days}</td>

            <td>

              <span className={`status ${leave.status.toLowerCase()}`}>
                {leave.status}
              </span>

            </td>

            <td>{leave.hr_comment || "-"}</td>

          </tr>

        ))

      ) : (

        <tr>

          <td colSpan="6" className="empty">

            No leave applications yet.

          </td>

        </tr>

      )}

    </tbody>

  </table>

</div>
      </div>
    </div>
  );
}