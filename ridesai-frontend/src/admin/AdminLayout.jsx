import Sidebar from "./Sidebar";
import Header from "./Header";
import "./admin.css";

export default function AdminLayout({ children }) {
  return (
    <div className="rideai_admin_wrapper">
      <Sidebar />
      <div className="rideai_admin_content">
        <Header />
        <main className="rideai_admin_main">{children}</main>
      </div>
    </div>
  );
}