import { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

const REASONS = [
  { id: "sales", label: "Talk to Sales" },
  { id: "support", label: "Get Support" },
];

const REASON_COPY = {
  sales: {
    subtitle: "Tell us about your team and we'll help you pick the right plan.",
    submitLabel: "Contact US",
  },
  support: {
    subtitle: "Already a customer? Tell us what's going on and we'll jump in fast.",
    submitLabel: "Contact US",
  },
};


export default function ContactHub() {
  const [reason, setReason] = useState("sales");
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [chatOpen, setChatOpen] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
  e.preventDefault();
  setSubmitting(true);
  setSent(false);

  // Fake delay (optional)
  await new Promise((resolve) => setTimeout(resolve, 800));

  setSent(true);

  setForm({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  });

  setSubmitting(false);
}

  const copy = REASON_COPY[reason];

  return (
    <>
      <Header />

      <main className="chub-page">
        <div className="chub-shell">
          <div className="chub-hero">
            <p className="chub-eyebrow">Contact</p>
            <h1 className="chub-title">How can we help?</h1>

            <div className="chub-reasons" role="tablist" aria-label="Reason for contact">
              {REASONS.map((r) => (
                <button
                  key={r.id}
                  role="tab"
                  aria-selected={reason === r.id}
                  className={`reason-pill${reason === r.id ? " reason-pill--active" : ""}`}
                  onClick={() => setReason(r.id)}
                  type="button"
                >
                  {r.label}
                </button>
              ))}
            </div>

            <p className="chub-subtitle">{copy.subtitle}</p>
          </div>

          <div className="chub-grid">
            <form className="chub-form" onSubmit={handleSubmit}>
              {sent && (
                <div className="form-success">
                  Thanks — your message is on its way. We'll be in touch soon.
                </div>
              )}

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="name">Full name</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Ali Khan"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="email">Work email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="ali@company.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                {reason === "sales" && (
                  <div className="form-field">
                    <label htmlFor="company">Company name</label>
                    <input
                      id="company"
                      name="company"
                      type="text"
                      placeholder="Acme Inc."
                      value={form.company}
                      onChange={handleChange}
                    />
                  </div>
                )}

                <div className="form-field">
                  <label htmlFor="phone">Phone (optional)</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+92 300 1234567"
                    value={form.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="message">
                  {reason === "support" ? "What's going on?" : "Message"}
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  placeholder={
                    reason === "support"
                      ? "Describe the issue you're running into..."
                      : "Tell us a bit about what you need..."
                  }
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button className="form-submit" type="submit" disabled={submitting}>
                {submitting ? "Sending..." : copy.submitLabel}
              </button>
            </form>

            <aside className="chub-sidebar">
              <div className="side-card">
                <div className="info-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 6H20V18H4V6ZM4 6L12 12L20 6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div>
                  <p className="info-label">Email</p>
                  <p className="info-value">
                    ahead@ridestechnologies.com
                  </p>
                  <p className="info-note">
                    We'll get back to you as soon as possible.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
      <style>{`
        .chub-page {
          min-height: 100vh;
          background: #faf7fc;
          padding: 88px 20px 110px;
          font-family: "Inter", -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
        }

        .chub-page::before {
          content: "";
          position: absolute;
          top: -160px;
          right: -160px;
          width: 480px;
          height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(190,39,238,0.16) 0%, rgba(190,39,238,0) 70%);
          pointer-events: none;
        }

        .chub-shell {
          max-width: 1120px;
          margin: 0 auto;
          position: relative;
        }

        .chub-hero {
          text-align: center;
          margin-bottom: 44px;
        }

        .chub-eyebrow {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #be27ee;
          margin: 0 0 14px;
        }

        .chub-title {
          font-family: "Manrope", sans-serif;
          font-weight: 800;
          font-size: clamp(30px, 4vw, 44px);
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: #1f1130;
          margin: 0 0 26px;
        }

        .chub-reasons {
          display: inline-flex;
          gap: 8px;
          background: #ffffff;
          border: 1px solid #ece0f5;
          border-radius: 999px;
          padding: 6px;
          margin-bottom: 20px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .reason-pill {
          border: none;
          background: transparent;
          padding: 10px 20px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 600;
          color: #7c6889;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .reason-pill--active {
          background: #be27ee;
          color: #ffffff;
        }

        .chub-subtitle {
          font-size: 16px;
          color: #7c6889;
          max-width: 520px;
          margin: 0 auto;
        }

        .chub-grid {
          display: grid;
          grid-template-columns: 1.35fr 0.85fr;
          gap: 28px;
          align-items: start;
        }

        @media (max-width: 860px) {
          .chub-grid {
            grid-template-columns: 1fr;
          }
        }

        .chub-form {
          background: #ffffff;
          border: 1px solid #ece0f5;
          border-radius: 20px;
          padding: 36px;
          box-shadow: 0 20px 48px -28px rgba(190, 39, 238, 0.3);
        }

        .form-success {
          background: #f8ecfd;
          color: #8a13ad;
          border: 1px solid #e6c4f5;
          border-radius: 10px;
          padding: 12px 16px;
          font-size: 14px;
          margin-bottom: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        @media (max-width: 540px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
          margin-bottom: 20px;
        }

        .form-field label {
          font-size: 13px;
          font-weight: 600;
          color: #4a3a56;
        }

        .form-field input,
        .form-field textarea {
          font-family: inherit;
          font-size: 14.5px;
          color: #1f1130;
          background: #faf7fc;
          border: 1px solid #ece0f5;
          border-radius: 10px;
          padding: 12px 14px;
          resize: vertical;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .form-field input:focus,
        .form-field textarea:focus {
          outline: none;
          border-color: #be27ee;
          box-shadow: 0 0 0 3px rgba(190, 39, 238, 0.15);
          background: #ffffff;
        }

        .form-submit {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          background: #be27ee;
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: filter 0.2s ease, transform 0.15s ease;
        }

        .form-submit:hover { filter: brightness(1.08); }
        .form-submit:active { transform: scale(0.98); }
        .form-submit:disabled { opacity: 0.7; cursor: default; }

        .chub-sidebar {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .side-card {
          background: #ffffff;
          border: 1px solid #ece0f5;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          gap: 14px;
          align-items: flex-start;
          text-align: left;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          font-family: inherit;
          cursor: default;
        }

        .side-card--chat {
          cursor: pointer;
          border-color: #be27ee;
        }

        .side-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 16px 32px -18px rgba(190, 39, 238, 0.35);
        }

        .info-icon {
          width: 40px;
          height: 40px;
          min-width: 40px;
          border-radius: 12px;
          background: #f8ecfd;
          color: #be27ee;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .info-label {
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #a48ab3;
          margin: 0 0 4px;
        }

        .info-value {
          font-size: 14.5px;
          font-weight: 600;
          color: #1f1130;
          margin: 0 0 3px;
        }

        .info-note {
          font-size: 12.5px;
          color: #9884a5;
          margin: 0;
        }

        .chub-faq {
          margin-top: 64px;
        }

        .faq-title {
          font-family: "Manrope", sans-serif;
          font-weight: 700;
          font-size: 26px;
          color: #1f1130;
          text-align: center;
          margin: 0 0 28px;
        }

        .faq-list {
          max-width: 720px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .faq-item {
          background: #ffffff;
          border: 1px solid #ece0f5;
          border-radius: 14px;
          overflow: hidden;
        }

        .faq-question {
          width: 100%;
          background: none;
          border: none;
          padding: 18px 20px;
          font-size: 15px;
          font-weight: 600;
          color: #1f1130;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          text-align: left;
        }

        .faq-caret {
          color: #be27ee;
          display: flex;
          transition: transform 0.2s ease;
        }

        .faq-caret--open {
          transform: rotate(180deg);
        }

        .faq-answer {
          padding: 0 20px 18px;
          margin: 0;
          font-size: 14px;
          color: #7c6889;
          line-height: 1.6;
        }

        .chat-launcher {
          position: fixed;
          bottom: 26px;
          right: 26px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #be27ee;
          color: #ffffff;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 28px -8px rgba(190, 39, 238, 0.55);
          cursor: pointer;
          z-index: 40;
          transition: transform 0.15s ease;
        }

        .chat-launcher:hover { transform: scale(1.06); }

        .chat-panel {
          position: fixed;
          bottom: 92px;
          right: 26px;
          width: 320px;
          max-width: calc(100vw - 40px);
          background: #ffffff;
          border: 1px solid #ece0f5;
          border-radius: 16px;
          box-shadow: 0 24px 56px -16px rgba(31, 17, 48, 0.3);
          overflow: hidden;
          z-index: 40;
        }

        .chat-panel-header {
          background: #be27ee;
          color: #ffffff;
          padding: 14px 18px;
          font-weight: 600;
          font-size: 14.5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chat-close {
          background: none;
          border: none;
          color: #ffffff;
          font-size: 20px;
          line-height: 1;
          cursor: pointer;
        }

        .chat-panel-body {
          padding: 18px;
          min-height: 100px;
        }

        .chat-bubble {
          background: #f8ecfd;
          color: #4a1a5c;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 13.5px;
          line-height: 1.5;
        }

        .chat-panel-footer {
          display: flex;
          border-top: 1px solid #ece0f5;
          padding: 10px;
          gap: 8px;
        }

        .chat-panel-footer input {
          flex: 1;
          border: 1px solid #ece0f5;
          border-radius: 8px;
          padding: 8px 10px;
          font-size: 13.5px;
          font-family: inherit;
        }

        .chat-panel-footer input:focus {
          outline: none;
          border-color: #be27ee;
        }

        .chat-panel-footer button {
          background: #be27ee;
          color: #ffffff;
          border: none;
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 13.5px;
          font-weight: 600;
          cursor: pointer;
        }

        @media (prefers-reduced-motion: reduce) {
          .side-card, .form-submit, .chat-launcher, .faq-caret {
            transition: none;
          }
        }
      `}</style>
    </>
  );
}