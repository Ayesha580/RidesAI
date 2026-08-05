import "./MessageBubble.css";

export default function MessageBubble({

    message,

}) {

    const user = JSON.parse(
    localStorage.getItem("user")
);

    const mine = user?.id === message.sender.id;

    return (

        <div className={mine ? "message mine" : "message"}>

    {!mine && (

        <div className="message-name">

            {message.sender.full_name}

        </div>

    )}

    <div className="message-body">

        {message.message}

    </div>

    <div className="message-time">

        {

            new Date(message.created_at)
            .toLocaleTimeString([],{
                hour:"2-digit",
                minute:"2-digit"
            })

        }

    </div>

</div>

    );

}