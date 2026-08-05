import { useNavigate } from "react-router-dom";

export default function HRManagement() {
  const navigate = useNavigate();

  return (
    <>
      <h1 className="hr-management-title">HR Management</h1>

      <div className="hr-management-cards">

        <div className="hr-management-card">
          <h2>Create HR</h2>
          <p>Create new HR accounts.</p>

          <button
            className="hr-management-btn"
            onClick={() => navigate("/owner/hr/create")}
          >
            Create HR
          </button>
        </div>

        <div className="hr-management-card">
          <h2>HR List</h2>
          <p>View all HR users.</p>

          <button
            className="hr-management-btn"
            onClick={() => navigate("/owner/hr/list")}
          >
            View HR
          </button>
        </div>

      </div>
    </>
  );
}