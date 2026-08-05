import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { createConversation } from "./chatService";
import "./NewConversationModal.css";

export default function NewConversationModal({ onClose, onCreated }) {
    const [users, setUsers] = useState([]);
    const [selectedIds, setSelectedIds] = useState([]);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const response = await axiosClient.get("/users/");
            setUsers(response.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoadingUsers(false);
        }
    };

    const toggleUser = (id) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const isGroup = selectedIds.length > 1;

    const handleSubmit = async () => {
        if (selectedIds.length === 0) return;
        try {
            setLoading(true);

            const payload = {
                members: selectedIds,
                name: title,
                conversation_type: isGroup ? "group" : "direct",
            };

            console.log("Sending conversation payload:", payload);

            const response = await createConversation(payload);
            onCreated(response.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-box">
                <div className="modal-header">
                    <h3>New Conversation</h3>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                {isGroup && (
                    <input
                        type="text"
                        className="modal-title-input"
                        placeholder="Group name..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                )}

                <div className="user-select-list">
                    {loadingUsers ? (
                        <div className="modal-loading">Loading users...</div>
                    ) : (
                        users.map((user) => (
                            <label
                                key={user.id}
                                className={`user-select-item ${
                                    selectedIds.includes(user.id) ? "selected" : ""
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedIds.includes(user.id)}
                                    onChange={() => toggleUser(user.id)}
                                />
                                <div className="user-avatar">
                                    {(user.full_name || user.username).charAt(0).toUpperCase()}
                                </div>
                                <div className="user-info">
                                    <span className="user-name">
                                        {user.full_name || user.username}
                                    </span>
                                    <span className="user-role">{user.role}</span>
                                </div>
                            </label>
                        ))
                    )}
                </div>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="btn-submit"
                        onClick={handleSubmit}
                        disabled={
                            loading ||
                            selectedIds.length === 0 ||
                            (isGroup && !title.trim())
                        }
                    >
                        {loading ? "Creating..." : "Submit"}
                    </button>
                </div>
            </div>
        </div>
    );
}