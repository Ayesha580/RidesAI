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

      setStats({
        present,
        absent,
        late,
        onBreak,
      });
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
    <div className="attendance-page">

      <div className="page-header">
        <h2>Attendance Management</h2>
      </div>

      <div className="attendance-cards">

        <div className="card present">
          <h3>Present</h3>
          <span>{stats.present}</span>
        </div>

        <div className="card absent">
          <h3>Absent</h3>
          <span>{stats.absent}</span>
        </div>

        <div className="card late">
          <h3>Late</h3>
          <span>{stats.late}</span>
        </div>

        <div className="card break">
          <h3>On Break</h3>
          <span>{stats.onBreak}</span>
        </div>

      </div>

      <div className="table-wrapper">

        <table>

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

            {attendance.map((item) => (
              <tr key={item.id}>

                <td>
                  {item.employee_name}
                </td>

                <td>
                  {item.date}
                </td>

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
                  {item.is_late ? "Yes" : "No"}
                </td>

                <td>
                  {item.is_on_break ? "On Break" : "-"}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}