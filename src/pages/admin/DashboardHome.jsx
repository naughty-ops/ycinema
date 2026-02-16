
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FaFilm, FaTv, FaList, FaClock } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const DashboardHome = () => {
    const [stats, setStats] = useState({
        totalMovies: 0,
        totalSeries: 0,
        totalContent: 0,
        recentItems: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            // Fetch counts using headless queries for performance
            const { count: totalContent, error: totalError } = await supabase
                .from('movies')
                .select('*', { count: 'exact', head: true });

            const { count: totalMovies, error: moviesError } = await supabase
                .from('movies')
                .select('*', { count: 'exact', head: true })
                .eq('type', 'movie');

            const { count: totalSeries, error: seriesError } = await supabase
                .from('movies')
                .select('*', { count: 'exact', head: true })
                .eq('type', 'series');

            // Still need recent items, but limit strictly
            const { data: recentItems, error: recentError } = await supabase
                .from('movies')
                .select('id, title, type, created_at, category, status')
                .order('created_at', { ascending: false })
                .limit(5);

            if (totalError || moviesError || seriesError || recentError) throw new Error('Failed to fetch stats');

            setStats({
                totalMovies: totalMovies || 0,
                totalSeries: totalSeries || 0,
                totalContent: totalContent || 0,
                recentItems: recentItems || []
            });
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ marginBottom: '2rem', fontSize: '1.8rem', color: '#333' }}>Dashboard Overview</h1>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                <StatCard
                    icon={<FaFilm />}
                    title="Total Movies"
                    value={stats.totalMovies}
                    color="#3498db"
                    link="/admin/content"
                />
                <StatCard
                    icon={<FaTv />}
                    title="Total Series"
                    value={stats.totalSeries}
                    color="#9b59b6"
                    link="/admin/content"
                />
                <StatCard
                    icon={<FaList />}
                    title="Total Content"
                    value={stats.totalContent}
                    color="#03c76c"
                    link="/admin/content"
                />
            </div>

            {/* Recent Activity */}
            <div style={{ background: 'white', borderRadius: '15px', padding: '2rem', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1.2rem', color: '#333', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FaClock style={{ color: '#f39c12' }} /> Recent Activity
                    </h2>
                    <Link to="/admin/content" style={{ color: '#03c76c', textDecoration: 'none', fontWeight: '500' }}>View All</Link>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid #f0f0f0', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', color: '#666', fontWeight: '600' }}>Title</th>
                                <th style={{ padding: '1rem', color: '#666', fontWeight: '600' }}>Type</th>
                                <th style={{ padding: '1rem', color: '#666', fontWeight: '600' }}>Status</th>
                                <th style={{ padding: '1rem', color: '#666', fontWeight: '600' }}>Date Added</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.recentItems.length > 0 ? (
                                stats.recentItems.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f9f9f9', transition: 'background 0.2s' }}>
                                        <td style={{ padding: '1rem', fontWeight: '500', color: '#333' }}>{item.title}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.8rem',
                                                background: item.type === 'series' ? '#e8f0fe' : '#e6fffa',
                                                color: item.type === 'series' ? '#1967d2' : '#02b862'
                                            }}>
                                                {(item.type || 'movie').toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                color: item.status === 'draft' ? '#f39c12' : '#2ecc71',
                                                fontWeight: '500',
                                                fontSize: '0.9rem'
                                            }}>
                                                {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Published'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', color: '#888', fontSize: '0.9rem' }}>
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No content found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ icon, title, value, color, link }) => (
    <Link to={link || '#'} style={{ textDecoration: 'none' }}>
        <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '15px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            gap: '1.5rem',
            transition: 'transform 0.2s, box-shadow 0.2s',
            cursor: 'pointer'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 5px 20px rgba(0,0,0,0.05)';
            }}
        >
            <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: `${color}20`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                color: color
            }}>
                {icon}
            </div>
            <div>
                <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '5px' }}>{title}</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#333' }}>{value}</div>
            </div>
        </div>
    </Link>
);

export default DashboardHome;
