// import { useEffect, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";
// import axiosClient from "../api/axiosClient";

// export default function PaymentSuccess() {
//   const [error, setError] = useState(null);
//   const navigate = useNavigate();
//   const hasRun = useRef(false);

//   useEffect(() => {
//     if (hasRun.current) {
//       console.log("⚠️ PaymentSuccess already ran. Skipping...");
//       return;
//     }

//     hasRun.current = true;

//     const activate = async () => {
//       try {
//         console.log("🚀 PaymentSuccess started");

//         const params = new URLSearchParams(window.location.search);
//         const checkoutId = params.get("checkout_id");

//         console.log("🔹 Checkout ID:", checkoutId);

//         if (!checkoutId) {
//           console.error("❌ Missing checkout ID");
//           setError("Missing checkout ID.");
//           return;
//         }

//         // Step 1: Verify payment
//         console.log("🔄 Verifying payment...");

//         const paymentResponse = await axiosClient.post(
//           "/billing/payment-success/",
//           {
//             checkout_id: checkoutId,
//           }
//         );

//         console.log("✅ Payment verification successful:", paymentResponse.data);

//         // Step 2: Get selected plan
//         const savedPlan = JSON.parse(
//           localStorage.getItem("selected_plan") || "null"
//         );

//         console.log("📦 Saved plan:", savedPlan);

//         // Step 3: Complete registration
//         console.log("🔄 Completing registration...");

//         const res = await axiosClient.post("/complete-registration/", {
//           plan_id: savedPlan?.id,
//         });

//         console.log("✅ Registration completed:", res.data);

//         // Step 4: Calculate purchase value
//         const seats = Number(savedPlan?.seats || 1);
//         const price = Number(savedPlan?.price);

//         console.log("💰 Price:", price);
//         console.log("💺 Seats:", seats);

//         if (!price || price <= 0) {
//           console.error("❌ Invalid purchase amount:", price);
//           throw new Error("Invalid purchase amount");
//         }

//         const total = price * seats;
//         const currency = savedPlan?.currency || "USD";

//         console.log("💵 Total Purchase Value:", total);
//         console.log("💱 Currency:", currency);

//         // Step 5: Purchase tracking
//         const purchaseKey = `purchase_tracked_${checkoutId}`;

//         console.log("🔑 Purchase Key:", purchaseKey);
//         console.log(
//           "🔍 Already tracked:",
//           localStorage.getItem(purchaseKey)
//         );

//         if (window.fbq && !localStorage.getItem(purchaseKey)) {
//           console.log("📊 🔥 FIRING META PURCHASE EVENT");

//           console.log("Meta Purchase Data:", {
//             value: total,
//             currency: currency.toUpperCase(),
//           });

//           window.fbq("track", "Purchase", {
//             value: total,
//             currency: currency.toUpperCase(),
//           });

//           localStorage.setItem(purchaseKey, "true");

//           console.log("✅ Meta Purchase event fired successfully");
//         } else {
//           if (!window.fbq) {
//             console.error("❌ window.fbq is NOT available");
//           }

//           if (localStorage.getItem(purchaseKey)) {
//             console.warn("⚠️ Purchase already tracked for this checkout");
//           }
//         }

//         // Step 6: Save tokens
//         localStorage.setItem("access_token", res.data.access);
//         localStorage.setItem("refresh_token", res.data.refresh);

//         localStorage.removeItem("selected_plan");

//         console.log("🎉 PaymentSuccess flow completed");

//         navigate(res.data.redirect || "/dashboard");
//       } catch (err) {
//         console.error("❌ PaymentSuccess Error:", err);
//         console.error(
//           "Server Error:",
//           err.response?.data || err.message
//         );

//         if (err.response?.status === 500) {
//           setError(
//             "Your account may already be set up. Please try logging in."
//           );
//         } else {
//           setError("Payment verification failed.");
//         }
//       }
//     };

//     activate();
//   }, [navigate]);

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         alignItems: "center",
//         gap: "10px",
//       }}
//     >
//       {error ? (
//         <p style={{ color: "#dc2626" }}>{error}</p>
//       ) : (
//         <>
//           <h2>Payment Successful 🎉</h2>
//           <p>Verifying your payment...</p>
//         </>
//       )}
//     </div>
//   );
// }
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

export default function PaymentSuccess() {
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) {
      console.log("⚠️ PaymentSuccess already ran. Skipping...");
      return;
    }

    hasRun.current = true;

    const activate = async () => {
      try {
        console.log("🚀 PaymentSuccess started");

        const params = new URLSearchParams(window.location.search);
        const checkoutId = params.get("checkout_id");

        console.log("🔹 Checkout ID:", checkoutId);

        if (!checkoutId) {
          console.error("❌ Missing checkout ID");
          setError("Missing checkout ID.");
          return;
        }

        // Step 1: Verify payment
        console.log("🔄 Verifying payment...");

        const paymentResponse = await axiosClient.post(
          "/billing/payment-success/",
          {
            checkout_id: checkoutId,
          }
        );

        console.log("✅ Payment verification successful:", paymentResponse.data);

        // Step 2: Get selected plan
        const savedPlan = JSON.parse(
          localStorage.getItem("selected_plan") || "null"
        );

        console.log("📦 Saved plan:", savedPlan);

        // Step 3: Complete registration
        console.log("🔄 Completing registration...");

        const res = await axiosClient.post("/complete-registration/", {
          plan_id: savedPlan?.id,
        });

        console.log("✅ Registration completed:", res.data);

        // Step 4: Calculate purchase value
        const seats = Number(savedPlan?.seats || 1);
        const price = Number(savedPlan?.price);

        console.log("💰 Price:", price);
        console.log("💺 Seats:", seats);

        if (!price || price <= 0) {
          console.error("❌ Invalid purchase amount:", price);
          throw new Error("Invalid purchase amount");
        }

        const total = price * seats;
        const currency = savedPlan?.currency || "USD";

        console.log("💵 Total Purchase Value:", total);
        console.log("💱 Currency:", currency);

        // Step 5: Save tokens
        localStorage.setItem("access_token", res.data.access);
        localStorage.setItem("refresh_token", res.data.refresh);

        localStorage.removeItem("selected_plan");

        console.log("🎉 PaymentSuccess flow completed");

        navigate(res.data.redirect || "/dashboard");
      } catch (err) {
        console.error("❌ PaymentSuccess Error:", err);
        console.error(
          "Server Error:",
          err.response?.data || err.message
        );

        if (err.response?.status === 500) {
          setError(
            "Your account may already be set up. Please try logging in."
          );
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