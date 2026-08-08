import { Outlet } from "react-router-dom";
import EmployeeSidebar from "./EmployeeSidebar";
import Topbar from "../Topbar";
import "./EmployeeDashboard.css";

export default function EmployeeLayout() {
  return (
    <div className="rideai_emp_wrapper">
      <EmployeeSidebar />

      <div className="rideai_emp_main">
        <Topbar />

        <div className="rideai_emp_content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}