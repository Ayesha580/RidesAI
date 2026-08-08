import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./OwnerDashboard.css";

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
          "#E9D5FF", "#DDD6FE", "#F3E8FF",
          "#F5D0FE", "#EDE9FE", "#FCE7F3",
        ],
        borderColor: [
          "#BE27EE", "#9333EA", "#8B5CF6",
          "#C026D3", "#A855F7", "#D946EF",
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
  };

  if (loading) {
    return <h2>Loading Dashboard...</h2>;
  }

  return (
    <div className="ownerdash_wrap">
      {/* Stat Cards */}
      <div className="ownerdash_cards">
        <div className="ownerdash_card">
          <h2>{dashboard.employees}</h2>
          <p>Total Employees</p>
        </div>
        <div className="ownerdash_card">
          <h2>{dashboard.hrs}</h2>
          <p>Total HR</p>
        </div>
        <div className="ownerdash_card">
          <h2>{dashboard.managers}</h2>
          <p>Total Managers</p>
        </div>
        <div className="ownerdash_card">
          <h2>{dashboard.attendance}</h2>
          <p>Attendance Records</p>
        </div>
        <div className="ownerdash_card">
          <h2>{dashboard.tasks}</h2>
          <p>Pending Tasks</p>
        </div>
        <div className="ownerdash_card">
          <h2>{dashboard.leads}</h2>
          <p>Total Leads</p>
        </div>
      </div>

      {/* Office Hours */}
      <div className="ownerdash_panel-card">
        <h2 className="ownerdash_panel-title">🕒 Office Hours</h2>

        <form onSubmit={saveOfficeHours} className="ownerdash_form">
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

      {/* Announcement */}
      <div className="ownerdash_panel-card">
        <h2 className="ownerdash_panel-title">📢 Company Announcement</h2>

        <form onSubmit={sendAnnouncement} className="ownerdash_form">
          <input
            type="text"
            placeholder="Announcement Title"
            value={announcement.title}
            onChange={(e) =>
              setAnnouncement({ ...announcement, title: e.target.value })
            }
          />

          <textarea
            rows="6"
            placeholder="Write announcement..."
            value={announcement.message}
            onChange={(e) =>
              setAnnouncement({ ...announcement, message: e.target.value })
            }
          />

          <button className="ownerdash_btn" disabled={sending}>
            {sending ? "Sending..." : "Send Announcement"}
          </button>
        </form>
      </div>

      {/* Tables */}
      <div className="ownerdash_grid">
        <div className="ownerdash_panel-card">
          <h3 className="ownerdash_panel-title">Recent Staff</h3>

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
                      <td>{staff.name}</td>
                      <td>{staff.role}</td>
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
          <h3 className="ownerdash_panel-title">Recent Tasks</h3>

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
                      <td>{task.status}</td>
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
        <h3 className="ownerdash_panel-title">Business Overview</h3>
        <div className="ownerdash_chart-wrap">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}