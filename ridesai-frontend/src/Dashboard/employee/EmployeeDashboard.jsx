import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EmployeeDashboard.css";
import axiosClient from "../../api/axiosClient";
import Herry from "../components/Herry";


export default function EmployeeDashboard() {
    const [dashboard, setDashboard] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDashboard();
    }, []);

    async function fetchDashboard() {
        try {
            const response = await axiosClient.get("/dashboard/employee/");
            setDashboard(response.data);
        } catch (err) {
            console.log(err);
            if (
                err.response?.status !== 401 &&
                err.response?.status !== 403
            ) {
                navigate("/");
            }
        }
    }

    if (!dashboard) {
        return null;
    }

    const initial = dashboard.employee?.name
        ? dashboard.employee.name.charAt(0).toUpperCase()
        : "E";

    return (
        <div className="rideai_emp_dashboard">

            <div className="rideai_emp_header">
                <div>
                    <h1>Welcome Back</h1>
                    <p>Here's your work summary for today.</p>
                </div>

                <div className="rideai_emp_box">
                    <div className="rideai_emp_avatar">{initial}</div>
                    <div>
                        <span>{dashboard.employee?.designation}</span>
                    </div>
                </div>
            </div>

            <div className="rideai_emp_statsgrid">
                <div className="rideai_emp_statcard">
                    <h5>Today's Tasks</h5>
                    <h2>{dashboard.total_tasks}</h2>
                </div>

                <div className="rideai_emp_statcard">
                    <h5>Pending</h5>
                    <h2>{dashboard.pending_tasks}</h2>
                </div>

                <div className="rideai_emp_statcard">
                    <h5>Completed</h5>
                    <h2>{dashboard.completed_tasks}</h2>
                </div>

                <div className="rideai_emp_statcard">
                    <h5>Working Hours</h5>
                    <h2>{dashboard.working_hours} hrs</h2>
                </div>
            </div>

            <div className="rideai_emp_gridcontent">
                <div className="rideai_emp_leftside">
                    <div className="rideai_emp_panel">
                        <h3>Today's Attendance</h3>

                        <div className="rideai_emp_attendancebox">
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

                    <div className="rideai_emp_panel">
                        <h3>Recent Tasks</h3>

                        <table className="rideai_emp_table">
                            <thead>
                                <tr>
                                    <th>Task</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dashboard.tasks?.map((task) => (
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

                <div className="rideai_emp_rightside">
                    <div className="rideai_emp_panel">
                        <h3>Performance</h3>
                        <div className="rideai_emp_progresscircle">
                            <h1>{dashboard.performance}%</h1>
                            <span>Productivity</span>
                        </div>
                    </div>

                    <div className="rideai_emp_panel">
                        <h3>Leave Balance</h3>
                        <h1>{dashboard.leave_balance}</h1>
                        <span>Days Remaining</span>
                    </div>
                </div>
            </div>
            <Herry />
        </div>
    );
}