import { useEffect, useState } from "react";
import "./Support.css";
import axiosClient from "../api/axiosClient";
export default function Support() {
    const [questions, setQuestions] = useState([]);
    const [messages, setMessages] = useState([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && questions.length === 0) {
            fetchQuestions();
        }
    }, [open]);

    const fetchQuestions = async () => {
        try {
            setLoading(true);

            const response = await axiosClient.get(
                "/support/questions/"
            );

            setQuestions(response.data);
        } catch (error) {
            console.error(
                "Failed to load support questions:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    const handleQuestionClick = (item) => {
        setMessages((prev) => [
            ...prev,
            {
                type: "user",
                text: item.question,
            },
            {
                type: "bot",
                text: item.answer,
            },
        ]);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleClearChat = () => {
        setMessages([]);
    };

    return (
        <>
            {/* ================= FLOATING BUTTON ================= */}

            {!open && (
                <button
                    className="ridesai-support-widget-button"
                    onClick={() => setOpen(true)}
                    aria-label="Open Support"
                >
                    <span className="ridesai-support-widget-icon">
                        ?
                    </span>

                    <span className="ridesai-support-widget-label">
                        Support
                    </span>
                </button>
            )}

            {/* ================= CHAT WINDOW ================= */}

            {open && (
                <div className="ridesai-support-widget">

                    {/* HEADER */}

                    <div className="ridesai-support-widget-header">

                        <div className="ridesai-support-widget-profile">

                            <div className="ridesai-support-widget-avatar">
                                ✦
                            </div>

                            <div>
                                <h3>Rides AI Support</h3>

                                <div className="ridesai-support-widget-online">
                                    <span></span>
                                    Online
                                </div>
                            </div>

                        </div>

                        <button
                            className="ridesai-support-widget-close"
                            onClick={handleClose}
                        >
                            ×
                        </button>

                    </div>


                    {/* CHAT BODY */}

                    <div className="ridesai-support-widget-body">

                        {/* INITIAL BOT MESSAGE */}

                        {messages.length === 0 && (
                            <div className="ridesai-support-widget-welcome">

                                <div className="ridesai-support-widget-bot-row">

                                    <div className="ridesai-support-widget-small-avatar">
                                        ✦
                                    </div>

                                    <div className="ridesai-support-widget-bot-message">
                                        Hi! 👋
                                        <br />
                                        How can we help you today?
                                    </div>

                                </div>

                            </div>
                        )}


                        {/* MESSAGES */}

                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className={
                                    message.type === "user"
                                        ? "ridesai-support-widget-user-row"
                                        : "ridesai-support-widget-bot-row"
                                }
                            >

                                {message.type === "bot" && (
                                    <div className="ridesai-support-widget-small-avatar">
                                        ✦
                                    </div>
                                )}

                                <div
                                    className={
                                        message.type === "user"
                                            ? "ridesai-support-widget-user-message"
                                            : "ridesai-support-widget-bot-message"
                                    }
                                >
                                    {message.text}
                                </div>

                            </div>
                        ))}


                        {/* QUESTIONS */}

                        <div className="ridesai-support-widget-question-section">

                            <div className="ridesai-support-widget-question-title">
                                Popular questions
                            </div>

                            {loading ? (
                                <div className="ridesai-support-widget-loading">
                                    Loading...
                                </div>
                            ) : (
                                questions.map((item) => (
                                    <button
                                        key={item.id}
                                        className="ridesai-support-widget-question"
                                        onClick={() =>
                                            handleQuestionClick(item)
                                        }
                                    >
                                        <span className="ridesai-support-widget-question-mark">
                                            ?
                                        </span>

                                        <span>
                                            {item.question}
                                        </span>

                                        <span className="ridesai-support-widget-arrow">
                                            ›
                                        </span>
                                    </button>
                                ))
                            )}

                        </div>

                    </div>


                    {/* FOOTER */}

                    <div className="ridesai-support-widget-footer">

                        {messages.length > 0 && (
                            <button
                                className="ridesai-support-widget-clear"
                                onClick={handleClearChat}
                            >
                                Clear chat
                            </button>
                        )}

                        <span>
                            Select a question to get help
                        </span>

                    </div>

                </div>
            )}
        </>
    );
}