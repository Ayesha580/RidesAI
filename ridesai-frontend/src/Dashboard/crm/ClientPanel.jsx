import { useEffect, useState } from "react";
import {
  changeClientStatus,
  getClient,
  createDeal,
} from "./crmService";
import "./ClientPanel.css";

const STATUS = {
  prospect: "Prospect",
  active: "Active",
  won: "Won",
  lost: "Lost",
};

const COLORS = {
  prospect: "#FF77FF",
  active: "#3b82f6",
  won: "#10b981",
  lost: "#ef4444",
};

export default function ClientPanel({
  clients,
  client,
  onSelect,
  onClose,
  onUpdate,
}) {
  const [data, setData] = useState(client || null);
  const [status, setStatus] = useState(
    client?.status || "prospect"
  );
  const [loading, setLoading] = useState(false);

  const [showDealForm, setShowDealForm] = useState(false);
  const [creatingDeal, setCreatingDeal] = useState(false);

  const [dealForm, setDealForm] = useState({
    title: "",
    amount: "",
    currency: "USD",
    stage: "new",
    probability: 10,
    expected_close_date: "",
    description: "",
  });

  useEffect(() => {
    if (client?.id) {
      getClient(client.id)
        .then((r) => {
          const clientData = r.data;

          setData(clientData);
          setStatus(clientData.status);
        })
        .catch(() => {});
    }
  }, [client]);

  async function handleStatusChange(value) {
    const oldStatus = status;

    setStatus(value);

    try {
      setLoading(true);

      await changeClientStatus(
        data.id,
        value,
        "Status updated from CRM"
      );

      if (onUpdate) {
        await onUpdate();
      }
    } catch {
      setStatus(oldStatus);
    } finally {
      setLoading(false);
    }
  }

  function handleDealInput(e) {
    const { name, value } = e.target;

    setDealForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleCreateDeal(e) {
    e.preventDefault();

    if (creatingDeal) return;

    if (!dealForm.title.trim()) {
      alert("Please enter a deal title.");
      return;
    }

    try {
      setCreatingDeal(true);

      await createDeal({
        title: dealForm.title,
        client: data.id,
        amount: Number(dealForm.amount || 0),
        currency: dealForm.currency,
        stage: dealForm.stage,
        probability: Number(
          dealForm.probability || 0
        ),
        expected_close_date:
          dealForm.expected_close_date || null,
        description: dealForm.description,
      });

      alert("Deal created successfully.");

      setDealForm({
        title: "",
        amount: "",
        currency: "USD",
        stage: "new",
        probability: 10,
        expected_close_date: "",
        description: "",
      });

      setShowDealForm(false);

      if (onUpdate) {
        await onUpdate();
      }

      onClose();
    } catch (error) {
      console.error("Deal creation error:", error);

      alert(
        error?.response?.data?.detail ||
        error?.response?.data?.error ||
        "Unable to create deal."
      );
    } finally {
      setCreatingDeal(false);
    }
  }

  if (client && data) {
    return (
      <div
        className="client-drawer-overlay"
        onClick={onClose}
      >
        <div
          className="client-drawer"
          onClick={(e) =>
            e.stopPropagation()
          }
        >
          <div className="client-drawer-header">
            <div>
              <h3>{data.full_name}</h3>

              <span>
                {data.business_name ||
                  "No company"}
              </span>
            </div>

            <button onClick={onClose}>
              ×
            </button>
          </div>

          <div className="client-info">
            <div>
              <span>Email</span>
              <strong>
                {data.email || "-"}
              </strong>
            </div>

            <div>
              <span>Phone</span>
              <strong>
                {data.phone || "-"}
              </strong>
            </div>

            <div>
              <span>Location</span>
              <strong>
                {data.location || "-"}
              </strong>
            </div>

            <div>
              <span>Category</span>
              <strong>
                {data.category || "-"}
              </strong>
            </div>
          </div>

          <div className="client-status-section">
            <label>
              Client Status
            </label>

            <select
              value={status}
              disabled={loading}
              onChange={(e) =>
                handleStatusChange(
                  e.target.value
                )
              }
            >
              {Object.entries(STATUS).map(
                ([key, value]) => (
                  <option
                    key={key}
                    value={key}
                  >
                    {value}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="client-deal-section">
            <div className="client-section-header">
              <div>
                <h4>Sales Opportunity</h4>

                <p>
                  Create a deal for this client
                  and add it to your pipeline.
                </p>
              </div>

              {!showDealForm && (
                <button
                  className="create-deal-btn"
                  onClick={() =>
                    setShowDealForm(true)
                  }
                >
                  + Create Deal
                </button>
              )}
            </div>

            {showDealForm && (
              <form
                className="deal-form"
                onSubmit={handleCreateDeal}
              >
                <div className="deal-form-group">
                  <label>
                    Deal Title
                  </label>

                  <input
                    name="title"
                    value={dealForm.title}
                    onChange={handleDealInput}
                    placeholder="e.g. Website Development"
                    required
                  />
                </div>

                <div className="deal-form-row">
                  <div className="deal-form-group">
                    <label>
                      Amount
                    </label>

                    <input
                      type="number"
                      name="amount"
                      min="0"
                      value={dealForm.amount}
                      onChange={handleDealInput}
                      placeholder="0"
                    />
                  </div>

                  <div className="deal-form-group">
                    <label>
                      Currency
                    </label>

                    <select
                      name="currency"
                      value={dealForm.currency}
                      onChange={handleDealInput}
                    >
                      <option value="USD">
                        USD
                      </option>

                      <option value="EUR">
                        EUR
                      </option>

                      <option value="GBP">
                        GBP
                      </option>

                      <option value="PKR">
                        PKR
                      </option>
                    </select>
                  </div>
                </div>

                <div className="deal-form-row">
                  <div className="deal-form-group">
                    <label>
                      Stage
                    </label>

                    <select
                      name="stage"
                      value={dealForm.stage}
                      onChange={handleDealInput}
                    >
                      <option value="new">
                        New
                      </option>

                      <option value="qualification">
                        Qualification
                      </option>

                      <option value="proposal">
                        Proposal
                      </option>

                      <option value="negotiation">
                        Negotiation
                      </option>
                    </select>
                  </div>

                  <div className="deal-form-group">
                    <label>
                      Probability
                    </label>

                    <input
                      type="number"
                      name="probability"
                      min="0"
                      max="100"
                      value={
                        dealForm.probability
                      }
                      onChange={handleDealInput}
                    />
                  </div>
                </div>

                <div className="deal-form-group">
                  <label>
                    Expected Close Date
                  </label>

                  <input
                    type="date"
                    name="expected_close_date"
                    value={
                      dealForm.expected_close_date
                    }
                    onChange={handleDealInput}
                  />
                </div>

                <div className="deal-form-group">
                  <label>
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={
                      dealForm.description
                    }
                    onChange={handleDealInput}
                    placeholder="Describe this opportunity..."
                    rows="3"
                  />
                </div>

                <div className="deal-form-actions">
                  <button
                    type="button"
                    className="deal-cancel-btn"
                    onClick={() =>
                      setShowDealForm(false)
                    }
                    disabled={creatingDeal}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="deal-save-btn"
                    disabled={creatingDeal}
                  >
                    {creatingDeal
                      ? "Creating..."
                      : "Create Deal"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {data.status_history?.length >
            0 && (
            <div className="status-history">
              <h4>
                Status History
              </h4>

              {data.status_history.map(
                (item) => (
                  <div key={item.id}>
                    <strong>
                      {item.old_status ||
                        "Created"}{" "}
                      →{" "}
                      {item.new_status}
                    </strong>

                    <span>
                      {item.note}
                    </span>
                  </div>
                )
              )}
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
          <th>Client</th>
          <th>Company</th>
          <th>Contact</th>
          <th>Status</th>
          <th>Category</th>
        </tr>
      </thead>

      <tbody>
        {clients.map((item) => (
          <tr
            key={item.id}
            onClick={() =>
              onSelect(item)
            }
          >
            <td>
              <strong>
                {item.full_name}
              </strong>
            </td>

            <td>
              {item.business_name || "-"}
            </td>

            <td>
              {item.email ||
                item.phone ||
                "-"}
            </td>

            <td>
              <span
                className="status-badge"
                style={{
                  background: `${
                    COLORS[item.status] ||
                    "#999"
                  }22`,
                  color:
                    COLORS[item.status] ||
                    "#999",
                }}
              >
                {STATUS[item.status] ||
                  item.status}
              </span>
            </td>

            <td>
              {item.category || "-"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}