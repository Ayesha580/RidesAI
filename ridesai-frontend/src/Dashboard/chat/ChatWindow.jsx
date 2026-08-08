import { useEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import {
    getMessages,
    connectSocket,
    disconnectSocket
} from "./chatService";
import "./ChatWindow.css";

export default function ChatWindow({ selectedConversation, onBack }) {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const bottomRef = useRef();

    useEffect(() => {
        if (!selectedConversation) return;

        loadMessages();

        connectSocket(selectedConversation.id, (message) => {
            setMessages((prev) => [...prev, message]);
        });

        return () => {
            disconnectSocket();
        };
    }, [selectedConversation]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const loadMessages = async () => {
        setLoading(true);
        try {
            const response = await getMessages(selectedConversation.id);
            setMessages(response.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const onMessageSent = (message) => {
        setMessages((prev) => [...prev, message]);
    };

    if (!selectedConversation) {
        return (
            <div className="chat-window">
                <div className="chat-window-empty">Select a conversation</div>
            </div>
        );
    }

    return (
        <div className="chat-window">
            <div className="chat-header">
                <button className="chat-back-btn" onClick={onBack}>
                    <FaArrowLeft />
                </button>

                <div>
                    <h2>{selectedConversation.name}</h2>
                    <span>Team Conversation</span>
                </div>
            </div>

            <div className="chat-messages">
                {loading ? (
                    <div className="chat-loading">Loading...</div>
                ) : (
                    <>
                        {messages.map((message) => (
                            <MessageBubble key={message.id} message={message} />
                        ))}
                        <div ref={bottomRef}></div>
                    </>
                )}
            </div>

            <MessageInput conversation={selectedConversation} onMessageSent={onMessageSent} />
        </div>
    );
}