import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import axiosClient from "../api/axiosClient";
import {
  FaUsers,
  FaUserTie,
  FaUserShield,
  FaBuilding,
  FaTasks,
  FaUserCog,
  FaClipboardList,
} from "react-icons/fa";

import { MdManageAccounts } from "react-icons/md";
import { RiUserStarFill } from "react-icons/ri";
const CARD_META = [
  {
    key: "total_users",
    title: "Total Users",
    icon: <FaUsers />,
    accent: "#9F22F9",
  },
  {
    key: "total_owners",
    title: "Owners",
    icon: <RiUserStarFill />,
    accent: "#7B1FA2",
  },
  {
    key: "total_managers",
    title: "Managers",
    icon: <MdManageAccounts />,
    accent: "#1976D2",
  },
  {
    key: "total_hr",
    title: "HR",
    icon: <FaUserShield />,
    accent: "#5C6BC0",
  },
  {
    key: "total_employees",
    title: "Employees",
    icon: <FaUserTie />,
    accent: "#E4572E",
  },
  {
    key: "total_accountants",
    title: "Accountants",
    icon: <FaUserCog />,
    accent: "#00897B",
  },
  {
    key: "total_companies",
    title: "Companies",
    icon: <FaBuilding />,
    accent: "#22B8CF",
  },
  {
    key: "total_leads",
    title: "Leads",
    icon: <FaClipboardList />,
    accent: "#2ECC71",
  },
  {
    key: "total_tasks",
    title: "Tasks",
    icon: <FaTasks />,
    accent: "#5C6BC0",
  },
];


export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchStats() {
  try {
    setLoading(true);
    setError(null);

    const res = await axiosClient.get("/dashboard/admin/");

    if (isMounted) {
      setData(res.data);
    }
  } catch (err) {
    setError(
      err.response?.data?.detail ||
      err.response?.data?.message ||
      err.message ||
      "Failed to load dashboard data"
    );
  } finally {
    if (isMounted) {
      setLoading(false);
    }
  }
}

    fetchStats();
    return () => {
      isMounted = false;
    };
  }, []);

  const stats = data?.stats || {};
  const recentCompanies = data?.recent_companies || [];
  const recentLeads = data?.recent_leads || [];

  function formatValue(rawValue) {
    if (rawValue === undefined || rawValue === null) return "—";
    if (typeof rawValue === "number") return rawValue.toLocaleString();
    return rawValue;
  }

  return (
    <AdminLayout>
      <div className="dashboard-heading">
        <h2>Dashboard Overview</h2>
        <p>Real-time snapshot of your platform activity</p>
      </div>

      {error && (
        <div className="dashboard-error">
          Couldn't load dashboard data — {error}.{" "}
          <button className="retry-btn" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}

      <div className="cards">
        {loading
          ? CARD_META.map((meta) => (
              <div className="card card-skeleton" key={meta.key}>
                <div className="skeleton-icon" />
                <div className="skeleton-line short" />
                <div className="skeleton-line long" />
              </div>
            ))
          : CARD_META.map((meta) => (
              <div className="card" key={meta.key}>
                <div
                  className="card-icon"
                  style={{
                    background: `${meta.accent}1A`,
                    color: meta.accent,
                  }}
                >
                  {meta.icon}
                </div>
                <h4>{meta.title}</h4>
                <h1>{formatValue(stats[meta.key])}</h1>
              </div>
            ))}
      </div>

      <div className="panels">
        <div className="panel">
          <div className="panel-header">
            <h3>Recent Companies</h3>
          </div>
          {loading ? (
            <div className="panel-empty">Loading…</div>
          ) : recentCompanies.length === 0 ? (
            <div className="panel-empty">No companies yet.</div>
          ) : (
            <ul className="panel-list">
              {recentCompanies.map((company) => (
                <li key={company.id}>
                  <span className="panel-list-avatar">{company.name?.charAt(0) || "?"}</span>
                  {company.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <h3>Recent Leads</h3>
          </div>
          {loading ? (
            <div className="panel-empty">Loading…</div>
          ) : recentLeads.length === 0 ? (
            <div className="panel-empty">No leads yet.</div>
          ) : (
            <ul className="panel-list">
              {recentLeads.map((lead) => (
                <li key={lead.id}>
                  <span className="panel-list-avatar">{lead.name?.charAt(0) || "?"}</span>
                  {lead.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}