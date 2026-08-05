import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

const STEPS = [
  {
    id: 1,
    title: "Create your account",
    description:
      "Sign up in a couple of minutes,Pick a plan later, once you've seen how it fits your team.",
    visual: "signup",
  },
  {
    id: 2,
    title: "Set up your team",
    description:
      "Add employees, HR and managers.",
    visual: "team",
  },
  {
    id: 3,
    title: "Connect your workflows",
    description:
      "Attendance, CRM, HR, Manager and Employees, so a check-in, a deal, or a stock update all stay in sync.",
    visual: "workflow",
  },
  {
    id: 4,
    title: "Grow with real insight",
    description:
      "Dashboards turn day-to-day activity into decisions, so you spend less time digging for numbers.",
    visual: "insight",
  },
];

function StepVisual({ kind }) {
  if (kind === "signup") {
    return (
      <div className="visual visual-signup">
        <div className="v-line v-line-title" />
        <div className="v-field" />
        <div className="v-field" />
        <div className="v-button" />
      </div>
    );
  }
  if (kind === "team") {
    return (
      <div className="visual visual-team">
        {["A", "K", "S", "M"].map((letter, i) => (
          <div className="v-avatar" key={letter} style={{ zIndex: 4 - i }}>
            {letter}
          </div>
        ))}
        <div className="v-add">+</div>
      </div>
    );
  }
  if (kind === "workflow") {
    return (
      <div className="visual visual-workflow">
        <div className="v-node">Owner</div>
        <div className="v-connector" />
        <div className="v-node v-node--accent">CRM</div>
        
      </div>
    );
  }
  return (
    <div className="visual visual-insight">
      {[40, 65, 50, 85, 60].map((h, i) => (
        <div className="v-bar" key={i} style={{ height: `${h}%` }} />
      ))}
    </div>
  );
}

export default function HowItWorks() {
  const navigate = useNavigate();

  return (
    <>
      <Header />

      <main className="hiw-page">
        <div className="hiw-shell">
          <div className="hiw-hero">
            <p className="hiw-eyebrow">How it works</p>
            <h1 className="hiw-title">From sign-up to running your business, in four steps</h1>
            <p className="hiw-subtitle">
              No lengthy setup calls required. Most teams are checking in their
              first employee within the same afternoon.
            </p>
          </div>

          <div className="hiw-timeline">
            <div className="timeline-line" aria-hidden="true" />

            {STEPS.map((step, index) => (
              <div
                className={`timeline-row${index % 2 === 1 ? " timeline-row--reverse" : ""}`}
                key={step.id}
              >
                <div className="timeline-content">
                  <span className="step-number">{String(step.id).padStart(2, "0")}</span>
                  <h2 className="step-title">{step.title}</h2>
                  <p className="step-description">{step.description}</p>
                </div>

                <div className="timeline-marker" aria-hidden="true" />

                <div className="timeline-visual">
                  <StepVisual kind={step.visual} />
                </div>
              </div>
            ))}
          </div>

          <div className="hiw-cta">
            <h2 className="cta-title">Ready to see it running with your own team?</h2>
            <p className="cta-subtitle">
              Create an account and set up your first workflow today.
            </p>
            <button className="cta-button" onClick={() => navigate("/register")}>
              Get started
            </button>
          </div>
        </div>
      </main>

      <Footer />

      <style>{`
        .hiw-page {
          min-height: 100vh;
          background: #faf7fc;
          padding: 88px 20px 110px;
          font-family: "Inter", -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
        }

        .hiw-page::before {
          content: "";
          position: absolute;
          top: -160px;
          left: -160px;
          width: 480px;
          height: 480px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(190,39,238,0.14) 0%, rgba(190,39,238,0) 70%);
          pointer-events: none;
        }

        .hiw-shell {
          max-width: 1080px;
          margin: 0 auto;
          position: relative;
        }

        .hiw-hero {
          text-align: center;
          margin-bottom: 80px;
        }

        .hiw-eyebrow {
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #be27ee;
          margin: 0 0 14px;
        }

        .hiw-title {
          font-family: "Manrope", sans-serif;
          font-weight: 800;
          font-size: clamp(30px, 4vw, 42px);
          line-height: 1.2;
          letter-spacing: -0.02em;
          color: #1f1130;
          max-width: 720px;
          margin: 0 auto 18px;
        }

        .hiw-subtitle {
          font-size: 16.5px;
          color: #7c6889;
          max-width: 480px;
          margin: 0 auto;
        }

        .hiw-timeline {
          position: relative;
        }

        .timeline-line {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 50%;
          width: 2px;
          background: linear-gradient(180deg, #ece0f5 0%, #be27ee 50%, #ece0f5 100%);
          transform: translateX(-50%);
        }

        .timeline-row {
          position: relative;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 40px;
          padding: 40px 0;
        }

        .timeline-row--reverse {
          direction: rtl;
        }

        .timeline-row--reverse .timeline-content,
        .timeline-row--reverse .timeline-visual {
          direction: ltr;
        }

        .timeline-content {
          text-align: right;
        }

        .timeline-row--reverse .timeline-content {
          text-align: left;
        }

        .step-number {
          font-family: "JetBrains Mono", monospace;
          font-size: 14px;
          font-weight: 600;
          color: #be27ee;
          letter-spacing: 0.05em;
        }

        .step-title {
          font-family: "Manrope", sans-serif;
          font-weight: 700;
          font-size: 22px;
          color: #1f1130;
          margin: 8px 0 10px;
        }

        .step-description {
          font-size: 14.5px;
          line-height: 1.65;
          color: #7c6889;
          max-width: 340px;
          margin: 0 0 0 auto;
        }

        .timeline-row--reverse .step-description {
          margin: 0 auto 0 0;
        }

        .timeline-marker {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #be27ee;
          box-shadow: 0 0 0 6px #f8ecfd;
          z-index: 2;
        }

        .timeline-visual {
          display: flex;
          justify-content: flex-start;
        }

        .timeline-row--reverse .timeline-visual {
          justify-content: flex-end;
        }

        .visual {
          width: 100%;
          max-width: 260px;
          min-height: 140px;
          background: #ffffff;
          border: 1px solid #ece0f5;
          border-radius: 16px;
          padding: 22px;
          box-shadow: 0 20px 44px -26px rgba(190, 39, 238, 0.35);
        }

        .visual-signup { display: flex; flex-direction: column; gap: 12px; }
        .v-line-title { width: 55%; height: 10px; border-radius: 4px; background: #ece0f5; }
        .v-field { height: 30px; border-radius: 8px; background: #faf7fc; border: 1px solid #ece0f5; }
        .v-button { height: 32px; border-radius: 8px; background: #be27ee; margin-top: 4px; }

        .visual-team {
          display: flex;
          align-items: center;
        }
        .v-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #f8ecfd;
          color: #be27ee;
          font-family: "Manrope", sans-serif;
          font-weight: 700;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #ffffff;
          margin-left: -12px;
        }
        .v-avatar:first-child { margin-left: 0; }
        .v-add {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #ffffff;
          border: 2px dashed #be27ee;
          color: #be27ee;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          margin-left: -12px;
        }

        .visual-workflow {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        .v-node {
          width: 100%;
          text-align: center;
          padding: 10px;
          border-radius: 10px;
          background: #faf7fc;
          border: 1px solid #ece0f5;
          font-size: 13px;
          font-weight: 600;
          color: #4a3a56;
        }
        .v-node--accent { background: #be27ee; color: #ffffff; border-color: #be27ee; }
        .v-connector { width: 2px; height: 14px; background: #ece0f5; }

        .visual-insight {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          height: 100px;
        }
        .v-bar {
          flex: 1;
          border-radius: 6px 6px 0 0;
          background: linear-gradient(180deg, #be27ee 0%, #f0c6fb 100%);
        }

        .hiw-cta {
          margin-top: 80px;
          text-align: center;
          background: #ffffff;
          border: 1px solid #ece0f5;
          border-radius: 20px;
          padding: 56px 32px;
          box-shadow: 0 20px 48px -28px rgba(190, 39, 238, 0.3);
        }

        .cta-title {
          font-family: "Manrope", sans-serif;
          font-weight: 800;
          font-size: 28px;
          color: #1f1130;
          margin: 0 0 12px;
        }

        .cta-subtitle {
          font-size: 15px;
          color: #7c6889;
          margin: 0 0 28px;
        }

        .cta-button {
          border: none;
          background: #be27ee;
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          padding: 14px 32px;
          border-radius: 12px;
          cursor: pointer;
          transition: filter 0.2s ease, transform 0.15s ease;
        }

        .cta-button:hover { filter: brightness(1.08); }
        .cta-button:active { transform: scale(0.98); }

        @media (max-width: 860px) {
          .timeline-line { left: 24px; }

          .timeline-row,
          .timeline-row--reverse {
            direction: ltr;
            grid-template-columns: 40px 1fr;
            gap: 20px;
          }

          .timeline-marker {
            grid-row: 1;
            grid-column: 1;
            margin-top: 6px;
          }

          .timeline-content,
          .timeline-row--reverse .timeline-content {
            grid-column: 2;
            text-align: left;
          }

          .step-description,
          .timeline-row--reverse .step-description {
            margin: 0;
          }

          .timeline-visual,
          .timeline-row--reverse .timeline-visual {
            grid-column: 2;
            justify-content: flex-start;
            margin-top: 18px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .cta-button { transition: none; }
        }
      `}</style>
    </>
  );
}