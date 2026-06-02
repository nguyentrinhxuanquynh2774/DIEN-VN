import { useState } from 'react';
import { updatePost } from '../../../services/postService';
import { useAuth } from '../../../context/AuthContext';
import { X } from 'lucide-react';
import styles from './EditPostModal.module.css';

export default function EditPostModal({ post, onClose, onSuccess }) {
    const { user: authUser } = useAuth();
    const [caption, setCaption] = useState(post.caption || '');
    const [styleTag, setStyleTag] = useState(post.styleTag || '');
    const [occasion, setOccasion] = useState(post.occasion || '');
    const [productTags, setProductTags] = useState(
        (post.tags || []).map(t => t.name).join(', ')
    );
    const [loading, setLoading] = useState(false);

   const handleSubmit = async () => {
        if (!caption.trim()) return alert('Caption không được để trống');
        setLoading(true);
        try {
            const tagsArray = productTags
                .split(',')
                .map(t => t.trim())
                .filter(Boolean);

            const uniqueTags = [...new Set(tagsArray)];

            const updated = await updatePost(post.id, authUser.id, {
                caption,
                styleTag,
                occasion,
                productTags: uniqueTags, 
            });

            onSuccess({ 
                ...post, 
                caption, 
                styleTag, 
                occasion,
                tags: uniqueTags.map(name => ({ name }))
            });

            if (onClose) onClose();
            
        } catch (err) {
            alert('Lỗi: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h3>Chỉnh sửa bài viết</h3>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                {post.imageUrl && (
                    <img
                        src={post.imageUrl}
                        alt="preview"
                        className={styles.imagePreview}
                    />
                )}

                <div className={styles.fields}>
                    <div className={styles.field}>
                        <label>Caption</label>
                        <textarea
                            value={caption}
                            onChange={e => setCaption(e.target.value)}
                            className={styles.textarea}
                            rows={3}
                            placeholder="Mô tả bài viết..."
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label>Style Tag</label>
                            <input
                                value={styleTag}
                                onChange={e => setStyleTag(e.target.value)}
                                className={styles.input}
                                placeholder="vd: Minimalist"
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Dịp</label>
                            <input
                                value={occasion}
                                onChange={e => setOccasion(e.target.value)}
                                className={styles.input}
                                placeholder="vd: Đi làm"
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>Product Tags <span>(phân cách bằng dấu phẩy)</span></label>
                        <input
                            value={productTags}
                            onChange={e => setProductTags(e.target.value)}
                            className={styles.input}
                            placeholder="vd: Áo trắng, Quần đen, Giày sneaker"
                        />
                    </div>
                </div>

                <div className={styles.actions}>
                    <button className={styles.cancelBtn} onClick={onClose}>
                        Hủy
                    </button>
                    <button
                        className={styles.saveBtn}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
}