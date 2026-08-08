import { useEffect, useMemo, useState } from "react";
import AdminLayout from "./AdminLayout";
import axiosClient from "../api/axiosClient";
import "./Payments.css";

function friendlyError(err) {
  const status = err.response?.status;

  if (status === 401 || status === 403) {
    return "Not authorized - login required";
  }

  if (status === 404) {
    return "Endpoint not found (check the URL / trailing slash)";
  }

  if (typeof err.response?.data === "string") {
    return `Server returned non-JSON response (status ${
      status ?? "unknown"
    })`;
  }

  return (
    err.response?.data?.error ||
    err.message ||
    "Failed to load payment data"
  );
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

      const res = await axiosClient.get(
        "/dashboard/superadmin/payments/"
      );

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.results || [];

      if (isMounted) {
        setPayments(data);
      }
    } catch (err) {
      if (isMounted) {
        setError(friendlyError(err));
        setPayments([]);
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }
  }

  const stats = useMemo(() => {
    const total = payments.length;

    const active = payments.filter(
      (p) =>
        String(p.status || "").toLowerCase() === "active"
    ).length;

    const inactive = payments.filter(
      (p) =>
        String(p.status || "").toLowerCase() !== "active"
    ).length;

    const totalRevenue = payments.reduce((sum, payment) => {
      const price = Number(payment.price || 0);

      return sum + (Number.isFinite(price) ? price : 0);
    }, 0);

    return {
      total,
      active,
      inactive,
      totalRevenue,
    };
  }, [payments]);

  function formatPrice(price) {
    if (
      price === null ||
      price === undefined ||
      price === ""
    ) {
      return "—";
    }

    const numericPrice = Number(price);

    if (!Number.isFinite(numericPrice)) {
      return `$${price}`;
    }

    return `$${numericPrice.toLocaleString(
      "en-US",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    )}`;
  }

  function formatBillingCycle(cycle) {
    if (!cycle) return "—";

    return String(cycle)
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  }

  function formatStatus(status) {
    if (!status) return "Unknown";

    return String(status)
      .replace(/[_-]/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      );
  }

  function getStatusClass(status) {
    const normalized = String(status || "")
      .toLowerCase()
      .replace(/[\s_-]/g, "");

    if (
      normalized === "active" ||
      normalized === "paid" ||
      normalized === "success" ||
      normalized === "successful"
    ) {
      return "payment-status-active";
    }

    if (
      normalized === "pending" ||
      normalized === "processing"
    ) {
      return "payment-status-pending";
    }

    if (
      normalized === "cancelled" ||
      normalized === "canceled" ||
      normalized === "expired" ||
      normalized === "failed"
    ) {
      return "payment-status-danger";
    }

    return "payment-status-neutral";
  }

  function shortenSubscriptionId(id) {
    if (!id) return "—";

    const value = String(id);

    if (value.length <= 26) {
      return value;
    }

    return `${value.slice(0, 12)}...${value.slice(-10)}`;
  }

  return (
    <AdminLayout>
      <div className="payments-page">

        {/* PAGE HEADER */}
        <div className="payments-header">

          <div className="payments-title-row">

            <div className="payments-title-icon">
              $
            </div>

            <div>
              <h2>Payments</h2>

              <p>
                Monitor business subscriptions,
                billing plans, and payment status.
              </p>
            </div>

          </div>

          <button
            className="payments-refresh-btn"
            onClick={() => loadPayments()}
            disabled={loading}
          >
            <span
              className={
                loading
                  ? "payments-refresh-spin"
                  : ""
              }
            >
              ↻
            </span>

            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>

        </div>


        {/* ERROR */}
        {error && (
          <div className="payments-error">

            <div className="payments-error-icon">
              !
            </div>

            <div className="payments-error-content">
              <strong>
                Unable to load payments
              </strong>

              <span>{error}</span>
            </div>

            <button
              className="payments-retry-btn"
              onClick={() => loadPayments()}
            >
              Retry
            </button>

          </div>
        )}


        {/* STAT CARDS */}
        <div className="payments-stats">

          <div className="payments-stat-card">

            <div className="payments-stat-icon purple">
              $
            </div>

            <div>
              <span>Total Subscriptions</span>
              <strong>{stats.total}</strong>
            </div>

          </div>


          <div className="payments-stat-card">

            <div className="payments-stat-icon green">
              ✓
            </div>

            <div>
              <span>Active Subscriptions</span>
              <strong>{stats.active}</strong>
            </div>

          </div>


          <div className="payments-stat-card">

            <div className="payments-stat-icon orange">
              !
            </div>

            <div>
              <span>Inactive</span>
              <strong>{stats.inactive}</strong>
            </div>

          </div>


          <div className="payments-stat-card">

            <div className="payments-stat-icon blue">
              $
            </div>

            <div>
              <span>Total Plan Value</span>
              <strong>
                {formatPrice(stats.totalRevenue)}
              </strong>
            </div>

          </div>

        </div>


        {/* MAIN PANEL */}
        <div className="payments-panel">

          <div className="payments-panel-header">

            <div>
              <h3>Subscription Payments</h3>

              <p>
                Business plans and billing information.
              </p>
            </div>

            <div className="payments-count">
              {payments.length}{" "}
              {payments.length === 1
                ? "Record"
                : "Records"}
            </div>

          </div>


          {/* LOADING */}
          {loading ? (
            <div className="payments-loading">

              <div className="payments-loading-spinner"></div>

              <span>
                Loading payment records...
              </span>

            </div>
          ) : payments.length === 0 ? (
            /* EMPTY */
            <div className="payments-empty">

              <div className="payments-empty-icon">
                $
              </div>

              <h4>No payment records found</h4>

              <p>
                There are currently no subscription
                payment records to display.
              </p>

              <button
                className="payments-empty-refresh"
                onClick={() => loadPayments()}
              >
                Refresh Payments
              </button>

            </div>
          ) : (
            /* TABLE */
            <div className="payments-table-wrapper">

              <table className="payments-table">

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

                  {payments.map((payment) => (
                    <tr
                      key={
                        payment.company_id ||
                        payment.polar_subscription_id
                      }
                    >

                      {/* COMPANY */}
                      <td data-label="Company">

                        <div className="payment-company">

                          <div className="payment-company-avatar">
                            {payment.company_name
                              ?.charAt(0)
                              ?.toUpperCase() || "C"}
                          </div>

                          <div className="payment-company-info">

                            <strong>
                              {payment.company_name ||
                                "Unnamed Company"}
                            </strong>

                            {payment.company_id && (
                              <span>
                                ID #{payment.company_id}
                              </span>
                            )}

                          </div>

                        </div>

                      </td>


                      {/* PLAN */}
                      <td data-label="Plan">

                        {payment.plan ? (
                          <span className="payment-plan">
                            {payment.plan}
                          </span>
                        ) : (
                          <span className="payment-muted">
                            No plan
                          </span>
                        )}

                      </td>


                      {/* BILLING */}
                      <td data-label="Billing">

                        <span className="payment-billing">
                          {formatBillingCycle(
                            payment.billing_cycle
                          )}
                        </span>

                      </td>


                      {/* PRICE */}
                      <td data-label="Price">

                        <span className="payment-price">
                          {formatPrice(payment.price)}
                        </span>

                      </td>


                      {/* SEATS */}
                      <td data-label="Seats">

                        <span className="payment-seats">
                          {payment.seats ?? "—"}
                        </span>

                      </td>


                      {/* STATUS */}
                      <td data-label="Status">

                        <span
                          className={`payment-status ${getStatusClass(
                            payment.status
                          )}`}
                        >
                          <span className="payment-status-dot"></span>

                          {formatStatus(
                            payment.status
                          )}
                        </span>

                      </td>


                      {/* SUBSCRIPTION */}
                      <td data-label="Subscription ID">

                        {payment.polar_subscription_id ? (
                          <div className="subscription-cell">

                            <span
                              className="subscription-id"
                              title={
                                payment.polar_subscription_id
                              }
                            >
                              {shortenSubscriptionId(
                                payment.polar_subscription_id
                              )}
                            </span>

                            <button
                              className="subscription-copy-btn"
                              title="Copy subscription ID"
                              onClick={() => {
                                navigator.clipboard?.writeText(
                                  payment.polar_subscription_id
                                );
                              }}
                            >
                              Copy
                            </button>

                          </div>
                        ) : (
                          <span className="payment-muted">
                            —
                          </span>
                        )}

                      </td>

                    </tr>
                  ))}

                </tbody>

              </table>

            </div>
          )}

        </div>

      </div>
    </AdminLayout>
  );
}
