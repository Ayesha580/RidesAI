import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import "./HRList.css";

export default function HRList() {
  const navigate = useNavigate();

  const [hrs, setHrs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHRs();
  }, []);

  const fetchHRs = async () => {
    try {
      setLoading(true);

      const response = await axiosClient.get("/hr/hr-list/");

      setHrs(response.data || []);
    } catch (err) {
      alert(
        err.response?.data?.error ||
          "Unable to load HR list."
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteHR = async (id) => {
    if (!window.confirm("Are you sure you want to delete this HR?")) {
      return;
    }

    try {
      await axiosClient.delete(`/hr/${id}/delete/`);

      alert("✅ HR deleted successfully.");

      fetchHRs();
    } catch (err) {
      alert(
        err.response?.data?.error ||
          "Unable to delete HR."
      );
    }
  };

  if (loading) {
    return (
      <div className="hrlist_wrap">
        <div className="hrlist_panel">
          <p className="hrlist_loading">Loading HRs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hrlist_wrap">

      <div className="hrlist_panel">

        {/* Header */}
        <div className="hrlist_header">

          <div>
            <h1 className="hrlist_title">
              HR List
            </h1>

            <p className="hrlist_subtitle">
              Manage HR accounts.
            </p>
          </div>

          <button
            type="button"
            className="hrlist_add_btn"
            onClick={() =>
              navigate("/owner/hr/create")
            }
          >
            + Create HR
          </button>

        </div>

        {/* Empty */}
        {hrs.length === 0 ? (

          <div className="hrlist_empty">
            <h3>No HR Found</h3>

            <p>
              There are currently no HR accounts.
            </p>
          </div>

        ) : (

          /* Table */
          <div className="hrlist_table_wrapper">

            <table className="hrlist_table">

              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Age</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Joining Date</th>
                  <th>Salary</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>

                {hrs.map((hr) => (

                  <tr key={hr.id}>

                    <td>
                      {hr.name || "-"}
                    </td>

                    <td>
                      {hr.username || "-"}
                    </td>

                    <td>
                      {hr.email || "-"}
                    </td>

                    <td>
                      {hr.age || "-"}
                    </td>

                    <td>
                      {hr.department || "-"}
                    </td>

                    <td>
                      {hr.role || "-"}
                    </td>

                    <td>
                      {hr.joining_date || "-"}
                    </td>

                    <td>
                      {hr.salary !== null &&
                      hr.salary !== undefined &&
                      hr.salary !== ""
                        ? hr.salary
                        : "-"}
                    </td>

                    <td>
                      <div className="hrlist_actions">

                        <button
                          type="button"
                          className="hrlist_edit_btn"
                          onClick={() =>
                            navigate(
                              `/owner/hr/edit/${hr.id}`
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="hrlist_delete_btn"
                          onClick={() =>
                            deleteHR(hr.id)
                          }
                        >
                          Delete
                        </button>

                      </div>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}