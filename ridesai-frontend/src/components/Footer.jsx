import { Link } from "react-router-dom";
import "./layout.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Link to="/" className="brand" style={{ color: "#fff" }}>
            <span className="brand-mark" />
            Rides AI
          </Link>
          <p>
            Rides AI helps businesses streamline HR, attendance, and workforce management with an intelligent, easy-to-use platform.
          </p>
        </div>

        <div className="footer-col">
          <h5>Product</h5>
{/*           <a href="#modules">Modules</a> */}
          <a href="/work">How it works</a>
          <Link to="/pricing">Pricing</Link>
        </div>

        <div className="footer-col">
          <h5>Company</h5>
          <a href="/contact">Contact</a>
          <Link to="/login">Log in</Link>
        </div>

        <div className="footer-col">
          <h5>Legal</h5>
          <span>Privacy policy</span>
          <span>Terms of service</span>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Rides AI. All rights reserved.</span>
        <span>Made for businesses that run on more than one spreadsheet.</span>
      </div>
    </footer>
  );
}