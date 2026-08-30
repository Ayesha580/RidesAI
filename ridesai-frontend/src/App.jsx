import { useState, useEffect } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    useLocation
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import SplashScreen from "./pages/SplashScreen";

// Public Pages
import Landing from "./pages/Landing";
import PricingPlan from "./pages/PricingPlan";
import ContactPage from "./pages/Contact";
import HowItWorks from "./pages/HowitWorks";
import Register from "./pages/Register";
import Login from "./pages/Login";
import SelectPlan from "./pages/SelectPlan";
import Checkout from "./pages/checkout";
import Dashboard from "./pages/Dashboard";
import PaymentSuccess from "./pages/PaymentSuccess";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import TermofServices from "./pages/TermofServices";

// Admin
import AdminDashboard from "./admin/AdminDashboard";
import AdminLogin from "./admin/AdminLogin";
import AdminBusinesses from "./admin/Businesses";
import AdminUsers from "./admin/Users";
import AdminPayments from "./admin/Payments";
import Plans from "./admin/Plan";

// Owner
import DashboardLayout from "./Dashboard/DashboardLayout";
import OwnerDashboard from "./Dashboard/owner/OwnerDashboard";
import OwnerTasks from "./Dashboard/owner/OwnerTasks";
import OwnerAllAttendance from "./Dashboard/owner/Attendanceall";
import OwnerProfile from "./Dashboard/owner/Profile";
import OwnerChat from "./Dashboard/owner/Chat";
import OwnerCrm from "./Dashboard/owner/Crm";
import OwnerEmployees from "./Dashboard/owner/EmployeesList";
import OwnerAddEmployee from "./Dashboard/owner/OnwerAddEmployee";
import Screenshots from "./Dashboard/owner/Screenshots";
import Settings from "./Dashboard/owner/Settings";
import BillingSettings from "./Dashboard/owner/BillingSettings";
import OwnerMailbox from "./Dashboard/owner/Mailbox";
import HRManagement from "./Dashboard/owner/HRManagement";
import CreateHR from "./Dashboard/owner/AddHR";
import HRList from "./Dashboard/owner/HRList";
import ManagerManagement from "./Dashboard/owner/ManagerManagement";
import AddManager from "./Dashboard/owner/AddManager";
import ManagerList from "./Dashboard/owner/ManagerList";
import EditManager from "./Dashboard/owner/EditManager";
import EditHR from "./Dashboard/owner/EditHR";
import EditEmployee from "./Dashboard/owner/EditEmployee";

// Manager
import ManagerLayout from "./Dashboard/manager/ManagerLayout";
import ManagerDashboard from "./Dashboard/manager/ManagerDashboard";
import MyTeam from "./Dashboard/manager/MyTeam";
import ManagerTasks from "./Dashboard/manager/Task";
import ManagerAttendance from "./Dashboard/manager/Attendance";
import ManagerAnnouncements from "./Dashboard/manager/Announcements";
import MyTasks from "./Dashboard/manager/MyTask";
import ManagerChat from "./Dashboard/manager/Chat";

// HR
import HRLayout from "./Dashboard/hr/HRLayout";
import HRDashboard from "./Dashboard/hr/HRDashboard";
import EmployeeList from "./Dashboard/hr/EmployeeList";
import HRTask from "./Dashboard/hr/Tasks";
import HRAnnouncements from "./Dashboard/hr/Announcements";
import HRChat from "./Dashboard/hr/HRChat";
import Applications from "./Dashboard/hr/Applications";
import OfferLetters from "./Dashboard/hr/OfferLetters";
import HRAttendance from "./Dashboard/hr/Attendance";
import HRLeaves from "./Dashboard/hr/EmpLeaves";

// Employee
import EmployeeLayout from "./Dashboard/employee/EmployeeLayout";
import EmployeeDashboard from "./Dashboard/employee/EmployeeDashboard";
import MyProfile from "./Dashboard/employee/MyProfile";
import EmployeeChat from "./Dashboard/employee/EmployeeChat";
import Attendance from "./Dashboard/employee/Attendance";
import Tasks from "./Dashboard/employee/Tasks";
import Leave from "./Dashboard/employee/Leave";
import Payslips from "./Dashboard/employee/Payslips";
import Notifications from "./Dashboard/employee/Notifications";
import Support from "./components/Support";

// Herry
import OwnerHerry from "./Dashboard/owner/Herry";
import HRHerry from "./Dashboard/hr/Herry";
import ManagerHerry from "./Dashboard/manager/Herry";
import EmployeeHerry from "./Dashboard/employee/Herry";


export default function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}


function AppContent() {
    const [showSplash, setShowSplash] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSplash(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, []);

    // Splash sirf main domain "/" par
    if (location.pathname === "/" && showSplash) {
        return <SplashScreen />;
    }

    return (
        <Routes>

            {/* =====================================================
                PUBLIC ROUTES
            ===================================================== */}

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

            <Route
                path="/privacypolicy"
                element={<PrivacyPolicy />}
            />

            <Route
                path="/termofservices"
                element={<TermofServices />}
            />

            <Route
                path="/refundpolicy"
                element={<RefundPolicy />}
            />


            {/* =====================================================
                ADMIN ROUTES
            ===================================================== */}

            <Route
                path="/admin"
                element={<AdminLogin />}
            />

            <Route
                path="/admin/dashboard"
                element={<AdminDashboard />}
            />

            <Route
                path="/admin/businesses"
                element={<AdminBusinesses />}
            />

            <Route
                path="/admin/users"
                element={<AdminUsers />}
            />

            <Route
                path="/admin/payments"
                element={<AdminPayments />}
            />

            <Route
                path="/admin/plans"
                element={<Plans />}
            />


            {/* =====================================================
                MANAGER DASHBOARD
            ===================================================== */}

            <Route
                element={
                    <ProtectedRoute>
                        <ManagerLayout />
                    </ProtectedRoute>
                }
            >

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
                    path="/manager/chat"
                    element={
                        <ProtectedRoute feature="team_chat">
                            <ManagerChat />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/manager/herry"
                    element={
                        <ProtectedRoute>
                            <ManagerHerry />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/manager/attendance"
                    element={<ManagerAttendance />}
                />

            </Route>


            {/* =====================================================
                HR DASHBOARD
            ===================================================== */}

            <Route
                element={
                    <ProtectedRoute>
                        <HRLayout />
                    </ProtectedRoute>
                }
            >

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

                <Route
                    path="/hr/attendance"
                    element={<HRAttendance />}
                />

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
                    path="/hr/herry"
                    element={
                        <ProtectedRoute>
                            <HRHerry />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/hr/offer-letters"
                    element={<OfferLetters />}
                />

            </Route>


            {/* =====================================================
                EMPLOYEE DASHBOARD
            ===================================================== */}

            <Route
                element={
                    <ProtectedRoute>
                        <EmployeeLayout />
                    </ProtectedRoute>
                }
            >

                <Route
                    path="/employee/dashboard"
                    element={<EmployeeDashboard />}
                />

                <Route
                    path="/employee/profile"
                    element={<MyProfile />}
                />

                <Route
                    path="/employee/attendance"
                    element={<Attendance />}
                />

                <Route
                    path="/employee/tasks"
                    element={<Tasks />}
                />

                <Route
                    path="/employee/leave"
                    element={<Leave />}
                />

                <Route
                    path="/employee/payslips"
                    element={<Payslips />}
                />

                <Route
                    path="/employee/chat"
                    element={
                        <ProtectedRoute feature="team_chat">
                            <EmployeeChat />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employee/herry"
                    element={
                        <ProtectedRoute>
                            <EmployeeHerry />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/employee/notifications"
                    element={<Notifications />}
                />

            </Route>


            {/* =====================================================
                OWNER DASHBOARD
            ===================================================== */}

            <Route
                path="/dashboard"
                element={<Dashboard />}
            />

            <Route
                path="/dashboard/hr-management"
                element={<HRManagement />}
            />

            <Route
                element={
                    <ProtectedRoute>
                        <DashboardLayout />
                    </ProtectedRoute>
                }
            >

                <Route
                    path="/owner/dashboard"
                    element={<OwnerDashboard />}
                />

                {/* HR Management */}

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
                    path="/owner/hr/edit/:id"
                    element={<EditHR />}
                />


                {/* Tasks */}

                <Route
                    path="/owner/tasks"
                    element={<OwnerTasks />}
                />


                {/* Screenshots */}

                <Route
                    path="/owner/screenshots"
                    element={<Screenshots />}
                />


                {/* Settings */}

                <Route
                    path="/owner/settings"
                    element={<Settings />}
                >

                    <Route
                        path="mailbox"
                        element={
                            <ProtectedRoute feature="mailbox">
                                <OwnerMailbox />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="profile"
                        element={<OwnerProfile />}
                    />

                    <Route
                        path="billing"
                        element={<BillingSettings />}
                    />

                </Route>


                {/* CRM */}

                <Route
                    path="/owner/crm"
                    element={
                        <ProtectedRoute feature="crm">
                            <OwnerCrm />
                        </ProtectedRoute>
                    }
                />


                {/* Herry */}

                <Route
                    path="/owner/herry"
                    element={
                        <ProtectedRoute>
                            <OwnerHerry />
                        </ProtectedRoute>
                    }
                />


                {/* Managers */}

                <Route
                    path="/owner/managers"
                    element={<ManagerManagement />}
                />

                <Route
                    path="/owner/managers/add"
                    element={<AddManager />}
                />

                <Route
                    path="/owner/managers/:id"
                    element={<ManagerList />}
                />

                <Route
                    path="/owner/managers/:id/edit"
                    element={<EditManager />}
                />


                {/* Employees */}

                <Route
                    path="/owner/employees"
                    element={<OwnerEmployees />}
                />

                <Route
                    path="/owner/employees/add"
                    element={<OwnerAddEmployee />}
                />

                <Route
                    path="/owner/employees/:id/edit"
                    element={<EditEmployee />}
                />


                {/* Attendance */}

                <Route
                    path="/owner/attendance"
                    element={<OwnerAllAttendance />}
                />


                {/* Team Chat */}

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
    );
}
