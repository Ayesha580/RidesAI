import { NavLink, Outlet, useLocation } from "react-router-dom";
import "./Settings.css";
import {hasFeature} from "../../utils/planAccess";

const settingsMenu=[


...(hasFeature("mailbox")?
[
{
title:"Mailbox",
path:"/owner/settings/mailbox",
icon:"📧",
description:"Connect your Gmail account",
}
]
:[]
),


{
title:"Billing & Subscription",
path:"/owner/settings/billing",
icon:"💳",
description:"Manage your plan and seats",
},
{
    title: "Profile",
    path: "/owner/settings/profile",
    icon: "👤",
    description: "Edit your personal information",
  },

]

export default function Settings() {

    const location = useLocation();

    const isSettingsRoot = location.pathname === "/owner/settings";

    return (

        <div className="settings-page">

            <h2>Settings</h2>

            <div className="settings-layout">

                {/* LEFT: settings list */}
                <div className="settings-sidebar">

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

                {/* RIGHT: selected setting's content */}
                <div className="settings-content">

                    {isSettingsRoot ? (

                        <div className="settings-empty-state">
                            <span className="settings-empty-icon">⚙️</span>
                        </div>

                    ) : (

                        <Outlet />

                    )}

                </div>

            </div>

        </div>

    );
}