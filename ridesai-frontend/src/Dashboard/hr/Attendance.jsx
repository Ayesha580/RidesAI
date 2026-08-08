import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import "./Attendance.css";

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    onBreak: 0,
  });

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const res = await axiosClient.get("/hr/attendance/company/");
      const data = res.data;
      setAttendance(data);

      let present = 0;
      let absent = 0;
      let late = 0;
      let onBreak = 0;

      data.forEach((item) => {
        if (!item.clock_in) {
          absent++;
        } else {
          present++;
        }

        if (item.is_late) {
          late++;
        }

        if (item.is_on_break) {
          onBreak++;
        }
      });

      setStats({ present, absent, late, onBreak });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <h3>Loading...</h3>;
  }

  return (
    <div className="hratt_page">
      <div className="hratt_header">
        <h2>Attendance Management</h2>
      </div>

      <div className="hratt_cards">
        <div className="hratt_card hratt_present">
          <h3>Present</h3>
          <span>{stats.present}</span>
        </div>

        <div className="hratt_card hratt_absent">
          <h3>Absent</h3>
          <span>{stats.absent}</span>
        </div>

        <div className="hratt_card hratt_late">
          <h3>Late</h3>
          <span>{stats.late}</span>
        </div>

        <div className="hratt_card hratt_break">
          <h3>On Break</h3>
          <span>{stats.onBreak}</span>
        </div>
      </div>

      <div className="hratt_table-wrap">
        <table className="hratt_table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Date</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Late</th>
              <th>Break</th>
            </tr>
          </thead>

          <tbody>
            {attendance.length === 0 ? (
              <tr>
                <td colSpan="6" className="hratt_empty">No attendance records found.</td>
              </tr>
            ) : (
              attendance.map((item) => (
                <tr key={item.id}>
                  <td>{item.employee_name}</td>
                  <td>{item.date}</td>
                  <td>
                    {item.clock_in
                      ? new Date(item.clock_in).toLocaleTimeString()
                      : "--"}
                  </td>
                  <td>
                    {item.clock_out
                      ? new Date(item.clock_out).toLocaleTimeString()
                      : "--"}
                  </td>
                  <td>
                    <span className={`hratt_status ${item.is_late ? "hratt_status-late" : "hratt_status-ontime"}`}>
                      {item.is_late ? "Yes" : "No"}
                    </span>
                  </td>
                  <td>
                    {item.is_on_break ? (
                      <span className="hratt_status hratt_status-onbreak">On Break</span>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}