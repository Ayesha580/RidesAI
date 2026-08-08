import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import axiosClient from "../api/axiosClient";

function friendlyError(err) {
  const status = err.response?.status;
  if (status === 401 || status === 403) return "Not authorized - login required";
  if (status === 404) return "Endpoint not found (check the URL / trailing slash)";
  if (typeof err.response?.data === "string") {
    return `Server returned non-JSON response (status ${status ?? "unknown"})`;
  }
  return err.response?.data?.error || err.message || "Failed to load data";
}

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    loadPlans(isMounted);
    return () => {
      isMounted = false;
    };
  }, []);

  async function loadPlans(isMounted = true) {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosClient.get("/dashboard/superadmin/plans/");
      const data = Array.isArray(res.data) ? res.data : res.data?.results || [];

      if (isMounted) setPlans(data);
    } catch (err) {
      if (isMounted) {
        setError(friendlyError(err));
        setPlans([]);
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="rideai_admin_dashheading">
        <h2>Plans</h2>
        <p>Saare available subscription plans jo companies choose kar sakti hain</p>
      </div>

      {error && (
        <div className="rideai_admin_error">
          Couldn't load plans — {error}.{" "}
          <button className="rideai_admin_retrybtn" onClick={() => loadPlans()}>
            Retry
          </button>
        </div>
      )}

      <div className="rideai_admin_tablepanel">
        {loading ? (
          <div className="rideai_admin_panelempty">Loading…</div>
        ) : plans.length === 0 ? (
          <div className="rideai_admin_panelempty">Koi plan nahi mila.</div>
        ) : (
          <table className="rideai_admin_datatable">
            <thead>
              <tr>
                <th>Plan Name</th>
                <th>Price</th>
                <th>Billing Cycle</th>
                <th>Max Seats</th>
                <th>Companies Using</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td data-label="Plan Name" className="rideai_admin_cellstrong">
                    {plan.name}
                  </td>
                  <td data-label="Price">{plan.price ? `$${plan.price}` : "—"}</td>
                  <td data-label="Billing Cycle">{plan.billing_cycle || "—"}</td>
                  <td data-label="Max Seats">{plan.max_seats ?? "—"}</td>
                  <td data-label="Companies Using">{plan.company_count ?? 0}</td>
                  <td data-label="Status">
                    <span
                      className={`rideai_admin_statusbadge ${
                        plan.is_active
                          ? "rideai_admin_status-active"
                          : "rideai_admin_status-inactive"
                      }`}
                    >
                      {plan.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}