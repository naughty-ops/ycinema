import { FaFire, FaFistRaised, FaTheaterMasks, FaLaugh, FaMicroscope, FaStar, FaChartLine, FaTrophy, FaSkull, FaGhost, FaHeart } from 'react-icons/fa';

const categories = [
    { id: 'all', label: 'Trending', icon: FaFire },
    { id: 'action', label: 'Action', icon: FaFistRaised },
    { id: 'drama', label: 'Drama', icon: FaTheaterMasks },
    { id: 'comedy', label: 'Comedy', icon: FaLaugh },
    { id: 'thriller', label: 'Thriller', icon: FaMicroscope },
    { id: 'new', label: 'New Releases', icon: FaStar },
    { id: 'popular', label: 'Popular', icon: FaChartLine },
    { id: 'top10', label: 'Top 10', icon: FaTrophy },
    { id: 'revenge', label: 'Revenge', icon: FaSkull },
    { id: 'inspirational', label: 'Inspirational', icon: FaHeart },
    { id: 'horror', label: 'Horror', icon: FaGhost },
];

const CategoryNav = ({ activeCategory, onSelectCategory }) => {
    return (
        <div className="category-nav" id="category-nav">
            {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                    <div
                        key={cat.id}
                        className={`category-item ${activeCategory === cat.id ? 'active' : ''}`}
                        data-category={cat.id}
                        onClick={() => onSelectCategory(cat.id)}
                    >
                        <Icon /> {cat.label}
                    </div>
                );
            })}
        </div>
    );
};

export default CategoryNav;
