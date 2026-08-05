import api from "../../api/axiosClient";

export const getPlanDetails = () =>
    api.get("/dashboard/owner/");

export const upgradePlan = (
    plan,
    seats,
    billing
)=>
api.post(
    "/billing/upgrade-plan/",
    {
        plan,
        seats,
        billing
    }
);