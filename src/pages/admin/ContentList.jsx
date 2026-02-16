
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const ContentList = () => {
    const [content, setContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all'); // all, movie, series

    useEffect(() => {
        fetchContent();
    }, []);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('movies')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setContent(data || []);
        } catch (error) {
            console.error('Error fetching content:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            const { error } = await supabase
                .from('movies')
                .delete()
                .eq('id', id);

            if (error) throw error;

            // Optimistic update
            setContent(content.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Failed to delete item.');
        }
    };

    const filteredContent = content.filter(item => {
        const matchesSearch = item.title?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || item.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#333' }}>Content Library</h2>
                <Link
                    to="/admin/content/add"
                    style={{
                        background: '#03c76c',
                        color: 'white',
                        padding: '0.8rem 1.5rem',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: '500'
                    }}
                >
                    <FaPlus /> Add New
                </Link>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                    <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#aaa' }} />
                    <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.8rem 0.8rem 0.8rem 35px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            outline: 'none'
                        }}
                    />
                </div>
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}
                >
                    <option value="all">All Content</option>
                    <option value="movie">Movies</option>
                    <option value="series">Series</option>
                </select>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>Loading content...</div>
            ) : filteredContent.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666', background: '#f9f9f9', borderRadius: '8px' }}>
                    No content found. Start by adding a movie or series!
                </div>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ background: '#f8f9fa', color: '#555', textAlign: 'left' }}>
                                <th style={{ padding: '1rem', borderBottom: '2px solid #eee' }}>Title</th>
                                <th style={{ padding: '1rem', borderBottom: '2px solid #eee' }}>Type</th>
                                <th style={{ padding: '1rem', borderBottom: '2px solid #eee' }}>Category</th>
                                <th style={{ padding: '1rem', borderBottom: '2px solid #eee' }}>Year</th>
                                <th style={{ padding: '1rem', borderBottom: '2px solid #eee' }}>Stats</th>
                                <th style={{ padding: '1rem', borderBottom: '2px solid #eee' }}>Status</th>
                                <th style={{ padding: '1rem', borderBottom: '2px solid #eee', textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredContent.map(item => (
                                <tr key={item.id} style={{ borderBottom: '1px solid #eee', transition: 'background 0.2s' }}>
                                    <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <img
                                            src={item.frontImage || 'https://via.placeholder.com/40x60'}
                                            alt={item.title}
                                            style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                        />
                                        <span style={{ fontWeight: '500' }}>{item.title}</span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            background: item.type === 'series' ? '#e3f2fd' : '#e8f5e9',
                                            color: item.type === 'series' ? '#1565c0' : '#2e7d32',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.85rem'
                                        }}>
                                            {item.type || 'movie'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: '#666' }}>{item.category}</td>
                                    <td style={{ padding: '1rem', color: '#666' }}>{item.year}</td>
                                    <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                                            {item.rating && <span style={{ background: '#fff3cd', padding: '2px 6px', borderRadius: '4px' }}>⭐ {item.rating}</span>}
                                            {item.isPopular && <span style={{ background: '#ffebee', color: '#c62828', padding: '2px 6px', borderRadius: '4px' }}>Hot</span>}
                                            {item.isNewRelease && <span style={{ background: '#e3f2fd', color: '#1565c0', padding: '2px 6px', borderRadius: '4px' }}>New</span>}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            color: item.status === 'draft' ? '#f57c00' : '#2e7d32',
                                            fontWeight: '500'
                                        }}>
                                            {item.status || 'published'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                            <Link
                                                to={`/admin/content/edit/${item.id}`}
                                                style={{
                                                    padding: '8px',
                                                    background: '#f1f3f5',
                                                    color: '#495057',
                                                    borderRadius: '4px',
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <FaEdit />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                style={{
                                                    padding: '8px',
                                                    background: '#fff5f5',
                                                    color: '#e03131',
                                                    borderRadius: '4px',
                                                    border: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ContentList;
