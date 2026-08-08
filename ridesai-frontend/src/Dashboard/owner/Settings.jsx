import { useEffect, useState } from "react";
import { NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import "./Settings.css";
import { hasFeature } from "../../utils/planAccess";

const settingsMenu = [
    ...(hasFeature("mailbox")
        ? [
              {
                  title: "Mailbox",
                  path: "/owner/settings/mailbox",
                  icon: "📧",
                  description: "Connect your Gmail account",
              },
          ]
        : []),
    {
        title: "Billing & Subscription",
        path: "/owner/settings/billing",
        icon: "💳",
        description: "Manage your plan and seats",
    },
    {
        title: "Profile",
        path: "/owner/settings/profile",
        icon: "👤",
        description: "Edit your personal information",
    },
];

export default function Settings() {
    const location = useLocation();
    const navigate = useNavigate();
    const isSettingsRoot = location.pathname === "/owner/settings";

    const [isMobile, setIsMobile] = useState(
        typeof window !== "undefined" ? window.innerWidth <= 768 : false
    );

    useEffect(() => {
        const mq = window.matchMedia("(max-width: 768px)");
        const handler = (e) => setIsMobile(e.matches);
        mq.addEventListener("change", handler);
        return () => mq.removeEventListener("change", handler);
    }, []);

    // Desktop pe root khulte hi Profile default dikhna chahiye
    if (isSettingsRoot && !isMobile) {
        return <Navigate to="/owner/settings/profile" replace />;
    }

    const activeItem = settingsMenu.find((item) => item.path === location.pathname);

    return (
        <div className="settings-page">
            <h2>Settings</h2>

            <div className="settings-layout">
                {/* LEFT: settings list — mobile pe sirf tab tak dikhta hai jab tak koi item select nahi hota */}
                <div className={`settings-sidebar ${!isSettingsRoot && isMobile ? "settings-mobile-hidden" : ""}`}>
                    {settingsMenu.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `settings-list-item ${isActive ? "active" : ""}`
                            }
                        >
                            <span className="settings-list-icon">{item.icon}</span>

                            <div className="settings-list-text">
                                <span className="settings-list-title">{item.title}</span>
                                <span className="settings-list-desc">{item.description}</span>
                            </div>

                            <span className="settings-list-arrow">&rsaquo;</span>
                        </NavLink>
                    ))}
                </div>

                {/* RIGHT: selected setting's content — mobile pe sirf tab dikhta hai jab item select ho */}
                <div className={`settings-content ${isSettingsRoot && isMobile ? "settings-mobile-hidden" : ""}`}>
                    {isSettingsRoot ? (
                        <div className="settings-empty-state">
                            <span className="settings-empty-icon">⚙️</span>
                        </div>
                    ) : (
                        <>
                            {isMobile && (
                                <button
                                    className="settings-back-btn"
                                    onClick={() => navigate("/owner/settings")}
                                >
                                    ‹ {activeItem?.title || "Back"}
                                </button>
                            )}
                            <Outlet />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}