import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { hasFeature } from "../../utils/planAccess";

const menu = [
  { title: "Dashboard", path: "/hr/dashboard", icon: "📊" },
  { title: "Employees", path: "/hr/employees", icon: "👨‍💻" },
  { title: "Attendance", path: "/hr/attendance", icon: "🕒" },
  { title: "Tasks", path: "/hr/tasks", icon: "📋" },
    { title: "Announcements", path: "/hr/announcements", icon: "📋" },
  { title: "Leaves", path: "/hr/leaves", icon: "📋" },
  { title: "Applications", path: "/hr/applications", icon: "📄" },
  {
  title: "Chat",
  path: "/hr/chat",
  icon: "💬",
  feature:"team_chat"
},
];

export default function HRSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="logo">
        <img src={logo} alt="Rides AI Logo" className="logo-img" />

        <div>
          <h2>Rides AI</h2>
          <p>HR Panel</p>
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
              <span>{item.icon}</span>
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