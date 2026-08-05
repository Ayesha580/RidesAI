import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import Header from "../components/Header";
import Footer from "../components/Footer";
import axiosClient from "../api/axiosClient";

import "./Register.css";

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await axiosClient.post("/login/", {
        username,
        password,
      });

      // Save JWT
      // Login
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
    localStorage.setItem(
    "user",
    JSON.stringify(res.data.user)
);
      navigate(res.data.redirect);

    } catch (err) {
    console.log(err.response.status);
    console.log(err.response.data);
      setError(
        err.response?.data?.error ||
        "Invalid username or password."
      );

    } finally {

      setLoading(false);

    }
  }

  return (
    <>
      <Header />

      <section className="register-page">

        <div className="register-card">

          <h1>Welcome Back 👋</h1>

          <p className="subtitle">
            Login to access your dashboard.
          </p>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>

            <div className="form-group">
              <label>Username</label>

              <input
                type="text"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Password</label>

              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="primary-btn"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Login"}
            </button>

          </form>

          <div
            style={{
              marginTop: "25px",
              textAlign: "center",
            }}
          >
            Don't have an account?{" "}
            <Link to="/register">
              Register
            </Link>
          </div>

        </div>

      </section>

      <Footer />
    </>
  );
}