import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./HRDashboard.css";
import Herry from "../components/Herry";

export default function HRDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  axiosClient
    .get("/dashboard/hr/")
    .then((res) => setData(res.data))
    .catch((err) => {
      console.log("STATUS:", err.response?.status);
      console.log("DATA:", err.response?.data);
      setError(
        err.response?.data?.error ||
        err.response?.data?.detail ||
        `Failed to load dashboard (${err.response?.status || "network error"})`
      );
    })
    .finally(() => setLoading(false));
}, []);

  if (loading) return <p className="hr-loading">Loading...</p>;
  if (error) return <p className="hr-error">{error}</p>;

  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="hr-dashboard">
      {/* Welcome Banner */}
      <div className="hr-welcome-card">
        <div>
          <h1>Welcome back, {data.hr_name} 👋</h1>
        </div>
        <div className="hr-date">{today}</div>
      </div>

      {/* Stat Cards */}
      <div className="hr-stats-grid">
        <div className="hr-stat-card">
          <p className="hr-stat-label">Total Employees</p>
          <h2 className="hr-stat-value">{data.employees}</h2>
        </div>

        <div className="hr-stat-card">
          <p className="hr-stat-label">Present Today</p>
          <h2 className="hr-stat-value">{data.attendance_today}</h2>
          <p className="hr-stat-sub">
            {data.employees > 0
              ? Math.round((data.attendance_today / data.employees) * 100)
              : 0}
            % attendance rate
          </p>
        </div>
      </div>

      {/* Recent Employees */}
      <div className="hr-table-card">
        <div className="hr-table-header">
          <h3>Recent Employees</h3>
        </div>

        {data.recent_employees.length === 0 ? (
          <p className="hr-empty">Koi employee abhi tak add nahi hua.</p>
        ) : (
          <table className="hr-table">
            <thead>
              <tr>
                <th>Name</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <Herry />
    </div>
  );
}