import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import styles from './AuthModal.module.css';

export default function AuthModal({ onClose }) {
    const { login } = useAuth(); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            await login(email, password); 
            onClose(); 
        } catch (err) {
            setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
                
                <button className={styles.closeBtn} onClick={onClose}>×</button>
                
                <div className={styles.modalHeader}>
                    <h3>Đăng nhập để tiếp tục</h3>
                    <p>Hãy đăng nhập tài khoản để có thể thả tim, lưu bài viết vào bộ sưu tập hoặc theo dõi những người bạn yêu thích.</p>
                </div>

                {error && <div className={styles.errorBadge}>{error}</div>}

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <input 
                            type="email" 
                            placeholder="Nhập email của bạn..." 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            required 
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Mật khẩu</label>
                        <input 
                            type="password" 
                            placeholder="Nhập mật khẩu..." 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                            disabled={loading}
                        />
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={loading}>
                        {loading ? 'Đang kiểm tra...' : 'Đăng nhập'}
                    </button>
                </form>

                <div className={styles.modalFooter}>
                    <span>Chưa có tài khoản? </span>
                    <a href="/register" onClick={() => onClose()}>Đăng ký ngay</a>
                </div>
            </div>
        </div>
    );
}