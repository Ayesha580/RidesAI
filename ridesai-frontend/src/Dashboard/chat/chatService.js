import axiosClient from "../../api/axiosClient";

let socket = null;
export const createConversation = (data)=>
    axiosClient.post(
        "/chat/conversations/create/",
        data
    );

export const deleteConversation = (conversationId) =>
    axiosClient.delete(`/chat/conversations/${conversationId}/delete/`);

export const getConversations = () =>
    axiosClient.get("/chat/conversations/");

export const getMessages = (conversationId) =>
    axiosClient.get(`/chat/messages/${conversationId}/`);


export const connectSocket = (conversationId, onMessage) => {

    if (socket) {
        socket.close();
    }
    const token = localStorage.getItem("access_token");

    socket = new WebSocket(
        `ws:/ws/chat/${conversationId}/`
    );

    socket.onopen = () => {
        console.log("WebSocket Connected");
    };

    socket.onmessage = (event) => {

        const data = JSON.parse(event.data);

        onMessage(data);

    };

    socket.onclose = () => {
        console.log("WebSocket Closed");
    };

    socket.onerror = (err) => {
        console.log(err);
    };

    return socket;
};

export const sendSocketMessage = (message) => {

    if (!socket) return;

    socket.send(
        JSON.stringify({
            message,
        })
    );

};

export const disconnectSocket = () => {

    if (socket) {

        socket.close();

        socket = null;

    }

};