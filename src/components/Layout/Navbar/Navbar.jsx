import styles from './Navbar.module.css' 
import defaultAvatar from '../../../assets/images/avatar.jpg' 
import { Search, User, Settings, LifeBuoy, MessageSquare, LogOut, Bell, Home, Users, Compass } from 'lucide-react'; 
import { Link, useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../../context/AuthContext'; 
import { useState, useEffect, useRef } from 'react'; 

export default function Navbar() {
    const { user, logout } = useAuth(); 
    const [isOpen, setIsOpen] = useState(false); 
    const [searchText, setSearchText] = useState(''); 
    const [isVisible, setIsVisible] = useState(true); 
    const [lastScrollY, setLastScrollY] = useState(0); 
    const dropdownRef = useRef(null); 
    const navigate = useNavigate(); 

    const toggleDropdown = () => setIsOpen(!isOpen); 

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target))
                setIsOpen(false); 
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []); 

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchText.trim()) {
            navigate(`/explore?q=${encodeURIComponent(searchText.trim())}`); 
            setSearchText(''); 
        }
    }; 

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY < 50) {
                setIsVisible(true); 
            } else if (currentScrollY > lastScrollY) {
                setIsVisible(false); 
                setIsOpen(false);  
            } else {
                setIsVisible(true); 
            }
            setLastScrollY(currentScrollY); 
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]); 

    const handleLogout = async () => {
        try {
            await logout();
            setIsOpen(false);
            navigate('/login');
        } catch (err) {
            console.error('Logout error:', err.message);
        }
    };

    return (
        <nav className={`${styles.navbar} ${!isVisible ? styles.hidden : ''}`}> 
            <div className={styles.navbarLeft}> 
                <img className={styles.navbarLogo} src="/favicon.jpg" alt="logo" /> 
                <span className={styles.navbarHeading}> ienVN </span> 
            </div>

            <div className={styles.navbarSearch}> 
                <Search size={18} strokeWidth={2} className={styles.navbarSearchIcon} /> 
                <input
                    placeholder="Tìm kiếm theo caption, phong cách, dịp, tên sản phẩm, tên người dùng..." 
                    value={searchText} 
                    onChange={e => setSearchText(e.target.value)} 
                    onKeyDown={handleSearch} 
                />
            </div>

            <div className={styles.navbarCenter}> 
                <Link to="/" className={styles.navbarCenterItem} data-tooltip="Trang chủ"> 
                    <Home /> 
                </Link>
                <Link to="/following" className={styles.navbarCenterItem} data-tooltip="Đang theo dõi"> 
                    <Users /> 
                </Link>
                <Link to="/explore" className={styles.navbarCenterItem} data-tooltip="Khám phá"> 
                    <Compass /> 
                </Link>
            </div>

            <div className={styles.navbarRight}> 
                {user ? (
                    <>
                        <button className={styles.notificationButton}> 
                            <Bell size={25} strokeWidth={1.8} stroke="#ffffff" fill="#ffffff" /> 
                        </button>
                        <div className={styles.avatarContainer} ref={dropdownRef}> 
                            <img
                                className={styles.avatarImg}
                                src={
                                        (user?.avatarUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.avatarUrl) 
                                            ? `${user.avatarUrl || user.user_metadata.avatar_url || user.user_metadata.avatarUrl}?t=${new Date().getTime()}` 
                                            : defaultAvatar
                                    }                                
                                alt="avatar"
                                onClick={toggleDropdown} 
                            />
                            {isOpen && ( 
                                <div className={styles.dropdownMenu}> 
                                    <Link to={`/profile/${user?.id}`} className={styles.dropdownItem} onClick={() => setIsOpen(false)}> 
                                        <User /><span>Trang cá nhân</span> 
                                    </Link>
                                    <div className={styles.dropdownItem}><Settings /><span>Cài đặt</span></div> 
                                    <div className={styles.dropdownItem}><LifeBuoy /><span>Hỗ trợ</span></div> 
                                    <div className={styles.dropdownItem}><MessageSquare /><span> Tin nhắn </span></div> 
                                    <div className={styles.dropdownItem} onClick={handleLogout}>
                                        <LogOut /><span>Đăng xuất</span> 
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className={styles.authButtons}>
                        <Link to="/login" className={styles.loginBtn}>Đăng nhập</Link>
                        <Link to="/register" className={styles.registerBtn}>Đăng ký</Link>
                    </div>
                )}
            </div>
        </nav>
    );
}