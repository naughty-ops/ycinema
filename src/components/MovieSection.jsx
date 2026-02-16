import { FaChevronRight } from 'react-icons/fa';
import MovieCard from './MovieCard';

const MovieSection = ({ title, movies, onMovieClick, onViewAll }) => {
    if (!movies || movies.length === 0) return null;

    return (
        <div className="section">
            <div className="section-header">
                <h2 className="section-title">{title}</h2>
                <div
                    className="view-all"
                    onClick={onViewAll}
                    style={{ cursor: 'pointer' }}
                >
                    View All <FaChevronRight />
                </div>
            </div>
            <div className="movies-grid">
                {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} onClick={() => onMovieClick(movie)} />
                ))}
            </div>
        </div>
    );
};

export default MovieSection;
