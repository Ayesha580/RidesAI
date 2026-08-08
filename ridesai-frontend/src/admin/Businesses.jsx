import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import axiosClient from "../api/axiosClient";
import "./Businesses.css";

const ROLE_LABELS = {
  owner: "Owners",
  manager: "Managers",
  hr: "HR",
  employee: "Employees",
  accountant: "Accountants",
};

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

export default function Businesses() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [expandedId, setExpandedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let isMounted = true;

    loadCompanies(isMounted);

    return () => {
      isMounted = false;
    };
  }, []);

  async function loadCompanies(isMounted = true) {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosClient.get(
        "/dashboard/superadmin/companies/"
      );

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.results || [];

      if (isMounted) {
        setCompanies(data);
      }
    } catch (err) {
      if (isMounted) {
        setError(friendlyError(err));
        setCompanies([]);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }

  async function toggleExpand(company) {
    if (expandedId === company.id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }

    setExpandedId(company.id);
    setDetail(null);
    setDetailLoading(true);
    setError(null);

    try {
      const res = await axiosClient.get(
        `/dashboard/superadmin/companies/${company.id}/`
      );

      setDetail(res.data);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleDelete(company) {
    const confirmed = window.confirm(
      `"${company.name}" Delete?\n\n` +
        `It delete all the users\n` +
        `- Owner\n` +
        `- Managers\n` +
        `- HR\n` +
        `- Employees (${company.employee_count})\n` +
        `- Accountants\n\n` +
        `- not valid`
    );

    if (!confirmed) return;

    try {
      setDeletingId(company.id);

      const res = await axiosClient.delete(
        `/dashboard/superadmin/companies/${company.id}/`
      );

      setCompanies((prev) =>
        prev.filter((c) => c.id !== company.id)
      );

      if (expandedId === company.id) {
        setExpandedId(null);
        setDetail(null);
      }

      window.alert(
        res.data?.message || "deleted successfully"
      );
    } catch (err) {
      window.alert(
        `not deleted ${friendlyError(err)}`
      );
    } finally {
      setDeletingId(null);
    }
  }

  const totalCompanies = companies.length;

  const activeCompanies = companies.filter(
    (company) => company.status === "active"
  ).length;

  const totalEmployees = companies.reduce(
    (total, company) =>
      total + Number(company.employee_count || 0),
    0
  );

  return (
    <AdminLayout>
      <div className="businesses-page">

        {/* PAGE HEADER */}
        <div className="businesses-header">
          <div>
            <div className="businesses-title-row">
              <div className="businesses-title-icon">
                🏢
              </div>

              <div>
                <h2>Businesses</h2>
                <p>
                  Manage registered businesses, plans and team hierarchy.
                </p>
              </div>
            </div>
          </div>

          <button
            className="businesses-refresh-btn"
            onClick={() => loadCompanies()}
            disabled={loading}
          >
            <span className={loading ? "refresh-spin" : ""}>
              ↻
            </span>
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="businesses-error">
            <div className="businesses-error-icon">
              !
            </div>

            <div className="businesses-error-content">
              <strong>Something went wrong</strong>
              <span>{error}</span>
            </div>

            <button
              className="businesses-retry-btn"
              onClick={() => loadCompanies()}
            >
              Retry
            </button>
          </div>
        )}

        {/* STATS */}
        <div className="businesses-stats">

          <div className="business-stat-card">
            <div className="business-stat-icon purple">
              🏢
            </div>

            <div>
              <span>Total Businesses</span>
              <strong>{totalCompanies}</strong>
            </div>
          </div>

          <div className="business-stat-card">
            <div className="business-stat-icon green">
              ✓
            </div>

            <div>
              <span>Active Businesses</span>
              <strong>{activeCompanies}</strong>
            </div>
          </div>

          <div className="business-stat-card">
            <div className="business-stat-icon blue">
              👥
            </div>

            <div>
              <span>Total Employees</span>
              <strong>{totalEmployees}</strong>
            </div>
          </div>

          <div className="business-stat-card">
            <div className="business-stat-icon orange">
              💳
            </div>

            <div>
              <span>Plans Assigned</span>
              <strong>
                {
                  companies.filter(
                    (company) => company.plan
                  ).length
                }
              </strong>
            </div>
          </div>

        </div>

        {/* TABLE */}
        <div className="businesses-panel">

          <div className="businesses-panel-header">
            <div>
              <h3>Registered Businesses</h3>
              <p>
                Click a business to view its team hierarchy.
              </p>
            </div>

            <div className="businesses-count">
              {companies.length}{" "}
              {companies.length === 1
                ? "Business"
                : "Businesses"}
            </div>
          </div>

          {loading ? (
            <div className="businesses-loading">
              <div className="loading-spinner"></div>
              <span>Loading businesses...</span>
            </div>
          ) : companies.length === 0 ? (
            <div className="businesses-empty">
              <div className="empty-icon">
                🏢
              </div>

              <h4>No businesses found</h4>

              <p>
                Koi registered company available nahi hai.
              </p>

              <button
                className="businesses-refresh-btn"
                onClick={() => loadCompanies()}
              >
                ↻ Refresh
              </button>
            </div>
          ) : (
            <div className="businesses-table-wrapper">

              <table className="businesses-table">

                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Owner</th>
                    <th>Plan</th>
                    <th>Seats</th>
                    <th>Employees</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {companies.map((company) => (
                    <>
                      <tr
                        key={company.id}
                        className={`business-row ${
                          expandedId === company.id
                            ? "expanded"
                            : ""
                        }`}
                        onClick={() =>
                          toggleExpand(company)
                        }
                      >

                        <td data-label="Company">
                          <div className="company-cell">

                            <div className="company-avatar">
                              {company.name
                                ?.charAt(0)
                                ?.toUpperCase() || "C"}
                            </div>

                            <div className="company-info">
                              <strong>
                                {company.name || "Unnamed Company"}
                              </strong>

                              <span>
                                ID #{company.id}
                              </span>
                            </div>

                          </div>
                        </td>

                        <td data-label="Owner">
                          <div className="owner-cell">
                            <span className="owner-name">
                              {company.owner?.name || "—"}
                            </span>
                          </div>
                        </td>

                        <td data-label="Plan">
                          <span className="plan-badge">
                            {company.plan || "No plan"}
                          </span>
                        </td>

                        <td data-label="Seats">
                          <span className="number-value">
                            {company.seats ?? 0}
                          </span>
                        </td>

                        <td data-label="Employees">
                          <span className="number-value">
                            {company.employee_count ?? 0}
                          </span>
                        </td>

                        <td data-label="Status">
                          <span
                            className={`business-status status-${(
                              company.status || "unknown"
                            ).toLowerCase()}`}
                          >
                            <span className="status-dot"></span>
                            {company.status || "Unknown"}
                          </span>
                        </td>

                        <td
                          data-label="Action"
                          className="action-cell"
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                        >
                          <button
                            className="business-delete-btn"
                            disabled={
                              deletingId === company.id
                            }
                            onClick={() =>
                              handleDelete(company)
                            }
                          >
                            {deletingId === company.id ? (
                              <>
                                <span className="button-spinner"></span>
                                Deleting
                              </>
                            ) : (
                              <>
                                <span>🗑</span>
                                Delete
                              </>
                            )}
                          </button>
                        </td>

                      </tr>

                      {/* EXPANDED TEAM */}
                      {expandedId === company.id && (
                        <tr
                          key={`detail-${company.id}`}
                          className="business-expanded-row"
                        >
                          <td colSpan={7}>

                            {detailLoading ? (
                              <div className="team-loading">
                                <div className="loading-spinner"></div>
                                <span>
                                  Loading team hierarchy...
                                </span>
                              </div>
                            ) : detail ? (
                              <div className="team-section">

                                <div className="team-header">
                                  <div>
                                    <h4>
                                      {company.name} — Team
                                    </h4>

                                    <p>
                                      Business staff hierarchy
                                    </p>
                                  </div>

                                  <button
                                    className="close-team-btn"
                                    onClick={() => {
                                      setExpandedId(null);
                                      setDetail(null);
                                    }}
                                  >
                                    ×
                                  </button>
                                </div>

                                <div className="hierarchy-grid">

                                  {Object.entries(
                                    ROLE_LABELS
                                  ).map(
                                    ([roleKey, label]) => {
                                      const members =
                                        detail.members?.[
                                          roleKey
                                        ] || [];

                                      if (
                                        members.length === 0
                                      ) {
                                        return null;
                                      }

                                      return (
                                        <div
                                          className="hierarchy-card"
                                          key={roleKey}
                                        >
                                          <div className="hierarchy-card-header">
                                            <div className={`role-icon ${roleKey}`}>
                                              {roleKey === "owner" && "👑"}
                                              {roleKey === "manager" && "💼"}
                                              {roleKey === "hr" && "👤"}
                                              {roleKey === "employee" && "👥"}
                                              {roleKey === "accountant" && "💰"}
                                            </div>

                                            <div>
                                              <h5>
                                                {label}
                                              </h5>

                                              <span>
                                                {
                                                  members.length
                                                }{" "}
                                                {members.length === 1
                                                  ? "member"
                                                  : "members"}
                                              </span>
                                            </div>
                                          </div>

                                          <ul className="team-members">

                                            {members.map(
                                              (member) => (
                                                <li
                                                  key={
                                                    member.id
                                                  }
                                                >
                                                  <div className="member-avatar">
                                                    {member.name
                                                      ?.charAt(
                                                        0
                                                      )
                                                      ?.toUpperCase() ||
                                                      "U"}
                                                  </div>

                                                  <div className="member-info">
                                                    <strong>
                                                      {
                                                        member.name
                                                      }
                                                    </strong>

                                                    {member.designation && (
                                                      <span>
                                                        {
                                                          member.designation
                                                        }
                                                      </span>
                                                    )}

                                                    <small>
                                                      {
                                                        member.email
                                                      }
                                                    </small>
                                                  </div>
                                                </li>
                                              )
                                            )}

                                          </ul>
                                        </div>
                                      );
                                    }
                                  )}

                                </div>
                              </div>
                            ) : (
                              <div className="team-no-data">
                                Data load nahi hua.
                              </div>
                            )}

                          </td>
                        </tr>
                      )}
                    </>
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