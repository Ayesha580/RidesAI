import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function ApplyJob() {
  const { id } = useParams();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    cover_letter: "",
  });

  const [resume, setResume] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (file) setResume(file);
  }

  async function submit(e) {
    e.preventDefault();

    if (!resume) {
      setError("Please attach your resume before submitting.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append("full_name", form.full_name);
      data.append("email", form.email);
      data.append("phone", form.phone);
      data.append("cover_letter", form.cover_letter);
      data.append("resume", resume);

      const res = await fetch(`/api/hr/jobs/${id}/apply/`, {
        method: "POST",
        body: data,
      });

      if (!res.ok) {
        throw new Error("Submission failed.");
      }

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Header />

      <style>{`
        .aj-page {
          --aj-ink: #1B1730;
          --aj-body: #57536E;
          --aj-paper: #F6F4FC;
          --aj-accent: #FF77FF;
          --aj-accent-dark: #8B1BB5;
          --aj-accent-soft: #F8EBFC;
          --aj-line: #E7E2F5;
          --aj-error: #C4432B;
          --aj-error-soft: #FBEBE6;
          --aj-success: #158F52;
          --aj-success-soft: #E5F6EC;

          font-family: 'Inter', -apple-system, sans-serif;
          background: var(--aj-paper);
          min-height: 100vh;
          padding: 56px 20px 80px;
          color: var(--aj-body);
        }

        .aj-shell {
          max-width: 560px;
          margin: 0 auto;
        }

        .aj-crumb {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--aj-accent-dark);
          margin-bottom: 22px;
        }
        .aj-crumb a {
          color: var(--aj-accent-dark);
          text-decoration: none;
          opacity: 0.7;
        }
        .aj-crumb a:hover { opacity: 1; text-decoration: underline; }

        .aj-card {
          padding: 8px 0 0;
        }

        .aj-eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--aj-accent);
          margin-bottom: 10px;
        }

        .aj-title {
          font-family: 'Sora', sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: var(--aj-ink);
          margin: 0 0 8px;
        }

        .aj-subtitle {
          font-size: 14px;
          margin: 0 0 32px;
        }

        .aj-field {
          margin-bottom: 20px;
        }

        .aj-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--aj-ink);
          margin-bottom: 6px;
        }

        .aj-input,
        .aj-textarea {
          width: 100%;
          box-sizing: border-box;
          font-family: 'Inter', sans-serif;
          font-size: 14.5px;
          color: var(--aj-ink);
          background: var(--aj-paper);
          border: 1px solid var(--aj-line);
          border-radius: 10px;
          padding: 12px 14px;
          outline: none;
          transition: border-color 0.15s ease, background 0.15s ease;
        }

        .aj-input:focus,
        .aj-textarea:focus {
          border-color: var(--aj-accent);
          background: #fff;
        }

        .aj-textarea {
          resize: vertical;
          min-height: 110px;
          line-height: 1.6;
        }

        .aj-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 480px) {
          .aj-row { grid-template-columns: 1fr; }
        }

        .aj-file {
          border: 1px dashed var(--aj-line);
          border-radius: 10px;
          padding: 16px;
          text-align: center;
          background: var(--aj-paper);
          cursor: pointer;
          position: relative;
        }

        .aj-file input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        .aj-file-label {
          font-size: 13.5px;
          font-weight: 600;
          color: var(--aj-accent-dark);
        }

        .aj-file-hint {
          font-size: 12px;
          color: var(--aj-body);
          margin-top: 2px;
        }

        .aj-error {
          background: var(--aj-error-soft);
          color: var(--aj-error);
          font-size: 13.5px;
          padding: 10px 14px;
          border-radius: 8px;
          margin-bottom: 18px;
        }

        .aj-submit {
          width: 100%;
          margin-top: 10px;
          padding: 14px 20px;
          border: none;
          border-radius: 10px;
          background: var(--aj-accent);
          color: #fff;
          font-family: 'Sora', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .aj-submit:hover { background: var(--aj-accent-dark); }
        .aj-submit:active { transform: scale(0.99); }
        .aj-submit:disabled {
          background: #C9C4DA;
          cursor: not-allowed;
        }

        .aj-success {
          text-align: center;
          padding: 20px 0;
        }

        .aj-success-badge {
          width: 48px; height: 48px;
          border-radius: 50%;
          background: var(--aj-success-soft);
          color: var(--aj-success);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px;
          font-size: 22px;
        }

        .aj-success h2 {
          font-family: 'Sora', sans-serif;
          font-size: 19px;
          color: var(--aj-ink);
          margin: 0 0 8px;
        }

        .aj-success p {
          font-size: 14px;
          margin: 0 0 22px;
        }

        .aj-back-btn {
          display: inline-block;
          padding: 11px 22px;
          border-radius: 9px;
          border: 1px solid var(--aj-line);
          color: var(--aj-ink);
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
        }
        .aj-back-btn:hover { border-color: var(--aj-accent); }
      `}</style>

      <div className="aj-page">
        <div className="aj-shell">
          <div className="aj-crumb">
            <Link to={`/careers/${id}`}>&larr; Back to job</Link>
          </div>

          <div className="aj-card">
            {submitted ? (
              <div className="aj-success">
                <div className="aj-success-badge">✓</div>
                <h2>Application submitted</h2>
                <p>Thanks for applying — we'll be in touch if it's a match.</p>
                <Link to={`/careers/${id}`} className="aj-back-btn">
                  Back to job details
                </Link>
              </div>
            ) : (
              <>
                <div className="aj-eyebrow">Application</div>
                <h1 className="aj-title">Apply for this role</h1>
                <p className="aj-subtitle">
                  Fill in your details below — it only takes a minute.
                </p>

                {error && <div className="aj-error">{error}</div>}

                <form onSubmit={submit}>
                  <div className="aj-field">
                    <label className="aj-label">Full name</label>
                    <input
                      className="aj-input"
                      name="full_name"
                      placeholder="Your full name"
                      value={form.full_name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="aj-row">
                    <div className="aj-field">
                      <label className="aj-label">Email</label>
                      <input
                        className="aj-input"
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                        pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                      />
                    </div>
                    <div className="aj-field">
                      <label className="aj-label">Phone</label>
                      <input
                        className="aj-input"
                        name="phone"
                        placeholder="03XX XXXXXXX"
                        value={form.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="aj-field">
                    <label className="aj-label">Cover letter</label>
                    <textarea
                      className="aj-textarea"
                      name="cover_letter"
                      placeholder="Tell us why you're a good fit for this role"
                      value={form.cover_letter}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="aj-field">
                    <label className="aj-label">Resume</label>
                    <div className="aj-file">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFile}
                      />
                      <div className="aj-file-label">
                        {resume ? resume.name : "Click to upload your resume"}
                      </div>
                      <div className="aj-file-hint">PDF, DOC or DOCX</div>
                    </div>
                  </div>

                  <button className="aj-submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit application"}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}