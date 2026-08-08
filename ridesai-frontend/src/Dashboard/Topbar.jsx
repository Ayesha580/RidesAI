import { useEffect, useState } from "react";
import "./Topbar.css";

export default function Topbar() {
  const [user, setUser] = useState({});

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("user"));

    if (data) {
      setUser(data);
    }
  }, []);

  return (
    <header className="ri_topbar">
      <div className="ri_topbar-left">
        <h2>Dashboard</h2>
      </div>

      <div className="ri_topbar-right">
        <div className="ri_company-badge">
          {user.company_name || "Rides AI"}
        </div>

        <div className="ri_profile-card">
          <div className="ri_avatar">
            {user.first_name
              ? user.first_name.charAt(0).toUpperCase()
              : "A"}
          </div>

          <div className="ri_profile-info">
            <h4>{user.first_name || "Owner"}</h4>
          </div>
        </div>
      </div>
    </header>
  );
}