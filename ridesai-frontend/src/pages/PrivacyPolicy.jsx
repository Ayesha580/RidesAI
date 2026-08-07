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
}