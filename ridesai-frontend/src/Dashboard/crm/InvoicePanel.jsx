import { useEffect, useState } from "react";
import {
  getInvoice,
  updateInvoice,
  downloadInvoicePDF,
  generateInvoicePDF,
} from "./crmService";
import "./InvoicePanel.css";

const STATUS = {
  draft: "Draft",
  pending: "Pending",
  sent: "Sent",
  paid: "Paid",
  overdue: "Overdue",
  cancelled: "Cancelled",
};

const COLORS = {
  draft: "#64748b",
  pending: "#f59e0b",
  sent: "#3b82f6",
  paid: "#10b981",
  overdue: "#ef4444",
  cancelled: "#ef4444",
};

export default function InvoicePanel({ invoice, onClose, onUpdate }) {
  const [data, setData] = useState(invoice || null);
  const [status, setStatus] = useState(invoice?.status || "draft");
  const [paymentMethod, setPaymentMethod] = useState(
    invoice?.payment_method || ""
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (invoice?.id) {
      setData(invoice);
      setStatus(invoice.status || "draft");
      setPaymentMethod(invoice.payment_method || "");

      getInvoice(invoice.id)
        .then((response) => {
          const invoiceData = response?.data || response;
          setData(invoiceData);
          setStatus(invoiceData.status || "draft");
          setPaymentMethod(invoiceData.payment_method || "");
        })
        .catch((error) => {
          console.error("Invoice loading error:", error);
        });
    }
  }, [invoice]);

  async function handleSave() {
    if (!data?.id || saving) return;

    try {
      setSaving(true);

      const response = await updateInvoice(data.id, {
        status,
        payment_method: paymentMethod,
      });

      const updated = response?.data || response;

      setData((prev) => ({
        ...prev,
        ...updated,
        status,
        payment_method: paymentMethod,
      }));

      if (onUpdate) {
        await onUpdate();
      }

      alert("Invoice updated successfully.");
    } catch (error) {
      console.error("Invoice update error:", error);
      alert(
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Unable to update invoice."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload() {
    if (!data?.id || downloading) return;

    try {
      setDownloading(true);

      // Agar PDF file abhi tak generate nahi hui to pehle generate karo
      if (!data.pdf_file) {
        await generateInvoicePDF(data.id);
      }

      const response = await downloadInvoicePDF(data.id);

      const blob =
        response?.data instanceof Blob
          ? response.data
          : new Blob([response?.data], { type: "application/pdf" });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${data.invoice_number || `invoice-${data.id}`}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      // pdf_file ab exist karti hai, state update kar dete hain
      setData((prev) => ({ ...prev, pdf_file: prev.pdf_file || true }));
    } catch (error) {
      console.error("Invoice PDF error:", error);
      alert("Unable to download invoice PDF.");
    } finally {
      setDownloading(false);
    }
  }

  function formatMoney(value, currency = "USD") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  }

  function formatDate(date) {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  if (!data) return null;

  return (
    <div className="invoice-drawer-overlay" onClick={onClose}>
      <div className="invoice-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="invoice-drawer-header">
          <div>
            <span className="invoice-panel-label">Invoice</span>
            <h3>{data.invoice_number || `INV-${data.id}`}</h3>
            <span>
              {data.client_name ||
                data.client?.full_name ||
                data.client?.business_name ||
                "No client"}
            </span>
          </div>

          <button className="invoice-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="invoice-status-card">
          <div>
            <span>Status</span>
            <strong style={{ color: COLORS[status] || "#64748b" }}>
              {STATUS[status] || status}
            </strong>
          </div>

          <span
            className="status-badge"
            style={{
              color: COLORS[status] || "#64748b",
              background: `${COLORS[status] || "#64748b"}12`,
              borderColor: `${COLORS[status] || "#64748b"}25`,
            }}
          >
            <i style={{ background: COLORS[status] || "#64748b" }} />
            {STATUS[status] || status}
          </span>
        </div>

        <div className="invoice-info">
          <div>
            <span>Invoice Number</span>
            <strong>{data.invoice_number || `INV-${data.id}`}</strong>
          </div>

          <div>
            <span>Client</span>
            <strong>
              {data.client_name ||
                data.client?.full_name ||
                data.client?.business_name ||
                "—"}
            </strong>
          </div>

          <div>
            <span>Business</span>
            <strong>
              {data.business_name || data.client?.business_name || "—"}
            </strong>
          </div>

          <div>
            <span>Deal</span>
            <strong>{data.deal_title || data.deal?.title || "—"}</strong>
          </div>

          <div>
            <span>Created</span>
            <strong>{formatDate(data.created_at)}</strong>
          </div>

          <div>
            <span>Due Date</span>
            <strong>{formatDate(data.due_date)}</strong>
          </div>
        </div>

        <div className="invoice-amount-card">
          <span>Total Amount</span>
          <strong>{formatMoney(data.total, data.currency)}</strong>
        </div>

        <div className="invoice-edit-section">
          <label>Invoice Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {Object.entries(STATUS).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div className="invoice-edit-section">
          <label>Payment Method</label>
          <input
            type="text"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            placeholder="e.g. Bank Transfer, PayPal, Cash"
          />
          <small>
            This payment method will be shown on the generated invoice PDF.
          </small>
        </div>

        <div className="invoice-actions">
          <button
            className="invoice-download-btn"
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? "Preparing PDF..." : "↓ Download PDF"}
          </button>

          <button
            className="invoice-save-btn"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        <div className="invoice-summary">
          <div>
            <span>Subtotal</span>
            <strong>{formatMoney(data.subtotal, data.currency)}</strong>
          </div>

          <div>
            <span>Tax</span>
            <strong>{formatMoney(data.tax, data.currency)}</strong>
          </div>

          <div className="invoice-summary-total">
            <span>Total</span>
            <strong>{formatMoney(data.total, data.currency)}</strong>
          </div>
        </div>

        {data.notes && (
          <div className="invoice-notes">
            <h4>Notes</h4>
            <p>{data.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}