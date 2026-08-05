import { Outlet } from "react-router-dom";
import ManagerSidebar from "./ManagerSidebar";
import Topbar from "../Topbar";
import "../hr/HRDashboard.css";


export default function ManagerLayout(){

return (

<div className="dashboard-wrapper">


    <ManagerSidebar />


    <div className="dashboard-main">


        <Topbar />


        <div className="page-content">

            <Outlet />

        </div>


    </div>


</div>

)

}