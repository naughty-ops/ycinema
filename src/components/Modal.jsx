import { useEffect } from 'react';
import { FaTimes, FaPlay, FaStar } from 'react-icons/fa';

const Modal = ({ movie, onClose, onWatch, relatedMovies, onRelatedClick }) => {
    // Lock body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    if (!movie) return null;

    return (
        <div className="modal" id="detail-modal" style={{ display: 'flex', opacity: 1, visibility: 'visible' }}>
            <div className="modal-content">
                <button className="modal-close" id="modal-close" onClick={onClose}><FaTimes /></button>
                <button className="modal-watch-btn" id="modal-watch-btn" onClick={onWatch}><FaPlay /> Watch Now</button>
                <div className="modal-header">
                    <img src={movie.backImage} className="modal-backdrop" alt={movie.title} />
                    <img src={movie.frontImage} className="modal-poster" alt={movie.title} />
                    <div className="modal-header-content">
                        <h2 className="modal-title">{movie.title}</h2>
                        <div className="modal-meta">
                            <span className="modal-year">{movie.year}</span>
                            <span className="modal-certification">{movie.certification || 'PG-13'}</span>
                            <span className="modal-duration">{movie.duration}</span>
                            <span className="modal-rating"><FaStar /> {movie.rating}</span>
                        </div>
                    </div>
                </div>
                <div className="modal-body">
                    <p className="modal-description">{movie.description}</p>

                    <div className="modal-details">
                        <div className="detail-item">
                            <div className="detail-label">Director</div>
                            <div className="detail-value" id="modal-director">{movie.director}</div>
                        </div>
                        <div className="detail-item">
                            <div className="detail-label">Cast</div>
                            <div className="detail-value" id="modal-cast">{Array.isArray(movie.cast) ? movie.cast.join(', ') : movie.cast}</div>
                        </div>
                        <div className="detail-item">
                            <div className="detail-label">Genre</div>
                            <div className="detail-value" id="modal-genre">{movie.category}</div>
                        </div>
                        <div className="detail-item">
                            <div className="detail-label">Language</div>
                            <div className="detail-value" id="modal-language">{movie.language || 'English'}</div>
                        </div>
                        <div className="detail-item">
                            <div className="detail-label">Awards</div>
                            <div className="detail-value" id="modal-awards">{movie.awards || 'None'}</div>
                        </div>
                    </div>

                    <h3 className="modal-section-title">More Like This</h3>
                    <div className="similar-movies" id="similar-movies">
                        {/* Render related movies here */}
                        {relatedMovies && relatedMovies.map(rel => (
                            <div
                                key={rel.id}
                                className="similar-movie-item"
                                onClick={() => onRelatedClick && onRelatedClick(rel)}
                                style={{ cursor: 'pointer' }}
                            >
                                <img src={rel.frontImage} alt={rel.title} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;
