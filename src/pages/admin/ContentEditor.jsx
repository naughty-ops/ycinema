
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaArrowLeft, FaImage } from 'react-icons/fa';

const ContentEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        type: 'movie', // 'movie' or 'series'
        status: 'published',
        description: '',
        category: '',
        year: new Date().getFullYear(),
        rating: '',
        duration: '',
        language: 'English',
        country: 'USA',
        frontImage: '',
        backImage: '',
        watchLink: '',
        featured: false,
        isNewRelease: false,
        isPopular: false,
        cast: [], // We'll handle as string for simple input then parse
        director: '',
        seasons: [] // We'll assume empty for now or basic JSON editor
    });

    // Helper state for array inputs
    const [castInput, setCastInput] = useState('');
    const [writersInput, setWritersInput] = useState('');
    const [awardsInput, setAwardsInput] = useState('');

    useEffect(() => {
        if (isEditMode) {
            fetchContent();
        }
    }, [id]);

    const fetchContent = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('movies')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching content:', error);
            navigate('/admin/content');
        } else {
            setFormData(data);
            // safe cast handling
            if (Array.isArray(data.cast)) setCastInput(data.cast.join(', '));
            else if (typeof data.cast === 'string') setCastInput(data.cast);

            if (Array.isArray(data.writers)) setWritersInput(data.writers.join(', '));
            else if (typeof data.writers === 'string') setWritersInput(data.writers);

            if (Array.isArray(data.awards)) setAwardsInput(data.awards.join(', '));
            else if (typeof data.awards === 'string') setAwardsInput(data.awards);
        }
        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Prepare data
            const castArray = castInput.split(',').map(c => c.trim()).filter(c => c);
            const writersArray = writersInput.split(',').map(c => c.trim()).filter(c => c);
            const awardsArray = awardsInput.split(',').map(c => c.trim()).filter(c => c);

            const payload = {
                ...formData,
                cast: castArray,
                writers: writersArray,
                awards: awardsArray,
                updated_at: new Date().toISOString()
            };

            let error;
            if (isEditMode) {
                const { error: updateError } = await supabase
                    .from('movies')
                    .update(payload)
                    .eq('id', id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('movies')
                    .insert([payload]);
                error = insertError;
            }

            if (error) throw error;
            navigate('/admin/content');
        } catch (err) {
            console.error('Error saving content:', err);
            alert('Error saving content: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <button
                    onClick={() => navigate('/admin/content')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#666' }}
                >
                    <FaArrowLeft /> Back to List
                </button>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#333' }}>
                    {isEditMode ? 'Edit Content' : 'Add New Content'}
                </h2>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
                {/* Basic Info */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Title</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Type</label>
                        <select name="type" value={formData.type || 'movie'} onChange={handleChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #ddd' }}>
                            <option value="movie">Movie</option>
                            <option value="series">Series</option>
                        </select>
                    </div>
                </div>

                {/* Media Links (URLs for now, Image Upload can be Phase 4) */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Front Image URL (Poster)</label>
                        <input type="text" name="frontImage" value={formData.frontImage} onChange={handleChange} placeholder="https://..." style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                    </div>
                    <div className="form-group">
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Backdrop Image URL (Landscape)</label>
                        <input type="text" name="backImage" value={formData.backImage || ''} onChange={handleChange} placeholder="https://..." style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                    </div>
                </div>

                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Carousel Hero Image URL (Optional)</label>
                    <small style={{ display: 'block', marginBottom: '0.5rem', color: '#666' }}>Specific image for the top slider. Falls back to Backdrop if empty.</small>
                    <input type="text" name="carouselImage" value={formData.carouselImage || ''} onChange={handleChange} placeholder="https://..." style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                </div>

                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Description</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows="4" style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #ddd' }}></textarea>
                </div>

                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Cast (comma separated)</label>
                    <input type="text" value={castInput} onChange={(e) => setCastInput(e.target.value)} placeholder="Actor 1, Actor 2..." style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                </div>

                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Writers (comma separated)</label>
                    <input type="text" value={writersInput} onChange={(e) => setWritersInput(e.target.value)} placeholder="Writer 1, Writer 2..." style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                </div>

                <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Awards (comma separated)</label>
                    <input type="text" value={awardsInput} onChange={(e) => setAwardsInput(e.target.value)} placeholder="Award 1, Award 2..." style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                </div>

                {/* Meta Data */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Category/Genre</label>
                        <input type="text" name="category" value={formData.category} onChange={handleChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Year</label>
                        <input type="number" name="year" value={formData.year} onChange={handleChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Rating (0-10)</label>
                        <input type="number" step="0.1" name="rating" value={formData.rating} onChange={handleChange} style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Duration</label>
                        <input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g. 2h 15m" style={{ width: '100%', padding: '0.7rem', borderRadius: '6px', border: '1px solid #ddd' }} />
                    </div>
                </div>

                {/* Toggles */}
                <div style={{ display: 'flex', gap: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} /> Featured
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="checkbox" name="isPopular" checked={formData.isPopular} onChange={handleChange} /> Popular
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="checkbox" name="isNewRelease" checked={formData.isNewRelease} onChange={handleChange} /> New Release
                    </label>
                </div>

                {/* Submit Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                    <button
                        type="button"
                        onClick={() => navigate('/admin/content')}
                        style={{ padding: '0.8rem 1.5rem', borderRadius: '8px', border: '1px solid #ddd', background: 'white', cursor: 'pointer' }}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            padding: '0.8rem 2rem',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#03c76c',
                            color: 'white',
                            fontWeight: 'bold',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <FaSave /> {loading ? 'Saving...' : 'Save Content'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ContentEditor;
