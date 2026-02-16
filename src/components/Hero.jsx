import { useState, useEffect } from 'react';
import { FaPlay, FaInfoCircle } from 'react-icons/fa';

const Hero = ({ movies }) => {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        if (!movies || movies.length === 0) return;
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % movies.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [movies]);

    if (!movies || movies.length === 0) return null;

    return (
        <div className="hero-container" id="hero-container">
            <div className="hero">
                {movies.map((movie, index) => (
                    <div
                        key={movie.id}
                        className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                        style={{
                            backgroundImage: `url(${movie.carouselImage || movie.backImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }}
                    >
                        <img src={movie.carouselImage || movie.backImage} className="hero-backdrop" alt={movie.title} />
                        <div className="hero-content">
                            <span className="hero-badge">Featured</span>
                            <h1 className="hero-title">{movie.title}</h1>
                            <div className="hero-meta">
                                <span>{movie.year}</span>
                                <span>{movie.duration}</span>
                                <span>{movie.rating}</span>
                            </div>
                            <p className="hero-description">{movie.description}</p>
                            <div className="hero-actions">
                                <button className="btn btn-primary">
                                    <FaPlay /> Watch Now
                                </button>
                                <button className="btn btn-secondary">
                                    <FaInfoCircle /> More Info
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <div className="hero-indicators" id="hero-indicators">
                {movies.map((_, index) => (
                    <div
                        key={index}
                        className={`hero-indicator ${index === currentSlide ? 'active' : ''}`}
                        onClick={() => setCurrentSlide(index)}
                    ></div>
                ))}
            </div>
        </div>
    );
};

export default Hero;
