import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin.css";
import logo from "../assets/logo.png";

export default function AdminLogin() {

    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = (e) => {
        e.preventDefault();

        // Temporary login
        if (username && password) {
            navigate("/admin/dashboard");
        }
    };

    return (
        <div className="admin-login">

            <div className="login-card">

                <div className="login-shape shape1"></div>
                <div className="login-shape shape2"></div>

                <div className="login-content">

                    <img
                        src={logo}
                        className="login-logo"
                        alt="Rides AI"
                    />

                    <h2>Welcome Back</h2>

                    <p>Sign in to access the RidesAI Admin Dashboard</p>

                    <form onSubmit={handleLogin}>

                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                            />
                        </div>

                        <div className="input-group">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                        </div>

                        <button type="submit">
                            Sign In
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}