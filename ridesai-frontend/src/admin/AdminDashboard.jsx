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

  // ... imports same ...

return (
    <AdminLayout>
      <div className="rideai_admin_dashheading">
        <h2>Dashboard Overview</h2>
        <p>Real-time snapshot of your platform activity</p>
      </div>

      {error && (
        <div className="rideai_admin_error">
          Couldn't load dashboard data — {error}.{" "}
          <button className="rideai_admin_retrybtn" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      )}

      <div className="rideai_admin_cards">
        {loading
          ? CARD_META.map((meta) => (
              <div className="rideai_admin_card rideai_admin_skeleton" key={meta.key}>
                <div className="rideai_admin_skeletonicon" />
                <div className="rideai_admin_skeletonline short" />
                <div className="rideai_admin_skeletonline long" />
              </div>
            ))
          : CARD_META.map((meta) => (
              <div className="rideai_admin_card" key={meta.key}>
                <div
                  className="rideai_admin_cardicon"
                  style={{ background: `${meta.accent}1A`, color: meta.accent }}
                >
                  {meta.icon}
                </div>
                <h4>{meta.title}</h4>
                <h1>{formatValue(stats[meta.key])}</h1>
              </div>
            ))}
      </div>

      <div className="rideai_admin_panels">
        <div className="rideai_admin_panel">
          <div className="rideai_admin_panelheader">
            <h3>Recent Companies</h3>
          </div>
          {loading ? (
            <div className="rideai_admin_panelempty">Loading…</div>
          ) : recentCompanies.length === 0 ? (
            <div className="rideai_admin_panelempty">No companies yet.</div>
          ) : (
            <ul className="rideai_admin_panellist">
              {recentCompanies.map((company) => (
                <li key={company.id}>
                  <span className="rideai_admin_panellistavatar">{company.name?.charAt(0) || "?"}</span>
                  {company.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rideai_admin_panel">
          <div className="rideai_admin_panelheader">
            <h3>Recent Leads</h3>
          </div>
          {loading ? (
            <div className="rideai_admin_panelempty">Loading…</div>
          ) : recentLeads.length === 0 ? (
            <div className="rideai_admin_panelempty">No leads yet.</div>
          ) : (
            <ul className="rideai_admin_panellist">
              {recentLeads.map((lead) => (
                <li key={lead.id}>
                  <span className="rideai_admin_panellistavatar">{lead.name?.charAt(0) || "?"}</span>
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