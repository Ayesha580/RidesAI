import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import "./PricingPlan.css";
import { useState } from "react";


export default function SelectPlan() {
  const navigate = useNavigate();
  const [billing, setBilling] = useState("monthly");
  const [seatsMap, setSeatsMap] = useState({});

  function getSeats(planId) {
    return seatsMap[planId] || 1;
  }

  function updateSeats(planId, value) {
    const val = Math.max(1, parseInt(value) || 1);
    setSeatsMap((prev) => ({ ...prev, [planId]: val }));
  }

  const monthlyPlans = [
    {
      id: 1,
      name: "Standard",
      initial: "S",
      price: 5,
      period: "/seat/month",
      accent: "#2E62E8",
      accentSoft: "#EAF0FE",
      tagline: "Complete employee management for businesses of any size.",
      features: [
        "Unlimited Seats (Per Seat Pricing)",
        "Employee Profiles",
        "Employee Login & Logout",
        "Break Start / End",
        "Automatic Attendance",
        "GPS Location Tracking",
        "IP Restrictions",
        "Task Assignment",
        "Due Date & Priority",
        "Task Status & Comments",
        "Task History",
        "Leave Requests & Approval",
        "Late Arrival Tracking",
        "Announcements",
        "Notifications",
        "Employee Dashboard",
        "Manager Assignment",
        "Manager Dashboard",
        "Task Assignment by Managers",
         "AI Assistant 'Herry'"
      ],
    },
    {
      id: 2,
      name: "Premium",
      initial: "P",
      price: 20,
      period: "/seat/month",
      accent: "#7A46E0",
      accentSoft: "#F1EBFC",
      tagline: "Everything you need to manage employees and HR operations.",
      featured: true,
      features: [
        "Everything in Employee Management",
        "Unlimited Seats (Per Seat Pricing)",
        "HR Dashboard",
        "Hiring & Recruitment",
        "Application Tracking",
        "Offer Letter Generation",
        "Employee Onboarding",
        "Attendance Management",
        "Leave Management",
        "Departments",
        "Teams Management",
        "Manager Assignment",
        "Manager Dashboard",
        "Task Assignment by Managers",
        "Keyboard & Mouse Activity Tracking",
        "Screenshot Monitoring",
        "Team Chat",
        "Task Notifications",
        "AI Assistant 'Herry'"

      ],
    },
    {
      id: 3,
      name: "Gold",
      initial: "G",
      price: 50,
      period: "/seat/month",
      accent: "#0E9F6E",
      accentSoft: "#E7F7F1",
      tagline: "Complete ERP solution with Employee Management, HRMS & CRM.",
      features: [
        "Everything in Employee Management",
        "Everything in HRMS",
        "Unlimited Seats (Per Seat Pricing)",
        "Lead Management",
        "Owner Dashboard",
        "HR Dashboard",
        "Manager Dashboard",
        "Employee Dashboard",
        "Attendance Management",
        "Task Management",
        "Department Management",
        "Team Management",
        "Notifications",
        "Reports & Analytics",
        "Priority Support",
        "AI Assistant 'Herry'"

      ],
    },
  ];

  const yearlyPlans = [
    {
      id: 1,
      name: "Standard",
      initial: "S",
      originalPrice: 60,
      price: 54,
      period: "/seat/year",
      accent: "#2E62E8",
      accentSoft: "#EAF0FE",
      tagline: "Complete employee management for businesses of any size.",
      features: [
        "Unlimited Seats (Per Seat Pricing)",
        "Employee Profiles",
        "Employee Login & Logout",
        "Break Start / End",
        "Automatic Attendance",
        "GPS Location Tracking",
        "IP Restrictions",
        "Task Assignment",
        "Due Date & Priority",
        "Task Status & Comments",
        "Task History",
        "Leave Requests & Approval",
        "Late Arrival Tracking",
        "Announcements",
        "Notifications",
        "Employee Dashboard",
        "Manager Assignment",
        "Manager Dashboard",
        "Task Assignment by Managers",
        "AI Assistant 'Herry'"
      ],
    },
    {
      id: 2,
      name: "Premium",
      initial: "P",
      originalPrice: 240,
      price: 216,
      period: "/seat/year",
      accent: "#7A46E0",
      accentSoft: "#F1EBFC",
      tagline: "Everything you need to manage employees and HR operations.",
      featured: true,
      features: [
        "Everything in Employee Management",
        "Unlimited Seats (Per Seat Pricing)",
        "HR Dashboard",
        "Hiring & Recruitment",
        "Application Tracking",
        "Offer Letter Generation",
        "Employee Onboarding",
        "Attendance Management",
        "Leave Management",
        "Departments",
        "Teams Management",
        "Manager Assignment",
        "Manager Dashboard",
        "Task Assignment by Managers",
        "Keyboard & Mouse Activity Tracking",
        "Screenshot Monitoring",
        "Team Chat",
        "Task Notifications",
        "AI Assistant 'Herry'"
      ],
    },
    {
      id: 3,
      name: "Gold",
      initial: "G",
      originalPrice: 600,
      price: 540,
      period: "/seat/year",
      accent: "#0E9F6E",
      accentSoft: "#E7F7F1",
      tagline: "Complete ERP solution with Employee Management, HRMS & CRM.",
      features: [
        "Everything in Employee Management",
        "Everything in HRMS",
        "Unlimited Seats (Per Seat Pricing)",
        "Lead Management",
        "Owner Dashboard",
        "HR Dashboard",
        "Manager Dashboard",
        "Employee Dashboard",
        "Attendance Management",
        "Task Management",
        "Department Management",
        "Team Management",
        "Notifications",
        "Reports & Analytics",
        "Priority Support",
        "AI Assistant 'Herry'"
      ],
    },
  ];

  const plans = billing === "monthly" ? monthlyPlans : yearlyPlans;

  function selectPlan(plan) {
    const seats = getSeats(plan.id);
    localStorage.setItem(
      "selected_plan",
      JSON.stringify({ ...plan, seats, billing })
    );
    navigate("/checkout");
  }

  return (
    <>
      <Header />
      <div className="billing-switch">
        <button
          className={billing === "monthly" ? "active" : ""}
          onClick={() => setBilling("monthly")}
        >
          Monthly
        </button>

        <button
          className={billing === "yearly" ? "active" : ""}
          onClick={() => setBilling("yearly")}
        >
          Yearly
          <span className="billing-discount">Save 10%</span>
        </button>
      </div>
      <div
        style={{
          minHeight: "100vh",
          background: "#f5f7fb",
          padding: "70px 20px",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "auto",
          }}
        >
          <h1
            style={{
              textAlign: "center",
              fontSize: "42px",
              marginBottom: "10px",
              color: "#111827",
            }}
          >
            Choose Your Plan
          </h1>

          <p
            style={{
              textAlign: "center",
              color: "#6b7280",
              marginBottom: "60px",
              fontSize: "18px",
            }}
          >
            Select the perfect plan for your business.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
              gap: "30px",
            }}
          >
            {plans.map((plan) => {
              const seats = getSeats(plan.id);
              const total = plan.price * seats;

              return (
                <div
                  key={plan.id}
                  style={{
                    background: "#fff",
                    borderRadius: "18px",
                    padding: "35px",
                    boxShadow: "0 15px 40px rgba(0,0,0,.08)",
                    transition: ".3s",
                    textAlign: "center",
                  }}
                >
                  <div
                    style={{
                      width: "70px",
                      height: "70px",
                      margin: "0 auto 20px",
                      borderRadius: "50%",
                      background: plan.accent,
                      color: "#fff",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      fontSize: "28px",
                      fontWeight: "bold",
                    }}
                  >
                    $
                  </div>

                  <h2>{plan.name}</h2>

                  {billing === "yearly" && (
                  <div
                    style={{
                      fontSize: "20px",
                      color: "#9ca3af",
                      textDecoration: "line-through",
                      fontWeight: "600",
                      marginTop: "15px",
                    }}
                  >
                    ${plan.originalPrice * seats}
                  </div>
                )}

                <h1
                  style={{
                    fontSize: "55px",
                    color: plan.accent,
                    margin: "5px 0",
                  }}
                >
                  ${plan.price * seats}
                </h1>
                  <p style={{ color: "#777" }}>
                    {seats} {seats > 1 ? "Seats" : "Seat"} • 
                    {billing === "monthly" ? " / Month" : " / Year"}
                  </p>
                  {/* SEAT SELECTOR */}
                  <div
                    style={{
                      margin: "25px 0",
                      padding: "18px",
                      background: plan.accentSoft,
                      borderRadius: "12px",
                    }}
                  >
                    <label
                      style={{
                        display: "block",
                        marginBottom: "10px",
                        color: "#374151",
                        fontWeight: "600",
                        fontSize: "14px",
                      }}
                    >
                      Number of Seats
                    </label>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "12px",
                      }}
                    >
                      <button
                        onClick={() => updateSeats(plan.id, seats - 1)}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          background: "#fff",
                          color: "#374151",
                          fontSize: "18px",
                          cursor: "pointer",
                        }}
                      >
                        −
                      </button>

                      <input
                        type="number"
                        min="1"
                        value={seats}
                        onChange={(e) => updateSeats(plan.id, e.target.value)}
                        style={{
                          width: "60px",
                          padding: "8px",
                          textAlign: "center",
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          fontSize: "16px",
                        }}
                      />

                      <button
                        onClick={() => updateSeats(plan.id, seats + 1)}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          background: "#fff",
                          fontSize: "18px",
                          color: "#374151",
                          cursor: "pointer",
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: "30px 0",
                    }}
                  >
                    {plan.features.map((item) => (
                      <li
                        key={item}
                        style={{
                          padding: "10px 0",
                          borderBottom: "1px solid #eee",
                        }}
                      >
                        ✅ {item}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => selectPlan(plan)}
                    style={{
                      width: "100%",
                      padding: "15px",
                      border: "none",
                      borderRadius: "10px",
                      background: plan.accent,
                      color: "#fff",
                      fontSize: "17px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Choose Plan
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}