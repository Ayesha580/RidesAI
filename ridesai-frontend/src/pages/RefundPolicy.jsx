import Header from "../components/Header";
import Footer from "../components/Footer";

export default function CancellationRefundPolicy() {
  const sections = [
    {
      title: "Subscription Cancellation",
      body: (
        <>
          <p>
            Customers may cancel their subscription at any time through
            their account settings or by contacting our support team.
          </p>
          <p>
            Cancellation will stop future billing. Your subscription will
            remain active until the end of the current billing period unless
            otherwise stated.
          </p>
        </>
      ),
    },
    {
      title: "Refund Policy",
      body: (
        <>
          <p>
            Subscription fees are generally non-refundable once a billing
            cycle has started.
          </p>
          <p>Refunds may be considered only in exceptional circumstances, including:</p>
          <ul>
            <li>Duplicate or accidental charges.</li>
            <li>Billing errors caused by RidesAI.</li>
            <li>Charges required to be refunded under applicable law.</li>
          </ul>
          <p>
            Approved refunds will be processed using the original payment
            method whenever possible.
          </p>
        </>
      ),
    },
    {
      title: "Failed or Disputed Payments",
      body: (
        <p>
          If a payment cannot be processed, access to paid features may be
          limited or suspended until payment is successfully completed.
        </p>
      ),
    },
    {
      title: "Changes to Subscriptions",
      body: (
        <p>
          Customers may upgrade or downgrade their subscription plans in
          accordance with the options available within the platform. Any
          pricing adjustments will take effect according to the applicable
          billing cycle.
        </p>
      ),
    },
    {
      title: "Changes to This Policy",
      body: (
        <p>
          RidesAI reserves the right to modify this Cancellation and Refund
          Policy at any time. Updated versions will be published on this
          page with a revised effective date.
        </p>
      ),
    },
    {
      title: "Contact",
      body: (
        <p>
          For questions regarding cancellations or refunds, please contact:{" "}
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
        <h1>Cancellation &amp; Refund Policy</h1>
        <p className="date">Effective Date: 7 August 2026</p>

        <p className="intro">
          This Cancellation and Refund Policy explains how subscription
          cancellations and refunds are handled for RidesAI, a cloud-based
          ERP and CRM software platform.
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