import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/auth";
import { apiPost } from "../utils/api";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    function validate() {
        if (!email.trim()) return "Please enter your email";
        if (!/\S+@\S+\.\S+/.test(email)) return "Please enter a valid email";
        if (!password) return "Please enter your password";
        return null;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const validationErr = validate();
        if (validationErr) { setError(validationErr); return; }

        setError("");
        setLoading(true);
        try {
            const data = await apiPost("/auth/login", { email, password });
            console.log("Login API Response:", data);

            if (!data.success) {
                setError(String(data.message || "Login failed"));
                setLoading(false);
                return;
            }

            // Store token & user state
            console.log("Storing auth data...");
            login(data.user, data.access_token, data.refresh_token);

            // Navigate immediately
            console.log("Navigating to dashboard...");
            navigate("/", { replace: true });
        } catch (err) {
            console.error("Login error:", err);
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
                    <h2>Sign in</h2>
                    <p className="auth-desc">Enter your credentials to access the dashboard.</p>

                    {error && <div className="auth-error" role="alert">{error}</div>}

                    <label className="field-label" htmlFor="login-email">Email</label>
                    <input
                        id="login-email"
                        type="email"
                        placeholder="you@company.com"
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        required
                        className="field-input"
                        autoComplete="email"
                    />

                    <label className="field-label" htmlFor="login-password">Password</label>
                    <div className="pw-wrap">
                        <input
                            id="login-password"
                            type={showPw ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => { setPassword(e.target.value); setError(""); }}
                            required
                            className="field-input"
                            autoComplete="current-password"
                        />
                        <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                            {showPw ? "Hide" : "Show"}
                        </button>
                    </div>

                    <button type="submit" className="auth-btn" disabled={loading}>
                        {loading ? "Signing in..." : "Sign in"}
                    </button>

                    <p className="auth-switch">
                        No account yet? <Link to="/signup">Create one</Link>
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
