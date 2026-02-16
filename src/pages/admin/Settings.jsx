
import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FaGripVertical, FaEye, FaEyeSlash, FaSave, FaStar, FaFilm, FaLayerGroup } from 'react-icons/fa';

const DEFAULT_SECTIONS = [
    { id: 'new', title: 'New Releases For You', type: 'new', visible: true },
    { id: 'popular', title: 'Popular Movies', type: 'popular', visible: true },
    { id: 'top10', title: 'Top 10 Movies This Week', type: 'top10', visible: true },
    { id: 'action', title: 'Action Movies', type: 'action', visible: true }
];

const Settings = () => {
    const [activeTab, setActiveTab] = useState('layout'); // layout, top10, carousel
    const [sections, setSections] = useState([]);

    // Top 10 State
    const [top10Movies, setTop10Movies] = useState([]);

    // Carousel State
    const [allMovies, setAllMovies] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Homepage Layout Config
            const { data: configData } = await supabase
                .from('homepage_config')
                .select('value')
                .eq('key', 'homepage_sections')
                .single();

            if (configData) setSections(configData.value);
            else setSections(DEFAULT_SECTIONS);

            // 2. Fetch Movies for Top 10 and Carousel
            const { data: moviesData, error } = await supabase
                .from('movies')
                .select('id, title, top10, top10_order, featured, frontImage')
                .order('top10_order', { ascending: true }); // Initial fetch order

            if (error) throw error;

            if (moviesData) {
                setAllMovies(moviesData);
                // Filter Top 10
                const t10 = moviesData.filter(m => m.top10).sort((a, b) => (a.top10_order || 0) - (b.top10_order || 0));
                setTop10Movies(t10);
            }

        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- SAVE LOGIC ---
    const handleSave = async () => {
        setSaving(true);
        try {
            // 1. Save Layout
            await supabase
                .from('homepage_config')
                .upsert({
                    key: 'homepage_sections',
                    value: sections,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'key' });

            // 2. Save Top 10 Order & Carousel (Featured) Logic
            // We need to update specific movies. 
            // For Top 10, we update 'top10_order'.
            const updates = top10Movies.map((movie, index) => ({
                id: movie.id,
                top10_order: index + 1 // 1-based index
            }));

            // Bulk update is tricky in Supabase basic client without multiple requests or a custom function.
            // We will loop for now as list is small (max 10-20 items usually).
            for (const update of updates) {
                await supabase.from('movies').update({ top10_order: update.top10_order }).eq('id', update.id);
            }

            alert('All settings saved successfully!');
            fetchData(); // Refresh to ensure sync
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Failed to save settings.');
        } finally {
            setSaving(false);
        }
    };

    // --- LAYOUT HANDLERS ---
    const onLayoutDragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(sections);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setSections(items);
    };

    const toggleVisibility = (index) => {
        const newSections = [...sections];
        newSections[index].visible = !newSections[index].visible;
        setSections(newSections);
    };

    const handleTitleChange = (index, newTitle) => {
        const newSections = [...sections];
        newSections[index].title = newTitle;
        setSections(newSections);
    };

    const addSection = (type) => {
        const id = `${type}-${Date.now()}`;
        const title = type.charAt(0).toUpperCase() + type.slice(1);
        const newSection = { id, title: type === 'top10' ? 'Top 10' : title, type, visible: true };
        setSections([...sections, newSection]);
    };

    const removeSection = (index) => {
        if (window.confirm('Remove this section?')) {
            const newSections = [...sections];
            newSections.splice(index, 1);
            setSections(newSections);
        }
    };

    // --- TOP 10 HANDLERS ---
    const onTop10DragEnd = (result) => {
        if (!result.destination) return;
        const items = Array.from(top10Movies);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setTop10Movies(items);
    };

    // --- CAROUSEL HANDLERS ---
    const toggleFeatured = async (movieId, currentStatus) => {
        try {
            await supabase.from('movies').update({ featured: !currentStatus }).eq('id', movieId);
            // Optimistic update
            setAllMovies(allMovies.map(m => m.id === movieId ? { ...m, featured: !currentStatus } : m));
        } catch (e) {
            console.error(e);
        }
    };

    // --- TOP 10 TOGGLE FOR LIST ---
    const toggleTop10Status = async (movieId, currentStatus) => {
        try {
            // Update DB
            await supabase.from('movies').update({ top10: !currentStatus }).eq('id', movieId);

            // Update Local
            const updatedAll = allMovies.map(m => m.id === movieId ? { ...m, top10: !currentStatus } : m);
            setAllMovies(updatedAll);

            if (!currentStatus) {
                // Added to Top 10
                const movieToAdd = updatedAll.find(m => m.id === movieId);
                setTop10Movies([...top10Movies, movieToAdd]);
            } else {
                // Removed from Top 10
                setTop10Movies(top10Movies.filter(m => m.id !== movieId));
            }
        } catch (e) {
            console.error(e);
        }
    }


    if (loading) return <div style={{ padding: '2rem' }}>Loading settings...</div>;

    const availableTypes = ['action', 'comedy', 'drama', 'horror', 'sci-fi', 'romance', 'documentary', 'thriller', 'anime'];
    const filteredMovies = allMovies.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', color: '#333', margin: 0 }}>Settings & Configuration</h1>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 2rem',
                        background: '#03c76c', color: 'white', border: 'none', borderRadius: '8px',
                        fontWeight: 'bold', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.7 : 1
                    }}
                >
                    <FaSave /> {saving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid #ddd', paddingBottom: '1rem' }}>
                <TabButton active={activeTab === 'layout'} onClick={() => setActiveTab('layout')} icon={<FaLayerGroup />} label="Homepage Layout" />
                <TabButton active={activeTab === 'top10'} onClick={() => setActiveTab('top10')} icon={<FaStar />} label="Top 10 Manager" />
                <TabButton active={activeTab === 'carousel'} onClick={() => setActiveTab('carousel')} icon={<FaFilm />} label="Hero Carousel" />
            </div>

            {/* TAB CONTENT: LAYOUT */}
            {activeTab === 'layout' && (
                <div style={tabStyle}>
                    <div style={{ marginBottom: '1.5rem', color: '#666' }}>
                        Drag to reorder sections. Toggle visibility. Click text to rename.
                    </div>
                    <DragDropContext onDragEnd={onLayoutDragEnd}>
                        <Droppable droppableId="sections">
                            {(provided) => (
                                <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {sections.map((section, index) => (
                                        <Draggable key={section.id} draggableId={section.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    style={{
                                                        ...provided.draggableProps.style,
                                                        display: 'flex', alignItems: 'center', padding: '1rem',
                                                        background: snapshot.isDragging ? '#f8f9fa' : 'white',
                                                        border: '1px solid #eee', borderRadius: '8px',
                                                        boxShadow: snapshot.isDragging ? '0 5px 15px rgba(0,0,0,0.1)' : 'none'
                                                    }}
                                                >
                                                    <div {...provided.dragHandleProps} style={{ padding: '0 10px', color: '#aaa', cursor: 'grab' }}><FaGripVertical /></div>
                                                    <div style={{ flex: 1, marginLeft: '10px' }}>
                                                        <input
                                                            type="text" value={section.title} onChange={(e) => handleTitleChange(index, e.target.value)}
                                                            style={{ border: 'none', fontSize: '1rem', fontWeight: '500', width: '100%', padding: '5px', background: 'transparent' }}
                                                        />
                                                        <div style={{ fontSize: '0.8rem', color: '#888', paddingLeft: '5px' }}>Type: {section.type}</div>
                                                    </div>
                                                    <button onClick={() => toggleVisibility(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: section.visible ? '#03c76c' : '#ccc', fontSize: '1.2rem', padding: '0 10px' }}>
                                                        {section.visible ? <FaEye /> : <FaEyeSlash />}
                                                    </button>
                                                    <button onClick={() => removeSection(index)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff6b6b', fontSize: '1.2rem' }}>&times;</button>
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </DragDropContext>
                    <div style={{ marginTop: '2rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px', border: '1px dashed #ddd' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#555' }}>Add Content Row</h3>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {availableTypes.map(type => (
                                <button key={type} onClick={() => addSection(type)} style={{ padding: '5px 15px', background: 'white', border: '1px solid #ddd', borderRadius: '20px', cursor: 'pointer' }}>+ {type.charAt(0).toUpperCase() + type.slice(1)}</button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: TOP 10 */}
            {activeTab === 'top10' && (
                <div style={tabStyle}>
                    <div style={{ marginBottom: '1.5rem', color: '#666' }}>
                        Drag movies to change their order in the Top 10 list.
                    </div>

                    <div style={{ display: 'flex', gap: '2rem' }}>
                        {/* List */}
                        <div style={{ flex: 1 }}>
                            <DragDropContext onDragEnd={onTop10DragEnd}>
                                <Droppable droppableId="top10">
                                    {(provided) => (
                                        <div {...provided.droppableProps} ref={provided.innerRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {top10Movies.map((movie, index) => (
                                                <Draggable key={movie.id} draggableId={String(movie.id)} index={index}>
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            style={{
                                                                ...provided.draggableProps.style,
                                                                display: 'flex', alignItems: 'center', padding: '10px',
                                                                background: 'white', border: '1px solid #eee', borderRadius: '8px',
                                                                gap: '10px'
                                                            }}
                                                        >
                                                            <strong style={{ color: '#03c76c', width: '20px' }}>{index + 1}</strong>
                                                            <div style={{ width: '40px', height: '60px', background: '#eee', overflow: 'hidden', borderRadius: '4px' }}>
                                                                {movie.frontImage && <img src={movie.frontImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                            </div>
                                                            <span style={{ fontWeight: '500' }}>{movie.title}</span>
                                                            <div style={{ marginLeft: 'auto' }}>
                                                                <button onClick={() => toggleTop10Status(movie.id, true)} style={{ color: '#ff6b6b', border: 'none', background: 'none', cursor: 'pointer' }}>Remove</button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </div>

                        {/* Selector */}
                        <div style={{ width: '300px', borderLeft: '1px solid #eee', paddingLeft: '1rem' }}>
                            <h3>Add to Top 10</h3>
                            <input
                                type="text" placeholder="Search movies..."
                                value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                                style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                            />
                            <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                {filteredMovies.filter(m => !m.top10).map(movie => (
                                    <div key={movie.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px', background: '#f9f9f9', fontSize: '0.9rem' }}>
                                        <span>{movie.title}</span>
                                        <button onClick={() => toggleTop10Status(movie.id, false)} style={{ color: '#03c76c', border: 'none', background: 'none', cursor: 'pointer' }}>Add</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* TAB CONTENT: CAROUSEL */}
            {activeTab === 'carousel' && (
                <div style={tabStyle}>
                    <p style={{ color: '#666', marginBottom: '1rem' }}>Select which movies appear in the top Hero Carousel.</p>
                    <input
                        type="text" placeholder="Search movies..."
                        value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        style={{ width: '100%', padding: '10px', marginBottom: '1rem', borderRadius: '4px', border: '1px solid #ddd' }}
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                        {filteredMovies.map(movie => (
                            <div key={movie.id}
                                onClick={() => toggleFeatured(movie.id, movie.featured)}
                                style={{
                                    background: movie.featured ? '#e6fffa' : 'white',
                                    border: movie.featured ? '2px solid #03c76c' : '1px solid #eee',
                                    borderRadius: '8px', padding: '10px', cursor: 'pointer', transition: 'all 0.2s', position: 'relative'
                                }}
                            >
                                {movie.featured && <div style={{ position: 'absolute', top: '10px', right: '10px', color: '#03c76c' }}><FaStar /></div>}
                                <div style={{ height: '120px', background: '#eee', marginBottom: '10px', borderRadius: '4px', overflow: 'hidden' }}>
                                    {movie.frontImage && <img src={movie.frontImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                </div>
                                <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '5px' }}>{movie.title}</div>
                                <div style={{ fontSize: '0.8rem', color: movie.featured ? '#03c76c' : '#ccc' }}>
                                    {movie.featured ? 'Featured' : 'Not Featured'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '0.8rem 1.2rem',
            background: active ? '#03c76c' : 'transparent', color: active ? 'white' : '#666',
            border: 'none', borderRadius: '30px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s'
        }}
    >
        {icon} {label}
    </button>
);

const tabStyle = {
    background: 'white', padding: '2rem', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.05)', minHeight: '400px'
};

export default Settings;
