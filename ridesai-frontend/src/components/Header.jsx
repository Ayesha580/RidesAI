import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import "./layout.css";

export default function Header() {
  return (
    <header className="site-header">
      <Link to="/" className="brand">
        <img src={logo} alt="Rides AI" className="brand-logo" />
        <span>Rides AI</span>
      </Link>

      <nav className="site-nav">
        <Link to="/">Home</Link>
        <a href="#modules">Modules</a>
        <a href="/work">How it works</a>
        <Link to="/register" className="nav-cta">
          Register
        </Link>
      </nav>
    </header>
  );
}