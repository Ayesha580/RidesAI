import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";

export default function Screenshots() {
  const [screenshots, setScreenshots] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    employee_id: "",
    date: "",
  });

  useEffect(() => {
    loadEmployees();
    loadScreenshots();
  }, []);

  async function loadEmployees() {
    try {
      const res = await axiosClient.get("/hr/employees/list/api/");
      setEmployees(res.data || []);
    } catch (err) {
      console.log(err);
    }
  }

  async function loadScreenshots(customFilters = filters) {
    setLoading(true);
    try {
      const params = {};
      if (customFilters.employee_id) params.employee_id = customFilters.employee_id;
      if (customFilters.date) params.date = customFilters.date;

      const res = await axiosClient.get("/hr/screenshots/", {
        params,
      });
      setScreenshots(res.data || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(field, value) {
    const updated = { ...filters, [field]: value };
    setFilters(updated);
    loadScreenshots(updated);
  }

  return (
    <div className="screenshots-page">
      <h2>📸 Employee Activity Screenshots</h2>

      <div className="screenshots-filters">
        <select
          value={filters.employee_id}
          onChange={(e) => handleFilterChange("employee_id", e.target.value)}
        >
          <option value="">All Employees</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={filters.date}
          onChange={(e) => handleFilterChange("date", e.target.value)}
        />
      </div>

      {loading ? (
  <p>Loading screenshots...</p>
) : screenshots.length === 0 ? (
  <p>No screenshots found.</p>
) : (
  <table className="screenshots-table">
    <thead>
      <tr>
        {/* <th>Preview</th> */}
        <th>Employee</th>
        <th>Date & Time</th>
        <th>Action</th>
      </tr>
    </thead>

    <tbody>
      {screenshots.map((s) => (
        <tr key={s.id}>
          {/* <td>
            <a
              href={s.image_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={s.image_url}
                alt="Screenshot"
                className="thumb"
              />
            </a>
          </td> */}

          <td>{s.employee_name}</td>

          <td>
            {new Date(s.captured_at).toLocaleString()}
          </td>

          <td>
            <a
              href={s.image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="view-link"
            >
              View
            </a>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)}
    </div>
  );
}