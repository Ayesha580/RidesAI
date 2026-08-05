import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import Sidebar from "../Sidebar";

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
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );
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

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />

      <div style={{ flex: 1, padding: "30px" }}>
        {loading ? (
          <h2>Loading Managers...</h2>
        ) : (
          <div className="panel">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2>Manager List</h2>

              <Link
                to="/owner/managers/add"
                style={{
                  background: "#be27ee",
                  color: "#fff",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                + Create Manager
              </Link>
            </div>

            <table>
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
                    <td colSpan="6" style={{ textAlign: "center" }}>
                      No Managers Found
                    </td>
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
                          style={{
                            background: "#ef4444",
                            color: "#fff",
                            border: "none",
                            padding: "6px 14px",
                            borderRadius: "6px",
                            fontWeight: "600",
                            cursor:
                              deletingId === manager.id
                                ? "not-allowed"
                                : "pointer",
                            opacity: deletingId === manager.id ? 0.6 : 1,
                          }}
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
        )}
      </div>
    </div>
  );
}