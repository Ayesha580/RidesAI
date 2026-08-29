import api from "../../api/axiosClient";

export const getPlanDetails = () =>
  api.get("/dashboard/owner/");

export const getSubscriptionDetails = () =>
  api.get("/billing/subscription/");

export const createCustomerPortal = () =>
  api.post("/billing/customer-portal/");

export const createCustomerSession = () =>
  api.post("/billing/customer-session/");

export const cancelSubscription = () =>
  api.post("/billing/cancel/");

export const resumeSubscription = () =>
  api.post("/billing/resume/");

export const upgradePlan = (plan, seats, billing) =>
  api.post("/billing/upgrade-plan/", {
    plan,
    seats,
    billing,
  });