import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./OwnerEmployees.css";

export default function OwnerEmployees() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEmployees = () => {
    setLoading(true);
    axiosClient
      .get("/hr/employees/list/api/")
      .then((res) => setEmployees(res.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  function handleDelete(emp) {
    if (!window.confirm(`Remove ${emp.name}? This cannot be undone.`)) return;

    axiosClient
      .delete(`/hr/employees/${emp.id}/remove/`)
      .then(() => {
        setEmployees((prev) => prev.filter((e) => e.id !== emp.id));
      })
      .catch((err) => {
        console.log(err);
        alert(err.response?.data?.error || "Could not delete employee.");
      });
  }

  return (
    <div className="rideai_ownemp_page">
      <div className="rideai_ownemp_header">
        <h2 className="rideai_ownemp_title">Employees</h2>
        <button
          className="rideai_ownemp_addbtn"
          onClick={() => navigate("/owner/employees/add")}
        >
          + Add Employee
        </button>
      </div>

      <div className="rideai_ownemp_tablecard">
        {loading ? (
          <p className="rideai_ownemp_loading">Loading...</p>
        ) : (
          <table className="rideai_ownemp_table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Department</th>
                <th>Role</th>
                <th>Age</th>
                <th>Joining Date</th>
                <th>Salary</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <tr key={emp.id}>
                    <td data-label="Name">{emp.name}</td>
                    <td data-label="Username">{emp.username}</td>
                    <td data-label="Email">{emp.email}</td>
                    <td data-label="Department">{emp.department || "-"}</td>
                    <td data-label="Role">{emp.custom_role || "-"}</td>
                    <td data-label="Age">{emp.age || "-"}</td>
                    <td data-label="Joining Date">{emp.joining_date || "-"}</td>
                    <td data-label="Salary">
                      {emp.salary !== null && emp.salary !== undefined && emp.salary !== ""
                        ? emp.salary
                        : "-"}
                    </td>
                    <td data-label="Actions">
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          className="rideai_ownemp_editbtn"
                          onClick={() => navigate(`/owner/employees/${emp.id}/edit`)}
                        >
                          Edit
                        </button>
                        <button
                          className="rideai_ownemp_delbtn"
                          onClick={() => handleDelete(emp)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="rideai_ownemp_empty">
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