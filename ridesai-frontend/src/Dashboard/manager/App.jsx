import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Applications from "./dashboard/hr/Applications";
import OfferLetters from "./dashboard/hr/OfferLetters";
import Landing from "./pages/Landing";
import PricingPlan from "./pages/PricingPlan"
import ContactPage from "./pages/Contact"
import HowItWorks from "./pages/HowitWorks"
import Register from "./pages/Register";
import Login from "./pages/Login";
import SelectPlan from "./pages/SelectPlan";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import PaymentSuccess from "./pages/PaymentSuccess";
import OwnerChat from "./dashboard/owner/Chat";
import HRManagement from "./Dashboard/owner/HRManagement";
import CreateHR from "./Dashboard/owner/AddHR";
import HRList from "./Dashboard/owner/HRList";
import OwnerCrm from "./Dashboard/owner/Crm";
import Settings from "./Dashboard/owner/Settings";
import BillingSettings from "./Dashboard/owner/BillingSettings";
import OwnerMailbox from "./Dashboard/owner/Mailbox";
import ManagerManagement from "./Dashboard/owner/ManagerManagement"
import AddManager from "./Dashboard/owner/AddManager"
import ManagerList from "./Dashboard/owner/ManagerList"
import ManagerLayout from "./Dashboard/manager/ManagerLayout"
import ManagerDashboard from "./Dashboard/manager/ManagerDashboard";
import MyTeam from "./dashboard/manager/MyTeam";
import ManagerTasks from "./dashboard/manager/Task";
import ManagerAttendance from "./dashboard/manager/Attendance";
import ManagerAnnouncements from "./dashboard/manager/Announcements"
import MyTasks from "./dashboard/manager/MyTask"


import EmployeeLayout from "./dashboard/employee/EmployeeLayout";
import EmployeeDashboard from "./dashboard/employee/EmployeeDashboard";
import MyProfile from "./dashboard/employee/MyProfile";
import EmployeeChat from "./dashboard/employee/EmployeeChat"
import Attendance from "./dashboard/employee/Attendance";
import HRAttendance from "./dashboard/hr/Attendance";
import HRLeaves from "./dashboard/hr/EmpLeaves"
import Tasks from "./dashboard/employee/Tasks";
import Leave from "./dashboard/employee/Leave";
import Payslips from "./dashboard/employee/Payslips";
import Notifications from "./dashboard/employee/Notifications";


// HR Dashboard
import HRLayout from "./dashboard/hr/HRLayout";
import HRDashboard from "./dashboard/hr/HRDashboard";
import EmployeeList from "./dashboard/hr/EmployeeList";
import HRTask from "./dashboard/hr/Tasks"
import HRAnnouncements from "./dashboard/hr/Announcements"
import HRChat from "./dashboard/hr/HRChat"

import DashboardLayout from "./dashboard/DashboardLayout";
import OwnerDashboard from "./dashboard/owner/OwnerDashboard";
import OwnerTasks from "./dashboard/owner/OwnerTasks";
import OwnerEmployees from "./dashboard/owner/EmployeesList"
import OwnerAllAttendance from "./dashboard/owner/Attendanceall"

export default function App() {

return (

<BrowserRouter>

<Routes>


{/* Public Routes */}

<Route
path="/"
element={<Landing />}
/>

<Route
path="/register"
element={<Register />}
/>


<Route
path="/login"
element={<Login />}
/>



<Route
path="/select-plan"
element={<SelectPlan />}
/>


<Route
path="/checkout"
element={<Checkout />}
/>


<Route
path="/payment-success"
element={<PaymentSuccess />}
/>
<Route
path="/pricing"
element={<PricingPlan />}
/>
<Route
path="/contact"
element={<ContactPage />}
/>
<Route
path="/work"
element={<HowItWorks />}
/>


{/* Manager Dashboard Routes */}
<Route element={<ManagerLayout />}>

    <Route
        path="/manager/dashboard"
        element={<ManagerDashboard />}
    />


    <Route
        path="/manager/team"
        element={<MyTeam />}
    />


    <Route
        path="/manager/tasks"
        element={<ManagerTasks />}
    />
    <Route
        path="/manager/mytasks"
        element={<MyTasks />}
    />
    <Route
        path="/manager/announcements"
        element={<ManagerAnnouncements />}
    />


    <Route
        path="/manager/attendance"
        element={<ManagerAttendance />}
    />
    <Route
    path="/manager/attendance"
    element={<OwnerAllAttendance />}
    />


</Route>

{/* HR Dashboard Routes */}

<Route element={<HRLayout />}>

<Route
path="/hr/dashboard"
element={<HRDashboard />}
/>
<Route
path="/hr/leaves"
element={<HRLeaves />}
/>


<Route
path="/hr/employees"
element={<EmployeeList />}
/>
<Route path="/hr/attendance" element={<HRAttendance />} />
<Route
path="/hr/tasks"
element={<HRTask />}
/>
<Route
path="/hr/announcements"
element={<HRAnnouncements />}
/>
<Route
path="/hr/applications"
element={<Applications />}
/>
<Route
path="/hr/chat"
element={
<ProtectedRoute feature="team_chat">
    <HRChat />
</ProtectedRoute>
}
/>
<Route
path="/hr/offer-letters"
element={<OfferLetters/>}
/>

</Route>


<Route element={<EmployeeLayout />}>
  <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
  <Route path="/employee/profile" element={<MyProfile />} />
  <Route path="/employee/attendance" element={<Attendance />} />
  <Route path="/employee/tasks" element={<Tasks />} />
  <Route path="/employee/leave" element={<Leave />} />
  <Route path="/employee/payslips" element={<Payslips />} />
  <Route
    path="/employee/chat"
    element={
    <ProtectedRoute feature="team_chat">
        <EmployeeChat />
    </ProtectedRoute>
    }
    />
  <Route path="/employee/notifications" element={<Notifications />} />
</Route>



{/* Owner Routes */}

<Route
path="/dashboard"
element={<Dashboard />}
/>


<Route
path="/dashboard/hr-management"
element={<HRManagement />}
/>


<Route element={<DashboardLayout />}>

<Route
path="/owner/dashboard"
element={<OwnerDashboard />}
/>
<Route
path="/owner/hr"
element={
<ProtectedRoute feature="hr">
    <HRList />
</ProtectedRoute>
}
/>
<Route
path="/owner/hr/create"
element={<CreateHR />}
/>
<Route
 path="/owner/tasks"
 element={<OwnerTasks/>}
/>
<Route path="/owner/settings" element={<Settings />}>
    <Route
        path="/owner/settings/mailbox"
        element={
        <ProtectedRoute feature="mailbox">
            <OwnerMailbox />
        </ProtectedRoute>
        }
    />
  <Route path="/owner/settings/billing" element={<BillingSettings />} />
</Route>
<Route
path="/owner/crm"
element={
<ProtectedRoute feature="crm">
    <OwnerCrm />
</ProtectedRoute>
}
/>
<Route path="/owner/managers" element={<ManagerManagement />} />

<Route path="/owner/managers/add" element={<AddManager />} />

<Route path="/owner/managers/:id" element={<ManagerList />} />
<Route
path="/owner/employees"
element={<OwnerEmployees />}
/>
<Route
path="/owner/attendance"
element={<OwnerAllAttendance />}
/>
<Route
path="/owner/chat"
element={
<ProtectedRoute feature="team_chat">
    <OwnerChat />
</ProtectedRoute>
}
/>
</Route>


</Routes>



</BrowserRouter>

)

}