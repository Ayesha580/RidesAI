import { useEffect, useState } from "react";
import {
  changeDealStage,
  getDeal,
  createInvoice,
} from "./crmService";
import "./DealPanel.css";

const STAGES = {
  new: "New",
  qualification: "Qualification",
  proposal: "Proposal",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

const COLORS = {
  new: "#FF77FF",
  qualification: "#6366f1",
  proposal: "#3b82f6",
  negotiation: "#f59e0b",
  won: "#10b981",
  lost: "#ef4444",
};

export default function DealPanel({ deals, deal, onSelect, onClose, onUpdate }) {
  const [data, setData] = useState(deal || null);
  const [stage, setStage] = useState(deal?.stage || "new");
  const [loading, setLoading] = useState(false);

  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [creatingInvoice, setCreatingInvoice] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const in14Days = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const [invoiceForm, setInvoiceForm] = useState({
    service: "",
    description: "",
    quantity: 1,
    unit_price: "",
    currency: "USD",
    issue_date: today,
    due_date: in14Days,
    tax: 0,
    discount: 0,
    payment_terms: "",
    notes: "",
  });

  useEffect(() => {
    if (deal?.id) {
      getDeal(deal.id)
        .then((r) => {
          setData(r.data);
          setStage(r.data.stage);
        })
        .catch(() => {});
    }
  }, [deal]);

  async function handleStageChange(value) {
    const oldStage = stage;
    setStage(value);
    try {
      setLoading(true);
      await changeDealStage(data.id, value, "Stage updated from CRM");
      if (onUpdate) await onUpdate();
    } catch {
      setStage(oldStage);
    } finally {
      setLoading(false);
    }
  }

  function handleInvoiceInput(e) {
    const { name, value } = e.target;
    setInvoiceForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleCreateInvoice(e) {
    e.preventDefault();
    if (creatingInvoice) return;

    if (!invoiceForm.unit_price || Number(invoiceForm.unit_price) <= 0) {
      alert("Please enter a valid unit price.");
      return;
    }

    if (!data.client) {
      alert("This deal has no linked client, cannot create an invoice.");
      return;
    }

    try {
      setCreatingInvoice(true);

      await createInvoice({
        client: data.client,
        deal: data.id,
        issue_date: invoiceForm.issue_date,
        due_date: invoiceForm.due_date,
        service: invoiceForm.service,
        description: invoiceForm.description,
        quantity: Number(invoiceForm.quantity || 1),
        unit_price: Number(invoiceForm.unit_price || 0),
        currency: invoiceForm.currency,
        tax: Number(invoiceForm.tax || 0),
        discount: Number(invoiceForm.discount || 0),
        payment_terms: invoiceForm.payment_terms,
        notes: invoiceForm.notes,
      });

      alert("Invoice created successfully.");

      setInvoiceForm({
        service: "",
        description: "",
        quantity: 1,
        unit_price: "",
        currency: "USD",
        issue_date: today,
        due_date: in14Days,
        tax: 0,
        discount: 0,
        payment_terms: "",
        notes: "",
      });

      setShowInvoiceForm(false);

      if (onUpdate) await onUpdate();

      onClose();
    } catch (error) {
      console.error("Invoice creation error:", error);
      alert(
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Unable to create invoice."
      );
    } finally {
      setCreatingInvoice(false);
    }
  }

  if (deal && data) {
    return (
      <div className="deal-drawer-overlay" onClick={onClose}>
        <div className="deal-drawer" onClick={(e) => e.stopPropagation()}>
          <div className="deal-drawer-header">
            <div>
              <h3>{data.title}</h3>
              <span>{data.client_name || data.client?.full_name || "Client"}</span>
            </div>
            <button onClick={onClose}>×</button>
          </div>

          <div className="deal-info">
            <div>
              <span>Amount</span>
              <strong>{data.currency || "USD"} {data.amount ?? 0}</strong>
            </div>
            <div>
              <span>Probability</span>
              <strong>{data.probability ?? 0}%</strong>
            </div>
            <div>
              <span>Expected Close</span>
              <strong>{data.expected_close_date || "-"}</strong>
            </div>
          </div>

          <label>Deal Stage</label>
          <select
            value={stage}
            disabled={loading}
            onChange={(e) => handleStageChange(e.target.value)}
          >
            {Object.entries(STAGES).map(([key, value]) => (
              <option key={key} value={key}>{value}</option>
            ))}
          </select>

          {/* --- Invoice creation section --- */}
          <div className="deal-invoice-section">
            <div className="deal-section-header">
              <div>
                <h4>Invoice</h4>
                <p>Generate an invoice for this deal.</p>
              </div>

              {!showInvoiceForm && (
                <button
                  className="create-invoice-btn"
                  onClick={() => setShowInvoiceForm(true)}
                >
                  + Create Invoice
                </button>
              )}
            </div>

            {showInvoiceForm && (
              <form className="invoice-form" onSubmit={handleCreateInvoice}>
                <div className="invoice-form-group">
                  <label>Service</label>
                  <input
                    name="service"
                    value={invoiceForm.service}
                    onChange={handleInvoiceInput}
                    placeholder="e.g. Website Development"
                  />
                </div>

                <div className="invoice-form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={invoiceForm.description}
                    onChange={handleInvoiceInput}
                    placeholder="Details of the service..."
                    rows="2"
                  />
                </div>

                <div className="invoice-form-row">
                  <div className="invoice-form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      value={invoiceForm.quantity}
                      onChange={handleInvoiceInput}
                    />
                  </div>

                  <div className="invoice-form-group">
                    <label>Unit Price</label>
                    <input
                      type="number"
                      name="unit_price"
                      min="0"
                      value={invoiceForm.unit_price}
                      onChange={handleInvoiceInput}
                      required
                    />
                  </div>

                  <div className="invoice-form-group">
                    <label>Currency</label>
                    <select
                      name="currency"
                      value={invoiceForm.currency}
                      onChange={handleInvoiceInput}
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="PKR">PKR</option>
                    </select>
                  </div>
                </div>

                <div className="invoice-form-row">
                  <div className="invoice-form-group">
                    <label>Issue Date</label>
                    <input
                      type="date"
                      name="issue_date"
                      value={invoiceForm.issue_date}
                      onChange={handleInvoiceInput}
                    />
                  </div>

                  <div className="invoice-form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      name="due_date"
                      value={invoiceForm.due_date}
                      onChange={handleInvoiceInput}
                    />
                  </div>
                </div>

                <div className="invoice-form-row">
                  <div className="invoice-form-group">
                    <label>Tax</label>
                    <input
                      type="number"
                      name="tax"
                      min="0"
                      value={invoiceForm.tax}
                      onChange={handleInvoiceInput}
                    />
                  </div>

                  <div className="invoice-form-group">
                    <label>Discount</label>
                    <input
                      type="number"
                      name="discount"
                      min="0"
                      value={invoiceForm.discount}
                      onChange={handleInvoiceInput}
                    />
                  </div>
                </div>

                <div className="invoice-form-group">
                  <label>Payment Terms</label>
                  <input
                    name="payment_terms"
                    value={invoiceForm.payment_terms}
                    onChange={handleInvoiceInput}
                    placeholder="e.g. Net 15, Due on receipt"
                  />
                </div>

                <div className="invoice-form-group">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    value={invoiceForm.notes}
                    onChange={handleInvoiceInput}
                    placeholder="Any additional notes..."
                    rows="2"
                  />
                </div>

                <div className="invoice-form-actions">
                  <button
                    type="button"
                    className="invoice-cancel-btn"
                    onClick={() => setShowInvoiceForm(false)}
                    disabled={creatingInvoice}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="invoice-save-btn"
                    disabled={creatingInvoice}
                  >
                    {creatingInvoice ? "Creating..." : "Create Invoice"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {data.stage_history?.length > 0 && (
            <div className="deal-history">
              <h4>Deal History</h4>
              {data.stage_history.map((item) => (
                <div key={item.id}>
                  <strong>{item.old_stage || "Created"} → {item.new_stage}</strong>
                  <span>{item.note}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <table className="crm-table">
      <thead>
        <tr>
          <th>Deal</th>
          <th>Client</th>
          <th>Amount</th>
          <th>Stage</th>
          <th>Probability</th>
          <th>Expected Close</th>
        </tr>
      </thead>
      <tbody>
        {deals.map((item) => (
          <tr key={item.id} onClick={() => onSelect(item)}>
            <td><strong>{item.title}</strong></td>
            <td>{item.client_name || item.client?.full_name || "-"}</td>
            <td>{item.currency || "USD"} {item.amount ?? 0}</td>
            <td>
              <span
                className="status-badge"
                style={{
                  background: `${COLORS[item.stage] || "#999"}22`,
                  color: COLORS[item.stage] || "#999",
                }}
              >
                {STAGES[item.stage] || item.stage}
              </span>
            </td>
            <td>{item.probability ?? 0}%</td>
            <td>{item.expected_close_date || "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}