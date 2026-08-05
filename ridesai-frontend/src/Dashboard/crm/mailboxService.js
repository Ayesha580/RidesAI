import api from "../../api/axiosClient";

export const getMailbox = () =>
    api.get("/integrations/mailbox/");

export const connectMailbox = () =>
    api.get("/integrations/google/login/");

export const disconnectMailbox = () =>
    api.delete("/integrations/disconnect/");

export const sendTestEmail = (email) =>
    api.post("/integrations/send-test/", {
        email,
    });