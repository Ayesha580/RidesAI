import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import axiosClient from "../api/axiosClient";

const ROLE_LABELS = {
  owner: "Owner",
  manager: "Managers",
  hr: "HR",
  employee: "Employees",
  accountant: "Accountants",
};

function friendlyError(err) {
  const status = err.response?.status;
  if (status === 401 || status === 403) return "Not authorized - login required";
  if (status === 404) return "Endpoint not found (check the URL / trailing slash)";
  if (typeof err.response?.data === "string") {
    // Django ne JSON ke bajaye HTML bheja - wrong URL, auth redirect, ya server error page
    return `Server returned non-JSON response (status ${status ?? "unknown"})`;
  }
  return err.response?.data?.error || err.message || "Failed to load data";
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

      const res = await axiosClient.get("/dashboard/superadmin/companies/");
      const data = Array.isArray(res.data) ? res.data : res.data?.results || [];

      if (isMounted) setCompanies(data);
    } catch (err) {
      if (isMounted) {
        setError(friendlyError(err));
        setCompanies([]);
      }
    } finally {
      if (isMounted) setLoading(false);
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

    try {
      const res = await axiosClient.get(`/dashboard/superadmin/companies/${company.id}/`);
      setDetail(res.data);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleDelete(company) {
    const confirmed = window.confirm(
      `"${company.name}" ko delete karein?\n\n` +
        `Ye company ke SAARE users bhi delete kar dega:\n` +
        `- Owner\n- Managers\n- HR\n- Employees (${company.employee_count})\n\n` +
        `Ye action WAAPIS NAHI ho sakta.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(company.id);
      const res = await axiosClient.delete(`/dashboard/superadmin/companies/${company.id}/`);
      setCompanies((prev) => prev.filter((c) => c.id !== company.id));
      if (expandedId === company.id) {
        setExpandedId(null);
        setDetail(null);
      }
      window.alert(res.data?.message || "Company delete ho gayi.");
    } catch (err) {
      window.alert(`Delete nahi ho saka: ${friendlyError(err)}`);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AdminLayout>
      <div className="dashboard-heading">
        <h2>Businesses</h2>
{/*         <p>Saari registered companies, unke plan aur team hierarchy</p> */}
      </div>

      {error && (
        <div className="dashboard-error">
          Couldn't load businesses — {error}.{" "}
          <button className="retry-btn" onClick={() => loadCompanies()}>
            Retry
          </button>
        </div>
      )}

      <div className="table-panel">
        {loading ? (
          <div className="panel-empty">Loading…</div>
        ) : companies.length === 0 ? (
          <div className="panel-empty">Koi company nahi mili.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Owner</th>
                <th>Plan</th>
                <th>Seats</th>
                <th>Employees</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <>
                  <tr
                    key={company.id}
                    className="table-row-clickable"
                    onClick={() => toggleExpand(company)}
                  >
                    <td className="cell-strong">{company.name}</td>
                    <td>{company.owner ? company.owner.name : "—"}</td>
                    <td>{company.plan || "No plan"}</td>
                    <td>{company.seats}</td>
                    <td>{company.employee_count}</td>
                    <td>
                      <span className={`status-badge status-${company.status}`}>
                        {company.status}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        className="danger-btn"
                        disabled={deletingId === company.id}
                        onClick={() => handleDelete(company)}
                      >
                        {deletingId === company.id ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>

                  {expandedId === company.id && (
                    <tr className="expanded-row">
                      <td colSpan={7}>
                        {detailLoading ? (
                          <div className="panel-empty">Loading team…</div>
                        ) : detail ? (
                          <div className="hierarchy-grid">
                            {Object.entries(ROLE_LABELS).map(([roleKey, label]) => {
                              const members = detail.members?.[roleKey] || [];
                              if (members.length === 0) return null;
                              return (
                                <div className="hierarchy-group" key={roleKey}>
                                  <h5>{label}</h5>
                                  <ul>
                                    {members.map((m) => (
                                      <li key={m.id}>
                                        {m.name}
                                        {m.designation ? ` — ${m.designation}` : ""}
                                        <span className="hierarchy-email">{m.email}</span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="panel-empty">Data load nahi hua.</div>
                        )}
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}