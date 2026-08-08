import { useNavigate } from "react-router-dom";
import "./HRManagement.css";

export default function HRManagement() {
  const navigate = useNavigate();

  return (
    <div className="hrmgmt_wrap">
      <h1 className="hrmgmt_title">HR Management</h1>

      <div className="hrmgmt_cards">
        <div className="hrmgmt_card">
          <h2>Create HR</h2>
          <p>Create new HR accounts.</p>
          <button className="hrmgmt_btn" onClick={() => navigate("/owner/hr/create")}>
            Create HR
          </button>
        </div>

        <div className="hrmgmt_card">
          <h2>HR List</h2>
          <p>View all HR users.</p>
          <button className="hrmgmt_btn" onClick={() => navigate("/owner/hr/list")}>
            View HR
          </button>
        </div>
      </div>
    </div>
  );
}