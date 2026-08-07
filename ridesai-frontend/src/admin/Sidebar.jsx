import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/admin/businesses", label: "Businesses", icon: "🏢" },
  { to: "/admin/users", label: "Users", icon: "👥" },
  { to: "/admin/bookings", label: "Bookings", icon: "📅" },
  { to: "/admin/chatbot", label: "AI Chatbot", icon: "🤖" },
  { to: "/admin/payments", label: "Payments", icon: "💳" },
  { to: "/admin/hr", label: "HR Management", icon: "🧑‍💼" },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <img src={logo} alt="Rides AI" />
        <h2>Rides AI</h2>
      </div>

      {NAV_ITEMS.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={location.pathname === item.to ? "active" : ""}
        >
          <span className="nav-icon">{item.icon}</span>
          {item.label}
        </Link>
      ))}
    </aside>
  );
}