import "./LeadDetailDrawer.css";

const TYPE_ICONS = {
    call: "📞",
    email: "✉️",
    whatsapp: "💬",
    reminder: "⏰",
};

export default function LeadDetailDrawer({ lead, onClose }) {
    return (
        <div className="drawer-overlay" onClick={onClose}>
            <div className="drawer-box" onClick={(e) => e.stopPropagation()}>
                <div className="drawer-header">
                    <div>
                        <h3>{lead.full_name}</h3>
                        <span>{lead.business_name || "No company"}</span>
                    </div>
                    <button className="drawer-close" onClick={onClose}>×</button>
                </div>

                <div className="drawer-section">
                    <div className="drawer-info-row">
                        <span>Email</span>
                        <strong>{lead.email || "-"}</strong>
                    </div>
                    <div className="drawer-info-row">
                        <span>Phone</span>
                        <strong>{lead.phone || "-"}</strong>
                    </div>
                    <div className="drawer-info-row">
                        <span>Location</span>
                        <strong>{lead.location || "-"}</strong>
                    </div>
                    <div className="drawer-info-row">
                        <span>Category</span>
                        <strong>{lead.category || "-"}</strong>
                    </div>
                    <div className="drawer-info-row">
                        <span>Score</span>
                        <strong>{lead.score}/100</strong>
                    </div>
                </div>

                <h4 className="drawer-subtitle">Follow-up Activities</h4>

                <div className="followup-list">
                    {lead.follow_ups?.length ? (
                        lead.follow_ups.map((f) => (
                            <div key={f.id} className="followup-item">
                                <span className="followup-icon">{TYPE_ICONS[f.activity_type]}</span>
                                <div className="followup-content">
                                    <div className="followup-top">
                                        <strong>{f.activity_type}</strong>
                                        <span className={`followup-status ${f.status}`}>
                                            {f.status}
                                        </span>
                                    </div>
                                    <p>{f.message}</p>
                                    <span className="followup-date">
                                        {new Date(f.scheduled_at).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-followups">No follow-up activities yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}