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
        if (username && password) {
            navigate("/admin/dashboard");
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
                    <p>Sign in to access the RidesAI Admin Dashboard</p>

                    <form onSubmit={handleLogin}>

                        <div className="rideai_admin_inputgroup">
                            <input
                                type="text"
                                placeholder="Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                autoComplete="username"
                            />
                        </div>

                        <div className="rideai_admin_inputgroup">
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                        </div>

                        <button type="submit">Sign In</button>

                    </form>

                </div>

            </div>

        </div>
    );
}