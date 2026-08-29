import { useState } from "react";
import ReactMarkdown from "react-markdown";
import axiosClient from "../../api/axiosClient";
import "./Herry.css";

export default function Herry() {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        {
            role: "assistant",
            message:
                "Hi! I'm Herry, your AI Business Assistant. How can I help you?"
        }
    ]);
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState(null);
    const [usage, setUsage] = useState(null);
    const [limitReached, setLimitReached] = useState(false);

    const sendMessage = async (e) => {
        e.preventDefault();

        if (!message.trim() || loading || limitReached) {
            return;
        }

        const userMessage = message.trim();

        setMessages((prev) => [
            ...prev,
            {
                role: "user",
                message: userMessage
            }
        ]);

        setMessage("");
        setLoading(true);

        try {
            const res = await axiosClient.post(
                "/herry/chat/",
                {
                    message: userMessage,
                    conversation_id: conversationId
                }
            );

            if (res.data.conversation_id) {
                setConversationId(res.data.conversation_id);
            }

            if (res.data.usage) {
                setUsage(res.data.usage);
                setLimitReached(
                    res.data.usage.is_limit_reached
                );
            }

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    message:
                        res.data.message?.message ||
                        "Sorry, I couldn't process that."
                }
            ]);
        } catch (error) {
            console.error("Herry error:", error);

            if (
                error.response?.status === 403 &&
                error.response?.data?.limit_reached
            ) {
                const data = error.response.data;

                if (data.usage) {
                    setUsage(data.usage);
                }

                setLimitReached(true);

                setMessages((prev) => [
                    ...prev,
                    {
                        role: "assistant",
                        message:
                            data.message ||
                            "Your Herry message limit has been reached. Please upgrade your plan to continue."
                    }
                ]);

                return;
            }

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    message:
                        "Sorry, something went wrong. Please try again."
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const closeHerry = () => {
        setOpen(false);
    };

    return (
        <>
            {!open && (
                <button
                    className="herry-floating-button"
                    onClick={() => setOpen(true)}
                    aria-label="Open Herry"
                >
                    <span className="herry-icon">✦</span>
                </button>
            )}

            {open && (
                <div className="herry-chat-window">
                    <div className="herry-header">
                        <div className="herry-header-info">
                            <div className="herry-avatar">
                                ✦
                            </div>

                            <div>
                                <h3>Herry</h3>

                                <span>
                                    <i></i>
                                    AI Business Assistant
                                </span>
                            </div>
                        </div>

                        <button
                            className="herry-close"
                            onClick={closeHerry}
                            type="button"
                        >
                            ×
                        </button>
                    </div>

                    {usage && (
                        <div className="herry-usage">
                            <div className="herry-usage-top">
                                <span>
                                    {usage.plan}{" "}
                                    {usage.billing_interval === "yearly"
                                        ? "Yearly"
                                        : "Monthly"}
                                </span>

                                <span>
                                    {usage.used.toLocaleString()} /{" "}
                                    {usage.limit.toLocaleString()} messages
                                </span>
                            </div>

                            <div className="herry-progress">
                                <div
                                    className="herry-progress-bar"
                                    style={{
                                        width: `${Math.min(
                                            usage.percentage,
                                            100
                                        )}%`
                                    }}
                                />
                            </div>

                            <div className="herry-remaining">
                                {usage.remaining > 0
                                    ? `${usage.remaining.toLocaleString()} messages remaining`
                                    : "No messages remaining"}
                            </div>
                        </div>
                    )}

                    <div className="herry-messages">
                        {messages.map((item, index) => (
                            <div
                                key={index}
                                className={`herry-message ${
                                    item.role === "user"
                                        ? "herry-user-message"
                                        : "herry-assistant-message"
                                }`}
                            >
                                {item.role === "assistant" ? (
                                    <ReactMarkdown>
                                        {item.message}
                                    </ReactMarkdown>
                                ) : (
                                    item.message
                                )}
                            </div>
                        ))}

                        {loading && (
                            <div className="herry-message herry-assistant-message">
                                <div className="herry-typing">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        )}
                    </div>

                    {limitReached && (
                        <div className="herry-limit-message">
                            <strong>Herry limit reached</strong>

                            <p>
                                You have used all{" "}
                                {usage?.limit?.toLocaleString() || ""}{" "}
                                messages available on your{" "}
                                {usage?.plan || "current"}{" "}
                                {usage?.billing_interval === "yearly"
                                    ? "yearly"
                                    : "monthly"}{" "}
                                plan.
                            </p>

                            <button
                                type="button"
                                className="herry-upgrade-button"
                            >
                                Upgrade Plan
                            </button>
                        </div>
                    )}

                    {!limitReached && (
                        <form
                            className="herry-input-area"
                            onSubmit={sendMessage}
                        >
                            <input
                                type="text"
                                value={message}
                                onChange={(e) =>
                                    setMessage(e.target.value)
                                }
                                placeholder="Ask Herry anything..."
                                disabled={loading}
                            />

                            <button
                                type="submit"
                                disabled={
                                    !message.trim() || loading
                                }
                            >
                                ➤
                            </button>
                        </form>
                    )}
                </div>
            )}
        </>
    );
}

