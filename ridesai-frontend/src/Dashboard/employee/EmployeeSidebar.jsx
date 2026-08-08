import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { hasFeature } from "../../utils/planAccess";
import "../../components/sidebar.css";

const menu = [
  { title: "Dashboard", path: "/employee/dashboard", icon: "🏠" },
  { title: "Attendance", path: "/employee/attendance", icon: "🕒" },
  { title: "My Tasks", path: "/employee/tasks", icon: "📋" },
  { title: "Leave", path: "/employee/leave", icon: "📅" },
  { title: "Notifications", path: "/employee/notifications", icon: "🔔" },
  {
    title: "Chat",
    path: "/employee/chat",
    icon: "💬",
    feature: "team_chat",
  },
  { title: "My Profile", path: "/employee/profile", icon: "👤" },
];

export default function EmployeeSidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");

    navigate("/login");
  };

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {!isOpen && (
        <button
          className="ridesai-side-mobile-toggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>
      )}

      {isOpen && (
        <div
          className="ridesai-side-overlay"
          onClick={closeSidebar}
        ></div>
      )}

      <aside className={`ridesai-side ${isOpen ? "open" : ""}`}>
        <button
          className="ridesai-side-close-btn"
          onClick={closeSidebar}
          aria-label="Close menu"
        >
          ✕
        </button>

        <div className="ridesai-side-logo">
          <img
            src={logo}
            alt="Rides AI Logo"
            className="ridesai-side-logo-img"
          />

          <div>
            <h2>Rides AI</h2>
            <p>Employee Panel</p>
          </div>
        </div>

        <ul className="ridesai-side-menu">
          {menu
            .filter((item) => !item.feature || hasFeature(item.feature))
            .map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    isActive ? "ridesai-side-active" : ""
                  }
                >
                  <span style={{ marginRight: "10px" }}>
                    {item.icon}
                  </span>
                  {item.title}
                </NavLink>
              </li>
            ))}
        </ul>

        <div className="ridesai-side-footer">
          <button
            className="ridesai-side-logout-btn"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      </aside>
    </>
  );
}