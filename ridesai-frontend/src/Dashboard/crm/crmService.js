import axiosClient from "../../api/axiosClient";

export const getLeads = (page = 1) =>
  axiosClient.get(`/crm/leads/?page=${page}`);

export const deleteLead = (id) =>
  axiosClient.delete(`/crm/leads/${id}/`);

export const importLeads = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return axiosClient.post(
    "/crm/leads/import/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const convertLeadToClient = (id) =>
  axiosClient.post(`/crm/leads/${id}/convert/`);

export const getClients = (page = 1) =>
  axiosClient.get(`/crm/clients/?page=${page}`);

export const getClient = (id) =>
  axiosClient.get(`/crm/clients/${id}/`);

export const createClient = (data) =>
  axiosClient.post("/crm/clients/", data);

export const updateClient = (id, data) =>
  axiosClient.patch(`/crm/clients/${id}/`, data);

export const deleteClient = (id) =>
  axiosClient.delete(`/crm/clients/${id}/`);

export const changeClientStatus = (
  id,
  status,
  note = ""
) =>
  axiosClient.post(
    `/crm/clients/${id}/status/`,
    {
      status,
      note,
    }
  );

export const getDeals = (page = 1) =>
  axiosClient.get(`/crm/deals/?page=${page}`);

export const getDeal = (id) =>
  axiosClient.get(`/crm/deals/${id}/`);

export const createDeal = (data) =>
  axiosClient.post("/crm/deals/", data);

export const updateDeal = (id, data) =>
  axiosClient.patch(`/crm/deals/${id}/`, data);

export const deleteDeal = (id) =>
  axiosClient.delete(`/crm/deals/${id}/`);

export const changeDealStage = (
  id,
  stage,
  note = ""
) =>
  axiosClient.post(
    `/crm/deals/${id}/stage/`,
    {
      stage,
      note,
    }
  );

export const getInvoices = (page = 1) =>
  axiosClient.get(`/crm/invoices/?page=${page}`);

export const getInvoice = (id) =>
  axiosClient.get(`/crm/invoices/${id}/`);

export const createInvoice = (data) =>
  axiosClient.post("/crm/invoices/", data);

export const updateInvoice = (id, data) =>
  axiosClient.patch(`/crm/invoices/${id}/`, data);

export const deleteInvoice = (id) =>
  axiosClient.delete(`/crm/invoices/${id}/`);

 export const generateInvoicePDF = (id) =>
  axiosClient.post(`/crm/invoices/${id}/generate-pdf/`);

export const downloadInvoicePDF = (id) =>
  axiosClient.get(
    `/crm/invoices/${id}/download/`,
    {
      responseType: "blob",
    }
  );

export async function bulkDeleteLeads(payload) {
  const res = await axiosClient.post("/crm/leads/bulk-delete/", payload);
  return res.data;
}