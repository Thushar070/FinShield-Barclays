import { LayoutDashboard, ScanSearch, History, User, LogOut } from "lucide-react";

const navItems = [
    { id: "overview", label: "Dashboard", icon: LayoutDashboard },
    { id: "scan", label: "New Scan", icon: ScanSearch },
    { id: "history", label: "History", icon: History },
    { id: "profile", label: "Profile", icon: User },
];

export default function Sidebar({ activeTab, onTabChange, user, onLogout }) {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="sidebar-mark">F</div>
                <div>
                    <span className="sidebar-title">FinShield</span>
                    <span className="sidebar-label">FRAUD DETECTION</span>
                </div>
            </div>

            <nav className="sidebar-nav">
                <span className="nav-section-label">Navigation</span>
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? "active" : ""}`}
                        onClick={() => onTabChange(item.id)}
                    >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                        {activeTab === item.id && <span className="nav-indicator"></span>}
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="user-avatar">{(user?.username || "U")[0].toUpperCase()}</div>
                    <div className="user-info">
                        <span className="user-name">{user?.username || "User"}</span>
                        <span className="user-role">{user?.role || "analyst"}</span>
                    </div>
                </div>
                <button className="nav-item logout-btn" onClick={onLogout}>
                    <LogOut size={18} />
                    <span>Sign out</span>
                </button>
            </div>
        </aside>
    );
}
