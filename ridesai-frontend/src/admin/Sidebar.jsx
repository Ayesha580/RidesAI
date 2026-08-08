import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";

const NAV_ITEMS = [
  { to: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { to: "/admin/businesses", label: "Businesses", icon: "🏢" },
    { to: "/admin/plans", label: "Plans", icon: "📦" },
  { to: "/admin/users", label: "Users", icon: "👥" },
  { to: "/admin/payments", label: "Payments", icon: "💳" },
];

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {!isOpen && (
        <button
          className="rideai_admin_mobiletoggle"
          onClick={() => setIsOpen(true)}
          aria-label="Open menu"
        >
          ☰
        </button>
      )}

      {isOpen && (
        <div
          className="rideai_admin_overlay"
          onClick={closeSidebar}
        ></div>
      )}

      <aside className={`rideai_admin_sidebar ${isOpen ? "open" : ""}`}>
        <button
          className="rideai_admin_closebtn"
          onClick={closeSidebar}
          aria-label="Close menu"
        >
          ✕
        </button>

        <div className="rideai_admin_sidebarlogo">
          <img src={logo} alt="Rides AI" />
          <h2>Rides AI</h2>
        </div>

        {NAV_ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={closeSidebar}
            className={location.pathname === item.to ? "rideai_admin_navactive" : ""}
          >
            <span className="rideai_admin_navicon">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </aside>
    </>
  );
}