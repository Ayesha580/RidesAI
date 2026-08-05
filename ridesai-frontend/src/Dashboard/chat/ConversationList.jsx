import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import NewConversationModal from "./NewConversationModal";
import "./ConversationList.css";
import { deleteConversation } from "./chatService";

export default function ConversationList({
    selectedConversation,
    setSelectedConversation,
}) {
    const [loading, setLoading] = useState(true);
    const [conversations, setConversations] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null); // conversation object to delete
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        loadConversations();
    }, []);

    const loadConversations = async () => {
        try {
            const response = await axiosClient.get("/chat/conversations/");
            setConversations(response.data);
            if (response.data.length > 0 && !selectedConversation) {
                setSelectedConversation(response.data[0]);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const askDelete = (e, conversation) => {
        e.stopPropagation();
        setDeleteTarget(conversation);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        try {
            setDeleting(true);
            await deleteConversation(deleteTarget.id);
            setConversations((prev) =>
                prev.filter((c) => c.id !== deleteTarget.id)
            );
            if (selectedConversation?.id === deleteTarget.id) {
                setSelectedConversation(null);
            }
        } catch (err) {
            console.log(err);
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

    const handleConversationCreated = (conversation) => {
        setConversations((prev) => [conversation, ...prev]);
        setSelectedConversation(conversation);
        setShowModal(false);
    };

    if (loading) {
        return (
            <div className="conversation-sidebar">
                <div className="conversation-header">
                    <span>Team Chat</span>
                    <button onClick={() => setShowModal(true)}>+</button>
                </div>
                <div className="conversation-loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="conversation-sidebar">
            <div className="conversation-header">
                <span>Team Chat</span>
                <button onClick={() => setShowModal(true)}>+</button>
            </div>

            <div className="conversation-list">
                {conversations.map((conversation) => (
                    <div
                        key={conversation.id}
                        className={`conversation-item ${
                            selectedConversation?.id === conversation.id ? "active" : ""
                        }`}
                        onClick={() => setSelectedConversation(conversation)}
                    >
                        <div className="conversation-avatar">
                            {conversation.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="conversation-content">
                            <h4>{conversation.name}</h4>
                            <p>
                                {conversation.last_message
                                    ? conversation.last_message.message
                                    : "No messages"}
                            </p>
                        </div>
                        <button
                            className="conversation-delete-btn"
                            onClick={(e) => askDelete(e, conversation)}
                            title="Delete conversation"
                        >
                            🗑
                        </button>
                    </div>
                ))}
            </div>

            {showModal && (
                <NewConversationModal
                    onClose={() => setShowModal(false)}
                    onCreated={handleConversationCreated}
                />
            )}

            {deleteTarget && (
                <div className="confirm-overlay">
                    <div className="confirm-box">
                        <h4>Delete Conversation</h4>
                        <p>
                            Are you sure you want to delete{" "}
                            <strong>{deleteTarget.name}</strong>? This action
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