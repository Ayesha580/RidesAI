import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./ManagerList.css";

export default function ManagerList() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadManagers();
  }, []);

  async function loadManagers() {
    try {
      const res = await axiosClient.get("/hr/managers/list/");
      setManagers(res.data);
    } catch (err) {
      console.log(err);
      setManagers([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, name) {
    const confirmed = window.confirm(`Are you sure you want to delete "${name}"?`);
    if (!confirmed) return;

    setDeletingId(id);
    try {
      await axiosClient.delete(`/hr/managers/${id}/delete/`);
      setManagers((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.error || "Failed to delete manager.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <h2>Loading Managers...</h2>;

  return (
    <div className="mgrlist_panel">
      <div className="mgrlist_header">
        <h2>Manager List</h2>
        <Link to="/owner/managers/add" className="mgrlist_add-btn">
          + Create Manager
        </Link>
      </div>

      <div className="mgrlist_table-wrap">
        <table className="mgrlist_table">
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
            {managers.length === 0 ? (
              <tr>
                <td colSpan="6" className="mgrlist_empty">No Managers Found</td>
              </tr>
            ) : (
              managers.map((manager, index) => (
                <tr key={manager.id}>
                  <td>{index + 1}</td>
                  <td>{manager.name}</td>
                  <td>{manager.username}</td>
                  <td>{manager.email}</td>
                  <td>{manager.designation || "-"}</td>
                  <td>
                    <button
                      onClick={() => handleDelete(manager.id, manager.name)}
                      disabled={deletingId === manager.id}
                      className="mgrlist_delete-btn"
                    >
                      {deletingId === manager.id ? "Deleting..." : "Delete"}
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