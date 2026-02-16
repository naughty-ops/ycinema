
import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    FaHome,
    FaFilm,
    FaTv,
    FaCog,
    FaSignOutAlt,
    FaBars,
    FaUserCircle,
    FaDatabase
} from 'react-icons/fa';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const sidebarWidth = isSidebarOpen ? '260px' : '80px';
    const primaryColor = '#03c76c';

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f9' }}>
            {/* Sidebar */}
            <aside style={{
                width: sidebarWidth,
                background: '#1e1e2d',
                color: '#fff',
                transition: 'all 0.3s ease',
                position: 'fixed',
                height: '100vh',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isSidebarOpen ? 'space-between' : 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {isSidebarOpen && <h2 style={{ fontSize: '1.2rem', color: primaryColor, margin: 0 }}>yCINEMA</h2>}
                    <button onClick={toggleSidebar} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: '1.2rem' }}>
                        <FaBars />
                    </button>
                </div>

                <nav style={{ padding: '1rem 0', flex: 1 }}>
                    <NavItem to="/admin" icon={<FaHome />} label="Dashboard" isOpen={isSidebarOpen} end />
                    <NavItem to="/admin/content" icon={<FaFilm />} label="Content" isOpen={isSidebarOpen} />
                    <NavItem to="/admin/import" icon={<FaDatabase />} label="Import" isOpen={isSidebarOpen} />
                    <NavItem to="/admin/settings" icon={<FaCog />} label="Settings" isOpen={isSidebarOpen} />
                </nav>

                <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none',
                            color: '#ff6b6b',
                            width: '100%',
                            padding: '0.8rem',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            justifyContent: isSidebarOpen ? 'flex-start' : 'center'
                        }}
                    >
                        <FaSignOutAlt />
                        {isSidebarOpen && "Logout"}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                marginLeft: sidebarWidth,
                flex: 1,
                transition: 'margin 0.3s ease',
                width: '100%'
            }}>
                {/* Topbar */}
                <header style={{
                    background: '#fff',
                    padding: '1rem 2rem',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    height: '64px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#333' }}>
                        <span>{user?.email}</span>
                        <FaUserCircle size={28} color="#ccc" />
                    </div>
                </header>

                {/* Page Content */}
                <div style={{ padding: '2rem' }}>
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

const NavItem = ({ to, icon, label, isOpen, end = false }) => (
    <NavLink
        to={to}
        end={end}
        style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            padding: '12px 24px',
            color: isActive ? '#03c76c' : '#a2a3b7',
            textDecoration: 'none',
            background: isActive ? 'rgba(3, 199, 108, 0.1)' : 'transparent',
            borderLeft: isActive ? '3px solid #03c76c' : '3px solid transparent',
            justifyContent: isOpen ? 'flex-start' : 'center',
            fontSize: '1rem',
            marginBottom: '5px'
        })}
    >
        <span style={{ fontSize: '1.2rem', minWidth: '25px', display: 'flex', justifyContent: 'center' }}>{icon}</span>
        {isOpen && <span style={{ marginLeft: '12px' }}>{label}</span>}
    </NavLink>
);

export default AdminLayout;
