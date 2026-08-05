import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./Dashboard.css";

export default function DashboardLayout() {
  return (
    <div className="dashboard-wrapper">
      <Sidebar />

      <div className="dashboard-main">
        <Topbar />

        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}