import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployeeDashboard.css";
import DashboardCard from "./components/DashboardCard";

export default function EmployeeDashboard() {

    const [dashboard, setDashboard] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboard();
    }, []);

    async function fetchDashboard() {

        try {

            const response = await fetch(
                "/api/dashboard/employee/",
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
                    },
                }
            );

            if (
                response.status === 401 ||
                response.status === 403 ||
                response.status === 404
            ) {
                navigate("/");
                return;
            }

            const data = await response.json();

            if (data.error) {
                navigate("/");
                return;
            }

            setDashboard(data);

        } catch (err) {
            console.log(err);
            navigate("/");
        }
    }

    if (!dashboard) {
        return null;
    }

    return (
  <div className="employee-dashboard">

    <div className="dashboard-header">
      <div>
        <h1>Welcome Back</h1>
        <p>Here's your work summary for today.</p>
      </div>

      <div className="employee-box">
        <div>
          <span>
            {dashboard.employee?.designation}
          </span>
        </div>
      </div>
    </div>


    <div className="stats-grid">

      <div className="stat-card">
        <h5>Today's Tasks</h5>
        <h2>{dashboard.total_tasks}</h2>
      </div>

      <div className="stat-card">
        <h5>Pending</h5>
        <h2>{dashboard.pending_tasks}</h2>
      </div>

      <div className="stat-card">
        <h5>Completed</h5>
        <h2>{dashboard.completed_tasks}</h2>
      </div>

      <div className="stat-card">
        <h5>Working Hours</h5>
        <h2>{dashboard.working_hours} hrs</h2>
      </div>

    </div>


    <div className="dashboard-content">

      <div className="left-side">

        <div className="panel">

          <h3>Today's Attendance</h3>

          <div className="attendance-box">

            <div>
              <h4>Clock In</h4>

              <p>
                {dashboard.clock_in
                  ? new Date(dashboard.clock_in).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "--:--"}
              </p>
            </div>

            <div>
              <h4>Clock Out</h4>

              <p>
                {dashboard.clock_out
                  ? new Date(dashboard.clock_out).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                  : "--:--"}
              </p>
            </div>

          </div>

        </div>


        <div className="panel">

          <h3>Recent Tasks</h3>

          <table>

            <thead>

              <tr>

                <th>Task</th>

                <th>Priority</th>

                <th>Status</th>

              </tr>

            </thead>

            <tbody>

              {dashboard.tasks?.map(task=>(
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.priority}</td>
                  <td>{task.status}</td>
                </tr>
              ))}

            </tbody>

          </table>

        </div>

      </div>


      <div className="right-side">

        <div className="panel">

          <h3>Performance</h3>

          <div className="progress-circle">

            <h1>{dashboard.performance}%</h1>

            <span>Productivity</span>

          </div>

        </div>

        <div className="panel">

          <h3>Leave Balance</h3>

          <h1>{dashboard.leave_balance}</h1>

          <span>Days Remaining</span>

        </div>

      </div>

    </div>

  </div>
);
}