import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/auth";
import { apiPost } from "../utils/api";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    function validate() {
        if (!username.trim()) return "Please enter a username";
        if (username.length < 3) return "Username must be at least 3 characters";
        if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Username can only contain letters, numbers, and underscores";
        if (!email.trim()) return "Please enter your email";
        if (!/\S+@\S+\.\S+/.test(email)) return "Please enter a valid email";
        if (!password) return "Please enter a password";
        if (password.length < 6) return "Password must be at least 6 characters";
        return null;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const validationErr = validate();
        if (validationErr) { setError(validationErr); return; }

        setError("");
        setLoading(true);
        try {
            const data = await apiPost("/auth/signup", { email, username, password });

            if (!data.success) {
                setError(String(data.message || "Signup failed"));
                setLoading(false);
                return;
            }

            console.log("Signup success, logging in...", data.user.username);
            login(data.user, data.access_token, data.refresh_token);

            console.log("Navigating to dashboard...");
            navigate("/", { replace: true });
        } catch (err) {
            console.error("Signup error:", err);
            setError("Unable to reach the server. Check your connection.");
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-left">
                <div className="auth-left-content">
                    <div className="auth-logo-mark">F</div>
                    <h1 className="auth-hero-title">FinShield</h1>
                    <p className="auth-hero-tagline">Fraud Detection Platform</p>
                    <div className="auth-features">
                        <Feature n="01" title="Local AI Processing" desc="All models run on-premise. Zero data leaves your network." />
                        <Feature n="02" title="Multi-Modal Analysis" desc="Text, image, audio, and video — scanned in seconds." />
                        <Feature n="03" title="Explainable Decisions" desc="Every risk score comes with transparent reasoning." />
                    </div>
                </div>
            </div>

            <div className="auth-right">
                <form className="auth-form" onSubmit={handleSubmit} noValidate>
                    <h2>Create account</h2>
                    <p className="auth-desc">Set up your analyst profile to get started.</p>

                    {error && <div className="auth-error" role="alert">{error}</div>}

                    <label className="field-label" htmlFor="signup-username">Username</label>
                    <input
                        id="signup-username"
                        type="text"
                        placeholder="e.g. jsmith"
                        value={username}
                        onChange={(e) => { setUsername(e.target.value); setError(""); }}
                        required
                        className="field-input"
                        autoComplete="username"
                    />

                    <label className="field-label" htmlFor="signup-email">Email</label>
                    <input
                        id="signup-email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        required
                        className="field-input"
                        autoComplete="email"
                    />

                    <label className="field-label" htmlFor="signup-password">Password</label>
                    <input
                        id="signup-password"
                        type="password"
                        placeholder="Minimum 6 characters"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(""); }}
                        required
                        minLength={6}
                        className="field-input"
                        autoComplete="new-password"
                    />

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? "Creating account..." : "Create account"}
                    </button>

                    <p className="auth-switch">
                        Already registered? <Link to="/login">Sign in</Link>
                    </p>
                </form>
            </div>
        </div>
    );
}

function Feature({ n, title, desc }) {
    return (
        <div className="auth-feature">
            <span className="feature-num">{n}</span>
            <div>
                <strong>{title}</strong>
                <p>{desc}</p>
            </div>
        </div>
    );
}
