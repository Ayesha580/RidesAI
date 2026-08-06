import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./landing.css";

const stackModules = [
  { icon: "🧑‍💼", bg: "#E7D8FB", title: "HRMS", text: "Onboarding & records" },
  { icon: "⏱️", bg: "#F3E7FB", title: "EMS", text: "Clock-ins, leaves" },
  // { icon: "💳", bg: "#E7D8FB", title: "Payroll", text: "Runs itself monthly" },
  { icon: "📇", bg: "#F3E7FB", title: "CRM", text: "Leads & deals in one view" },
  { icon: "📦", bg: "#E7D8FB", title: "Dashboard", text: "Display All data" },
];

const allModules = [
  { icon: "🧑‍💼", title: "HRMS", text: "Employee records, onboarding and documents in one place." },
  { icon: "⏱️", title: "EMS", text: "Clock-ins, leave requests and shift tracking, automated." },
  // { icon: "💳", title: "Payroll", text: "Salaries, taxes and payslips calculated without spreadsheets." },
  { icon: "📇", title: "CRM", text: "Every lead, deal and follow-up tracked from first contact." },
  // { icon: "📊", title: "Accounting", text: "Invoices, expenses and ledgers that stay reconciled." },
  // { icon: "📦", title: "Inventory", text: "Stock levels and orders synced across every location." },
  // { icon: "🤖", title: "AI Assistant", text: "Asks your data questions and gets a straight answer back." },
  // { icon: "📈", title: "Reports", text: "One dashboard pulling numbers from every module above." },
];

const steps = [
  { title: "Register business", text: "Enter your business details and create your workspace." },
  { title: "Select plan", text: "Choose the Plan that fits your team's size." },
  { title: "Make payment", text: "Pay securely." },
  { title: "Start using ERP", text: "Invite your team and start managing" },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="rides">
      <Header />

      <section className="hero">
        <div>
          <span className="eyebrow">All-in-one ERP</span>
          <h1>
            Run your whole business <br />
            from <span className="accent">one dashboard</span>
          </h1>
          <p className="lede">
              Simplify your business with HRMS, attendance and CRM — all managed
              from one intuitive dashboard, so your team can work faster and more efficiently.
            </p>

          <div className="hero-ctas">
            <button className="btn-primary" onClick={() => navigate("/register")}>
              Get Started
            </button>
            <a href="#features" className="btn-ghost">
              See how it works
            </a>
          </div>

          <p className="trust-row">
            <b>One login.</b> departments. Zero spreadsheets.
          </p>
        </div>

        <div className="module-stack" aria-hidden="true">
          <svg className="thread-svg" viewBox="0 0 400 420">
            <defs>
              <linearGradient id="threadGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#BE27EE" />
                <stop offset="100%" stopColor="#B27BB2" />
              </linearGradient>
            </defs>
            <path
              className="thread-path"
              d="M60,40 C160,40 40,120 160,130 C280,140 120,220 260,230 C360,238 140,320 220,340"
            />
          </svg>

          {stackModules.map((m) => (
            <div className="module-card" key={m.title}>
              <span className="module-dot" style={{ background: m.bg }}>
                {m.icon}
              </span>
              <div>
                <h4>{m.title}</h4>
                <p>{m.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="section">
        <div className="section-head">
          <span className="eyebrow">Getting started</span>
          <h2>Four steps, then it runs itself</h2>
          <p>No sales calls, no onboarding calendar to book.</p>
        </div>

        <div className="steps">
          {steps.map((s, i) => (
            <div className="step" key={s.title}>
              <div className="step-num">{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="modules" className="modules-wrap">
        <div className="section">
          <div className="section-head">
            <span className="eyebrow">Everything included</span>
            <h2>One subscription, every department</h2>
            <p>Switch off what you don't need. Add teams as you grow.</p>
          </div>

          <div className="modules-grid">
            {allModules.map((m) => (
              <div className="module-tile" key={m.title}>
                <span className="module-dot" style={{ background: "#E7D8FB" }}>
                  {m.icon}
                </span>
                <h4>{m.title}</h4>
                <p>{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="cta-band" id="contact">
        <div>
          <h3>Bring your business onto one dashboard today</h3>
          <p>Set up takes minutes. Cancel anytime.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/register")}>
          Get Started
        </button>
      </div>

      <Footer />
    </div>
  );
}
