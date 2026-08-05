import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./OfferLetters.css";

export default function OfferLetters() {
  const [applications, setApplications] = useState([]);
  const [selected, setSelected] = useState("");
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const [form, setForm] = useState({
    designation: "",
    salary: "",
    joining_date: "",
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await axiosClient.get("/hr/applications/");

      setApplications(
        res.data.filter((app) => app.status === "Selected")
      );
    } catch (error) {
      console.log(error);
    }
  };

  const handleCandidateChange = (e) => {
    const id = Number(e.target.value);

    setSelected(id);

    const applicant = applications.find((app) => app.id === id);

    setSelectedApplicant(applicant);

    if (applicant) {
      setForm({
        designation:
          applicant.designation ||
          applicant.position ||
          applicant.job_title ||
          "",

        salary: applicant.salary || "",

        joining_date: applicant.joining_date || "",
      });
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const generateOffer = async () => {
    if (!selected) {
      alert("Please select candidate first");
      return;
    }

    try {
      await axiosClient.post("/hr/offer-letter/create/", {
        applicant_id: selected,
        designation: form.designation,
        salary: form.salary,
        joining_date: form.joining_date,
      });

      alert("Offer Letter Generated & Sent Successfully");
    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="offer-page">
      <div className="employee-header">
        <div>
          <h1>Offer Letter Generator</h1>
          <p>
            Generate and send professional offer letters to selected
            candidates.
          </p>
        </div>
      </div>

      <div className="offer-card">
        <h2>Candidate Details</h2>

        <div className="offer-grid">

          <div className="offer-group">
            <label>Select Candidate</label>

            <select
              value={selected}
              onChange={handleCandidateChange}
            >
              <option value="">Choose candidate</option>

              {applications.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.full_name}
                </option>
              ))}
            </select>
          </div>

          <div className="offer-group">
            <label>Designation</label>

            <input
              name="designation"
              value={form.designation}
              onChange={handleChange}
              placeholder="Software Engineer"
            />
          </div>

          <div className="offer-group">
            <label>Salary</label>

            <input
              name="salary"
              value={form.salary}
              onChange={handleChange}
              placeholder="80000"
            />
          </div>

          <div className="offer-group">
            <label>Joining Date</label>

            <input
              type="date"
              name="joining_date"
              value={form.joining_date}
              onChange={handleChange}
            />
          </div>

        </div>

        {selectedApplicant && (
          <div
            style={{
              marginTop: 25,
              padding: 20,
              background: "#f7f8fa",
              borderRadius: 8,
            }}
          >
            <h3>Candidate Information</h3>
            <p>
              <strong>Email:</strong>{" "}
              {selectedApplicant.email}
            </p>

            <p>
              <strong>Phone:</strong>{" "}
              {selectedApplicant.phone}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {selectedApplicant.status}
            </p>
          </div>
        )}

        <button
          className="generate-btn"
          onClick={generateOffer}
        >
          Generate Offer Letter
        </button>
      </div>
    </div>
  );
}