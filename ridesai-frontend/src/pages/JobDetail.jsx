import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function JobDetail() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function getJob() {
      try {
        setLoading(true);

        const response = await fetch(`/api/hr/jobs/public/${id}/`);

        if (!response.ok) {
          throw new Error("Job not found.");
        }

        const data = await response.json();

        setJob(data);
        setError("");
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    getJob();
  }, [id]);

  const daysLeft = job?.deadline
    ? Math.ceil(
        (new Date(job.deadline) - new Date()) / (1000 * 60 * 60 * 24)
      )
    : null;

  const isClosed = daysLeft !== null && daysLeft < 0;
  const isClosingSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 5;

  const formattedDeadline = job?.deadline
    ? new Date(job.deadline).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";

  return (
    <>
      <Header />

      <style>{`
        .jd-page {
          --jd-ink: #1B1730;
          --jd-body: #57536E;
          --jd-paper: #F6F4FC;
          --jd-card: #FFFFFF;
          --jd-accent: #FF77FF;
          --jd-accent-dark: #FF77FF;
          --jd-accent-soft: #F1E9FC;
          --jd-success: #158F52;
          --jd-success-soft: #E5F6EC;
          --jd-warn: #B45309;
          --jd-warn-soft: #FDF1E4;
          --jd-line: #E7E2F5;

          font-family: 'Inter', -apple-system, sans-serif;
          background: var(--jd-paper);
          min-height: 100vh;
          padding: 56px 20px 80px;
          color: var(--jd-body);
        }

        .jd-shell {
          max-width: 1040px;
          margin: 0 auto;
        }

        .jd-crumb {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--jd-accent-dark);
          margin-bottom: 18px;
        }

        .jd-crumb a {
          color: var(--jd-accent-dark);
          text-decoration: none;
          opacity: 0.7;
        }
        .jd-crumb a:hover { opacity: 1; text-decoration: underline; }

        /* ---- Ticket card ---- */
        .jd-ticket {
          background: var(--jd-card);
          border-radius: 20px;
          overflow: hidden;
          display: grid;
          grid-template-columns: 1fr 320px;
        }

        @media (max-width: 800px) {
          .jd-ticket { grid-template-columns: 1fr; }
        }

        .jd-main {
          padding: 44px 40px;
        }

        .jd-eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--jd-accent);
          margin-bottom: 14px;
        }

        .jd-title {
          font-family: 'Sora', sans-serif;
          font-size: 34px;
          font-weight: 700;
          color: var(--jd-ink);
          line-height: 1.15;
          margin: 0 0 8px;
        }

        .jd-company-line {
          font-size: 15px;
          color: var(--jd-body);
          margin-bottom: 26px;
        }

        .jd-company-line strong { color: var(--jd-ink); }

        .jd-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          font-weight: 600;
          padding: 6px 12px;
          border-radius: 999px;
          margin-bottom: 30px;
        }
        .jd-status.open { background: var(--jd-success-soft); color: var(--jd-success); }
        .jd-status.soon { background: var(--jd-warn-soft); color: var(--jd-warn); }
        .jd-status.closed { background: #F3F1F8; color: #8B87A0; }

        .jd-status .dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: currentColor;
        }

        .jd-section-title {
          font-family: 'Sora', sans-serif;
          font-size: 17px;
          font-weight: 600;
          color: var(--jd-ink);
          margin: 0 0 12px;
        }

        .jd-description {
          font-size: 15.5px;
          line-height: 1.75;
          color: var(--jd-body);
          white-space: pre-line;
        }

        /* ---- Perforated divider between main content and stub ---- */
        .jd-stub {
          background: var(--jd-accent-soft);
          padding: 40px 32px;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .jd-stub::before {
          content: "";
          position: absolute;
          top: 0; left: -12px;
          width: 24px; height: 24px;
          background: var(--jd-paper);
          border-radius: 50%;
        }
        .jd-stub::after {
          content: "";
          position: absolute;
          bottom: 0; left: -12px;
          width: 24px; height: 24px;
          background: var(--jd-paper);
          border-radius: 50%;
        }

        @media (max-width: 800px) {
          .jd-stub::before, .jd-stub::after {
            left: 0; right: 0; top: -12px; bottom: auto;
            width: 24px; height: 24px; margin: 0 auto;
          }
          .jd-stub::after { top: auto; bottom: -12px; }
        }

        .jd-stub-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--jd-accent-dark);
          opacity: 0.75;
          margin-bottom: 18px;
        }

        .jd-stat {
          padding: 12px 0;
          border-bottom: 1px dashed rgba(124, 44, 224, 0.25);
        }
        .jd-stat:last-of-type { border-bottom: none; }

        .jd-stat-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--jd-accent-dark);
          opacity: 0.65;
          margin-bottom: 3px;
        }

        .jd-stat-value {
          font-size: 15px;
          font-weight: 600;
          color: var(--jd-ink);
        }

        .jd-apply-btn {
          margin-top: 24px;
          display: block;
          text-align: center;
          padding: 15px 20px;
          border: none;
          border-radius: 10px;
          background: var(--jd-accent);
          color: #fff;
          font-family: 'Sora', sans-serif;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.15s ease, transform 0.1s ease;
        }
        .jd-apply-btn:hover { background: var(--jd-accent-dark); }
        .jd-apply-btn:active { transform: scale(0.98); }
        .jd-apply-btn.disabled {
          background: #C9C4DA;
          pointer-events: none;
        }

        .jd-back-link {
          margin-top: 12px;
          display: block;
          text-align: center;
          font-size: 13px;
          color: var(--jd-accent-dark);
          text-decoration: none;
          padding: 10px;
        }
        .jd-back-link:hover { text-decoration: underline; }

        .jd-barcode {
          margin-top: auto;
          padding-top: 24px;
          display: flex;
          gap: 3px;
          align-items: flex-end;
          height: 26px;
          opacity: 0.35;
        }
        .jd-barcode span {
          display: block;
          width: 3px;
          background: var(--jd-accent-dark);
        }

        /* ---- Loading / error states ---- */
        .jd-state {
          max-width: 480px;
          margin: 60px auto 0;
          background: var(--jd-card);
          border-radius: 16px;
          padding: 48px 36px;
          text-align: center;
          box-shadow: 0 12px 30px -16px rgba(45, 20, 90, 0.2);
        }

        .jd-spinner {
          width: 32px; height: 32px;
          border-radius: 50%;
          border: 3px solid var(--jd-accent-soft);
          border-top-color: var(--jd-accent);
          margin: 0 auto 20px;
          animation: jd-spin 0.8s linear infinite;
        }
        @keyframes jd-spin { to { transform: rotate(360deg); } }

        .jd-state h2 {
          font-family: 'Sora', sans-serif;
          font-size: 18px;
          color: var(--jd-ink);
          margin: 0 0 8px;
        }

        .jd-state p {
          font-size: 14px;
          color: var(--jd-body);
          margin: 0 0 24px;
        }
      `}</style>

      <div className="jd-page">
        <div className="jd-shell">
          {loading ? (
            <div className="jd-state">
              <div className="jd-spinner" />
              <h2>Loading job details</h2>
              <p>Hang tight, this'll just take a moment.</p>
            </div>
          ) : error ? (
            <div className="jd-state">
              <h2>This role isn't available</h2>
              <p>The posting may have closed or the link is incorrect.</p>
              <Link to="/careers" className="jd-apply-btn" style={{ display: "inline-block" }}>
                Back to careers
              </Link>
            </div>
          ) : (
            <>
              <div className="jd-crumb">
                <Link to="/careers">Careers</Link> / {job.title}
              </div>

              <div className="jd-ticket">
                <div className="jd-main">
                  <div className="jd-eyebrow">Ticket to apply</div>
                  <h1 className="jd-title">{job.title}</h1>
                  <div className="jd-company-line">
                    <strong>Rides Technologies</strong> · {job.department}
                  </div>

                  <div
                    className={`jd-status ${
                      isClosed ? "closed" : isClosingSoon ? "soon" : "open"
                    }`}
                  >
                    <span className="dot" />
                    {isClosed
                      ? "Applications closed"
                      : isClosingSoon
                      ? `Closes in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`
                      : "Actively hiring"}
                  </div>

                  <h2 className="jd-section-title">About the role</h2>
                  <p className="jd-description">{job.description}</p>
                </div>

                <div className="jd-stub">
                  <div className="jd-stub-label">Job information</div>

                  <div className="jd-stat">
                    <div className="jd-stat-label">Department</div>
                    <div className="jd-stat-value">{job.department}</div>
                  </div>
                  <div className="jd-stat">
                    <div className="jd-stat-label">Experience</div>
                    <div className="jd-stat-value">{job.experience} Years</div>
                  </div>
                  <div className="jd-stat">
                    <div className="jd-stat-label">Employment type</div>
                    <div className="jd-stat-value">{job.employment_type}</div>
                  </div>
                  <div className="jd-stat">
                    <div className="jd-stat-label">Salary</div>
                    <div className="jd-stat-value">PKR {job.salary}</div>
                  </div>
                  <div className="jd-stat">
                    <div className="jd-stat-label">Deadline</div>
                    <div className="jd-stat-value">{formattedDeadline}</div>
                  </div>
                  <div className="jd-stat">
                    <div className="jd-stat-label">Vacancies</div>
                    <div className="jd-stat-value">{job.vacancies}</div>
                  </div>

                  {isClosed ? (
                    <span className="jd-apply-btn disabled">Applications closed</span>
                  ) : (
                    <Link to={`/careers/${id}/apply`} className="jd-apply-btn">
                      Apply now
                    </Link>
                  )}
                  <Link to="/careers" className="jd-back-link">
                    Back to all roles
                  </Link>

                  <div className="jd-barcode">
                    {Array.from({ length: 26 }).map((_, i) => (
                      <span
                        key={i}
                        style={{ height: `${8 + ((i * 37) % 18)}px` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}