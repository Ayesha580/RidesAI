import Header from "../components/Header";
import Footer from "../components/Footer";

export default function PrivacyPolicy() {
  const sections = [
    {
      title: "Information We Collect",
      body: (
        <>
          <p>We may collect the following types of information:</p>
          <ul>
            <li>Account information (such as name, email address, and login credentials)</li>
            <li>Organization information</li>
            <li>User-generated business data and documents</li>
            <li>System and usage logs</li>
            <li>Subscription and billing information</li>
            <li>Technical information such as browser type, device information, and IP address</li>
          </ul>
        </>
      ),
    },
    {
      title: "How We Use Information",
      body: (
        <>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide and maintain the platform</li>
            <li>Authenticate users and secure accounts</li>
            <li>Deliver customer support</li>
            <li>Improve platform performance and user experience</li>
            <li>Process subscriptions and billing</li>
            <li>Comply with applicable legal obligations</li>
          </ul>
        </>
      ),
    },
    {
      title: "Data Security",
      body: (
        <p>
          We implement reasonable administrative, technical, and
          organizational measures to protect customer data from
          unauthorized access, disclosure, alteration, or destruction.
        </p>
      ),
    },
    {
      title: "Data Sharing",
      body: (
        <p>
          We do not sell or rent personal information. We may share
          information only with trusted third-party service providers that
          help us operate the platform, such as cloud hosting, payment
          processing, analytics, and customer support services, or when
          required by applicable law.
        </p>
      ),
    },
    {
      title: "Data Retention",
      body: (
        <p>
          We retain information only for as long as necessary to provide our
          services, meet legal obligations, resolve disputes, and enforce
          our agreements.
        </p>
      ),
    },
    {
      title: "Cookies",
      body: (
        <p>
          RidesAI uses cookies and similar technologies to maintain secure
          sessions, remember user preferences, analyze platform performance,
          and improve the overall user experience.
        </p>
      ),
    },
    {
      title: "Your Rights",
      body: (
        <p>
          Where permitted by applicable law, users may request access to,
          correction of, or deletion of their personal information. Users
          may also contact us regarding questions about how their data is
          processed.
        </p>
      ),
    },
    {
      title: "Changes to This Policy",
      body: (
        <p>
          We may update this Privacy Policy from time to time. Any changes
          will be posted on this page with an updated effective date.
        </p>
      ),
    },
    {
      title: "Contact",
      body: (
        <p>
          For privacy-related questions, please contact:{" "}
          <a href="mailto:ahead@ridestechnologies.com">ahead@ridestechnologies.com</a>
        </p>
      ),
    },
  ];

  return (
    <>
      <Header />
      <style>{`
        body{
          margin:0;
          background:#fff;
          font-family:Arial, Helvetica, sans-serif;
          color:#222;
        }
        .policy{
          max-width:760px;
          margin:0 auto;
          padding:64px 24px 96px;
          text-align:left;
        }
        .policy h1{
          font-size:32px;
          margin:0 0 8px;
          color:#111;
        }
        .policy .date{
          font-size:14px;
          color:#888;
          margin:0 0 36px;
        }
        .policy .intro{
          font-size:16px;
          line-height:1.75;
          color:#444;
          margin:0 0 40px;
        }
        .policy section{
          margin-bottom:32px;
        }
        .policy h2{
          font-size:19px;
          font-weight:700;
          color:#111;
          margin:0 0 10px;
        }
        .policy p{
          font-size:15.5px;
          line-height:1.75;
          color:#333;
          margin:0 0 10px;
        }
        .policy ul{
          margin:0 0 10px;
          padding-left:20px;
        }
        .policy li{
          font-size:15.5px;
          line-height:1.75;
          color:#333;
          margin-bottom:4px;
        }
        .policy a{
          color:#a020c4;
          text-decoration:none;
          font-weight:600;
        }
        .policy a:hover{
          text-decoration:underline;
        }
        .policy hr{
          border:none;
          border-top:1px solid #eee;
          margin:40px 0;
        }
        @media(max-width:640px){
          .policy{
            padding:40px 20px 70px;
          }
          .policy h1{
            font-size:26px;
          }
        }
      `}</style>

      <main className="policy">
        <h1>Privacy Policy</h1>
        <p className="date">Effective Date: 7 August 2026</p>

        <p className="intro">
          RidesAI is a cloud-based ERP and CRM software platform that helps
          organizations manage business operations, employee information,
          customer relationships, business records, documents, workflows,
          and related administrative processes. This Privacy Policy explains
          how we collect, use, and protect information when you use our
          platform.
        </p>

        <hr />

        {sections.map((s, i) => (
          <section key={i}>
            <h2>{s.title}</h2>
            {s.body}
          </section>
        ))}
      </main>

      <Footer />
    </>
  );
}