import { useState } from "react";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";

import "./Chat.css";

export default function Chat() {
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [mobileView, setMobileView] = useState("list"); // "list" | "chat"

    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
        setMobileView("chat");
    };

    return (
        <div className="chat-page">
            <div
                className={`chat-sidebar-wrap ${
                    mobileView === "chat" ? "mobile-hidden" : ""
                }`}
            >
                <ConversationList
                    selectedConversation={selectedConversation}
                    setSelectedConversation={handleSelectConversation}
                />
            </div>

            <div
                className={`chat-window-wrap ${
                    mobileView === "list" ? "mobile-hidden" : ""
                }`}
            >
                <ChatWindow
                    selectedConversation={selectedConversation}
                    onBack={() => setMobileView("list")}
                />
            </div>
        </div>
    );
}