import { Outlet } from "react-router-dom";
import HRSidebar from "./HRSidebar";
import Topbar from "../Topbar";
import "./HRDashboard.css";

export default function HRLayout() {
  return (
    <div className="hrlayout_wrapper">
      <HRSidebar />

      <div className="hrlayout_main">
        <Topbar />

        <div className="hrlayout_content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}