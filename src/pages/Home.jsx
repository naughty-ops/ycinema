import { useState, useEffect } from 'react'
import Header from '../components/Header'
import Hero from '../components/Hero'
import CategoryNav from '../components/CategoryNav'
import MovieSection from '../components/MovieSection'
import Footer from '../components/Footer'
import Modal from '../components/Modal'
import MovieCard from '../components/MovieCard'
import { FaChevronUp } from 'react-icons/fa'
import { supabase } from '../supabaseClient'

function Home() {
    const [movies, setMovies] = useState([]);
    const [featuredMovies, setFeaturedMovies] = useState([]);
    const [activeCategory, setActiveCategory] = useState('all');
    const [selectedMovie, setSelectedMovie] = useState(null);
    const [searchResults, setSearchResults] = useState({ titles: [], people: [], genres: [] });
    const [showBackToTop, setShowBackToTop] = useState(false);

    // Fetch movies from Supabase
    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const { data, error } = await supabase
                    .from('movies')
                    .select('id, title, frontImage, backImage, carouselImage, category, rating, year, type, status, featured, isNewRelease, isPopular, top10, top10_order, created_at, cast, director, description, duration, certification, language, awards, watchLink')
                    .eq('status', 'published');

                if (error) {
                    throw error;
                }

                if (data && data.length > 0) {
                    setMovies(data);
                    const featured = data.filter(m => m.featured);
                    setFeaturedMovies(featured.length > 0 ? featured : data.slice(0, 5));
                } else {
                    // Fallback/Initial Load
                    console.log("No data in Supabase, fetching local.");
                    throw new Error("Empty database");
                }
            } catch (err) {
                console.warn("Supabase fetch failed or empty, falling back to local JSON:", err.message);
                fetch('/movies.json')
                    .then(res => res.json())
                    .then(data => {
                        const movieList = data.movies || [];
                        setMovies(movieList);
                        const featured = movieList.filter(m => m.featured);
                        setFeaturedMovies(featured.length > 0 ? featured : movieList.slice(0, 5));
                    })
                    .catch(e => console.error("Failed to fetch local movies", e));
            }
        };

        fetchMovies();
    }, []);

    // Back to top visibility
    useEffect(() => {
        const handleScroll = () => {
            setShowBackToTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSearch = (query) => {
        if (!query) {
            setSearchResults({ titles: [], people: [], genres: [] });
            return;
        }

        const lowerQuery = query.toLowerCase();
        const results = {
            titles: [],
            people: [],
            genres: []
        };

        movies.forEach(movie => {
            // Titles
            if (movie.title.toLowerCase().includes(lowerQuery)) {
                results.titles.push(movie);
            }

            // People (Cast & Director)
            if (movie.cast) {
                // Cast might be a string (from DB) or array (from JSON)
                let castArray = [];
                if (Array.isArray(movie.cast)) {
                    castArray = movie.cast;
                } else if (typeof movie.cast === 'string') {
                    try {
                        castArray = JSON.parse(movie.cast);
                    } catch (e) {
                        // split by comma if not JSON
                        castArray = movie.cast.split(',').map(s => s.trim());
                    }
                }

                castArray.forEach(person => {
                    if (person.toLowerCase().includes(lowerQuery)) {
                        if (!results.people.some(p => p.name === person)) {
                            results.people.push({ name: person, role: 'Actor' });
                        }
                    }
                });
            }
            if (movie.director && movie.director.toLowerCase().includes(lowerQuery)) {
                if (!results.people.some(p => p.name === movie.director)) {
                    results.people.push({ name: movie.director, role: 'Director' });
                }
            }

            // Genres
            if (movie.category && movie.category.toLowerCase().includes(lowerQuery)) {
                const cats = movie.category.split(',').map(c => c.trim());
                cats.forEach(c => {
                    if (c.toLowerCase().includes(lowerQuery)) {
                        if (!results.genres.some(g => g.name === c)) { // simplistic check
                            results.genres.push({ name: c.charAt(0).toUpperCase() + c.slice(1) });
                        }
                    }
                })
            }
        });

        // Deduplicate genres explicitly if needed, but the check above handles basic cases
        // Unique genres
        results.genres = results.genres.filter((v, i, a) => a.findIndex(t => (t.name === v.name)) === i);

        setSearchResults(results);
    };

    const getMoviesBySection = (type) => {
        // Presets with specific sorting
        if (type === 'new') {
            // Sort by Date Added (Newest First)
            return [...movies]
                .filter(m => m.isNewRelease)
                .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
                .slice(0, 10);
        }
        if (type === 'popular') {
            // Sort by Rating (Highest First)
            return [...movies]
                .filter(m => m.isPopular)
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 10);
        }
        if (type === 'top10') {
            // Sort by Custom Order (Ascending)
            return [...movies]
                .filter(m => m.top10)
                .sort((a, b) => (a.top10_order || 0) - (b.top10_order || 0))
                .slice(0, 10);
        }

        // Dynamic Genre (case insensitive partial match)
        return movies.filter(m =>
            m.category && m.category.toLowerCase().includes(type.toLowerCase())
        ).slice(0, 10);
    }

    const filteredMovies = activeCategory === 'all'
        ? movies
        : activeCategory === 'new'
            ? movies.filter(m => m.isNewRelease).sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
            : activeCategory === 'popular'
                ? movies.filter(m => m.isPopular).sort((a, b) => (b.rating || 0) - (a.rating || 0))
                : activeCategory === 'top10'
                    ? movies.filter(m => m.top10).sort((a, b) => (a.top10_order || 0) - (b.top10_order || 0))
                    : movies.filter(m => m.category && m.category.toLowerCase().includes(activeCategory.toLowerCase()));

    const getRelatedMovies = (movie) => {
        if (!movie) return [];
        const firstCategory = movie.category.split(',')[0].trim().toLowerCase();
        return movies.filter(m =>
            m.category.toLowerCase().includes(firstCategory) && m.id !== movie.id
        ).slice(0, 4);
    }

    // Fetch homepage config
    const [sections, setSections] = useState([]);

    useEffect(() => {
        const fetchConfig = async () => {
            const { data } = await supabase
                .from('homepage_config')
                .select('value')
                .eq('key', 'homepage_sections')
                .single();

            if (data && data.value) {
                setSections(data.value);
            } else {
                // Default if no config
                setSections([
                    { id: 'new', title: 'New Releases For You', type: 'new', visible: true },
                    { id: 'popular', title: 'Popular Movies', type: 'popular', visible: true },
                    { id: 'top10', title: 'Top 10 Movies This Week', type: 'top10', visible: true },
                    { id: 'action', title: 'Action Movies', type: 'action', visible: true }
                ]);
            }
        };
        fetchConfig();
    }, []);

    return (
        <div className="Home">
            <Header
                onSearch={handleSearch}
                onVoiceSearch={() => console.log("Voice search clicked")}
                searchResults={searchResults}
                onMovieSelect={setSelectedMovie}
            />

            <Hero movies={featuredMovies} />

            <CategoryNav
                activeCategory={activeCategory}
                onSelectCategory={setActiveCategory}
            />

            <div className="main-container">
                {activeCategory === 'all' ? (
                    <>
                        {sections
                            .filter(section => section.visible)
                            .map(section => (
                                <MovieSection
                                    key={section.id}
                                    title={section.title}
                                    movies={getMoviesBySection(section.type)}
                                    onMovieClick={setSelectedMovie}
                                    onViewAll={() => setActiveCategory(section.type)}
                                />
                            ))
                        }
                    </>
                ) : (
                    <div className="section">
                        <div className="section-header">
                            <h2 className="section-title">{activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Movies</h2>
                        </div>
                        <div className="movies-grid">
                            {filteredMovies.map(movie => (
                                <MovieCard key={movie.id} movie={movie} onClick={() => setSelectedMovie(movie)} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {selectedMovie && (
                <Modal
                    movie={selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                    relatedMovies={getRelatedMovies(selectedMovie)}
                />
            )}

            <Footer />

            <button
                className={`back-to-top ${showBackToTop ? 'visible' : ''}`}
                id="back-to-top"
                onClick={scrollToTop}
            >
                <FaChevronUp />
            </button>
        </div>
    )
}

export default Home
