import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaLinkedinIn, FaChevronRight, FaHeart } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer>
            <div className="footer-content">
                <div className="footer-info">
                    <div className="footer-logo">yCINEMA</div>
                    <p className="footer-description">The ultimate streaming platform for movie lovers. Discover thousands of
                        movies and
                        TV shows, all in one place.</p>
                    <div className="social-icons">
                        <div className="social-icon"><FaFacebookF /></div>
                        <div className="social-icon"><FaTwitter /></div>
                        <div className="social-icon"><FaInstagram /></div>
                        <div className="social-icon"><FaYoutube /></div>
                        <div className="social-icon"><FaLinkedinIn /></div>
                    </div>
                </div>
                <div className="footer-column">
                    <h3 className="footer-heading">Navigation</h3>
                    <ul className="footer-links">
                        <li className="footer-link"><a href="#"><FaChevronRight /> Home</a></li>
                        <li className="footer-link"><a href="#"><FaChevronRight /> Movies</a></li>
                        <li className="footer-link"><a href="#"><FaChevronRight /> TV Shows</a></li>
                        <li className="footer-link"><a href="#"><FaChevronRight /> New Releases</a></li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h3 className="footer-heading">Categories</h3>
                    <ul className="footer-links">
                        <li className="footer-link"><a href="#"><FaChevronRight /> Action</a></li>
                        <li className="footer-link"><a href="#"><FaChevronRight /> Drama</a></li>
                        <li className="footer-link"><a href="#"><FaChevronRight /> Comedy</a></li>
                        <li className="footer-link"><a href="#"><FaChevronRight /> Thriller</a></li>
                        <li className="footer-link"><a href="#"><FaChevronRight /> Horror</a></li>
                    </ul>
                </div>
                <div className="footer-column">
                    <h3 className="footer-heading">Support</h3>
                    <ul className="footer-links">
                        <li className="footer-link"><a href="#"><FaChevronRight /> Help Center</a></li>
                        <li className="footer-link"><a href="#"><FaChevronRight /> Contact Us</a></li>
                        <li className="footer-link"><a href="#"><FaChevronRight /> Devices</a></li>
                        <li className="footer-link"><a href="#"><FaChevronRight /> Terms of Use</a></li>
                    </ul>
                </div>
            </div>
            <div className="copyright">
                &copy; 2023 yCINEMA. All rights reserved. | Designed with <FaHeart style={{ color: '#e74c3c' }} /> for movie lovers
            </div>
        </footer>
    );
};

export default Footer;
