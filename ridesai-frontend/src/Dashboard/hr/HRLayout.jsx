import { Outlet } from "react-router-dom";
import HRSidebar from "./HRSidebar";
import Topbar from "../Topbar";
import "./HRDashboard.css";

export default function HRLayout() {
  return (
    <div className="dashboard-wrapper">
      <HRSidebar />

      <div className="dashboard-main">
        <Topbar />

        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}