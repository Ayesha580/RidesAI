import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import "../../components/sidebar.css";

const menu = [
  { title: "Dashboard", path: "/manager/dashboard", icon: "📊" },
  { title: "My Team", path: "/manager/team", icon: "👨‍💼" },
  { title: "Tasks", path: "/manager/tasks", icon: "📋" },
  { title: "My Tasks", path: "/manager/mytasks", icon: "📋" },
  { title: "Announcements", path: "/manager/announcements", icon: "📋" },
];

export default function ManagerSidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("user");

    navigate("/login");
  };

  return (
    <aside className="ridesai-side">

      <div className="ridesai-side-logo">
        <img
          src={logo}
          alt="Rides AI Logo"
          className="ridesai-side-logo-img"
        />

        <div>
          <h2>Rides AI</h2>
          <p>Manager Panel</p>
        </div>
      </div>

      <ul className="ridesai-side-menu">
        {menu.map((item) => (
          <li key={item.path}>
            <NavLink
              to={item.path}
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
  );
}