import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import Sidebar from "../Sidebar"; // apne folder structure ke hisaab se path adjust karein
import { Link } from "react-router-dom";

export default function HRList() {

  const [hrs, setHrs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHRs();
  }, []);

  async function loadHRs() {
    try {
      const res = await axiosClient.get("/hr/hr-list/");
      setHrs(res.data);
    } catch (err) {
      console.log(err);

      setHrs([
        {
          id: 1,
          first_name: "Ayesha",
          last_name: "Khan",
          email: "ayesha@gmail.com",
          username: "ayesha",
        },
        {
          id: 2,
          first_name: "Ali",
          last_name: "Raza",
          email: "ali@gmail.com",
          username: "ali",
        },
      ]);
    }

    setLoading(false);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div style={{ flex: 1, padding: "30px" }}>

        {loading ? (
          <h2>Loading HR List...</h2>
        ) : (
          <div className="panel">

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2>HR List</h2>

              <Link
                to="/owner/hr/create"
                style={{
                  background: "#be27ee",
                  color: "#fff",
                  padding: "10px 18px",
                  borderRadius: "8px",
                  textDecoration: "none",
                  fontWeight: "600",
                }}
              >
                + Create HR
              </Link>
            </div>

            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Designation</th>
                </tr>
              </thead>

              <tbody>
                {hrs.length === 0 ? (
                  <tr>
                    <td colSpan="4">No HR Found</td>
                  </tr>
                ) : (
                  hrs.map((hr, index) => (
                    <tr key={hr.id}>
                      <td>{index + 1}</td>
                      <td>{hr.name}</td>
                      <td>{hr.username}</td>
                      <td>{hr.email}</td>
                      <td>{hr.designation}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

          </div>
        )}

      </div>

    </div>
  );
}