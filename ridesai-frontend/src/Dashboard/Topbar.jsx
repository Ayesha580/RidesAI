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
    <header className="topbar">
      <div className="topbar-left">
        <h2>Dashboard</h2>
      </div>

      <div className="topbar-right">
        <div className="company-badge">
          {user.company_name || "Rides AI"}
        </div>

        <div className="profile-card">
          <div className="avatar">
            {user.first_name
              ? user.first_name.charAt(0).toUpperCase()
              : "A"}
          </div>

          <div className="profile-info">
            <h4>{user.first_name || "Owner"}</h4>
          </div>
        </div>
      </div>
    </header>
  );
}