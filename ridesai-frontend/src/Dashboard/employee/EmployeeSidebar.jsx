import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { hasFeature } from "../../utils/planAccess";

const menu = [
  { title: "Dashboard", path: "/employee/dashboard", icon: "🏠" },
  { title: "Attendance", path: "/employee/attendance", icon: "🕒" },
  { title: "My Tasks", path: "/employee/tasks", icon: "📋" },
  { title: "Leave", path: "/employee/leave", icon: "📅" },
  { title: "Notifications", path: "/employee/notifications", icon: "🔔" },
  {title: "Chat", path: "/employee/chat", icon: "💬",feature:"team_chat"},
  { title: "My Profile", path: "/employee/profile", icon: "👤" },
];

export default function EmployeeSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    // Agar access_token use kar rahi ho to ye bhi remove kar do
    localStorage.removeItem("access_token");

    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="logo">
        <img
          src={logo}
          alt="Rides AI Logo"
          className="logo-img"
        />

        <div>
          <h2>Rides AI</h2>
          <p>Employee Panel</p>
        </div>
      </div>

      <ul className="menu">
        {menu
          .filter((item)=> !item.feature || hasFeature(item.feature))
          .map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              <span style={{ marginRight: "10px" }}>
                {item.icon}
              </span>
              {item.title}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Logout */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}