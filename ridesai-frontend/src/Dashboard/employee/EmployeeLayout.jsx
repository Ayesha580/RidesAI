import { Outlet } from "react-router-dom";
import EmployeeSidebar from "./EmployeeSidebar";
import Topbar from "../Topbar";
import "./EmployeeDashboard.css";

export default function EmployeeLayout() {
  return (
    <div className="dashboard-wrapper">

      <EmployeeSidebar />

      <div className="dashboard-main">

        <Topbar />

        <div className="page-content">
          <Outlet />
        </div>

      </div>

    </div>
  );
}