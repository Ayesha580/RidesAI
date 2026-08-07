<<<<<<< HEAD
import React from "react";

export default function TermsOfService() {
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
      boxShadow: "0 8px 25px rgba(0,0,0,0.08)",
      overflow: "hidden",
      border: `2px solid ${primary}`,
    },
    header: {
      background: primary,
      color: "#fff",
      padding: "40px 30px",
      textAlign: "center",
    },
    title: {
      margin: 0,
      fontSize: "38px",
      fontWeight: "700",
    },
    effective: {
      marginTop: "10px",
      fontSize: "16px",
      opacity: 0.95,
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
      fontSize: "24px",
      marginBottom: "12px",
      borderLeft: `5px solid ${primary}`,
      paddingLeft: "12px",
    },
    paragraph: {
      margin: 0,
      color: "#000",
    },
    list: {
      marginTop: "15px",
      paddingLeft: "25px",
    },
    listItem: {
      marginBottom: "10px",
    },
    contactBox: {
      background: "#faf5fd",
      border: `1px solid ${primary}`,
      borderRadius: "10px",
      padding: "20px",
      marginTop: "15px",
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
          <h1 style={styles.title}>RidesAI Terms of Service</h1>
          <p style={styles.effective}>Effective Date: August 2026</p>
        </div>

        <div style={styles.body}>
          <section style={styles.section}>
            <h2 style={styles.heading}>1. Acceptance</h2>
            <p style={styles.paragraph}>
              By accessing or using RidesAI, you agree to be bound by these
              Terms of Service. If you do not agree with these terms, you should
              not use the platform.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>2. Services</h2>
            <p style={styles.paragraph}>
              RidesAI is a cloud-based business management software that
              provides ERP and CRM solutions for organizations. Features may
              include HR management, employee records, attendance tracking,
              leave management, task management, document management, reporting,
              workflow automation, and related business productivity tools.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>3. User Accounts</h2>
            <p style={styles.paragraph}>
              Users are responsible for maintaining the confidentiality of their
              account credentials and for all activities performed under their
              account.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>4. Subscriptions and Billing</h2>
            <p style={styles.paragraph}>
              Access to certain features requires a paid subscription.
              Subscription fees are billed according to the selected plan and
              number of authorized users (seats). Fees are non-refundable unless
              otherwise required by applicable law.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>5. Acceptable Use</h2>
            <p>Users agree not to:</p>

            <ul style={styles.list}>
              <li style={styles.listItem}>
                Attempt unauthorized access to the platform or its systems.
              </li>
              <li style={styles.listItem}>
                Upload or distribute malicious software or harmful content.
              </li>
              <li style={styles.listItem}>
                Use the platform for unlawful, fraudulent, or abusive
                activities.
              </li>
              <li style={styles.listItem}>
                Interfere with the security, availability, or operation of the
                service.
              </li>
            </ul>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>6. Intellectual Property</h2>
            <p style={styles.paragraph}>
              All software, trademarks, logos, designs, documentation, and
              other intellectual property associated with RidesAI remain the
              exclusive property of RidesAI or its licensors. No ownership
              rights are transferred to users.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>7. Data and Privacy</h2>
            <p style={styles.paragraph}>
              Users retain ownership of the business data they upload to the
              platform. RidesAI processes and stores data in accordance with its
              Privacy Policy and implements reasonable security measures to
              protect user information.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>8. Service Availability</h2>
            <p style={styles.paragraph}>
              While RidesAI aims to provide reliable service, uninterrupted or
              error-free availability cannot be guaranteed. Scheduled
              maintenance or unexpected technical issues may temporarily affect
              access.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>9. Suspension and Termination</h2>
            <p style={styles.paragraph}>
              RidesAI reserves the right to suspend or terminate accounts that
              violate these Terms of Service or engage in activities that
              compromise the security or integrity of the platform.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>10. Limitation of Liability</h2>
            <p style={styles.paragraph}>
              To the maximum extent permitted by applicable law, RidesAI shall
              not be liable for any indirect, incidental, special, or
              consequential damages arising from the use or inability to use the
              platform.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>11. Changes to These Terms</h2>
            <p style={styles.paragraph}>
              RidesAI may update these Terms of Service from time to time.
              Continued use of the platform after changes become effective
              constitutes acceptance of the revised terms.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>12. Contact</h2>

            <div style={styles.contactBox}>
              <p>
                For questions regarding these Terms of Service, please contact:
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

export default function TermsOfService() {
  const sections = [
    {
      title: "1. Acceptance",
      body: (
        <p>
          By accessing or using RidesAI, you agree to be bound by these
          Terms of Service. If you do not agree with these terms, you should
          not use the platform.
        </p>
      ),
    },
    {
      title: "2. Services",
      body: (
        <p>
          RidesAI is a cloud-based business management software that
          provides ERP and CRM solutions for organizations. Features may
          include HR management, employee records, attendance tracking,
          leave management, task management, document management,
          reporting, workflow automation, and related business productivity
          tools.
        </p>
      ),
    },
    {
      title: "3. User Accounts",
      body: (
        <p>
          Users are responsible for maintaining the confidentiality of their
          account credentials and for all activities performed under their
          account.
        </p>
      ),
    },
    {
      title: "4. Subscriptions and Billing",
      body: (
        <p>
          Access to certain features requires a paid subscription.
          Subscription fees are billed according to the selected plan and
          number of authorized users (seats). Fees are non-refundable
          unless otherwise required by applicable law.
        </p>
      ),
    },
    {
      title: "5. Acceptable Use",
      body: (
        <>
          <p>Users agree not to:</p>
          <ul>
            <li>Attempt unauthorized access to the platform or its systems.</li>
            <li>Upload or distribute malicious software or harmful content.</li>
            <li>Use the platform for unlawful, fraudulent, or abusive activities.</li>
            <li>Interfere with the security, availability, or operation of the service.</li>
          </ul>
        </>
      ),
    },
    {
      title: "6. Intellectual Property",
      body: (
        <p>
          All software, trademarks, logos, designs, documentation, and other
          intellectual property associated with RidesAI remain the
          exclusive property of RidesAI or its licensors. No ownership
          rights are transferred to users.
        </p>
      ),
    },
    {
      title: "7. Data and Privacy",
      body: (
        <p>
          Users retain ownership of the business data they upload to the
          platform. RidesAI processes and stores data in accordance with its
          Privacy Policy and implements reasonable security measures to
          protect user information.
        </p>
      ),
    },
    {
      title: "8. Service Availability",
      body: (
        <p>
          While RidesAI aims to provide reliable service, uninterrupted or
          error-free availability cannot be guaranteed. Scheduled
          maintenance or unexpected technical issues may temporarily affect
          access.
        </p>
      ),
    },
    {
      title: "9. Suspension and Termination",
      body: (
        <p>
          RidesAI reserves the right to suspend or terminate accounts that
          violate these Terms of Service or engage in activities that
          compromise the security or integrity of the platform.
        </p>
      ),
    },
    {
      title: "10. Limitation of Liability",
      body: (
        <p>
          To the maximum extent permitted by applicable law, RidesAI shall
          not be liable for any indirect, incidental, special, or
          consequential damages arising from the use or inability to use the
          platform.
        </p>
      ),
    },
    {
      title: "11. Changes to These Terms",
      body: (
        <p>
          RidesAI may update these Terms of Service from time to time.
          Continued use of the platform after changes become effective
          constitutes acceptance of the revised terms.
        </p>
      ),
    },
    {
      title: "12. Contact",
      body: (
        <p>
          For questions regarding these Terms of Service, please contact:{" "}
          <a href="mailto:ahead@ridestechnologies.com">
            ahead@ridestechnologies.com
          </a>
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
        <h1>Terms of Service</h1>
        <p className="date">Effective Date: 7 August 2026</p>

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