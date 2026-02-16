import { useState, useEffect, useRef } from 'react';
import { FaPlayCircle, FaMicrophone, FaSearch } from 'react-icons/fa';
import SearchResults from './SearchResults';

const Header = ({ onSearch, onVoiceSearch, searchResults, onMovieSelect }) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        onSearch(query);
        setShowResults(true);
    };

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        onSearch(searchQuery);
        setShowResults(true);
    };

    const handleVoiceClick = () => {
        setIsListening(!isListening);
        onVoiceSearch();
    };

    const clearSearch = () => {
        setSearchQuery('');
        onSearch('');
        setShowResults(false);
    }

    return (
        <header id="navbar" className={isScrolled ? 'scrolled' : ''}>
            <div className="logo">
                <FaPlayCircle />yCINEMA
            </div>

            <div className="header-search-container" ref={searchRef}>
                <form className="header-search-bar" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        id="header-search-input"
                        className="header-search-input"
                        placeholder="Search movies, TV shows, actors..."
                        value={searchQuery}
                        onChange={handleInputChange}
                        onFocus={() => setShowResults(true)}
                    />
                    <div className="header-search-actions">
                        <button
                            type="button"
                            className={`header-voice-search ${isListening ? 'listening' : ''}`}
                            id="header-voice-search"
                            title="Voice Search"
                            onClick={handleVoiceClick}
                        >
                            <FaMicrophone />
                        </button>
                        <button type="submit" className="header-search-btn" id="header-search-btn">
                            <FaSearch />
                        </button>
                    </div>
                </form>

                {showResults && searchResults && (
                    <SearchResults
                        results={searchResults}
                        query={searchQuery}
                        onClear={clearSearch}
                        onTitleClick={(movie) => {
                            console.log("Clicked movie", movie.title);
                            setShowResults(false);
                            if (onMovieSelect) onMovieSelect(movie);
                        }}
                        onPersonClick={(person) => { console.log("Clicked person", person); setShowResults(false); setSearchQuery(person); onSearch(person); }}
                        onGenreClick={(genre) => { console.log("Clicked genre", genre); setShowResults(false); setSearchQuery(genre); onSearch(genre); }}
                    />
                )}
            </div>

            <div className="nav-container">
                <div className="nav-links">
                    <a href="#" className="nav-link active">Home</a>
                    <a href="#" className="nav-link">Movies</a>
                    <a href="#" className="nav-link">TV Shows</a>
                    <a href="#" className="nav-link">My List</a>
                </div>
            </div>
        </header>
    );
};

export default Header;
