import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import axiosClient from "../api/axiosClient";

function friendlyError(err) {
  const status = err.response?.status;
  if (status === 401 || status === 403) return "Not authorized - login required";
  if (status === 404) return "Endpoint not found (check the URL / trailing slash)";
  if (typeof err.response?.data === "string") {
    return `Server returned non-JSON response (status ${status ?? "unknown"})`;
  }
  return err.response?.data?.error || err.message || "Failed to load data";
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let isMounted = true;
    loadUsers(isMounted);
    return () => {
      isMounted = false;
    };
  }, []);

  async function loadUsers(isMounted = true) {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosClient.get("/dashboard/superadmin/users/");
      const data = Array.isArray(res.data) ? res.data : res.data?.results || [];

      if (isMounted) setUsers(data);
    } catch (err) {
      if (isMounted) {
        setError(friendlyError(err));
        setUsers([]);
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  }

  async function handleDelete(user) {
    const confirmed = window.confirm(
      `${user.name} (${user.role}) ko delete karein?\n\nYe action waapis nahi ho sakta.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(user.id);
      const res = await axiosClient.delete(`/dashboard/superadmin/users/${user.id}/`);
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      window.alert(res.data?.message || "User delete ho gaya.");
    } catch (err) {
      window.alert(`Delete nahi ho saka: ${friendlyError(err)}`);
    } finally {
      setDeletingId(null);
    }
  }

  const roles = useMemo(() => {
    const unique = new Set(users.map((u) => u.role_key));
    return ["all", ...Array.from(unique)];
  }, [users]);

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.company || "").toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role_key === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <AdminLayout>
      <div className="dashboard-heading">
        <h2>Users</h2>
{/*         <p>Saari companies ke saare users, ek jagah pe</p> */}
      </div>

      {error && (
        <div className="dashboard-error">
          Couldn't load users — {error}.{" "}
          <button className="retry-btn" onClick={() => loadUsers()}>
            Retry
          </button>
        </div>
      )}

      <div className="table-toolbar">
        <input
          className="header-search"
          style={{ width: 260 }}
          placeholder="Search name, email, company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="role-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          {roles.map((r) => (
            <option key={r} value={r}>
              {r === "all" ? "All roles" : r}
            </option>
          ))}
        </select>
      </div>

      <div className="table-panel">
        {loading ? (
          <div className="panel-empty">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="panel-empty">Koi user nahi mila.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Company</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td className="cell-strong">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.company || "—"}</td>
                  <td>
                    <span className={`status-badge ${u.is_active ? "status-active" : "status-inactive"}`}>
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    {u.role_key === "superadmin" ? (
                      <span className="text-muted">—</span>
                    ) : (
                      <button
                        className="danger-btn"
                        disabled={deletingId === u.id}
                        onClick={() => handleDelete(u)}
                      >
                        {deletingId === u.id ? "Deleting…" : "Delete"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}