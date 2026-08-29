import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./Screenshots.css"

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

      if (customFilters.employee_id) {
        params.employee_id = customFilters.employee_id;
      }

      if (customFilters.date) {
        params.date = customFilters.date;
      }

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
    const updated = {
      ...filters,
      [field]: value,
    };

    setFilters(updated);
    loadScreenshots(updated);
  }

  return (
    <div className="employee-shot-page">
      <div className="employee-shot-top">
        <div className="employee-shot-heading-area">
          <div className="employee-shot-heading-icon">📸</div>

          <div>
            <h1 className="employee-shot-title">
              Employee Activity Screenshots
            </h1>

            <p className="employee-shot-description">
              Monitor employee activity and captured screenshots
            </p>
          </div>
        </div>

        <div className="employee-shot-counter">
          <span>{screenshots.length}</span>
          <small>Screenshots</small>
        </div>
      </div>

      <div className="employee-shot-filter-box">
        <div className="employee-shot-filter-item">
          <label>Employee</label>

          <select
            value={filters.employee_id}
            onChange={(e) =>
              handleFilterChange("employee_id", e.target.value)
            }
          >
            <option value="">All Employees</option>

            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>

        <div className="employee-shot-filter-item">
          <label>Date</label>

          <input
            type="date"
            value={filters.date}
            onChange={(e) =>
              handleFilterChange("date", e.target.value)
            }
          />
        </div>
      </div>

      {loading ? (
        <div className="employee-shot-empty-box">
          <div className="employee-shot-empty-icon">⏳</div>

          <h3>Loading screenshots</h3>

          <p>Please wait while screenshots are loading.</p>
        </div>
      ) : screenshots.length === 0 ? (
        <div className="employee-shot-empty-box">
          <div className="employee-shot-empty-icon">📷</div>

          <h3>No screenshots found</h3>

          <p>Try changing the employee or date filter.</p>
        </div>
      ) : (
        <div className="employee-shot-table-box">
          <table className="employee-shot-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date & Time</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {screenshots.map((s) => {
                const name = s.employee_name || "Employee";
                const initial = name.charAt(0).toUpperCase();
                const date = new Date(s.captured_at);

                return (
                  <tr key={s.id}>
                    <td>
                      <div className="employee-shot-user">
                        <div className="employee-shot-avatar">
                          {initial}
                        </div>

                        <div>
                          <strong>{name}</strong>
                          <span>Employee</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="employee-shot-datetime">
                        <strong>
                          {date.toLocaleDateString()}
                        </strong>

                        <span>
                          {date.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>

                    <td>
                      <a
                        href={s.image_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="employee-shot-view"
                      >
                        <span>👁</span>
                        View
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}