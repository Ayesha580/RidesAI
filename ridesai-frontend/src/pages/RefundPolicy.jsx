import React from "react";

export default function CancellationRefundPolicy() {
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
          <h1 style={styles.title}>RidesAI Cancellation & Refund Policy</h1>
          <p style={styles.effective}>Effective Date: August 2026</p>
        </div>

        <div style={styles.body}>
          <section style={styles.section}>
            <h2 style={styles.heading}>Overview</h2>
            <p>
              This Cancellation and Refund Policy explains how subscription
              cancellations and refunds are handled for RidesAI, a cloud-based
              ERP and CRM software platform.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>Subscription Cancellation</h2>
            <p>
              Customers may cancel their subscription at any time through their
              account settings or by contacting our support team.
            </p>
            <p>
              Cancellation will stop future billing. Your subscription will
              remain active until the end of the current billing period unless
              otherwise stated.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>Refund Policy</h2>
            <p>
              Subscription fees are generally non-refundable once a billing
              cycle has started.
            </p>

            <p>Refunds may be considered only in exceptional circumstances, including:</p>

            <ul style={styles.list}>
              <li style={styles.item}>Duplicate or accidental charges.</li>
              <li style={styles.item}>Billing errors caused by RidesAI.</li>
              <li style={styles.item}>
                Charges required to be refunded under applicable law.
              </li>
            </ul>

            <p>
              Approved refunds will be processed using the original payment
              method whenever possible.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>Failed or Disputed Payments</h2>
            <p>
              If a payment cannot be processed, access to paid features may be
              limited or suspended until payment is successfully completed.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>Changes to Subscriptions</h2>
            <p>
              Customers may upgrade or downgrade their subscription plans in
              accordance with the options available within the platform. Any
              pricing adjustments will take effect according to the applicable
              billing cycle.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>Changes to This Policy</h2>
            <p>
              RidesAI reserves the right to modify this Cancellation and Refund
              Policy at any time. Updated versions will be published on this
              page with a revised effective date.
            </p>
          </section>

          <section style={styles.section}>
            <h2 style={styles.heading}>Contact</h2>

            <div style={styles.contactBox}>
              <p>
                For questions regarding cancellations or refunds, please
                contact:
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