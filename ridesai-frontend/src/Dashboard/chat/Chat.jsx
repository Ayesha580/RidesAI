import { useState } from "react";
import ConversationList from "./ConversationList";
import ChatWindow from "./ChatWindow";

import "./Chat.css";
export default function Chat() {
    const [selectedConversation, setSelectedConversation] = useState(null);
    return (
        <div className="chat-page">
            <ConversationList
                selectedConversation={selectedConversation}
                setSelectedConversation={setSelectedConversation}
            />
            <ChatWindow
                selectedConversation={selectedConversation}
            />
        </div>
    );
}