import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
    getMailbox,
    connectMailbox,
    disconnectMailbox,
    sendTestEmail,
} from "./mailboxService";

import "./Mailbox.css";

export default function Mailbox() {

    const [mailbox, setMailbox] = useState(null);

    const [loading, setLoading] = useState(true);

    const [sending, setSending] = useState(false);

    const [email, setEmail] = useState("");

    const [searchParams, setSearchParams] = useSearchParams();

    useEffect(() => {
        loadMailbox();
    }, []);

    const loadMailbox = async () => {
        try {

            const res = await getMailbox();

            setMailbox(res.data);

        } catch {

            setMailbox(null);

        } finally {

            setLoading(false);

        }
    };

    const connect = async () => {

        const res = await connectMailbox();

        window.location.href = res.data.authorization_url;

    };

    const disconnect = async () => {

        if (!window.confirm("Disconnect mailbox?")) return;

        await disconnectMailbox();

        setMailbox(null);

    };

    const testEmail = async () => {

        if (!email) return;

        setSending(true);

        try {

            await sendTestEmail(email);

            alert("Email Sent");

        } finally {

            setSending(false);

        }
    };

    const dismissBanner = () => {

        searchParams.delete("connected");

        setSearchParams(searchParams);

    };

    if (loading)
        return <div className="mailbox-loading">Loading...</div>;

    return (

        <div className="mailbox-page">

            <h2>Company Mailbox</h2>

            {searchParams.get("connected") === "true" && mailbox?.connected && (

                <div className="mailbox-success-banner">

                    <span>✅ Gmail account successfully connected!</span>

                    <button
                        className="banner-close-btn"
                        onClick={dismissBanner}
                    >
                        ✕
                    </button>

                </div>

            )}

            {!mailbox?.connected ? (

                <div className="mailbox-card">

                    <h3>No Mailbox Connected</h3>

                    <p>

                        Connect your company Gmail account to send follow-up emails.

                    </p>

                    <button
                        className="gmail-btn"
                        onClick={connect}
                    >
                        Connect Gmail
                    </button>

                </div>

            ) : (

                <div className="mailbox-card">

                    <div className="mailbox-row">

                        <span>Status</span>

                        <strong className="connected">
                            Connected
                        </strong>

                    </div>

                    <div className="mailbox-row">

                        <span>Email</span>

                        <strong>
                            {mailbox.email}
                        </strong>

                    </div>

                    <div className="mailbox-row">

                        <span>Provider</span>

                        <strong>
                            {mailbox.provider}
                        </strong>

                    </div>

                    <hr />

                    <h4>Send Test Email</h4>

                    <input
                        value={email}
                        onChange={(e)=>setEmail(e.target.value)}
                        placeholder="Email Address"
                    />

                    <button
                        className="test-btn"
                        onClick={testEmail}
                        disabled={sending}
                    >
                        {sending ? "Sending..." : "Send Test"}
                    </button>

                    <button
                        className="disconnect-btn"
                        onClick={disconnect}
                    >
                        Disconnect
                    </button>

                </div>

            )}

        </div>

    );
}