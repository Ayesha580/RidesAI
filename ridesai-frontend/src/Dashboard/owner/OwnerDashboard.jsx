import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./OwnerDashboard.css";
import Herry from "../components/Herry";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const STAT_ICONS = {
  employees: "👥",
  hrs: "🧾",
  managers: "🧑‍💼",
  attendance: "📅",
  tasks: "✅",
  leads: "📈",
};

export default function OwnerDashboard() {
  const [loading, setLoading] = useState(true);

  const [announcement, setAnnouncement] = useState({
    title: "",
    message: "",
  });

  const [sending, setSending] = useState(false);

  const [officeHours, setOfficeHours] = useState({
    shift_start: "09:15",
    shift_end: "18:00",
    timezone: "UTC",
  });

  const [timezones, setTimezones] = useState([]);
  const [savingHours, setSavingHours] = useState(false);

  const [dashboard, setDashboard] = useState({
    employees: 0,
    hrs: 0,
    managers: 0,
    attendance: 0,
    tasks: 0,
    leads: 0,
    recent_staff: [],
    recent_tasks: [],
  });

  useEffect(() => {
    loadDashboard();
    loadOfficeHours();
    loadTimezones();
  }, []);

  async function loadDashboard() {
    try {
      const res = await axiosClient.get("/dashboard/owner/");
      setDashboard({
        employees: res.data.employees || 0,
        hrs: res.data.hrs || 0,
        managers: res.data.managers || 0,
        attendance: res.data.attendance || 0,
        tasks: res.data.tasks || 0,
        leads: res.data.leads || 0,
        recent_staff: res.data.recent_staff || [],
        recent_tasks: res.data.recent_tasks || [],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadTimezones() {
    try {
      const res = await axiosClient.get("/hr/timezones/");
      setTimezones(res.data);
    } catch (err) {
      console.log(err);
    }
  }

  async function loadOfficeHours() {
    try {
      const res = await axiosClient.get("/hr/company/office-hours/");
      setOfficeHours({
        shift_start: res.data.shift_start,
        shift_end: res.data.shift_end,
        timezone: res.data.timezone,
      });
    } catch (err) {
      console.log(err);
    }
  }

  async function saveOfficeHours(e) {
    e.preventDefault();
    try {
      setSavingHours(true);
      const res = await axiosClient.put("/hr/company/office-hours/", officeHours);
      setOfficeHours({
        shift_start: res.data.shift_start,
        shift_end: res.data.shift_end,
        timezone: res.data.timezone,
      });
      alert("Office hours updated successfully.");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update office hours.");
    } finally {
      setSavingHours(false);
    }
  }

  async function sendAnnouncement(e) {
    e.preventDefault();
    try {
      setSending(true);
      await axiosClient.post("/hr/owner/announcements/", announcement);
      alert("Announcement sent successfully.");
      setAnnouncement({ title: "", message: "" });
    } catch (err) {
      console.log(err);
      alert("Failed to send announcement.");
    } finally {
      setSending(false);
    }
  }

  const chartData = {
    labels: ["Employees", "HR", "Managers", "Attendance", "Tasks", "Leads"],
    datasets: [
      {
        label: "Business Statistics",
        data: [
          dashboard.employees,
          dashboard.hrs,
          dashboard.managers,
          dashboard.attendance,
          dashboard.tasks,
          dashboard.leads,
        ],
        backgroundColor: [
          "#ff77ff",
          "#e85af0",
          "#d148e8",
          "#FF77FF",
          "#a91fd3",
          "#FF77FF",
        ],
        borderColor: "#FF77FF",
        borderWidth: 1,
        borderRadius: 8,
        maxBarThickness: 46,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#f3e8fd" },
      },
      x: {
        grid: { display: false },
      },
    },
  };

  if (loading) {
    return (
      <div className="ownerdash_loading">
        <div className="ownerdash_loader"></div>
        <span>Loading Dashboard...</span>
      </div>
    );
  }

  return (
    <div className="ownerdash_wrap">
      {/* Page Header */}

      {/* Stat Cards */}
      <div className="ownerdash_cards">
        <StatCard icon={STAT_ICONS.employees} value={dashboard.employees} label="Total Employees" />
        <StatCard icon={STAT_ICONS.hrs} value={dashboard.hrs} label="Total HR" />
        <StatCard icon={STAT_ICONS.managers} value={dashboard.managers} label="Total Managers" />
        <StatCard icon={STAT_ICONS.attendance} value={dashboard.attendance} label="Attendance Records" />
        <StatCard icon={STAT_ICONS.tasks} value={dashboard.tasks} label="Pending Tasks" />
        <StatCard icon={STAT_ICONS.leads} value={dashboard.leads} label="Total Leads" />
      </div>

      {/* Office Hours + Announcement side by side */}
      <div className="ownerdash_two-col">
        <div className="ownerdash_panel-card">
          <div className="ownerdash_panel-header">
            <span className="ownerdash_panel-icon">🕒</span>
            <h2 className="ownerdash_panel-title">Office Hours</h2>
          </div>

          <form onSubmit={saveOfficeHours} className="ownerdash_form">
            <div className="ownerdash_form-row">
              <div className="ownerdash_form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={officeHours.shift_start}
                  onChange={(e) =>
                    setOfficeHours({ ...officeHours, shift_start: e.target.value })
                  }
                />
              </div>

              <div className="ownerdash_form-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={officeHours.shift_end}
                  onChange={(e) =>
                    setOfficeHours({ ...officeHours, shift_end: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="ownerdash_form-group">
              <label>Timezone</label>
              <select
                value={officeHours.timezone}
                onChange={(e) =>
                  setOfficeHours({ ...officeHours, timezone: e.target.value })
                }
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            <button className="ownerdash_btn" disabled={savingHours}>
              {savingHours ? "Saving..." : "Save Office Hours"}
            </button>
          </form>
        </div>

        <div className="ownerdash_panel-card">
          <div className="ownerdash_panel-header">
            <span className="ownerdash_panel-icon">📢</span>
            <h2 className="ownerdash_panel-title">Company Announcement</h2>
          </div>

          <form onSubmit={sendAnnouncement} className="ownerdash_form">
            <div className="ownerdash_form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="Announcement Title"
                value={announcement.title}
                onChange={(e) =>
                  setAnnouncement({ ...announcement, title: e.target.value })
                }
              />
            </div>

            <div className="ownerdash_form-group">
              <label>Message</label>
              <textarea
                rows="5"
                placeholder="Write announcement..."
                value={announcement.message}
                onChange={(e) =>
                  setAnnouncement({ ...announcement, message: e.target.value })
                }
              />
            </div>

            <button className="ownerdash_btn" disabled={sending}>
              {sending ? "Sending..." : "Send Announcement"}
            </button>
          </form>
        </div>
      </div>

      {/* Tables */}
      <div className="ownerdash_grid">
        <div className="ownerdash_panel-card">
          <div className="ownerdash_panel-header">
            <span className="ownerdash_panel-icon">🧑‍🤝‍🧑</span>
            <h3 className="ownerdash_panel-title">Recent Staff</h3>
          </div>

          <div className="ownerdash_table-wrap">
            <table className="ownerdash_table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Department</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recent_staff.length > 0 ? (
                  dashboard.recent_staff.map((staff) => (
                    <tr key={staff.id}>
                      <td>
                        <div className="ownerdash_person">

                          <span>{staff.name}</span>
                        </div>
                      </td>
                      <td>
                        <span className="ownerdash_role-badge">{staff.role}</span>
                      </td>
                      <td>{staff.department || staff.designation || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="ownerdash_empty">No staff found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="ownerdash_panel-card">
          <div className="ownerdash_panel-header">
            <span className="ownerdash_panel-icon">📋</span>
            <h3 className="ownerdash_panel-title">Recent Tasks</h3>
          </div>

          <div className="ownerdash_table-wrap">
            <table className="ownerdash_table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.recent_tasks.length > 0 ? (
                  dashboard.recent_tasks.map((task) => (
                    <tr key={task.id}>
                      <td>{task.title}</td>
                      <td>
                        <span className="ownerdash_status-badge">{task.status}</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="2" className="ownerdash_empty">No tasks found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="ownerdash_panel-card">
        <div className="ownerdash_panel-header">
          <span className="ownerdash_panel-icon">📊</span>
          <h3 className="ownerdash_panel-title">Business Overview</h3>
        </div>
        <div className="ownerdash_chart-wrap">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      <Herry />
    </div>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <div className="ownerdash_card">
      <div className="ownerdash_card-icon">{icon}</div>
      <h2>{value}</h2>
      <p>{label}</p>
    </div>
  );
}