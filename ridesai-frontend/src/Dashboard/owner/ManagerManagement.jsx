import { useNavigate } from "react-router-dom";
import HRList from "./ManagerList";

export default function ManagerManagement() {
  const navigate = useNavigate();

  return (
    <>
      <div className="manager-management-list">
        <HRList />
      </div>
    </>
  );
}