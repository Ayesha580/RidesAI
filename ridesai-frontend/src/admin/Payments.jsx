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

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    loadPayments(isMounted);
    return () => {
      isMounted = false;
    };
  }, []);

  async function loadPayments(isMounted = true) {
    try {
      setLoading(true);
      setError(null);

      const res = await axiosClient.get("/dashboard/superadmin/payments/");
      const data = Array.isArray(res.data) ? res.data : res.data?.results || [];

      if (isMounted) setPayments(data);
    } catch (err) {
      if (isMounted) {
        setError(friendlyError(err));
        setPayments([]);
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="dashboard-heading">
        <h2>Payments</h2>
{/*         <p>Har company ka active plan, seats aur billing cycle</p> */}
      </div>

      {error && (
        <div className="dashboard-error">
          Couldn't load payments — {error}.{" "}
          <button className="retry-btn" onClick={() => loadPayments()}>
            Retry
          </button>
        </div>
      )}

      <div className="table-panel">
        {loading ? (
          <div className="panel-empty">Loading…</div>
        ) : payments.length === 0 ? (
          <div className="panel-empty">Koi payment record nahi mila.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Plan</th>
                <th>Billing</th>
                <th>Price</th>
                <th>Seats</th>
                <th>Status</th>
                <th>Subscription ID</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.company_id}>
                  <td className="cell-strong">{p.company_name}</td>
                  <td>
                    {p.plan ? (
                      p.plan
                    ) : (
                      <span className="text-muted">No plan</span>
                    )}
                  </td>
                  <td>{p.billing_cycle || "—"}</td>
                  <td>{p.price ? `$${p.price}` : "—"}</td>
                  <td>{p.seats}</td>
                  <td>
                    <span className={`status-badge status-${p.status}`}>{p.status}</span>
                  </td>
                  <td className="mono-text">{p.polar_subscription_id || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}