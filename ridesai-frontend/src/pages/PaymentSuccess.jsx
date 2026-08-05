import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function PaymentSuccess() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Guards against React StrictMode calling this effect twice in
  // development, which was causing /complete-registration/ to fire
  // two concurrent requests and crash with a duplicate-username error.
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const activate = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const checkoutId = params.get("checkout_id");

        if (!checkoutId) {
          setError("Missing checkout ID.");
          return;
        }

        // Step 1: verify the payment with Stripe/Polar (existing logic, unchanged)
        await axiosClient.post(
          "/billing/payment-success/",
          {
            checkout_id: checkoutId,
          }
        );

        // Step 2: payment is verified — NOW create the actual account
        // (User + Company) using the details saved in session during
        // /register/.
        const savedPlan = JSON.parse(
          localStorage.getItem("selected_plan")
        );

        const res = await axiosClient.post(
          "/complete-registration/",
          {
            plan_id: savedPlan?.id,
          }
        );

        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh_token", res.data.refresh);
        localStorage.removeItem("selected_plan");

        // IMPORTANT: redirect is a frontend route (React Router),
        // not a backend URL — use navigate(), not window.location
        // pointed at the Django server.
        navigate(res.data.redirect || "/dashboard");

      } catch (err) {
        console.error(err.response?.data || err.message);

        // If the account was actually already created by a duplicate
        // request (StrictMode double-fire before this fix), don't show
        // a scary error — just send them to login instead.
        if (err.response?.status === 500) {
          setError("Your account may already be set up. Please try logging in.");
        } else {
          setError("Payment verification failed.");
        }
      }
    };

    activate();
  }, [navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
      }}
    >
      {error ? (
        <p style={{ color: "#dc2626" }}>{error}</p>
      ) : (
        <>
          <h2>Payment Successful 🎉</h2>
          <p>Verifying your payment...</p>
        </>
      )}
    </div>
  );
}