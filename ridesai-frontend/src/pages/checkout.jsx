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

  // ==========================================
  // LOAD SELECTED PLAN
  // ==========================================
  useEffect(() => {
    console.log("========== CHECKOUT PAGE LOADED ==========");

    try {
      const storedPlan = localStorage.getItem("selected_plan");

      console.log("LocalStorage selected_plan:", storedPlan);

      if (!storedPlan) {
        console.warn("No selected plan found.");
        navigate("/select-plan");
        return;
      }

      const savedPlan = JSON.parse(storedPlan);

      console.log("Parsed selected plan:", savedPlan);

      setPlan(savedPlan);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load selected plan:", error);

      localStorage.removeItem("selected_plan");
      navigate("/select-plan");
    }
  }, [navigate]);

  // ==========================================
  // PAYMENT
  // ==========================================
  async function handlePayment() {
    if (processing) {
      console.log("Payment already processing...");
      return;
    }

    if (!plan) {
      console.error("❌ Plan is missing.");
      return;
    }

    try {
      setProcessing(true);

      console.log("");
      console.log("==========================================");
      console.log("          PAYMENT PROCESS START");
      console.log("==========================================");

      // ------------------------------------------
      // 1. CREATE CHECKOUT
      // ------------------------------------------

      const payload = {
        plan: plan.name,
        seats: plan.seats || 1,
        billing: plan.billing,
      };

      console.log("STEP 1: Creating Polar checkout...");
      console.log("Payload:", payload);

      const res = await axiosClient.post(
        "/billing/create-checkout/",
        payload
      );

      console.log("");
      console.log("========== CREATE CHECKOUT RESPONSE ==========");
      console.log("Status:", res.status);
      console.log("Data:", res.data);
      console.log("Checkout ID:", res.data?.checkout_id);
      console.log("Checkout URL:", res.data?.checkout_url);

      // ------------------------------------------
      // CHECK BACKEND RESPONSE
      // ------------------------------------------

      if (!res.data) {
        throw new Error("Backend returned empty response.");
      }

      if (!res.data.checkout_url) {
        console.error(
          "❌ checkout_url missing from backend response."
        );

        throw new Error(
          "Checkout URL was not returned by backend."
        );
      }

      console.log("✅ Checkout URL received.");

      // ------------------------------------------
      // 2. CREATE POLAR EMBED CHECKOUT
      // ------------------------------------------

      console.log("");
      console.log("STEP 2: Opening Polar checkout...");

      const checkout = await PolarEmbedCheckout.create(
        res.data.checkout_url,
        {
          theme: "light",
        }
      );

      console.log("");
      console.log("========== POLAR CHECKOUT CREATED ==========");
      console.log("Polar checkout object:", checkout);

      // ------------------------------------------
      // 3. CLOSE EVENT
      // ------------------------------------------

      checkout.addEventListener("close", () => {
        console.log("");
        console.log("========== POLAR CHECKOUT CLOSED ==========");
        console.log(
          "Checkout was closed before success event."
        );

        setProcessing(false);
      });

      // ------------------------------------------
      // 4. SUCCESS EVENT
      // ------------------------------------------

      checkout.addEventListener("success", async (event) => {
        console.log("");
        console.log("==========================================");
        console.log("       🎉 POLAR SUCCESS EVENT FIRED");
        console.log("==========================================");

        console.log("Raw success event:", event);
        console.log("Event detail:", event?.detail);

        try {
          // ------------------------------------------
          // GET CHECKOUT ID
          // ------------------------------------------

          const checkoutId =
            event?.detail?.checkoutId ||
            event?.detail?.checkout_id ||
            res.data?.checkout_id;

          console.log("");
          console.log("Checkout ID from event:", event?.detail?.checkoutId);
          console.log(
            "Checkout ID from event detail:",
            event?.detail?.checkout_id
          );
          console.log(
            "Checkout ID from backend:",
            res.data?.checkout_id
          );
          console.log(
            "FINAL CHECKOUT ID:",
            checkoutId
          );

          if (!checkoutId) {
            console.error("❌ CHECKOUT ID NOT FOUND.");

            throw new Error(
              "Checkout ID missing after successful payment."
            );
          }

          // ------------------------------------------
          // 5. VERIFY PAYMENT
          // ------------------------------------------

          console.log("");
          console.log(
            "STEP 3: Calling /billing/payment-success/..."
          );

          const verifyPayload = {
            checkout_id: checkoutId,
          };

          console.log(
            "Verification payload:",
            verifyPayload
          );

          const verifyRes = await axiosClient.post(
            "/billing/payment-success/",
            verifyPayload
          );

          console.log("");
          console.log(
            "========== PAYMENT SUCCESS API RESPONSE =========="
          );

          console.log(
            "HTTP status:",
            verifyRes.status
          );

          console.log(
            "Full response:",
            verifyRes
          );

          console.log(
            "Response data:",
            verifyRes.data
          );

          // ------------------------------------------
          // 6. VERIFY BACKEND SUCCESS
          // ------------------------------------------

          if (verifyRes.data?.success) {
            console.log("");
            console.log("==========================================");
            console.log("       ✅ PAYMENT VERIFIED SUCCESSFULLY");
            console.log("==========================================");

            const redirectUrl =
              verifyRes.data?.redirect ||
              "/complete-registration/";

            console.log(
              "Backend redirect:",
              verifyRes.data?.redirect
            );

            console.log(
              "Final redirect URL:",
              redirectUrl
            );

            console.log(
              "Navigating now..."
            );

            // Small delay only so console/logs can be seen
            setTimeout(() => {
              navigate(redirectUrl);
            }, 300);
          } else {
            console.error("");
            console.error(
              "❌ PAYMENT VERIFICATION FAILED"
            );

            console.error(
              "Backend response:",
              verifyRes.data
            );

            alert(
              "Payment verify nahi ho saka. Support se contact karein."
            );
          }
        } catch (error) {
          console.error("");
          console.error(
            "=========================================="
          );
          console.error(
            "       ❌ PAYMENT VERIFICATION ERROR"
          );
          console.error(
            "=========================================="
          );

          console.error(
            "Error:",
            error
          );

          console.error(
            "Error message:",
            error?.message
          );

          console.error(
            "Response:",
            error?.response
          );

          console.error(
            "Response data:",
            error?.response?.data
          );

          console.error(
            "Response status:",
            error?.response?.status
          );

          alert(
            "Payment hui, lekin verification me issue aaya. Support se contact karein."
          );
        } finally {
          setProcessing(false);
        }
      });

      console.log("");
      console.log(
        "========== EVENT LISTENERS REGISTERED =========="
      );

      console.log(
        "Waiting for Polar success event..."
      );

    } catch (error) {
      console.error("");
      console.error(
        "=========================================="
      );
      console.error(
        "       ❌ CREATE CHECKOUT ERROR"
      );
      console.error(
        "=========================================="
      );

      console.error(
        "Error:",
        error
      );

      console.error(
        "Error message:",
        error?.message
      );

      console.error(
        "Axios response:",
        error?.response
      );

      console.error(
        "Response data:",
        error?.response?.data
      );

      console.error(
        "Response status:",
        error?.response?.status
      );

      alert(
        "Unable to start payment."
      );

      setProcessing(false);
    }
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading || !plan) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
        }}
      >
        Loading...
      </div>
    );
  }

  // ==========================================
  // ORDER CALCULATIONS
  // ==========================================

  const seats = plan.seats || 1;
  const price = Number(plan.price) || 0;
  const total = price * seats;

  const billingLabel =
    plan.billing === "yearly"
      ? "Yearly"
      : "Monthly";

  // ==========================================
  // UI
  // ==========================================

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
          {/* ======================================
              LEFT SIDE
          ====================================== */}

          <div style={{ padding: "50px" }}>
            <h1
              style={{
                marginBottom: "10px",
                color: "#111827",
                fontSize: "36px",
              }}
            >
              Checkout
            </h1>

            <p
              style={{
                color: "#6b7280",
                marginBottom: "40px",
                fontSize: "17px",
              }}
            >
              You're almost done. Review your
              subscription below.
            </p>

            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "15px",
                padding: "30px",
              }}
            >
              <h2
                style={{
                  marginBottom: "25px",
                  color: "#111827",
                }}
              >
                Included Features
              </h2>

              {(plan.features || []).map(
                (feature, index) => (
                  <div
                    key={`${feature}-${index}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "18px",
                      fontSize: "17px",
                    }}
                  >
                    <span
                      style={{
                        color: "#22c55e",
                        marginRight: "12px",
                        fontSize: "22px",
                      }}
                    >
                      ✔
                    </span>

                    {feature}
                  </div>
                )
              )}
            </div>

            {/* BUTTONS */}

            <div
              style={{
                marginTop: "30px",
                display: "flex",
                gap: "15px",
              }}
            >
              <button
                onClick={handlePayment}
                disabled={processing}
                style={{
                  flex: 1,
                  padding: "18px",
                  border: "none",
                  borderRadius: "12px",
                  background: processing
                    ? "#9ca3af"
                    : "#FF77FF",
                  color: "#fff",
                  fontSize: "18px",
                  fontWeight: "700",
                  cursor: processing
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {processing
                  ? "Processing..."
                  : "Pay Now →"}
              </button>

              <button
                onClick={() =>
                  navigate("/select-plan")
                }
                disabled={processing}
                style={{
                  flex: 1,
                  padding: "16px",
                  borderRadius: "12px",
                  background: "#fff",
                  border: "1px solid #d1d5db",
                  fontSize: "16px",
                  color: "#000",
                  cursor: processing
                    ? "not-allowed"
                    : "pointer",
                  fontWeight: "600",
                }}
              >
                Change Plan
              </button>
            </div>
          </div>

          {/* ======================================
              RIGHT SIDE
          ====================================== */}

          <div
            style={{
              background: "#f8fafc",
              padding: "45px",
              borderLeft: "1px solid #e5e7eb",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h2
              style={{
                marginBottom: "25px",
                color: "#111827",
              }}
            >
              Order Summary
            </h2>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "18px",
              }}
            >
              <span>Plan</span>
              <strong>{plan.name}</strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "18px",
              }}
            >
              <span>Billing</span>
              <strong>{billingLabel}</strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "18px",
              }}
            >
              <span>Seats</span>
              <strong>{seats}</strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "25px",
              }}
            >
              <span>Price per seat</span>
              <strong>${price}</strong>
            </div>

            <hr
              style={{
                border: "none",
                borderTop: "1px solid #ddd",
                marginBottom: "25px",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "28px",
                fontWeight: "700",
                marginBottom: "35px",
                color: "#FF77FF",
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