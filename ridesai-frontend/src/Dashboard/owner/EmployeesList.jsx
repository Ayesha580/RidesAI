import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./OwnerEmployees.css";

export default function OwnerEmployees() {

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosClient
            .get("/hr/employees/list/api/")
            .then((res) => {
                setEmployees(res.data);
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <div className="rideai_ownemp_page">

            <h2 className="rideai_ownemp_title">Employees</h2>

            <div className="rideai_ownemp_tablecard">

                {loading ? (
                    <p className="rideai_ownemp_loading">Loading...</p>
                ) : (
                    <table className="rideai_ownemp_table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Username</th>
                                <th>Designation</th>
                                <th>Age</th>
                            </tr>
                        </thead>

                        <tbody>
                            {employees.length > 0 ? (
                                employees.map((emp) => (
                                    <tr key={emp.id}>
                                        <td data-label="Name">{emp.name}</td>
                                        <td data-label="Email">{emp.email}</td>
                                        <td data-label="Username">{emp.username}</td>
                                        <td data-label="Designation">{emp.designation || "-"}</td>
                                        <td data-label="Age">{emp.age || "-"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="rideai_ownemp_empty">
                                        No Employees Found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}

            </div>

        </div>
    );
}