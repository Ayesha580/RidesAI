<<<<<<< HEAD
import React from "react";

export default function PrivacyPolicy() {
  const primary = "#be27ee";

  const styles = {
    page: {
      background: "#fff",
      minHeight: "100vh",
      padding: "50px 20px",
      fontFamily: "'Segoe UI', sans-serif",
      color: "#000",
    },
    container: {
      maxWidth: "1000px",
      margin: "0 auto",
      background: "#fff",
      borderRadius: "16px",
      overflow: "hidden",
      border: `2px solid ${primary}`,
      boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
    },
    header: {
      background: primary,
      color: "#fff",
      textAlign: "center",
      padding: "40px 30px",
    },
    title: {
      margin: 0,
      fontSize: "38px",
      fontWeight: "700",
    },
    effective: {
      marginTop: "10px",
      fontSize: "16px",
    },
    body: {
      padding: "40px",
      lineHeight: "1.8",
      fontSize: "16px",
    },
    section: {
      marginBottom: "35px",
    },
    heading: {
      color: primary,
      borderLeft: `5px solid ${primary}`,
      paddingLeft: "12px",
      marginBottom: "12px",
      fontSize: "24px",
    },
    contactBox: {
      marginTop: "15px",
      background: "#faf5fd",
      border: `1px solid ${primary}`,
      borderRadius: "10px",
      padding: "20px",
    },
    list: {
      paddingLeft: "25px",
      marginTop: "10px",
    },
    item: {
      marginBottom: "10px",
    },
    email: {
      color: primary,
      fontWeight: "600",
      textDecoration: "none",
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>RidesAI Privacy Policy</h1>
          <p style={styles.effective}>Effective Date: August 2026</p>
        </div>

        <div style={styles.body}>
          <section style={styles.section}>
            <h2 style={styles.heading}>Introduction</h2>
            <p>
              RidesAI is a cloud-based ERP and CRM software platform that helps
              organizations manage business operations, employee information,
              customer relationships, business records, documents, workflows,
              and related administrative processes.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>Information We Collect</h2>
            <p>We may collect:</p>
            <ul style={styles.list}>
              <li style={styles.item}>
                Account information (such as name, email address, and login
                credentials)
              </li>
              <li style={styles.item}>Organization information</li>
              <li style={styles.item}>
                User-generated business data and documents
              </li>
              <li style={styles.item}>System and usage logs</li>
              <li style={styles.item}>
                Subscription and billing information
              </li>
              <li style={styles.item}>
                Technical information such as browser type, device information,
                and IP address
              </li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>How We Use Information</h2>
            <p>We use the information we collect to:</p>
            <ul style={styles.list}>
              <li style={styles.item}>Provide and maintain the platform</li>
              <li style={styles.item}>
                Authenticate users and secure accounts
              </li>
              <li style={styles.item}>Deliver customer support</li>
              <li style={styles.item}>
                Improve platform performance and user experience
              </li>
              <li style={styles.item}>
                Process subscriptions and billing
              </li>
              <li style={styles.item}>
                Comply with applicable legal obligations
              </li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>Data Security</h2>
            <p>
              We implement reasonable administrative, technical, and
              organizational measures to protect customer data from unauthorized
              access, disclosure, alteration, or destruction.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>Data Sharing</h2>
            <p>
              We do not sell or rent personal information. We may share
              information only with trusted third-party service providers that
              help us operate the platform, such as cloud hosting, payment
              processing, analytics, and customer support services, or when
              required by applicable law.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>Data Retention</h2>
            <p>
              We retain information only for as long as necessary to provide our
              services, meet legal obligations, resolve disputes, and enforce
              our agreements.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>Cookies</h2>
            <p>
              RidesAI uses cookies and similar technologies to maintain secure
              sessions, remember user preferences, analyze platform
              performance, and improve the overall user experience.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>Your Rights</h2>
            <p>
              Where permitted by applicable law, users may request access to,
              correction of, or deletion of their personal information. Users
              may also contact us regarding questions about how their data is
              processed.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes
              will be posted on this page with an updated effective date.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>Contact</h2>

            <div style={styles.contactBox}>
              <p>
                For privacy-related questions, please contact:
              </p>

              <p>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:ahead@ridestechnolgoies.com"
                  style={styles.email}
                >
                  ahead@ridestechnolgoies.com
                </a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
=======
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
>>>>>>> 5fcabad (Update frontend and dashboard)
}