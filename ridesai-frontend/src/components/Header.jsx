import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpeg";
import "./layout.css";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="site-header">

      {/* Cute Floating Decorations */}
      <div className="header-star header-star-one">✦</div>
      <div className="header-star header-star-two">✦</div>
      <div className="header-cloud header-cloud-one">☁</div>
      <div className="header-cloud header-cloud-two">☁</div>

      <Link to="/" className="brand">
        <img src={logo} alt="Rides AI" className="brand-logo" />
        <span>Rides AI</span>
      </Link>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle navigation"
      >
        {menuOpen ? "✕" : "☰"}
      </button>

      <nav className={`site-nav ${menuOpen ? "show" : ""}`}>
        <Link to="/" onClick={() => setMenuOpen(false)}>
          Home
        </Link>

        <a href="#modules" onClick={() => setMenuOpen(false)}>
          Modules
        </a>

        <Link to="/work" onClick={() => setMenuOpen(false)}>
          How it works
        </Link>

        <Link to="/pricing" onClick={() => setMenuOpen(false)}>
          Pricing
        </Link>

        <Link to="/login" onClick={() => setMenuOpen(false)}>
          Login
        </Link>

        <Link
          to="/register"
          className="nav-cta"
          onClick={() => setMenuOpen(false)}
        >
          Register
        </Link>
      </nav>
    </header>
  );
}