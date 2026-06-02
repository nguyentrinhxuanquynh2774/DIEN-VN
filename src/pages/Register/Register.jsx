import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Register.module.css';

export default function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!username.trim()) {
            return setError('Tên người dùng không được để trống!');
        }
        if (password !== confirmPassword) {
            return setError('Mật khẩu nhập lại không trùng khớp!');
        }

        try {
            setError('');
            await register(email, password, username.trim()); 
            alert('Đăng ký thành công!');
            navigate('/login');
        } catch (err) {
            setError(err.message || 'Lỗi xảy ra trong tiến trình đăng ký.');
        }
    };

    return (
        <div className={styles.registerContainer}>
            <div className={styles.registerCard}>
                <h2 className={styles.title}>Đăng ký tài khoản</h2>
                {error && <p className={styles.errorText}>{error}</p>}
                
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.inputGroup}>
                        <label>Tên người dùng (Username)</label>
                        <input 
                            type="text" 
                            value={username} 
                            onChange={e => setUsername(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Email</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Mật khẩu</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Xác nhận mật khẩu</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                    </div>
                    <button type="submit" className={styles.submitBtn}>Đăng ký</button>
                </form>
                
                <p className={styles.footerText}>
                    Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
}