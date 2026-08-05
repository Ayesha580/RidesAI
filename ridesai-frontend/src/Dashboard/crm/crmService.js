import axiosClient from "../../api/axiosClient";

export const getLeads = (page = 1) =>
    axiosClient.get(`/crm/leads/?page=${page}`);

export const createLead = (data) =>
    axiosClient.post("/crm/leads/", data);

export const updateLead = (id, data) =>
    axiosClient.patch(`/crm/leads/${id}/`, data);

export const deleteLead = (id) =>
    axiosClient.delete(`/crm/leads/${id}/`);

export const importLeads = (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axiosClient.post("/crm/leads/import/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};