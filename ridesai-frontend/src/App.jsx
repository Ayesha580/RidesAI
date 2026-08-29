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
import Checkout from "./pages/Checkout";
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
import DashboardLayout from "./dashboard/DashboardLayout";
import OwnerDashboard from "./dashboard/owner/OwnerDashboard";
import OwnerTasks from "./dashboard/owner/OwnerTasks";
import OwnerAllAttendance from "./dashboard/owner/Attendanceall";
import OwnerProfile from "./dashboard/owner/Profile";
import OwnerChat from "./dashboard/owner/Chat";
import OwnerCrm from "./dashboard/owner/Crm";
import OwnerEmployees from "./dashboard/owner/EmployeesList";
import OwnerAddEmployee from "./dashboard/owner/OnwerAddEmployee";
import Screenshots from "./dashboard/owner/Screenshots";
import Settings from "./dashboard/owner/Settings";
import BillingSettings from "./dashboard/owner/BillingSettings";
import OwnerMailbox from "./Dashboard/owner/Mailbox";
import HRManagement from "./Dashboard/owner/HRManagement";
import CreateHR from "./Dashboard/owner/AddHR";
import HRList from "./Dashboard/owner/HRList";
import ManagerManagement from "./Dashboard/owner/ManagerManagement";
import AddManager from "./Dashboard/owner/AddManager";
import ManagerList from "./Dashboard/owner/ManagerList";
import EditManager from "./Dashboard/owner/EditManager";
import EditHR from "./Dashboard/owner/EditHR";
import EditEmployee from "./dashboard/owner/EditEmployee";   // ✅ naya import

// Manager
import ManagerLayout from "./Dashboard/manager/ManagerLayout";
import ManagerDashboard from "./Dashboard/manager/ManagerDashboard";
import MyTeam from "./dashboard/manager/MyTeam";
import ManagerTasks from "./dashboard/manager/Task";
import ManagerAttendance from "./dashboard/manager/Attendance";
import ManagerAnnouncements from "./dashboard/manager/Announcements";
import MyTasks from "./dashboard/manager/MyTask";
import ManagerChat from "./dashboard/manager/Chat";

// HR
import HRLayout from "./dashboard/hr/HRLayout";
import HRDashboard from "./dashboard/hr/HRDashboard";
import EmployeeList from "./dashboard/hr/EmployeeList";
import HRTask from "./dashboard/hr/Tasks";
import HRAnnouncements from "./dashboard/hr/Announcements";
import HRChat from "./dashboard/hr/HRChat";
import Applications from "./dashboard/hr/Applications";
import OfferLetters from "./dashboard/hr/OfferLetters";
import HRAttendance from "./dashboard/hr/Attendance";
import HRLeaves from "./dashboard/hr/EmpLeaves";

// Employee
import EmployeeLayout from "./dashboard/employee/EmployeeLayout";
import EmployeeDashboard from "./dashboard/employee/EmployeeDashboard";
import MyProfile from "./dashboard/employee/MyProfile";
import EmployeeChat from "./dashboard/employee/EmployeeChat";
import Attendance from "./dashboard/employee/Attendance";
import Tasks from "./dashboard/employee/Tasks";
import Leave from "./dashboard/employee/Leave";
import Payslips from "./dashboard/employee/Payslips";
import Notifications from "./dashboard/employee/Notifications";
import Support from "./components/Support";

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
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Support />
                            </ProtectedRoute>
                        }
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

                    {/* Team Chat */}
                    <Route
                        path="/manager/chat"
                        element={
                            <ProtectedRoute feature="team_chat">
                                <ManagerChat />
                            </ProtectedRoute>
                        }
                    />

                    {/* Herry - AI Business Assistant */}
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

                    {/* Team Chat */}
                    <Route
                        path="/hr/chat"
                        element={
                            <ProtectedRoute feature="team_chat">
                                <HRChat />
                            </ProtectedRoute>
                        }
                    />

                    {/* Herry - AI Business Assistant */}
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

                    {/* Team Chat */}
                    <Route
                        path="/employee/chat"
                        element={
                            <ProtectedRoute feature="team_chat">
                                <EmployeeChat />
                            </ProtectedRoute>
                        }
                    />

                    {/* Herry - AI Business Assistant */}
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


                    {/* Herry - AI Business Assistant */}

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
                    <Route path="/owner/managers/:id/edit" element={<EditManager />} />



                    {/* Employees */}

                    <Route
                        path="/owner/employees"
                        element={<OwnerEmployees />}
                    />
                    <Route path="/owner/employees/:id/edit" element={<EditEmployee />} />
                {/* Employees */}

                <Route
                    path="/owner/employees"
                    element={<OwnerEmployees />}
                />

                <Route
                    path="/owner/employees/add"
                    element={<OwnerAddEmployee />}
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