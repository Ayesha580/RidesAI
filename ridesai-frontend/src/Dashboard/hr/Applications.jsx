import { useEffect, useState } from "react";
import AddCandidate from "./AddCandidate";
import UploadCSV from "./UploadCSV";
import "./Applications.css";

export default function Applications() {
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function fetchApplications() {
    try {
      const response = await fetch("/applications/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplications();
  }, []);

  async function sendOfferToAllSelected() {
    const selectedApplicants = applications.filter(
      (app) => app.status === "Selected"
    );

    if (selectedApplicants.length === 0) {
      alert("No selected candidates found.");
      return;
    }

    try {
      await Promise.all(
        selectedApplicants.map((app) =>
          fetch("/api/hr/offer-letter/create/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
            body: JSON.stringify({
              applicant_id: app.id,
              designation: app.designation,
              salary: app.salary,
              joining_date: app.joining_date,
            }),
          })
        )
      );

      alert("Offer letters sent to all selected candidates.");
    } catch (error) {
      console.log(error);
      alert("Something went wrong.");
    }
  }

  async function updateStatus(id, status) {
    try {
      await fetch(`/api/hr/applications/${id}/status/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ status }),
      });

      fetchApplications();
    } catch (error) {
      console.log(error);
    }
  }

  const filtered = applications.filter((app) =>
    app.full_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedApplications = filtered.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <div className="applications-page">
      <div className="page-header">
        <div>
          <h1>Applications</h1>
          <p>Track and manage candidate applications.</p>
        </div>
      </div>

      <div className="application-card">
        <div className="toolbar">
          <input
            placeholder="Search applicant..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />

          <div className="toolbar-actions">
            <AddCandidate onSuccess={fetchApplications} />
            <UploadCSV onSuccess={fetchApplications} />
            <button className="btn btn-primary" onClick={sendOfferToAllSelected}>
              Send Offer to All Selected
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading applications...</div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <h3>No Applications Found</h3>
            <p>Add a candidate or upload a CSV to get started.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Designation</th>
                  <th>Department</th>
                  <th>Salary</th>
                  <th>Joining Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {paginatedApplications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      <div className="candidate">
                        <div className="avatar">
                          {app.full_name?.charAt(0)}
                        </div>
                        {app.full_name}
                      </div>
                    </td>
                    <td>{app.email}</td>
                    <td>{app.phone}</td>
                    <td>
                      <span className="job">{app.designation}</span>
                    </td>
                    <td>{app.department}</td>
                    <td>{app.salary}</td>
                    <td>{app.joining_date}</td>
                    <td>
                      <select
                        className={`status ${app.status}`}
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Applied">Applied</option>
                        <option value="Shortlisted">Shortlisted</option>
                        <option value="Interview">Interview</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    className={page === index + 1 ? "active-page" : ""}
                    onClick={() => setPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}