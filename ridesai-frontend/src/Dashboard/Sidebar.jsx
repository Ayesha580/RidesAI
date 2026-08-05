import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { hasFeature } from "../utils/planAccess";
const menu = [

{
title:"Dashboard",
path:"/owner/dashboard",
icon:"📊"
},


{
title:"HR Management",
path:"/owner/hr",
icon:"👨‍💼",
feature:"hr"
},


{
title:"Managers",
path:"/owner/managers",
icon:"👨‍💼",
feature:"manager"
},


{
title:"CRM",
path:"/owner/crm",
icon:"👥",
feature:"crm"
},


{
title:"Employees",
path:"/owner/employees",
icon:"👨‍💻",
feature:"employee"
},


{
title:"Tasks",
path:"/owner/tasks",
icon:"📋",
feature:"tasks"
},


{
title:"Attendance",
path:"/owner/attendance",
icon:"🕒",
feature:"attendance"
},


{
title:"Chat",
path:"/owner/chat",
icon:"💬",
feature:"team_chat"
},
{
title:"Screenshots",
path:"/owner/screenshots",
icon:"📸"
},
{
title:"Settings",
path:"/owner/settings",
icon:"⚙️"
}

];

export default function OwnerSidebar() {
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
          <p>Owner Panel</p>
        </div>
      </div>

      <ul className="menu">
        {menu
          .filter(item=> !item.feature || hasFeature(item.feature))
          .map((item)=>(
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