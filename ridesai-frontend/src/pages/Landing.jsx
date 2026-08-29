import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Support from "../components/Support";
import bunnyMascot from "../assets/bunny-mascoot.png";
import catMascot from "../assets/pink-panther.png";
import "./landing.css";

const stackModules = [
  { icon: "🧑‍💼", bg: "#FFE1F0", title: "HRMS", text: "Onboarding & records" },
  { icon: "⏱️", bg: "#FFD1E8", title: "EMS", text: "Clock-ins, leaves" },
  // { icon: "💳", bg: "#FFE1F0", title: "Payroll", text: "Runs itself monthly" },
  { icon: "📇", bg: "#FFD1E8", title: "CRM", text: "Leads & deals in one view" },
  { icon: "📦", bg: "#FFE1F0", title: "Dashboard", text: "Display All data" },
    { icon: "🤖", bg: "#FFD1E8", title: "AI Assistant", text: "Ask questions & get instant answers" },

];

const allModules = [
  { icon: "🧑‍💼", title: "HRMS", text: "Employee records, onboarding and documents in one place." },
  { icon: "⏱️", title: "EMS", text: "Clock-ins, leave requests and shift tracking, automated." },
  // { icon: "💳", title: "Payroll", text: "Salaries, taxes and payslips calculated without spreadsheets." },

  { icon: "📇", title: "CRM", text: "Every lead, deal and follow-up tracked from first contact." },
{
    icon: "📦",
    title: "Dashboard",
    text: "View your business data and performance from one place.",
  },
{
    icon: "🤖",
    title: "Herry AI Assistant",
    text: "Ask questions about your business and get instant answers.",
  },
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
                <stop offset="0%" stopColor="#FF2D87" />
                <stop offset="100%" stopColor="#FF6FB5" />
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

          <img
            src={bunnyMascot}
            alt=""
            aria-hidden="true"
            className="hero-mascot"
          />
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
          {/* <img
            src={catMascot}
            alt=""
            aria-hidden="true"
            className="section-mascot"
          /> */}
          <div className="section-head">
            <span className="eyebrow">Everything included</span>
            <h2>One subscription, every department</h2>
            <p>Switch off what you don't need. Add teams as you grow.</p>
          </div>

          <div className="modules-grid">
            {allModules.map((m) => (
              <div className="module-tile" key={m.title}>
                <span className="module-dot" style={{ background: "#FFE1F0" }}>
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
      < Support />

      <Footer />
    </div>
  );
}