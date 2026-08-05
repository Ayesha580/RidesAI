import { useState } from "react";
import { importLeads } from "./crmService";
import "./LeadUploadModal.css";

export default function LeadUploadModal({ onClose, onImported }) {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        if (!file) return;
        try {
            setLoading(true);
            setError("");
            const response = await importLeads(file);
            setResult(response.data);
        } catch (err) {
            setError(
                err.response?.data?.error || "Something went wrong while importing."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="upload-overlay">
            <div className="upload-box">
                <div className="upload-header">
                    <h3>Import Leads</h3>
                    <button className="upload-close" onClick={onClose}>×</button>
                </div>

                {!result ? (
                    <>
                        <p className="upload-hint">
                            Upload a CSV or Excel file. We'll auto-detect columns like
                            name, email, phone, company, location, and category.
                        </p>

                        <label className="upload-dropzone">
                            <input
                                type="file"
                                accept=".csv,.xlsx,.xls"
                                onChange={(e) => setFile(e.target.files[0])}
                                hidden
                            />
                            {file ? file.name : "Click to select a file"}
                        </label>

                        {error && <div className="upload-error">{error}</div>}

                        <div className="upload-actions">
                            <button className="btn-cancel" onClick={onClose} disabled={loading}>
                                Cancel
                            </button>
                            <button
                                className="btn-submit"
                                onClick={handleSubmit}
                                disabled={!file || loading}
                            >
                                {loading ? "Importing..." : "Import"}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {result.mailbox_connected === false && (
                            <div className="upload-mailbox-warning">
                                ⚠️ Gmail mailbox is not connected. Leads were imported, but
                                follow-up emails won't be sent until you connect it in{" "}
                                <a href="/owner/settings/mailbox">Settings → Mailbox</a>.
                            </div>
                        )}

                        <div className="upload-result">
                            <div className="result-row">
                                <span>Total rows</span>
                                <strong>{result.total_rows}</strong>
                            </div>
                            <div className="result-row success">
                                <span>Imported</span>
                                <strong>{result.imported}</strong>
                            </div>
                            <div className="result-row warning">
                                <span>Duplicates skipped</span>
                                <strong>{result.duplicates}</strong>
                            </div>
                            <div className="result-row error">
                                <span>Invalid rows</span>
                                <strong>{result.invalid}</strong>
                            </div>
                        </div>

                        <div className="upload-actions">
                            <button className="btn-submit" onClick={onImported}>
                                Done
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}