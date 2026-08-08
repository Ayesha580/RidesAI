import { Outlet } from "react-router-dom";
import ManagerSidebar from "./ManagerSidebar";
import Topbar from "../Topbar";
import "./ManagerLayout.css";

export default function ManagerLayout() {
  return (
    <div className="rideai_mgr_wrapper">
      <ManagerSidebar />

      <div className="rideai_mgr_main">
        <Topbar />

        <div className="rideai_mgr_content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}