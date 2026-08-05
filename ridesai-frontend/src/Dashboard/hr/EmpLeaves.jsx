import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./EmpLeave.css";

export default function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCommentBox, setShowCommentBox] = useState(false);
    const [comment, setComment] = useState("");
    const [selectedLeave, setSelectedLeave] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    loadLeaves();
  }, []);

  const loadLeaves = async () => {
    try {
      const res = await axiosClient.get("/hr/leaves/");
      setLeaves(res.data);
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const openCommentBox = (id, status) => {
  setSelectedLeave(id);
  setSelectedStatus(status);
  setComment("");
  setShowCommentBox(true);
};

const submitStatus = async () => {
  try {
    await axiosClient.post(`/hr/leaves/${selectedLeave}/status/`, {
      status: selectedStatus,
      comment,
    });

    setShowCommentBox(false);
    loadLeaves();
  } catch (err) {
    alert(err.response?.data?.error || "Something went wrong");
  }
};

  if (loading) return <h3>Loading...</h3>;

  return (
  <div className="leave-page">

    <div className="leave-header">
      <div>
        <h2>Employee Leave Requests</h2>
        <p>Review and manage employee leave applications.</p>
      </div>
    </div>

    <div className="table-wrapper">
      <table className="leave-table">
        <thead>
          <tr>
            <th>Employee</th>
            <th>Leave Type</th>
            <th>From</th>
            <th>To</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {leaves.length > 0 ? (
            leaves.map((leave) => (
              <tr key={leave.id}>
                <td>{leave.employee_name}</td>
                <td>{leave.leave_type}</td>
                <td>{leave.start_date}</td>
                <td>{leave.end_date}</td>
                <td>{leave.reason}</td>

                <td>
                  <span className={`status ${leave.status.toLowerCase()}`}>
                    {leave.status}
                  </span>
                </td>

                <td>
                  {leave.status === "Pending" ? (
                    <div className="action-btns">
                      <button
                          className="approve"
                          onClick={() => openCommentBox(leave.id, "Approved")}
                        >
                          Approve
                        </button>

                        <button
                          className="reject"
                          onClick={() => openCommentBox(leave.id, "Rejected")}
                        >
                          Reject
                      </button>
                    </div>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="empty">
                No leave requests found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {showCommentBox && (
  <div className="comment-overlay">
    <div className="comment-box">
      <h3>Add Comment</h3>

      <textarea
        placeholder="Write comment (optional)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <div className="comment-actions">
        <button
          className="cancel-btn"
          onClick={() => setShowCommentBox(false)}
        >
          Cancel
        </button>

        <button
          className="submit-btn"
          onClick={submitStatus}
        >
          Submit
        </button>
      </div>
    </div>
  </div>
)}
    </div>

  </div>
);
}