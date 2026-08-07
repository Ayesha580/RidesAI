import Sidebar from "./Sidebar";
import Header from "./Header";
import "./admin.css";

export default function AdminLayout({ children }) {
  return (
    <div className="admin-wrapper">
      <Sidebar />
      <div className="admin-content">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}