import { useEffect, useMemo, useState } from "react";
import {
  getLeads,
  deleteLead,
  getClients,
  getDeals,
  getInvoices,
  bulkDeleteLeads,
  updateInvoice,
} from "./crmService";
import { getMailbox } from "./mailboxService";
import LeadUploadModal from "./LeadUploadModal";
import LeadDetailDrawer from "./LeadDetailDrawer";
import ClientPanel from "./ClientPanel";
import DealPanel from "./DealPanel";
import InvoicePanel from "./InvoicePanel";
import "./Crm.css";

const STATUS_COLORS = {
  new: "#FF77FF",
  contacted: "#3b82f6",
  interested: "#10b981",
  not_answering: "#f59e0b",
  won: "#16a34a",
  lost: "#ef4444",
};

const CLIENT_STATUS_COLORS = {
  prospect: "#FF77FF",
  active: "#3b82f6",
  inactive: "#64748b",
  won: "#10b981",
  lost: "#ef4444",
};

const DEAL_STAGE_COLORS = {
  new: "#FF77FF",
  qualification: "#6366f1",
  proposal: "#3b82f6",
  negotiation: "#f59e0b",
  won: "#10b981",
  lost: "#ef4444",
};

const INVOICE_STATUS_COLORS = {
  draft: "#64748b",
  pending: "#f59e0b",
  sent: "#3b82f6",
  paid: "#10b981",
  overdue: "#ef4444",
  cancelled: "#64748b",
};

function normalizeData(response) {
  if (Array.isArray(response)) return response;
  if (response?.results) return response.results;
  if (response?.data?.results) return response.data.results;
  if (response?.data && Array.isArray(response.data)) return response.data;
  return [];
}

function formatMoney(value, currency = "USD") {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function Crm() {
  const [leads, setLeads] = useState([]);
  const [clients, setClients] = useState([]);
  const [deals, setDeals] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [mailboxConnected, setMailboxConnected] = useState(false);
const [selectedLeadIds, setSelectedLeadIds] = useState([]);
const [bulkDeleting, setBulkDeleting] = useState(false);
  async function loadCRM() {
    try {
      setLoading(true);
      const [leadResponse, clientResponse, dealResponse, invoiceResponse] =
        await Promise.all([
          getLeads(),
          getClients(),
          getDeals(),
          getInvoices(),
        ]);

      setLeads(normalizeData(leadResponse));
      setClients(normalizeData(clientResponse));
      setDeals(normalizeData(dealResponse));
      setInvoices(normalizeData(invoiceResponse));

      try {
        const mailbox = await getMailbox();
        setMailboxConnected(
          mailbox?.connected || mailbox?.data?.connected || false
        );
      } catch {
        setMailboxConnected(false);
      }
    } catch (error) {
      console.error("CRM loading error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCRM();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const text = `
        ${lead.full_name || ""}
        ${lead.email || ""}
        ${lead.phone || ""}
        ${lead.business_name || ""}
        ${lead.location || ""}
        ${lead.category || ""}
      `.toLowerCase();

      return (
        text.includes(search.toLowerCase()) &&
        (statusFilter === "all" || lead.status === statusFilter)
      );
    });
  }, [leads, search, statusFilter]);

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const text = `
        ${client.full_name || ""}
        ${client.email || ""}
        ${client.phone || ""}
        ${client.business_name || ""}
        ${client.category || ""}
      `.toLowerCase();

      return (
        text.includes(search.toLowerCase()) &&
        (statusFilter === "all" || client.status === statusFilter)
      );
    });
  }, [clients, search, statusFilter]);

  const filteredDeals = useMemo(() => {
    return deals.filter((deal) => {
      const text = `
        ${deal.title || ""}
        ${deal.client_name || ""}
        ${deal.description || ""}
      `.toLowerCase();

      return (
        text.includes(search.toLowerCase()) &&
        (statusFilter === "all" || deal.stage === statusFilter)
      );
    });
  }, [deals, search, statusFilter]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const text = `
        ${invoice.invoice_number || ""}
        ${invoice.client_name || ""}
        ${invoice.client?.full_name || ""}
        ${invoice.business_name || ""}
        ${invoice.service || ""}
      `.toLowerCase();

      return (
        text.includes(search.toLowerCase()) &&
        (statusFilter === "all" || invoice.status === statusFilter)
      );
    });
  }, [invoices, search, statusFilter]);

  const totalLeads = leads.length;
  const totalClients = clients.length;
  const totalDeals = deals.length;
  const totalInvoices = invoices.length;

  const paidInvoices = invoices.filter((invoice) => invoice.status === "paid");

  const pendingInvoices = invoices.filter(
    (invoice) => invoice.status === "pending" || invoice.status === "sent"
  );

  const draftInvoices = invoices.filter((invoice) => invoice.status === "draft");

  const totalInvoiceAmount = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.total || 0),
    0
  );

  const paidInvoiceAmount = paidInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.total || 0),
    0
  );

  const outstandingAmount = invoices
    .filter(
      (invoice) => invoice.status !== "paid" && invoice.status !== "cancelled"
    )
    .reduce((sum, invoice) => sum + Number(invoice.total || 0), 0);

  const closedDeals = deals.filter((deal) => deal.stage === "won");
  const lostDeals = deals.filter((deal) => deal.stage === "lost");
  const openDeals = deals.filter(
    (deal) => deal.stage !== "won" && deal.stage !== "lost"
  );

  const totalSales = closedDeals.reduce(
    (sum, deal) => sum + Number(deal.amount || 0),
    0
  );

  const pipelineValue = openDeals.reduce(
    (sum, deal) => sum + Number(deal.amount || 0),
    0
  );

  const forecastValue = openDeals.reduce(
    (sum, deal) =>
      sum + Number(deal.amount || 0) * (Number(deal.probability || 0) / 100),
    0
  );

  const winRate =
    totalDeals > 0 ? Math.round((closedDeals.length / totalDeals) * 100) : 0;

  const pendingFollowups = leads.filter((lead) => lead.next_followup_date).length;

  const activeClients = clients.filter((client) => client.status === "active").length;

  async function handleDeleteLead(id) {
    if (!window.confirm("Delete this lead?")) return;

    try {
      await deleteLead(id);
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
      setSelectedLead(null);
    } catch (error) {
      console.error(error);
      alert("Unable to delete lead.");
    }
  }
  function toggleLeadSelection(id) {
  setSelectedLeadIds((prev) =>
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  );
}

function toggleSelectAllLeads() {
  if (selectedLeadIds.length === filteredLeads.length) {
    setSelectedLeadIds([]);
  } else {
    setSelectedLeadIds(filteredLeads.map((lead) => lead.id));
  }
}

async function handleBulkDeleteSelected() {
  if (!selectedLeadIds.length) return;
  if (!window.confirm(`Delete ${selectedLeadIds.length} selected lead(s)? This cannot be undone.`)) return;

  setBulkDeleting(true);
  try {
    await bulkDeleteLeads({ ids: selectedLeadIds });
    setLeads((prev) => prev.filter((lead) => !selectedLeadIds.includes(lead.id)));
    setSelectedLeadIds([]);
  } catch (error) {
    console.error(error);
    alert("Unable to delete selected leads.");
  } finally {
    setBulkDeleting(false);
  }
}

async function handleDeleteAllLeads() {
  const confirmMsg =
    statusFilter !== "all" || search
      ? `Delete ALL leads matching the current search/filter (${filteredLeads.length} lead(s))? This cannot be undone.`
      : `Delete ALL ${leads.length} lead(s)? This cannot be undone.`;

  if (!window.confirm(confirmMsg)) return;

  setBulkDeleting(true);
  try {
    await bulkDeleteLeads({
      delete_all: true,
      search: search || undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
    });
    setSelectedLeadIds([]);
    await loadCRM();
  } catch (error) {
    console.error(error);
    alert("Unable to delete leads.");
  } finally {
    setBulkDeleting(false);
  }
}

  async function handleInvoiceStatusChange(id, newStatus) {
    const prevInvoices = invoices;

    setInvoices((prev) =>
      prev.map((inv) => (inv.id === id ? { ...inv, status: newStatus } : inv))
    );

    try {
      await updateInvoice(id, { status: newStatus });
    } catch (error) {
      console.error("Invoice status update error:", error);
      setInvoices(prevInvoices);
      alert("Unable to update invoice status.");
    }
  }

  function handleTabChange(tab) {
    setActiveTab(tab);
    setSearch("");
    setStatusFilter("all");
      setSelectedLeadIds([]);
  }

  if (loading) {
    return (
      <div className="crm-loading">
        <div className="crm-loader"></div>
        <span>Loading CRM...</span>
      </div>
    );
  }

  return (
    <div className="crm-page">
      <div className="crm-header">
        <div className="crm-title-row">
          <div className="crm-title-icon">✦</div>
          <div>
            <h1>CRM</h1>
            <p>Manage your leads, clients, deals and sales pipeline.</p>
          </div>
        </div>

        <div className="crm-header-actions">
          <div
            className={`mail-status ${
              mailboxConnected ? "connected" : "disconnected"
            }`}
          >
            <span></span>
            {mailboxConnected ? (
              "Email Connected"
            ) : (
              <>
                Email Not Connected{" "}
                <a href="/owner/settings/mailbox">connect here</a>
              </>
            )}
          </div>

          <button className="crm-primary-btn" onClick={() => setShowUpload(true)}>
            <span>＋</span>
            Import Leads
          </button>
        </div>
      </div>

      <div className="crm-tabs">
        <button
          className={activeTab === "dashboard" ? "active" : ""}
          onClick={() => handleTabChange("dashboard")}
        >
          <span>▦</span>
          Dashboard
        </button>

        <button
          className={activeTab === "leads" ? "active" : ""}
          onClick={() => handleTabChange("leads")}
        >
          <span>♧</span>
          Leads
          <b>{totalLeads}</b>
        </button>

        <button
          className={activeTab === "clients" ? "active" : ""}
          onClick={() => handleTabChange("clients")}
        >
          <span>♙</span>
          Clients
          <b>{totalClients}</b>
        </button>

        <button
          className={activeTab === "deals" ? "active" : ""}
          onClick={() => handleTabChange("deals")}
        >
          <span>◈</span>
          Deals
          <b>{totalDeals}</b>
        </button>

        <button
          className={activeTab === "invoices" ? "active" : ""}
          onClick={() => handleTabChange("invoices")}
        >
          <span>▤</span>
          Invoices
          <b>{totalInvoices}</b>
        </button>

        <button
          className={activeTab === "pipeline" ? "active" : ""}
          onClick={() => handleTabChange("pipeline")}
        >
          <span>↗</span>
          Sales Pipeline
        </button>
      </div>

      {activeTab !== "dashboard" && activeTab !== "pipeline" && (
        <div className="crm-toolbar">
          <div className="crm-search">
            <span>⌕</span>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                activeTab === "leads"
                  ? "Search leads..."
                  : activeTab === "clients"
                  ? "Search clients..."
                  : activeTab === "deals"
                  ? "Search deals..."
                  : "Search invoices..."
              }
            />

            {search && <button onClick={() => setSearch("")}>×</button>}
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>

            {activeTab === "leads" && (
              <>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="interested">Interested</option>
                <option value="not_answering">Not Answering</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </>
            )}

            {activeTab === "clients" && (
              <>
                <option value="prospect">Prospect</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </>
            )}

            {activeTab === "deals" && (
              <>
                <option value="new">New</option>
                <option value="qualification">Qualification</option>
                <option value="proposal">Proposal</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
              </>
            )}

            {activeTab === "invoices" && (
              <>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </>
            )}
          </select>
        </div>
      )}

      {activeTab === "dashboard" && (
        <>
          <div className="crm-stat-grid">
            <StatCard
              icon="♧"
              label="Total Leads"
              value={totalLeads}
              sub={`${pendingFollowups} follow-ups`}
            />

            <StatCard
              icon="♙"
              label="Total Clients"
              value={totalClients}
              sub={`${activeClients} active`}
            />

            <StatCard
              icon="◈"
              label="Total Deals"
              value={totalDeals}
              sub={`${openDeals.length} open`}
            />

            <StatCard
              icon="✓"
              label="Deals Closed"
              value={closedDeals.length}
              sub={`${winRate}% win rate`}
              success
            />

            <StatCard icon="$" label="Total Sales" value={formatMoney(totalSales)} sub="Closed deals" />

            <StatCard
              icon="◎"
              label="Pipeline Value"
              value={formatMoney(pipelineValue)}
              sub={`${openDeals.length} opportunities`}
            />

            <StatCard
              icon="⌁"
              label="Sales Forecast"
              value={formatMoney(forecastValue)}
              sub="Weighted pipeline"
              purple
            />

            <StatCard
              icon="!"
              label="Lost Deals"
              value={lostDeals.length}
              sub="Closed as lost"
              danger
            />

            <StatCard
              icon="▤"
              label="Total Invoices"
              value={totalInvoices}
              sub={formatMoney(totalInvoiceAmount)}
            />

            <StatCard
              icon="✓"
              label="Paid Invoices"
              value={paidInvoices.length}
              sub={formatMoney(paidInvoiceAmount)}
              success
            />

            <StatCard
              icon="◷"
              label="Pending Invoices"
              value={pendingInvoices.length}
              sub="Awaiting payment"
            />

            <StatCard
              icon="▣"
              label="Draft Invoices"
              value={draftInvoices.length}
              sub="Not yet sent"
            />

            <StatCard
              icon="$"
              label="Outstanding"
              value={formatMoney(outstandingAmount)}
              sub="Unpaid invoices"
              danger
            />
          </div>

          <div className="crm-dashboard-grid">
            <section className="crm-card pipeline-card">
              <div className="card-heading">
                <div>
                  <h2>Sales Pipeline</h2>
                  <p>Current opportunities by stage</p>
                </div>

                <button onClick={() => handleTabChange("pipeline")}>
                  View Pipeline →
                </button>
              </div>

              <div className="pipeline-bars">
                {["new", "qualification", "proposal", "negotiation", "won"].map(
                  (stage) => {
                    const stageDeals = deals.filter((deal) => deal.stage === stage);

                    const value = stageDeals.reduce(
                      (sum, deal) => sum + Number(deal.amount || 0),
                      0
                    );

                    const percentage = totalDeals
                      ? Math.max(8, (stageDeals.length / totalDeals) * 100)
                      : 8;

                    return (
                      <div className="pipeline-row" key={stage}>
                        <div className="pipeline-label">
                          <span style={{ background: DEAL_STAGE_COLORS[stage] }} />

                          <strong>
                            {stage
                              .replace("_", " ")
                              .replace(/\b\w/g, (c) => c.toUpperCase())}
                          </strong>

                          <small>{stageDeals.length}</small>
                        </div>

                        <div className="pipeline-track">
                          <div
                            className="pipeline-fill"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <strong className="pipeline-money">{formatMoney(value)}</strong>
                      </div>
                    );
                  }
                )}
              </div>
            </section>

            <section className="crm-card forecast-card">
              <div className="card-heading">
                <div>
                  <h2>Sales Forecast</h2>
                  <p>Based on deal probability</p>
                </div>
              </div>

              <div className="forecast-main">
                <span>Forecasted Revenue</span>
                <strong>{formatMoney(forecastValue)}</strong>
                <small>from {openDeals.length} open deals</small>
              </div>

              <div className="forecast-list">
                {openDeals.slice(0, 5).map((deal) => (
                  <div className="forecast-item" key={deal.id}>
                    <div>
                      <strong>{deal.title}</strong>
                      <span>{deal.client_name || "Client"}</span>
                    </div>

                    <div className="forecast-right">
                      <strong>{formatMoney(deal.amount, deal.currency)}</strong>
                      <small>{Number(deal.probability || 0)}%</small>
                    </div>
                  </div>
                ))}

                {!openDeals.length && (
                  <div className="empty-small">No open deals.</div>
                )}
              </div>
            </section>
          </div>

          <div className="crm-bottom-grid">
            <section className="crm-card">
              <div className="card-heading">
                <div>
                  <h2>Recent Leads</h2>
                  <p>Latest prospects added to CRM</p>
                </div>

                <button onClick={() => handleTabChange("leads")}>View All →</button>
              </div>

              <div className="recent-list">
                {leads.slice(0, 6).map((lead) => (
                  <div
                    className="recent-item"
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                  >
                    <div className="avatar">{lead.full_name?.charAt(0)?.toUpperCase()}</div>

                    <div className="recent-info">
                      <strong>{lead.full_name}</strong>
                      <span>{lead.business_name || lead.email || "Lead"}</span>
                    </div>

                    <StatusBadge status={lead.status} colors={STATUS_COLORS} />
                  </div>
                ))}

                {!leads.length && <div className="empty-state">No leads available.</div>}
              </div>
            </section>

            <section className="crm-card">
              <div className="card-heading">
                <div>
                  <h2>Recent Deals</h2>
                  <p>Latest sales opportunities</p>
                </div>

                <button onClick={() => handleTabChange("deals")}>View All →</button>
              </div>

              <div className="recent-list">
                {deals.slice(0, 6).map((deal) => (
                  <div
                    className="recent-item"
                    key={deal.id}
                    onClick={() => setSelectedDeal(deal)}
                  >
                    <div className="deal-avatar">$</div>

                    <div className="recent-info">
                      <strong>{deal.title}</strong>
                      <span>{deal.client_name || "Client"}</span>
                    </div>

                    <div className="deal-value">
                      <strong>{formatMoney(deal.amount, deal.currency)}</strong>
                      <StatusBadge status={deal.stage} colors={DEAL_STAGE_COLORS} />
                    </div>
                  </div>
                ))}

                {!deals.length && <div className="empty-state">No deals available.</div>}
              </div>
            </section>
          </div>
        </>
      )}

      {activeTab === "leads" && (
  <section className="crm-table-card">
    <div className="table-header">
      <div>
        <h2>Leads</h2>
        <p>Manage and track your prospects</p>
      </div>

      <span className="result-count">{filteredLeads.length} results</span>
    </div>

    {(selectedLeadIds.length > 0 || filteredLeads.length > 0) && (
      <div className="crm-bulk-bar">
        <label className="crm-bulk-selectall">
          <input
            type="checkbox"
            checked={
              filteredLeads.length > 0 &&
              selectedLeadIds.length === filteredLeads.length
            }
            onChange={toggleSelectAllLeads}
          />
          {selectedLeadIds.length > 0
            ? `${selectedLeadIds.length} selected`
            : "Select all"}
        </label>

        <div className="crm-bulk-actions">
          {selectedLeadIds.length > 0 && (
            <button
              className="crm-bulk-delete-btn"
              onClick={handleBulkDeleteSelected}
              disabled={bulkDeleting}
            >
              {bulkDeleting ? "Deleting..." : `Delete Selected (${selectedLeadIds.length})`}
            </button>
          )}

          <button
            className="crm-bulk-delete-all-btn"
            onClick={handleDeleteAllLeads}
            disabled={bulkDeleting || !filteredLeads.length}
          >
            {bulkDeleting ? "Deleting..." : "Delete All"}
          </button>
        </div>
      </div>
    )}

    <div className="crm-table-wrapper">
      <table className="crm-table">
        <thead>
          <tr>
            <th style={{ width: "36px" }}>
              <input
                type="checkbox"
                checked={
                  filteredLeads.length > 0 &&
                  selectedLeadIds.length === filteredLeads.length
                }
                onChange={toggleSelectAllLeads}
              />
            </th>
            <th>Lead</th>
            <th>Business</th>
            <th>Contact</th>
            <th>Score</th>
            <th>Status</th>
            <th>Follow-up</th>
            <th>Source</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {filteredLeads.map((lead) => (
            <tr key={lead.id}>
              <td onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selectedLeadIds.includes(lead.id)}
                  onChange={() => toggleLeadSelection(lead.id)}
                />
              </td>

              <td>
                <div className="person-cell">
                  <div className="avatar">
                    {lead.full_name?.charAt(0)?.toUpperCase()}
                  </div>

                  <div>
                    <strong>{lead.full_name}</strong>
                    <small>{lead.category || "Lead"}</small>
                  </div>
                </div>
              </td>

              <td>{lead.business_name || "—"}</td>

              <td>
                <div className="contact-cell">
                  <span>{lead.email || "No email"}</span>
                  <small>{lead.phone || "No phone"}</small>
                </div>
              </td>

              <td>
                <ScoreBadge score={lead.score} />
              </td>

              <td>
                <StatusBadge status={lead.status} colors={STATUS_COLORS} />
              </td>

              <td>{formatDate(lead.next_followup_date)}</td>

              <td>
                <span className="source-badge">{lead.source || "manual"}</span>
              </td>

              <td>
                <div className="row-actions">
                  <button onClick={() => setSelectedLead(lead)}>View</button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteLead(lead.id)}
                  >
                    ×
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!filteredLeads.length && <EmptyTable text="No leads found" />}
    </div>
  </section>
)}

      {activeTab === "clients" && (
        <section className="crm-table-card">
          <div className="table-header">
            <div>
              <h2>Clients & Contacts</h2>
              <p>Manage your customer relationships</p>
            </div>

            <span className="result-count">{filteredClients.length} clients</span>
          </div>

          <div className="crm-table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Business</th>
                  <th>Contact</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Assigned To</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id}>
                    <td>
                      <div className="person-cell">
                        <div className="avatar client">
                          {client.full_name?.charAt(0)?.toUpperCase()}
                        </div>

                        <div>
                          <strong>{client.full_name}</strong>
                          <small>{client.category || "Client"}</small>
                        </div>
                      </div>
                    </td>

                    <td>{client.business_name || "—"}</td>

                    <td>
                      <div className="contact-cell">
                        <span>{client.email || "No email"}</span>
                        <small>{client.phone || "No phone"}</small>
                      </div>
                    </td>

                    <td>{client.location || "—"}</td>

                    <td>
                      <StatusBadge status={client.status} colors={CLIENT_STATUS_COLORS} />
                    </td>

                    <td>{client.assigned_to_name || "Unassigned"}</td>

                    <td>
                      <button
                        className="table-view-btn"
                        onClick={() => setSelectedClient(client)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!filteredClients.length && <EmptyTable text="No clients found" />}
          </div>
        </section>
      )}

      {activeTab === "deals" && (
        <section className="crm-table-card">
          <div className="table-header">
            <div>
              <h2>Deals</h2>
              <p>Track opportunities through your sales process</p>
            </div>

            <div className="header-summary">
              <strong>{formatMoney(pipelineValue)}</strong>
              <span>Open Pipeline</span>
            </div>
          </div>

          <div className="crm-table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Deal</th>
                  <th>Client</th>
                  <th>Amount</th>
                  <th>Stage</th>
                  <th>Probability</th>
                  <th>Expected Close</th>
                  <th>Assigned To</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredDeals.map((deal) => (
                  <tr key={deal.id}>
                    <td>
                      <div className="deal-cell">
                        <div className="deal-icon">$</div>

                        <div>
                          <strong>{deal.title}</strong>
                          <small>{deal.description || "Sales opportunity"}</small>
                        </div>
                      </div>
                    </td>

                    <td>{deal.client_name || "—"}</td>

                    <td>
                      <strong>{formatMoney(deal.amount, deal.currency)}</strong>
                    </td>

                    <td>
                      <StatusBadge status={deal.stage} colors={DEAL_STAGE_COLORS} />
                    </td>

                    <td>
                      <div className="probability">
                        <div>
                          <span style={{ width: `${deal.probability || 0}%` }} />
                        </div>
                        <strong>{deal.probability || 0}%</strong>
                      </div>
                    </td>

                    <td>{formatDate(deal.expected_close_date)}</td>

                    <td>{deal.assigned_to_name || "Unassigned"}</td>

                    <td>
                      <button
                        className="table-view-btn"
                        onClick={() => setSelectedDeal(deal)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!filteredDeals.length && <EmptyTable text="No deals found" />}
          </div>
        </section>
      )}

      {activeTab === "invoices" && (
        <section className="crm-table-card">
          <div className="table-header">
            <div>
              <h2>Invoices</h2>
              <p>Manage invoices and payment status</p>
            </div>

            <div className="header-summary">
              <strong>{formatMoney(outstandingAmount)}</strong>
              <span>Outstanding</span>
            </div>
          </div>

          <div className="crm-invoice-stats">
            <div>
              <span>Total Invoices</span>
              <strong>{totalInvoices}</strong>
            </div>

            <div>
              <span>Paid</span>
              <strong>{paidInvoices.length}</strong>
            </div>

            <div>
              <span>Pending</span>
              <strong>{pendingInvoices.length}</strong>
            </div>

            <div>
              <span>Draft</span>
              <strong>{draftInvoices.length}</strong>
            </div>

            <div>
              <span>Outstanding</span>
              <strong>{formatMoney(outstandingAmount)}</strong>
            </div>
          </div>

          <div className="crm-table-wrapper">
            <table className="crm-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Client</th>
                  <th>Deal</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td>
                      <div className="deal-cell">
                        <div className="deal-icon">#</div>

                        <div>
                          <strong>{invoice.invoice_number || `INV-${invoice.id}`}</strong>
                          <small>{formatDate(invoice.created_at)}</small>
                        </div>
                      </div>
                    </td>

                    <td>
                      {invoice.client_name || invoice.client?.full_name || "—"}
                    </td>

                    <td>{invoice.deal_title || invoice.deal?.title || "—"}</td>

                    <td>
                      <strong>{formatMoney(invoice.total, invoice.currency)}</strong>
                    </td>

                    <td>
                      <select
                        className="inline-status-select"
                        value={invoice.status}
                        style={{
                          color: INVOICE_STATUS_COLORS[invoice.status] || "#64748b",
                          borderColor: `${
                            INVOICE_STATUS_COLORS[invoice.status] || "#64748b"
                          }40`,
                          background: `${
                            INVOICE_STATUS_COLORS[invoice.status] || "#64748b"
                          }12`,
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          handleInvoiceStatusChange(invoice.id, e.target.value)
                        }
                      >
                        <option value="draft">Draft</option>
                        <option value="pending">Pending</option>
                        <option value="sent">Sent</option>
                        <option value="paid">Paid</option>
                        <option value="overdue">Overdue</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td>{formatDate(invoice.due_date)}</td>

                    <td>
                      <button
                        className="table-view-btn"
                        onClick={() => setSelectedInvoice(invoice)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!filteredInvoices.length && <EmptyTable text="No invoices found" />}
          </div>
        </section>
      )}

      {activeTab === "pipeline" && (
        <div className="kanban-wrapper">
          <div className="pipeline-summary">
            <div>
              <span>Total Pipeline</span>
              <strong>{formatMoney(pipelineValue)}</strong>
            </div>

            <div>
              <span>Forecast</span>
              <strong>{formatMoney(forecastValue)}</strong>
            </div>

            <div>
              <span>Closed Won</span>
              <strong>{formatMoney(totalSales)}</strong>
            </div>

            <div>
              <span>Win Rate</span>
              <strong>{winRate}%</strong>
            </div>
          </div>

          <div className="kanban-board">
            {["new", "qualification", "proposal", "negotiation", "won", "lost"].map(
              (stage) => {
                const stageDeals = deals.filter((deal) => deal.stage === stage);

                return (
                  <div className="kanban-column" key={stage}>
                    <div className="kanban-column-header">
                      <div>
                        <span style={{ background: DEAL_STAGE_COLORS[stage] }} />

                        <strong>
                          {stage
                            .replace("_", " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase())}
                        </strong>
                      </div>

                      <b>{stageDeals.length}</b>
                    </div>

                    <div className="kanban-cards">
                      {stageDeals.map((deal) => (
                        <div
                          className="kanban-deal"
                          key={deal.id}
                          onClick={() => setSelectedDeal(deal)}
                        >
                          <div className="kanban-deal-top">
                            <span>{deal.client_name || "Client"}</span>
                            <span>{deal.probability || 0}%</span>
                          </div>

                          <h3>{deal.title}</h3>

                          <strong className="kanban-amount">
                            {formatMoney(deal.amount, deal.currency)}
                          </strong>

                          <div className="kanban-footer">
                            <span>Close: {formatDate(deal.expected_close_date)}</span>
                          </div>
                        </div>
                      ))}

                      {!stageDeals.length && (
                        <div className="kanban-empty">No deals</div>
                      )}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      )}

      {showUpload && (
        <LeadUploadModal
          onClose={() => setShowUpload(false)}
          onImported={() => {
            setShowUpload(false);
            loadCRM();
          }}
        />
      )}

      {selectedLead && (
        <LeadDetailDrawer
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onDelete={() => handleDeleteLead(selectedLead.id)}
          onUpdate={loadCRM}
        />
      )}

      {selectedClient && (
        <ClientPanel
          clients={clients}
          client={selectedClient}
          onSelect={setSelectedClient}
          onClose={() => setSelectedClient(null)}
          onUpdate={loadCRM}
        />
      )}

      {selectedDeal && (
        <DealPanel
          deals={deals}
          deal={selectedDeal}
          onSelect={setSelectedDeal}
          onClose={() => setSelectedDeal(null)}
          onUpdate={loadCRM}
        />
      )}

      {selectedInvoice && (
        <InvoicePanel
          invoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          onUpdate={() => {
            setSelectedInvoice(null);
            loadCRM();
          }}
        />
      )}
    </div>
  );
}

function StatCard({ icon, label, value, sub, success, danger, purple }) {
  return (
    <div
      className={`crm-stat-card ${success ? "success" : ""} ${
        danger ? "danger" : ""
      } ${purple ? "purple" : ""}`}
    >
      <div className="stat-top">
        <div className="stat-icon">{icon}</div>
        <span>{label}</span>
      </div>

      <strong className="stat-value">{value}</strong>
      <small>{sub}</small>
    </div>
  );
}

function StatusBadge({ status, colors }) {
  const color = colors[status] || "#64748b";

  const label = status
    ? status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Unknown";

  return (
    <span
      className="status-badge"
      style={{ color, background: `${color}12`, borderColor: `${color}25` }}
    >
      <i style={{ background: color }} />
      {label}
    </span>
  );
}

function ScoreBadge({ score = 0 }) {
  let cls = "low";
  if (score >= 70) cls = "high";
  else if (score >= 40) cls = "medium";

  return (
    <span className={`score-badge ${cls}`}>
      <span>{score}</span>/100
    </span>
  );
}

function EmptyTable({ text }) {
  return (
    <div className="empty-table">
      <div>⌁</div>
      <strong>{text}</strong>
      <span>Try changing your search or filters.</span>
    </div>
  );
}