import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import { hasFeature } from "../utils/planAccess";
// OwnerSidebar.jsx ke top pe
import "../components/Sidebar.css";

const menu = [
  { title: "Dashboard", path: "/owner/dashboard", icon: "📊" },
  { title: "HR Management", path: "/owner/hr", icon: "👨‍💼", feature: "hr" },
  { title: "Managers", path: "/owner/managers", icon: "👨‍💼", feature: "manager" },
  { title: "CRM", path: "/owner/crm", icon: "👥", feature: "crm" },
  { title: "Employees", path: "/owner/employees", icon: "👨‍💻", feature: "employee" },
  { title: "Tasks", path: "/owner/tasks", icon: "📋", feature: "tasks" },
  { title: "Attendance", path: "/owner/attendance", icon: "🕒", feature: "attendance" },
  { title: "Chat", path: "/owner/chat", icon: "💬", feature: "team_chat" },
  { title: "Screenshots", path: "/owner/screenshots", icon: "📸" },
  { title: "Settings", path: "/owner/settings", icon: "⚙️" },
];

export default function OwnerSidebar() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");
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
      <p>Owner Panel</p>
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
            <span>{item.icon}</span>
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