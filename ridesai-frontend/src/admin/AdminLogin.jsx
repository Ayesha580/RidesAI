import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin.css";
import logo from "../assets/logo.jpeg";
import axiosClient from "../api/axiosClient";

export default function AdminLogin() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await axiosClient.post("/admin-login/", {
                username: username,
                password: password,
            });

            // Save JWT tokens
            localStorage.setItem("access_token", response.data.access);
            localStorage.setItem("refresh_token", response.data.refresh);

            // Save admin username
            localStorage.setItem("admin_username", username);

            // Go to admin dashboard
            navigate("/admin/dashboard");

        } catch (error) {
            console.error("Admin login error:", error);

            setError(
                error.response?.data?.detail ||
                "Invalid admin username or password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rideai_admin_loginpage">

            <div className="rideai_admin_logincard">

                <div className="rideai_admin_loginshape rideai_admin_shape1"></div>
                <div className="rideai_admin_loginshape rideai_admin_shape2"></div>

                <div className="rideai_admin_logincontent">

                    <img
                        src={logo}
                        className="rideai_admin_loginlogo"
                        alt="Rides AI"
                    />

                    <h2>Welcome Back</h2>

                    <p>
                        Sign in to access the RidesAI Admin Dashboard
                    </p>

                    {error && (
                        <div className="rideai_admin_loginerror">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>

                        <div className="rideai_admin_inputgroup">
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                                required
                            />
                        </div>

                        <div className="rideai_admin_inputgroup">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                                required
                            />
                        </div>

                        <button type="submit" disabled={loading}>
                            {loading ? "Signing In..." : "Sign In"}
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}