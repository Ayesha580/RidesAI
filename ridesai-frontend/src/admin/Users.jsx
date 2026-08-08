import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import axiosClient from "../api/axiosClient";
import "./Users.css";

function friendlyError(err) {
  const status = err.response?.status;

  if (status === 401 || status === 403) {
    return "Not authorized - login required";
  }

  if (status === 404) {
    return "Endpoint not found (check the URL / trailing slash)";
  }

  if (typeof err.response?.data === "string") {
    return `Server returned non-JSON response (status ${
      status ?? "unknown"
    })`;
  }

  return (
    err.response?.data?.error ||
    err.message ||
    "Failed to load data"
  );
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

      const res = await axiosClient.get(
        "/dashboard/superadmin/users/"
      );

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.results || [];

      if (isMounted) {
        setUsers(data);
      }
    } catch (err) {
      if (isMounted) {
        setError(friendlyError(err));
        setUsers([]);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }

  async function handleDelete(user) {
    const confirmed = window.confirm(
      `Delete "${user.name}" (${user.role})?\n\n` +
        `This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setDeletingId(user.id);

      const res = await axiosClient.delete(
        `/dashboard/superadmin/users/${user.id}/`
      );

      setUsers((prev) =>
        prev.filter((u) => u.id !== user.id)
      );

      window.alert(
        res.data?.message ||
          "User deleted successfully."
      );
    } catch (err) {
      window.alert(
        `Unable to delete user: ${friendlyError(err)}`
      );
    } finally {
      setDeletingId(null);
    }
  }

  const roles = useMemo(() => {
    const unique = new Set(
      users
        .map((u) => u.role_key)
        .filter(Boolean)
    );

    return ["all", ...Array.from(unique)];
  }, [users]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((u) => {
      const name = (u.name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const company = (u.company || "").toLowerCase();

      const matchesSearch =
        !query ||
        name.includes(query) ||
        email.includes(query) ||
        company.includes(query);

      const matchesRole =
        roleFilter === "all" ||
        u.role_key === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (u) => u.is_active
  ).length;

  const inactiveUsers = users.filter(
    (u) => !u.is_active
  ).length;

  const superAdmins = users.filter(
    (u) => u.role_key === "superadmin"
  ).length;

  return (
    <AdminLayout>
      <div className="users-page">

        {/* PAGE HEADER */}
        <div className="users-header">

          <div className="users-title-row">

            <div className="users-title-icon">
              👥
            </div>

            <div>
              <h2>Users</h2>

              <p>
                Manage all users across registered businesses.
              </p>
            </div>

          </div>

          <button
            className="users-refresh-btn"
            onClick={() => loadUsers()}
            disabled={loading}
          >
            <span
              className={
                loading ? "users-refresh-spin" : ""
              }
            >
              ↻
            </span>

            {loading ? "Refreshing..." : "Refresh"}
          </button>

        </div>


        {/* ERROR */}
        {error && (
          <div className="users-error">

            <div className="users-error-icon">
              !
            </div>

            <div className="users-error-content">
              <strong>Something went wrong</strong>
              <span>{error}</span>
            </div>

            <button
              className="users-retry-btn"
              onClick={() => loadUsers()}
            >
              Retry
            </button>

          </div>
        )}


        {/* STAT CARDS */}
        <div className="users-stats">

          <div className="users-stat-card">

            <div className="users-stat-icon purple">
              👥
            </div>

            <div>
              <span>Total Users</span>
              <strong>{totalUsers}</strong>
            </div>

          </div>


          <div className="users-stat-card">

            <div className="users-stat-icon green">
              ✓
            </div>

            <div>
              <span>Active Users</span>
              <strong>{activeUsers}</strong>
            </div>

          </div>


          <div className="users-stat-card">

            <div className="users-stat-icon orange">
              !
            </div>

            <div>
              <span>Inactive Users</span>
              <strong>{inactiveUsers}</strong>
            </div>

          </div>


          <div className="users-stat-card">

            <div className="users-stat-icon blue">
              🛡
            </div>

            <div>
              <span>Super Admins</span>
              <strong>{superAdmins}</strong>
            </div>

          </div>

        </div>


        {/* MAIN PANEL */}
        <div className="users-panel">

          {/* PANEL HEADER */}
          <div className="users-panel-header">

            <div>
              <h3>All Users</h3>

              <p>
                Search, filter, and manage system users.
              </p>
            </div>

            <div className="users-count">
              {filtered.length}{" "}
              {filtered.length === 1
                ? "User"
                : "Users"}
            </div>

          </div>


          {/* TOOLBAR */}
          <div className="users-toolbar">

            <div className="users-search-wrapper">

              <span className="users-search-icon">
                🔍
              </span>

              <input
                className="users-search"
                type="text"
                placeholder="Search name, email, or company..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              {search && (
                <button
                  className="users-clear-search"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}

            </div>


            <div className="users-filter-wrapper">

              <span className="users-filter-label">
                Role
              </span>

              <select
                className="users-role-select"
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value)
                }
              >
                {roles.map((role) => (
                  <option
                    key={role}
                    value={role}
                  >
                    {role === "all"
                      ? "All roles"
                      : role}
                  </option>
                ))}
              </select>

            </div>

          </div>


          {/* TABLE CONTENT */}
          {loading ? (
            <div className="users-loading">

              <div className="users-loading-spinner"></div>

              <span>
                Loading users...
              </span>

            </div>
          ) : filtered.length === 0 ? (
            <div className="users-empty">

              <div className="users-empty-icon">
                👥
              </div>

              <h4>No users found</h4>

              <p>
                Try changing your search or role filter.
              </p>

              {(search || roleFilter !== "all") && (
                <button
                  className="users-clear-filters"
                  onClick={() => {
                    setSearch("");
                    setRoleFilter("all");
                  }}
                >
                  Clear Filters
                </button>
              )}

            </div>
          ) : (
            <div className="users-table-wrapper">

              <table className="users-table">

                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Company</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>

                  {filtered.map((user) => (
                    <tr key={user.id}>

                      {/* USER */}
                      <td data-label="User">

                        <div className="user-cell">

                          <div className="user-avatar">
                            {user.name
                              ?.charAt(0)
                              ?.toUpperCase() || "U"}
                          </div>

                          <div className="user-info">

                            <strong>
                              {user.name ||
                                "Unnamed User"}
                            </strong>

                            <span>
                              ID #{user.id}
                            </span>

                          </div>

                        </div>

                      </td>


                      {/* EMAIL */}
                      <td data-label="Email">

                        <span className="user-email">
                          {user.email || "—"}
                        </span>

                      </td>


                      {/* ROLE */}
                      <td data-label="Role">

                        <span
                          className={`user-role role-${(
                            user.role_key ||
                            "unknown"
                          ).toLowerCase()}`}
                        >
                          {user.role || "Unknown"}
                        </span>

                      </td>


                      {/* COMPANY */}
                      <td data-label="Company">

                        <span className="user-company">
                          {user.company || "No company"}
                        </span>

                      </td>


                      {/* STATUS */}
                      <td data-label="Status">

                        <span
                          className={`user-status ${
                            user.is_active
                              ? "user-status-active"
                              : "user-status-inactive"
                          }`}
                        >
                          <span className="user-status-dot"></span>

                          {user.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </td>


                      {/* ACTION */}
                      <td
                        data-label="Action"
                        className="users-action-cell"
                      >

                        {user.role_key ===
                        "superadmin" ? (
                          <span className="users-protected">
                            <span>🛡</span>
                            Protected
                          </span>
                        ) : (
                          <button
                            className="users-delete-btn"
                            disabled={
                              deletingId === user.id
                            }
                            onClick={() =>
                              handleDelete(user)
                            }
                          >
                            {deletingId === user.id ? (
                              <>
                                <span className="users-button-spinner"></span>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <span>🗑</span>
                                Delete
                              </>
                            )}
                          </button>
                        )}

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </AdminLayout>
  );
}