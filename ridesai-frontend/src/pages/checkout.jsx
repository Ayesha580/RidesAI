import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { PolarEmbedCheckout } from "@polar-sh/checkout/embed";

export default function Checkout() {
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const savedPlan = JSON.parse(localStorage.getItem("selected_plan"));

    if (!savedPlan) {
      navigate("/select-plan");
      return;
    }

    setPlan(savedPlan);
    setLoading(false);
  }, [navigate]);

  async function handlePayment() {
    if (processing) return;

    try {
      setProcessing(true);

      const res = await axiosClient.post("/billing/create-checkout/", {
        plan: plan.name,
        seats: plan.seats,
        billing: plan.billing,
      });

      const checkout = await PolarEmbedCheckout.create(
        res.data.checkout_url,
        { theme: "light" }
      );

      // Modal band hone par (success ho ya user manually close kare)
      checkout.addEventListener("close", () => {
        setProcessing(false);
      });

      // Payment successfully complete hone par
      checkout.addEventListener("success", async (event) => {
        try {
          const checkoutId = event?.detail?.checkoutId || res.data.checkout_id;

          const verifyRes = await axiosClient.post("/billing/payment-success/", {
            checkout_id: checkoutId,
          });

          if (verifyRes.data?.success) {
            navigate(verifyRes.data.redirect || "/complete-registration/");
          } else {
            alert("Payment verify nahi ho saka. Support se contact karein.");
          }
        } catch (err) {
          console.error(err);
          alert("Payment hui, lekin verification me issue aaya. Support se contact karein.");
        } finally {
          setProcessing(false);
        }
      });
    } catch (err) {
      console.error(err);
      alert("Unable to start payment.");
      setProcessing(false);
    }
  }

  if (loading || !plan) {
    return <div>Loading...</div>;
  }

  const seats = plan.seats || 1;
  const total = plan.price * seats;
  const billingLabel = plan.billing === "yearly" ? "Yearly" : "Monthly";

  return (
    <>
      <Header />
      <div
        style={{
          minHeight: "100vh",
          background: "#f5f7fb",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1100px",
            background: "#fff",
            borderRadius: "20px",
            overflow: "hidden",
            boxShadow: "0 20px 60px rgba(0,0,0,.08)",
            display: "grid",
            gridTemplateColumns: "1fr 420px",
          }}
        >
          {/* LEFT SIDE */}
          <div style={{ padding: "50px" }}>
            <h1 style={{ marginBottom: "10px", color: "#111827", fontSize: "36px" }}>
              Checkout
            </h1>

            <p style={{ color: "#6b7280", marginBottom: "40px", fontSize: "17px" }}>
              You're almost done. Review your subscription below.
            </p>

            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "15px",
                padding: "30px",
              }}
            >
              <h2 style={{ marginBottom: "25px", color: "#111827" }}>
                Included Features
              </h2>

              {(plan.features || []).map((feature) => (
                <div
                  key={feature}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "18px",
                    fontSize: "17px",
                  }}
                >
                  <span style={{ color: "#22c55e", marginRight: "12px", fontSize: "22px" }}>
                    ✔
                  </span>
                  {feature}
                </div>
              ))}
            </div>

            {/* BUTTONS - ab left side pr, ek hi line mein side by side */}
            <div style={{ marginTop: "30px", display: "flex", gap: "15px" }}>
              <button
                onClick={handlePayment}
                disabled={processing}
                style={{
                  flex: 1,
                  padding: "18px",
                  border: "none",
                  borderRadius: "12px",
                  background: "#be27ee",
                  color: "#fff",
                  fontSize: "18px",
                  fontWeight: "700",
                  cursor: processing ? "not-allowed" : "pointer",
                }}
              >
                {processing ? "Processing..." : "Pay Now →"}
              </button>

              <button
                onClick={() => navigate("/select-plan")}
                disabled={processing}
                style={{
                  flex: 1,
                  padding: "16px",
                  borderRadius: "12px",
                  background: "#fff",
                  border: "1px solid #d1d5db",
                  fontSize: "16px",
                  color: "#000",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Change Plan
              </button>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div
            style={{
              background: "#f8fafc",
              padding: "45px",
              borderLeft: "1px solid #e5e7eb",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h2 style={{ marginBottom: "25px", color: "#111827" }}>Order Summary</h2>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "18px" }}>
              <span>Plan</span>
              <strong>{plan.name}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "18px" }}>
              <span>Billing</span>
              <strong>{billingLabel}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "18px" }}>
              <span>Seats</span>
              <strong>{seats}</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "25px" }}>
              <span>Price per seat</span>
              <strong>${plan.price}</strong>
            </div>

            <hr style={{ border: "none", borderTop: "1px solid #ddd", marginBottom: "25px" }} />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "28px",
                fontWeight: "700",
                marginBottom: "35px",
                color: "#be27ee",
              }}
            >
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
