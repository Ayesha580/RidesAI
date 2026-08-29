import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./ManagerList.css";

export default function ManagerList() {
  const navigate = useNavigate();

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
      console.error("Error loading managers:", err);
      setManagers([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id, name) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      await axiosClient.delete(`/hr/managers/${id}/delete/`);

      setManagers((prev) =>
        prev.filter((manager) => manager.id !== id)
      );

      alert("✅ Manager deleted successfully.");
    } catch (err) {
      console.error("Delete error:", err);

      alert(
        err.response?.data?.error ||
          "Failed to delete manager."
      );
    } finally {
      setDeletingId(null);
    }
  }

  function formatDate(date) {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString();
  }

  if (loading) {
    return <h2>Loading Managers...</h2>;
  }

  return (
    <div className="mgrlist_panel">

      {/* Header */}
      <div className="mgrlist_header">
        <div>
          <h2>Manager List</h2>
          <p className="mgrlist_subtitle">
            Manage your organization's managers.
          </p>
        </div>

        <Link
          to="/owner/managers/add"
          className="mgrlist_add-btn"
        >
          + Create Manager
        </Link>
      </div>

      {/* Table */}
      <div className="mgrlist_table-wrap">
        <table className="mgrlist_table">

          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Age</th>
              <th>Department</th>
              <th>Role</th>
              <th>Joining Date</th>
              <th>Salary</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {managers.length === 0 ? (
              <tr>
                <td
                  colSpan="11"
                  className="mgrlist_empty"
                >
                  No Managers Found
                </td>
              </tr>
            ) : (
              managers.map((manager, index) => (
                <tr key={manager.id}>

                  <td>{index + 1}</td>

                  <td>
                    {manager.name || "-"}
                  </td>

                  <td>
                    {manager.username || "-"}
                  </td>

                  <td>
                    {manager.email || "-"}
                  </td>

                  <td>
                    {manager.age || "-"}
                  </td>

                  <td>
                    {manager.department || "-"}
                  </td>
                  <td>
                    {manager.custom_role || "-"}
                  </td>

                  <td>
                    {formatDate(manager.joining_date)}
                  </td>

                  <td>
                    {manager.salary !== null &&
                    manager.salary !== undefined &&
                    manager.salary !== ""
                      ? manager.salary
                      : "-"}
                  </td>

                  <td>
                    <div
                      className="mgrlist_actions"
                      style={{
                        display: "flex",
                        gap: "8px",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/owner/managers/${manager.id}/edit`
                          )
                        }
                        className="mgrlist_edit-btn"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            manager.id,
                            manager.name
                          )
                        }
                        disabled={
                          deletingId === manager.id
                        }
                        className="mgrlist_delete-btn"
                      >
                        {deletingId === manager.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
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
