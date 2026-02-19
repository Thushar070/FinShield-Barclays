import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Actually used in logout? No, window.location for logout is safer to purge state.

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem("finshield_user");
        const token = localStorage.getItem("finshield_token");

        if (stored && token) {
            try {
                const parsed = JSON.parse(stored);
                console.log("Restoring session for:", parsed.username);
                setUser(parsed);
            } catch (e) {
                console.error("Auth parsing error, clearing session", e);
                localStorage.removeItem("finshield_user");
                localStorage.removeItem("finshield_token");
            }
        } else {
            console.log("No session found, user must login.");
        }
        setLoading(false);
    }, []);

    function login(userData, accessToken, refreshToken) {
        console.log("Login: Setting local storage tokens.");
        localStorage.setItem("finshield_token", accessToken);
        localStorage.setItem("finshield_refresh", refreshToken);
        localStorage.setItem("finshield_user", JSON.stringify(userData));
        setUser(userData);
    }

    function logout() {
        console.log("Logout: Clearing session.");
        localStorage.removeItem("finshield_token");
        localStorage.removeItem("finshield_refresh");
        localStorage.removeItem("finshield_user");
        setUser(null);
        // Force reload to clear any sensitive in-memory state
        window.location.href = "/login";
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
