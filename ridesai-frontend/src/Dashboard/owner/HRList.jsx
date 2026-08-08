import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { Link } from "react-router-dom";
import "./HRList.css";

export default function HRList() {
  const [hrs, setHrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadHRs();
  }, []);

  async function loadHRs() {
    try {
      const res = await axiosClient.get("/hr/hr-list/");
      setHrs(res.data);
    } catch (err) {
      console.log(err);
      setHrs([]);
    }
    setLoading(false);
  }

  async function handleDelete(id, name) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await axiosClient.delete(`/hr/${id}/delete/`);
      setHrs((prev) => prev.filter((hr) => hr.id !== id));
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.error || "Failed to delete HR.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <h2>Loading HR List...</h2>;

  return (
    <div className="hrlist_panel">
      <div className="hrlist_header">
        <h2>HR List</h2>
        <Link to="/owner/hr/create" className="hrlist_add-btn">
          + Create HR
        </Link>
      </div>

      <div className="hrlist_table-wrap">
        <table className="hrlist_table">
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Designation</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {hrs.length === 0 ? (
              <tr>
                <td colSpan="6" className="hrlist_empty">No HR Found</td>
              </tr>
            ) : (
              hrs.map((hr, index) => (
                <tr key={hr.id}>
                  <td>{index + 1}</td>
                  <td>{hr.name}</td>
                  <td>{hr.username}</td>
                  <td>{hr.email}</td>
                  <td>{hr.designation}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(hr.id, hr.name)}
                      disabled={deletingId === hr.id}
                      className="hrlist_delete-btn"
                    >
                      {deletingId === hr.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}