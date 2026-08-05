import Header from "../components/Header";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import "./PricingPlan.css";
import { useState } from "react";


export default function SelectPlan() {
  const navigate = useNavigate();
const [billing, setBilling] = useState("monthly");

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
    ],
  },
];
const plans = billing === "monthly" ? monthlyPlans : yearlyPlans;

  function selectPlan(plan) {
    localStorage.setItem("selected_plan", JSON.stringify(plan));
    navigate("/register");
  }

  return (
    <>
      <Header />

      <main className="plans-page">
                  <p className="plans-eyebrow">Pricing</p>

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
        <div className="plans-shell">          
          <h1 className="plans-title">Choose the plan that fits your team</h1>
          <p className="plans-subtitle">
            Every plan includes the core platform. Upgrade any time as your team grows.
          </p>

          <div className="plans-grid">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`plan-card${plan.featured ? " plan-card--featured" : ""}`}
                style={{ "--accent": plan.accent, "--accent-soft": plan.accentSoft }}
              >
                {plan.featured && <span className="plan-ribbon">Most chosen</span>}

                <div className="plan-badge">{plan.initial}</div>

                <h2 className="plan-name">{plan.name}</h2>
                <p className="plan-tagline">{plan.tagline}</p>

                <div className="plan-price">
                  {billing === "yearly" && (
                    <div className="plan-old-price">
                      ${plan.originalPrice}
                  </div>
                  )}

                  <div>
                    <span className="plan-price-currency">$</span>
                    <span className="plan-price-value">{plan.price}</span>
                    <span className="plan-price-period">{plan.period}</span>
                  </div>
                </div>
                {plan.badge && (
                    <div className="save-badge">
                        {plan.badge}
                    </div>
                )}

                <ul className="plan-features">
                  {plan.features.map((item) => (
                    <li key={item}>
                      <svg
                        className="plan-check"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M3 8.5L6.2 11.5L13 4.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                <button className="plan-cta" onClick={() => selectPlan(plan)}>
                  Get started
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}