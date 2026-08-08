import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./MyTeam.css";

export default function MyTeam() {

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosClient
            .get("/hr/manager/team/")
            .then((res) => {
                console.log("MY TEAM RESPONSE:", res.data);
                setEmployees(res.data);
            })
            .catch((err) => {
                console.log("TEAM ERROR:", err.response?.data || err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <p className="rideai_team_loading">Loading team...</p>;
    }

    return (
        <div className="rideai_team_page">

            <h2 className="rideai_team_title">My Team</h2>

            {employees.length === 0 ? (
                <p className="rideai_team_empty">
                    No employees assigned to your team.
                </p>
            ) : (
                <div className="rideai_team_tablecard">
                    <table className="rideai_team_table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th>Designation</th>
                            </tr>
                        </thead>

                        <tbody>
                            {employees.map((emp) => (
                                <tr key={emp.id}>
                                    <td data-label="Name">{emp.name}</td>
                                    <td data-label="Email">{emp.email}</td>
                                    <td data-label="Department">{emp.department || "-"}</td>
                                    <td data-label="Designation">{emp.designation || "-"}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
}