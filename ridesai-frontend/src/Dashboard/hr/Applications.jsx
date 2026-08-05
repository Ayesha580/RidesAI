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
      const response = await fetch("/api/hr/applications/", {
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

  async function generateOffer(id) {
    try {
      const response = await fetch("/api/hr/offer-letter/create/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ applicant_id: id }),
      });

      const data = await response.json();
      alert(data.message);
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
    <div style={{ padding: "30px", background: "#f8fafc", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "30px", color: "#111827" }}>
        Applications
      </h1>

      <div
        style={{
          background: "#fff",
          color: "#000",
          padding: "20px",
          borderRadius: "15px",
          boxShadow: "0 8px 25px rgba(0,0,0,.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            <AddCandidate onSuccess={fetchApplications} />
            <UploadCSV onSuccess={fetchApplications} />
          </div>
          <button
          onClick={sendOfferToAllSelected}
          style={{
            padding: "10px 18px",
            border: "none",
            borderRadius: "8px",
            background: "#be27ee",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Send Offer Letter to All Selected
        </button>
        </div>

        <input
          placeholder="Search applicant..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          style={{
            width: "300px",
            padding: "12px 15px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            marginBottom: "25px",
          }}
        />

        {loading ? (
          <h3>Loading applications...</h3>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8e8fd" }}>
                  <th style={th}>Name</th>
                  <th style={th}>Email</th>
                  <th style={th}>Phone</th>
                  <th style={th}>Designation</th>
                  <th style={th}>Department</th>
                  <th style={th}>Salary</th>
                  <th style={th}>Joining Date</th>
                  <th style={th}>Status</th>
                </tr>
              </thead>

              <tbody>
                {paginatedApplications.map((app) => (
                  <tr
                    key={app.id}
                    style={{ transition: "0.25s" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#faf5ff")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "white")
                    }
                  >
                    <td style={td}>{app.full_name}</td>
                    <td style={td}>{app.email}</td>
                    <td style={td}>{app.phone}</td>
                    <td style={td}>{app.designation}</td>
                    <td style={td}>{app.department}</td>
                    <td style={td}>{app.salary}</td>
                    <td style={td}>{app.joining_date}</td>
                    <td style={td}>
                      <select
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                        style={{
                          padding: "8px",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Selected">Selected</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "25px",
                }}
              >
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  style={pageBtn}
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index}
                    onClick={() => setPage(index + 1)}
                    style={{
                      ...pageBtn,
                      border: "none",
                      background: page === index + 1 ? "#2563eb" : "#f1f5f9",
                      color: page === index + 1 ? "white" : "#334155",
                    }}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  style={pageBtn}
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

const th = {
  textAlign: "left",
  padding: "18px",
  fontSize: "15px",
  color: "#be27ee",
  fontWeight: "600",
};

const td = {
  padding: "18px",
  borderBottom: "1px solid #eee",
  color: "#334155",
};

const pageBtn = {
  padding: "8px 14px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  cursor: "pointer",
};

const offerBtn = {
  padding: "8px 14px",
  borderRadius: "8px",
  border: "none",
  background: "#111827",
  color: "#000",
  cursor: "pointer",
  fontSize: "13px",
};