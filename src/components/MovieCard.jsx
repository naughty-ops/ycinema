import { useState } from 'react';
import { FaPlay } from 'react-icons/fa';

const MovieCard = ({ movie, onClick }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    return (
        <div className="card-container" onClick={onClick}>
            <div className={`card ${isFlipped ? 'flipped' : ''}`}
                onClick={(e) => { e.stopPropagation(); handleFlip(); }}>
                <div className="front">
                    <img
                        src={movie.frontImage}
                        alt={movie.title}
                        loading="lazy"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }}
                    />
                    <div className="title-overlay">{movie.title}</div>
                </div>
                <div className="back">
                    <img src={movie.backImage} alt={`${movie.title} background`} className="back-image" loading="lazy" />
                    <div className="back-content">{movie.description}</div>
                    <a href={movie.watchLink} target="_blank" rel="noopener noreferrer" className="watch-btn" onClick={(e) => e.stopPropagation()}>
                        <FaPlay /> Watch Now
                    </a>
                </div>
            </div>
        </div>
    );
};

export default MovieCard;
