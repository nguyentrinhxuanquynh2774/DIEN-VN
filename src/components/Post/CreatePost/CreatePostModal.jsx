import { useEffect } from 'react';
import styles from './CreatePost.module.css';
import CreatePostForm from './CreatePostForm';

export default function CreatePostModal({ onClose, onSuccess }) {

    useEffect(() => {
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, []);

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    useEffect(() => {
        const handler = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Tạo bài đăng mới">

                <div className={styles.modalHeader}>
                    <h3 className={styles.modalTitle}>Tạo bài đăng mới</h3>
                    <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
                        ×
                    </button>
                </div>

                <CreatePostForm
                    onSuccess={onSuccess}
                    onCancel={onClose}
                />
            </div>
        </div>
    );
}