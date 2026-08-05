import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);


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

async function sendAnnouncement(e) {
  e.preventDefault();

  try {
    setSending(true);

    await axiosClient.post(
      "/hr/owner/announcements/",
      announcement
    );

    alert("Announcement sent successfully.");

    setAnnouncement({
      title: "",
      message: "",
    });

  } catch (err) {
    console.log(err);
    alert("Failed to send announcement.");
  } finally {
    setSending(false);
  }
}


const [savingHours, setSavingHours] = useState(false);



useEffect(() => {
  loadOfficeHours();
  loadTimezones();
}, []);

async function loadTimezones() {
  try {
    const res = await axiosClient.get("/hr/timezones/");
    console.log("Timezones:", res.data);
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
      });
      alert("Office hours updated successfully.");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update office hours.");
    } finally {
      setSavingHours(false);
    }
  }
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

  const chartData = {
    labels: [
      "Employees",
      "HR",
      "Managers",
      "Attendance",
      "Tasks",
      "Leads",
    ],

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
  "#E9D5FF",
  "#DDD6FE",
  "#F3E8FF",
  "#F5D0FE",
  "#EDE9FE",
  "#FCE7F3",
],

borderColor: [
  "#BE27EE",
  "#9333EA",
  "#8B5CF6",
  "#C026D3",
  "#A855F7",
  "#D946EF",
],

borderWidth: 1,
      },
    ],
  };

  if (loading) {
    return <h2>Loading Dashboard...</h2>;
  }

  return (
    <>
      {/* Cards */}

      <div className="cards">

        <div className="card">
          <h2>{dashboard.employees}</h2>
          <p>Total Employees</p>
        </div>

        <div className="card">
          <h2>{dashboard.hrs}</h2>
          <p>Total HR</p>
        </div>

        <div className="card">
          <h2>{dashboard.managers}</h2>
          <p>Total Managers</p>
        </div>

        <div className="card">
          <h2>{dashboard.attendance}</h2>
          <p>Attendance Records</p>
        </div>

        <div className="card">
          <h2>{dashboard.tasks}</h2>
          <p>Pending Tasks</p>
        </div>

        <div className="card">
          <h2>{dashboard.leads}</h2>
          <p>Total Leads</p>
        </div>

      </div>

      <div className="announcement-card">
  <h2>🕒 Office Hours</h2>

  <form onSubmit={saveOfficeHours}>
    <label style={{ display: "block", marginBottom: 6 }}>Start Time</label>
    <input
      type="time"
      value={officeHours.shift_start}
      onChange={(e) =>
        setOfficeHours({ ...officeHours, shift_start: e.target.value })
      }
    />

    <label style={{ display: "block", margin: "12px 0 6px" }}>End Time</label>
    <input
      type="time"
      value={officeHours.shift_end}
      onChange={(e) =>
        setOfficeHours({ ...officeHours, shift_end: e.target.value })
      }
    
    />

    <label style={{ display: "block", margin: "12px 0 6px" }}>Timezone</label>
    <select
      value={officeHours.timezone}
      onChange={(e) =>
        setOfficeHours({ ...officeHours, timezone: e.target.value })
      }
    >
      {timezones.map((tz) => (
        <option key={tz} value={tz}>
          {tz}
        </option>
      ))}
    </select>

    <button disabled={savingHours} style={{ marginTop: 14 }}>
      {savingHours ? "Saving..." : "Save Office Hours"}
    </button>
  </form>
</div>
      <div className="announcement-card">
        

    <h2>📢 Company Announcement</h2>

    <form onSubmit={sendAnnouncement}>

        <input
            type="text"
            placeholder="Announcement Title"
            value={announcement.title}
            onChange={(e)=>
                setAnnouncement({
                    ...announcement,
                    title:e.target.value
                })
            }
        />

        <textarea
            rows="6"
            placeholder="Write announcement..."
            value={announcement.message}
            onChange={(e)=>
                setAnnouncement({
                    ...announcement,
                    message:e.target.value
                })
            }
        />

        <button disabled={sending}>
            {sending ? "Sending..." : "Send Announcement"}
        </button>

    </form>

</div>


      {/* Tables */}

      <div className="dashboard-grid">

        <div className="panel">

          <h3>Recent Staff</h3>

          <table>
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
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    No staff found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

        </div>

        <div className="panel">

          <h3>Recent Tasks</h3>

          <table>
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
                  <td colSpan="2" style={{ textAlign: "center" }}>
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

        </div>

      </div>

      {/* Chart */}

      <div className="chart-card">

        <h3>Business Overview</h3>

        <Bar data={chartData} />

      </div>
    </>
  );
}