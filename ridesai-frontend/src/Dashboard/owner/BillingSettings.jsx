import { useEffect, useState } from "react";
import {
  getPlanDetails,
  upgradePlan,
  getSubscriptionDetails,
  createCustomerSession,
  cancelSubscription,
  resumeSubscription,
} from "../billing/billingApi";

import "./Settings.css";

const PLANS = {
  monthly: [
    { name: "Standard", price: 5, description: "Essential business tools" },
    { name: "Premium", price: 20, description: "Advanced management features" },
    { name: "Gold", price: 50, description: "Complete enterprise solution" },
  ],
  yearly: [
    { name: "Standard", price: 54, description: "Essential business tools" },
    { name: "Premium", price: 216, description: "Advanced management features" },
    { name: "Gold", price: 540, description: "Complete enterprise solution" },
  ],
};

// Tier order — lower index = lower tier. Isi se pata chalta hai koi plan "upgrade" hai ya "downgrade".
const PLAN_ORDER = ["Standard", "Premium", "Gold"];
const getPlanRank = (planName) => PLAN_ORDER.indexOf(planName);

export default function BillingSettings() {
  const [tab, setTab] = useState("subscription");
  const [current, setCurrent] = useState(null);
  const [billing, setBilling] = useState("monthly");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [subscription, setSubscription] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    getPlanDetails()
      .then((res) => {
        const plan = res.data.plan;
        setCurrent(plan);
        setSelectedPlan(plan.name);
        setBilling(plan.billing || "monthly");
        setSeats(plan.seats || 1);
      })
      .finally(() => setLoading(false));

    getSubscriptionDetails()
      .then((res) => setSubscription(res.data))
      .catch((err) => console.error("Failed to load subscription details:", err));
  }, []);

  async function handleUpgrade(planName, seatsToUse, billingToUse) {
    try {
      setProcessing(true);
      const res = await upgradePlan(planName, seatsToUse, billingToUse);

      setCurrent({
        name: res.data.plan,
        billing: billingToUse,
        seats: res.data.seats,
        price_per_seat: current.price_per_seat,
      });

      const user = JSON.parse(localStorage.getItem("user"));
      if (user) {
        user.plan = res.data.plan;
        localStorage.setItem("user", JSON.stringify(user));
      }

      setMessage("Subscription updated successfully");
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      setMessage(error.response?.data?.error || "Something went wrong");
    } finally {
      setProcessing(false);
    }
  }

 async function handleManageBilling() {
  try {
    setPortalLoading(true);
    setMessage("");

    const res = await createCustomerSession();
    const url = res.data.session?.customer_portal_url;

    if (!url) {
      throw new Error("Customer portal URL was not returned.");
    }

    // Popup window (iframe NAHI) — CSP iski ijazat deta hai
    const width = 500;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const popup = window.open(
      url,
      "polar-portal",
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      // Popup blocker ne rok diya — fallback: naye tab mein khol dein
      window.open(url, "_blank", "noopener,noreferrer");
      setPortalLoading(false);
      return;
    }

    // Jab user popup band kare, subscription/payment details refresh kar dein
    const pollTimer = setInterval(() => {
      if (popup.closed) {
        clearInterval(pollTimer);
        setPortalLoading(false);

        getSubscriptionDetails()
          .then((r) => setSubscription(r.data))
          .catch((err) =>
            console.error("Failed to refresh subscription details:", err)
          );
      }
    }, 500);
  } catch (error) {
    console.error("Customer session error:", error);
    setMessage(
      error.response?.data?.error || "Unable to load payment method."
    );
    setPortalLoading(false);
  }
}

  async function handleCancelSubscription() {
    const confirmed = window.confirm(
      "Are you sure you want to cancel your subscription? You will continue to have access until the end of your current billing period."
    );

    if (!confirmed) return;

    try {
      setCancelLoading(true);
      setMessage("");

      const res = await cancelSubscription();
      setMessage(res.data.message || "Your subscription cancellation has been scheduled.");

      const subscriptionRes = await getSubscriptionDetails();
      setSubscription(subscriptionRes.data);
    } catch (error) {
      console.error("Cancel subscription error:", error);
      setMessage(error.response?.data?.error || "Unable to cancel subscription.");
    } finally {
      setCancelLoading(false);
    }
  }

  async function handleResumeSubscription() {
    try {
      setCancelLoading(true);
      setMessage("");

      const res = await resumeSubscription();
      setMessage(res.data.message || "Your subscription has been resumed.");

      const subscriptionRes = await getSubscriptionDetails();
      setSubscription(subscriptionRes.data);
    } catch (error) {
      console.error("Resume subscription error:", error);
      setMessage(error.response?.data?.error || "Unable to resume subscription.");
    } finally {
      setCancelLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;

  const plans = PLANS[billing];
  const selectedPlanData = plans.find((p) => p.name === selectedPlan);
  const total = selectedPlanData.price * seats;
  const samePlan = current.name === selectedPlan && current.billing === billing;
  const currentRank = getPlanRank(current.name);

  const isSameBillingTrack = billing === current.billing;

  const isPlanDisabled = (planName, isExactCurrent) => {
    if (isExactCurrent) return true;
    if (!isSameBillingTrack) return false;
    return getPlanRank(planName) < currentRank;
  };

  const selectedIsDowngrade = isPlanDisabled(selectedPlan, false) && !samePlan;

  return (
    <div className="billing-settings">
      {/* Tabs */}
      <div className="billing-tabs">
        <button className={tab === "subscription" ? "active" : ""} onClick={() => setTab("subscription")}>
          Subscription
        </button>
        <button className={tab === "seats" ? "active" : ""} onClick={() => setTab("seats")}>
          Seat Management
        </button>
        <button className={tab === "payment" ? "active" : ""} onClick={() => setTab("payment")}>
          Payment
        </button>
      </div>

      {tab === "subscription" && (
        <>
          {/* Current Plan */}
          <div className="current-plan-box">
            <div>
              <span className="label">Active Subscription</span>
              <h1>{current.name}</h1>
              <p>
                {current.seats} Seats &nbsp;•&nbsp; {current.billing}
              </p>
            </div>
            <div className="current-price">
              ${current.price_per_seat}
              <span>/seat</span>
            </div>
          </div>

          {/* Billing Toggle */}
          <div className="billing-toggle">
            <button className={billing === "monthly" ? "active" : ""} onClick={() => setBilling("monthly")}>
              Monthly
            </button>
            <button className={billing === "yearly" ? "active" : ""} onClick={() => setBilling("yearly")}>
              Yearly
            </button>
          </div>

          <h2>Choose Plan</h2>

          <div className="plan-grid">
            {plans.map((p) => {
              const isExactCurrent = current.name === p.name && current.billing === billing;
              const disabled = isPlanDisabled(p.name, isExactCurrent);

              return (
                <div
                  key={p.name}
                  className={[
                    "plan-card",
                    selectedPlan === p.name ? "selected" : "",
                    isExactCurrent ? "current-plan-disabled" : "",
                    !isExactCurrent && disabled ? "plan-disabled" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={
                    disabled
                      ? { opacity: 0.45, cursor: "not-allowed", pointerEvents: "none", filter: "grayscale(40%)" }
                      : { cursor: "pointer" }
                  }
                  onClick={() => !disabled && setSelectedPlan(p.name)}
                  aria-disabled={disabled}
                >
                  <h3>{p.name}</h3>
                  <h2>${p.price}</h2>
                  <span>per seat / {billing}</span>

                  {isExactCurrent && <span className="current-badge">Current Plan</span>}
                  {!isExactCurrent && disabled && <span className="unavailable-badge">Not Available</span>}
                </div>
              );
            })}
          </div>

          <h2>
            Total: ${total} / {billing === "monthly" ? "month" : "year"}
          </h2>
          <p>
            {seats} seats × ${selectedPlanData.price}
          </p>

          <button
            className="upgrade-btn"
            disabled={samePlan || processing || selectedIsDowngrade}
            onClick={() => handleUpgrade(selectedPlan, seats, billing)}
          >
            {processing ? "Updating..." : "Upgrade Plan"}
          </button>
        </>
      )}

      {tab === "seats" && (
        <div className="seat-management">
          <h2>Seat Management</h2>
          <p>
            Current Seats: <b>{current.seats}</b>
          </p>
          <p>
            Price: <b>${current.price_per_seat}/seat</b>
          </p>

          <div className="seat-control">
            <button onClick={() => setSeats((s) => Math.max(1, s - 1))} disabled={seats <= 1}>
              −
            </button>
            <h2>{seats}</h2>
            <button onClick={() => setSeats((s) => s + 1)}>+</button>
          </div>

          <h2>Additional Cost: ${Math.max(0, (seats - current.seats) * current.price_per_seat)}</h2>

          <button
            className="upgrade-btn"
            disabled={seats === current.seats || processing}
            onClick={() => handleUpgrade(current.name, seats, current.billing)}
          >
            {processing ? "Updating..." : "Update Seats"}
          </button>
        </div>
      )}

      {tab === "payment" && (
        <div className="payment-tab">

          <div className="payment-card">
            <div className="payment-card-icon">💳</div>

            <div className="payment-card-info">
              <span className="label">Payment Method</span>

              <h3>
                Payment method
              </h3>

              <p>
                Your payment method is securely managed.
              </p>
            </div>

            <button
              className="upgrade-btn"
              onClick={handleManageBilling}
              disabled={portalLoading}
            >
              {portalLoading
                ? "Loading..."
                : "Manage Payment Method"}
            </button>
          </div>

          {subscription && (
            <div className="payment-card">

              <div className="payment-card-icon">
                {subscription.cancel_at_period_end
                  ? "⚠️"
                  : "✅"}
              </div>

              <div className="payment-card-info">

                <span className="label">
                  Subscription Status
                </span>

                <h3>
                  {subscription.status
                    ? subscription.status.charAt(0).toUpperCase() +
                      subscription.status.slice(1)
                    : "Active"}
                </h3>

                {subscription.current_period_end && (
                  <p>
                    Next billing date:{" "}
                    <b>
                      {new Date(
                        subscription.current_period_end
                      ).toLocaleDateString()}
                    </b>
                  </p>
                )}

                {subscription.cancel_at_period_end && (
                  <p className="cancel-warning">
                    Your subscription is scheduled to cancel
                    at the end of the current billing period.
                  </p>
                )}

              </div>

              <div className="payment-card-actions">

                {subscription.cancel_at_period_end ? (
                  <button
                    className="upgrade-btn"
                    onClick={handleResumeSubscription}
                    disabled={cancelLoading}
                  >
                    {cancelLoading
                      ? "Processing..."
                      : "Resume Subscription"}
                  </button>
                ) : (
                  <button
                    className="cancel-subscription-btn"
                    onClick={handleCancelSubscription}
                    disabled={cancelLoading}
                  >
                    {cancelLoading
                      ? "Processing..."
                      : "Cancel Subscription"}
                  </button>
                )}

              </div>

            </div>
          )}

        </div>
      )}

      {message && <div className="success-message">{message}</div>}
    </div>
  );
}