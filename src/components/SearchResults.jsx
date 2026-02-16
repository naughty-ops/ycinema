import { FaFilm, FaUsers, FaTags, FaStar, FaTimes } from 'react-icons/fa';

const SearchResults = ({ results, query, onClear, onTitleClick, onPersonClick, onGenreClick }) => {
    const { titles, people, genres } = results;
    const hasResults = titles.length > 0 || people.length > 0 || genres.length > 0;

    if (!query) return null;

    return (
        <div className={`search-results ${query ? 'active' : ''}`}>
            {/* Header */}
            <div className="search-results-header">
                {hasResults ? (
                    <div className="search-results-title">Search Results for "{query}"</div>
                ) : (
                    <div className="search-results-title">No results found</div>
                )}
                <div className="search-clear" onClick={onClear}>Clear</div>
            </div>

            {!hasResults && (
                <div className="search-no-results">
                    <FaStar style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
                    {/* Note: In CSS we changed .search-no-results i to svg, so this works */}
                    <h3>No results found for "{query}"</h3>
                    <p>Try searching for something else</p>
                </div>
            )}

            {/* Titles */}
            {titles.length > 0 && (
                <div className="search-category">
                    <div className="search-category-title"><FaFilm /> Movies & TV Shows</div>
                    <div className="search-items">
                        {titles.slice(0, 5).map((movie) => (
                            <div key={movie.id} className="search-item" onClick={() => onTitleClick(movie)}>
                                <img src={movie.frontImage} className="search-item-poster" alt={movie.title} />
                                <div className="search-item-info">
                                    <div className="search-item-title">{movie.title}</div>
                                    <div className="search-item-meta">
                                        <span>{movie.year}</span>
                                        <span className="search-item-rating"><FaStar /> {movie.rating}</span>
                                        <span>{movie.category.split(',')[0]}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* People */}
            {people.length > 0 && (
                <div className="search-category">
                    <div className="search-category-title"><FaUsers /> People</div>
                    <div className="search-items">
                        {people.slice(0, 5).map((person, idx) => (
                            <div key={idx} className="search-item-person" onClick={() => onPersonClick(person.name)}>
                                <div className="person-avatar">{person.name.charAt(0)}</div>
                                <div className="person-info">
                                    <div className="person-name">{person.name}</div>
                                    <div className="person-role">{person.role}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Genres */}
            {genres.length > 0 && (
                <div className="search-category">
                    <div className="search-category-title"><FaTags /> Genres</div>
                    <div className="search-items">
                        {genres.slice(0, 5).map((genre, idx) => (
                            <div key={idx} className="search-item" onClick={() => onGenreClick(genre.name)}>
                                <div className="search-item-info">
                                    <div className="search-item-title">{genre.name}</div>
                                    <div className="search-item-meta">Browse all {genre.name} titles</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchResults;
