import { useEffect, useState } from "react";
import { getLeads, deleteLead } from "./crmService";
import { getMailbox } from "./mailboxService"; 
import LeadUploadModal from "./LeadUploadModal";
import LeadDetailDrawer from "./LeadDetailDrawer";
import "./Crm.css";

const STATUS_COLORS = {
    new: "#BE27EE",
    contacted: "#3b82f6",
    interested: "#22c55e",
    not_answering: "#f59e0b",
    won: "#10b981",
    lost: "#ef4444",
};

export default function Crm() {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showUpload, setShowUpload] = useState(false);
    const [selectedLead, setSelectedLead] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [mailboxConnected, setMailboxConnected] = useState(true); // assume true until checked

    // Pagination
    const [page, setPage] = useState(1);
    const [count, setCount] = useState(0);
    const pageSize = 20;
    const totalPages = Math.max(Math.ceil(count / pageSize), 1);

    const currentUser = JSON.parse(localStorage.getItem("user") || "null");
    const canImport = currentUser?.role === "owner";

    useEffect(() => {
        loadLeads(page);
    }, [page]);

    useEffect(() => {
        if (canImport) checkMailbox();
    }, [canImport]);

    const checkMailbox = async () => {
        try {
            const res = await getMailbox();
            setMailboxConnected(!!res.data?.connected);
        } catch {
            setMailboxConnected(false);
        }
    };

    const loadLeads = async (pageNum) => {
        try {
            setLoading(true);
            const response = await getLeads(pageNum);
            setLeads(response.data.results ?? response.data);
            setCount(response.data.count ?? response.data.length);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const handleImported = () => {
        setShowUpload(false);
        setPage(1);
        loadLeads(1);
    };

    const askDelete = (e, lead) => {
        e.stopPropagation();
        setDeleteTarget(lead);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            await deleteLead(deleteTarget.id);
            if (selectedLead?.id === deleteTarget.id) {
                setSelectedLead(null);
            }
            // Agar current page khali ho gaya aur pehla page nahi hai, pichle page pe chale jao
            if (leads.length === 1 && page > 1) {
                setPage((p) => p - 1);
            } else {
                loadLeads(page);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    return (
        <div className="crm-page">
            <div className="crm-header">
                <div>
                    <h2>Leads</h2>
                    <span>{count} total leads</span>
                </div>

                {canImport && (
                    <button className="crm-upload-btn" onClick={() => setShowUpload(true)}>
                        + Import Leads
                    </button>
                )}
            </div>

            {canImport && !mailboxConnected && (
                <div className="crm-mailbox-banner">
                    ⚠️ Gmail mailbox not connected — follow-up emails won't be sent to leads.{" "}
                    <a href="/owner/settings/mailbox">Connect now</a>
                </div>
            )}

            <div className="crm-table-wrapper">
                {loading ? (
                    <div className="crm-loading">Loading...</div>
                ) : leads.length === 0 ? (
                    <div className="crm-empty">No leads yet. Import a CSV/Excel file to get started.</div>
                ) : (
                    <table className="crm-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Contact</th>
                                <th>Location</th>
                                <th>Category</th>
                                <th>Score</th>
                                <th>Status</th>
                                <th>Next Follow-up</th>
                                {canImport && <th></th>}
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map((lead) => (
                                <tr key={lead.id} onClick={() => setSelectedLead(lead)}>
                                    <td>
                                        <div className="lead-name">{lead.full_name}</div>
                                        <div className="lead-business">{lead.business_name}</div>
                                    </td>
                                    <td>
                                        <div>{lead.email || "-"}</div>
                                        <div className="lead-phone">{lead.phone || "-"}</div>
                                    </td>
                                    <td>{lead.location || "-"}</td>
                                    <td>{lead.category || "-"}</td>
                                    <td>
                                        <div className="score-bar-wrapper">
                                            <div
                                                className="score-bar"
                                                style={{ width: `${lead.score}%` }}
                                            />
                                            <span>{lead.score}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span
                                            className="status-badge"
                                            style={{
                                                background: `${STATUS_COLORS[lead.status]}22`,
                                                color: STATUS_COLORS[lead.status],
                                            }}
                                        >
                                            {lead.status.replace("_", " ")}
                                        </span>
                                    </td>
                                    <td>{lead.next_followup_date || "-"}</td>
                                    {canImport && (
                                        <td>
                                            <button
                                                className="lead-delete-btn"
                                                onClick={(e) => askDelete(e, lead)}
                                                title="Delete lead"
                                            >
                                                🗑
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {!loading && leads.length > 0 && (
                <div className="crm-pagination">
                    <button
                        onClick={() => setPage((p) => Math.max(p - 1, 1))}
                        disabled={page === 1}
                    >
                        ‹ Prev
                    </button>
                    <span>
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                        disabled={page === totalPages}
                    >
                        Next ›
                    </button>
                </div>
            )}

            {showUpload && (
                <LeadUploadModal
                    onClose={() => setShowUpload(false)}
                    onImported={handleImported}
                />
            )}

            {selectedLead && (
                <LeadDetailDrawer
                    lead={selectedLead}
                    onClose={() => setSelectedLead(null)}
                />
            )}

            {deleteTarget && (
                <div className="confirm-overlay">
                    <div className="confirm-box">
                        <h4>Delete Lead</h4>
                        <p>
                            Are you sure you want to delete{" "}
                            <strong>{deleteTarget.full_name}</strong>? This action
                            cannot be undone.
                        </p>
                        <div className="confirm-actions">
                            <button
                                className="confirm-cancel"
                                onClick={() => setDeleteTarget(null)}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                className="confirm-delete"
                                onClick={confirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}