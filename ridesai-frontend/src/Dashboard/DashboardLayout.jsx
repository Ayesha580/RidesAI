import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./Dashboard.css";

export default function DashboardLayout() {
  return (
    <div className="dash_wrapper">
      <Sidebar />

      <div className="dash_main">
        <Topbar />

        <div className="dash_page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}