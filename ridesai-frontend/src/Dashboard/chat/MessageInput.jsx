import { useState } from "react";
import { FaPaperPlane, FaSmile } from "react-icons/fa";
import EmojiPicker from "emoji-picker-react";
import {
    sendSocketMessage
} from "./chatService";

import axiosClient from "../../api/axiosClient";

import "./MessageInput.css";
export default function MessageInput({

    conversation,

    onMessageSent,

}) {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const onEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
};

    const send = async () => {


        if (!message.trim() || !conversation)
            return;


        try {

            setLoading(true);


            const response = await axiosClient.post(
                "/chat/messages/send/",
                {
                    conversation: conversation.id,
                    message: message
                }
            );


            // UI update
            if(onMessageSent){

                onMessageSent(
                    response.data
                );

            }


            // websocket broadcast
            sendSocketMessage(
                message
            );


            setMessage("");


        }

        catch(err){

            console.log(err);

        }

        finally{

            setLoading(false);

        }

    };



    const handleKeyDown = (e)=>{


        if(
            e.key === "Enter" &&
            !e.shiftKey
        ){

            e.preventDefault();

            send();

        }

    };



    return (
    <div className="message-input-container">

        <button
            className="chat-icon-btn"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
        >
            <FaSmile />
        </button>
        {showEmojiPicker && (
        <div className="emoji-picker">
            <EmojiPicker onEmojiClick={onEmojiClick} />
        </div>
        )}

        <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
        />

        <button
            className="send-btn"
            onClick={send}
            disabled={loading}
        >
            <FaPaperPlane />
        </button>

    </div>
);
}