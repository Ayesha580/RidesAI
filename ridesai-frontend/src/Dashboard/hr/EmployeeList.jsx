import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import AddEmployee from "./AddEmployee";
import "./HRDashboard.css";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchEmployees = () => {
    setLoading(true);

    axiosClient
      .get("/hr/employees/list/api/")
      .then((res) => setEmployees(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleRemove = async (id, name) => {
    const confirmed = window.confirm(
      `Are you sure you want to remove ${name}?`
    );

    if (!confirmed) return;

    await axiosClient.delete(`/hr/employees/${id}/remove/`);
    fetchEmployees();
  };

  return (
    <div className="employee-page">
      <div className="employee-header">
        <div>
          <h1>Employees</h1>
          <p>Manage all employees in your organization.</p>
        </div>

        <button
          className="add-btn"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? "Close Form" : "+ Add Employee"}
        </button>
      </div>

      {showAddForm && (
        <div className="employee-form-card">
          <AddEmployee
            onSuccess={() => {
              setShowAddForm(false);
              fetchEmployees();
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="loading">Loading employees...</div>
      ) : employees.length === 0 ? (
        <div className="empty-state">
          <h3>No Employees Found</h3>
          <p>Add your first employee to get started.</p>
        </div>
      ) : (
        <div className="employee-table-card">
          <div className="employee-table-wrap">
            <table className="employee-table">
             <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Age</th>
                <th>Department</th>
                <th>Role</th>
                <th>Joining Date</th>
                <th>Salary</th>
                <th>Action</th>
              </tr>
            </thead>

              <tbody>
  {employees.map((emp) => (
    <tr key={emp.id}>
      <td>{emp.name}</td>
      <td>{emp.username}</td>
      <td>{emp.email}</td>
      <td>{emp.age || "-"}</td>
      <td>{emp.department || "-"}</td>
      <td>{emp.custom_role || "-"}</td>
      <td>
        {emp.joining_date
          ? new Date(emp.joining_date).toLocaleDateString("en-GB")
          : "-"}
      </td>
      <td>{emp.salary || "-"}</td>
      <td>
        <button
          className="remove-btn"
          onClick={() =>
            handleRemove(emp.id, emp.name)
          }
        >
          Remove
        </button>
      </td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}