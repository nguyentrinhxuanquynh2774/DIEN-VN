import { useState, useRef } from 'react';
import { ImagePlus } from 'lucide-react';
import styles from './CreatePost.module.css';
import { createPost, logStyleTagSuggestion } from '../../../services/postService';
import { useAuth } from '../../../context/AuthContext';
import { X } from 'lucide-react';
// ── Style tags ──────────────────
const STYLE_TAGS = [
    'Bánh bèo', 'Vintage', 'Y2K', 'Streetwear',
    'Minimalist', 'Casual', 'Formal', 'Sporty',
    'Elegant', 'Bohemian', 'Old Money', 'Dark Academia',
];
const OTHER_VALUE = '__other__'; 

const MAX_CAPTION  = 300;
const MAX_TAGS     = 8;
const MAX_OCCASION = 60;

export default function CreatePostForm({ onSuccess, onCancel }) {
    const { user } = useAuth();
    const fileInputRef    = useRef(null);
    const occasionInputRef = useRef(null);

    // ── image ──
    const [imageFile, setImageFile] = useState(null);
    const [preview,   setPreview]   = useState(null);

    // ── caption ──
    const [caption, setCaption] = useState('');

    const [styleSelect,      setStyleSelect]      = useState('');
    const [styleTag,         setStyleTag]         = useState('');
    const [styleSuggestion,  setStyleSuggestion]  = useState(''); 
    const isOtherStyle = styleSelect === OTHER_VALUE;

    const handleStyleSelectChange = (e) => {
        const val = e.target.value;
        setStyleSelect(val);
        if (val === OTHER_VALUE) {
            setStyleTag('Khác');
            setStyleSuggestion('');
            setTimeout(() => document.getElementById('style-suggestion-input')?.focus(), 50);
        } else {
            setStyleTag(val);
            setStyleSuggestion('');
        }
    };

    const [occasions,      setOccasions]      = useState([]);
    const [occasionInput,  setOccasionInput]  = useState('');

    const addOccasion = (value) => {
        const trimmed = value.trim();
        if (!trimmed || occasions.length >= 3) return;       
        if (occasions.find(o => o.toLowerCase() === trimmed.toLowerCase())) return;
        setOccasions(prev => [...prev, trimmed]);
        setOccasionInput('');
    };

    const handleOccasionKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addOccasion(occasionInput);
        }
        if (e.key === 'Backspace' && !occasionInput && occasions.length > 0) {
            setOccasions(prev => prev.slice(0, -1));
        }
    };

    const removeOccasion = (index) => {
        setOccasions(prev => prev.filter((_, i) => i !== index));
    };

    // ── product tags ──
    const [tags,     setTags]     = useState([]);
    const [tagInput, setTagInput] = useState('');

    const addTag = (value) => {
        const trimmed = value.trim();
        if (!trimmed || tags.length >= MAX_TAGS) return;
        if (tags.find(t => t.toLowerCase() === trimmed.toLowerCase())) return;
        setTags(prev => [...prev, trimmed]);
        setTagInput('');
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTag(tagInput);
        }
        if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
            setTags(prev => prev.slice(0, -1));
        }
    };

    const removeTag = (index) => {
        setTags(prev => prev.filter((_, i) => i !== index));
    };

    // ── ui state ──
    const [loading,  setLoading]  = useState(false);
    const [progress, setProgress] = useState(0);
    const [error,    setError]    = useState('');

    // ── image handling ──
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setError('Vui lòng chọn file ảnh hợp lệ.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setError('Ảnh không được vượt quá 10MB.');
            return;
        }
        setError('');
        setImageFile(file);
        setPreview(URL.createObjectURL(file));
    };

    // ── validation ──
    const occasionReady = occasions.length > 0 || occasionInput.trim().length > 0;
    const styleReady    = styleTag && (isOtherStyle ? true : true); 
    const canSubmit     = imageFile && caption.trim() && styleReady && occasionReady && !loading;

    // ── submit ──
    const handleSubmit = async () => {
        if (!canSubmit) return;

        const finalOccasions = occasionInput.trim()
            ? [...occasions, occasionInput.trim()]
            : occasions;
        if (finalOccasions.length === 0) {
            setError('Vui lòng nhập ít nhất một dịp.');
            return;
        }

        const finalSuggestion = isOtherStyle ? styleSuggestion.trim() : '';

        setLoading(true);
        setError('');
        setProgress(10);

        try {
            const progressInterval = setInterval(() => {
                setProgress(prev => prev < 80 ? prev + 10 : prev);
            }, 300);

            await createPost(user.id, imageFile, {
                caption:     caption.trim(),
                styleTag,                                
                occasion:    finalOccasions.join(', '), 
                productTags: tags,
            });

            if (isOtherStyle && finalSuggestion) {
                logStyleTagSuggestion(user.id, finalSuggestion).catch(() => {});
            }

            clearInterval(progressInterval);
            setProgress(100);
            setTimeout(() => onSuccess?.(), 300);

        } catch (err) {
            setError(err.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
            setProgress(0);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className={styles.modalBody}>

                {/* ── LEFT: image upload ── */}
                <div className={styles.imageZone}>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        hidden
                        onChange={handleImageChange}
                    />
                    {preview ? (
                        <>
                            <img src={preview} alt="preview" className={styles.previewImg} />
                            <button
                                className={styles.changeImgBtn}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Đổi ảnh
                            </button>
                        </>
                    ) : (
                        <div
                            className={styles.imagePlaceholder}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className={styles.uploadIcon}>
                                <ImagePlus size={26} />
                            </div>
                            <p className={styles.placeholderText}>Nhấn để chọn ảnh</p>
                            <p className={styles.placeholderSub}>JPG, PNG, WEBP · Tối đa 10MB</p>
                        </div>
                    )}
                </div>

                {/* ── RIGHT: form fields ── */}
                <div className={styles.formZone}>

                    {/* Caption */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Mô tả</label>
                        <textarea
                            className={styles.textarea}
                            placeholder="Chia sẻ outfit của bạn..."
                            value={caption}
                            maxLength={MAX_CAPTION}
                            onChange={e => setCaption(e.target.value)}
                        />
                        <span className={`${styles.charCount} ${caption.length > MAX_CAPTION * 0.9 ? styles.warn : ''}`}>
                            {caption.length}/{MAX_CAPTION}
                        </span>
                    </div>

                    {/* ── Style Tag: Controlled Freedom ── */}
                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>Phong cách</label>
                        <select
                            className={styles.select}
                            value={styleSelect}
                            onChange={handleStyleSelectChange}
                        >
                            <option value="">-- Chọn phong cách --</option>
                            {STYLE_TAGS.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                            <option disabled>──────────────</option>
                            <option value={OTHER_VALUE}>✦ Khác · Đề xuất phong cách mới...</option>
                        </select>

                        {isOtherStyle && (
                            <div className={styles.suggestionWrapper}>
                                <input
                                    id="style-suggestion-input"
                                    className={`${styles.input} ${styles.suggestionInput}`}
                                    placeholder='Tên phong cách bạn muốn đề xuất, VD: "Acubi"'
                                    value={styleSuggestion}
                                    maxLength={50}
                                    onChange={e => setStyleSuggestion(e.target.value)}
                                />
                                <p className={styles.tagHint}>
                                    💡 Bài sẽ đăng với tag <strong>Khác</strong>. Đề xuất của bạn sẽ được xem xét thêm vào danh sách.
                                </p>
                            </div>
                        )}
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>
                            Dịp ({occasions.length}/3)
                        </label>
                        <div
                            className={styles.tagsWrapper}
                            onClick={() => occasionInputRef.current?.focus()}
                        >
                            {occasions.map((occ, i) => (
                                <span key={i} className={`${styles.tag} ${styles.tagOccasion}`}>
                                    {occ}
                                    <button
                                        className={styles.tagRemove}
                                        onClick={(e) => { e.stopPropagation(); removeOccasion(i); }}
                                        type="button"
                                    >
                                        <X size={18} strokeWidth={2.5} />
                                    </button>
                                </span>
                            ))}
                            {occasions.length < 3 && (
                                <input
                                    ref={occasionInputRef}
                                    className={styles.tagInput}
                                    placeholder={occasions.length === 0 ? 'VD: Đi đu concert, Chụp kỷ yếu...' : ''}
                                    value={occasionInput}
                                    maxLength={MAX_OCCASION}
                                    onChange={e => setOccasionInput(e.target.value)}
                                    onKeyDown={handleOccasionKeyDown}
                                    onBlur={() => addOccasion(occasionInput)}
                                />
                            )}
                        </div>
                        <p className={styles.tagHint}>Nhấn Enter hoặc dấu phẩy để thêm · Tối đa 3 dịp</p>
                    </div>

                    <div className={styles.fieldGroup}>
                        <label className={styles.label}>
                            Tag sản phẩm ({tags.length}/{MAX_TAGS})
                        </label>
                        <div
                            className={styles.tagsWrapper}
                            onClick={() => document.getElementById('tag-input-field')?.focus()}
                        >
                            {tags.map((tag, i) => (
                                <span key={i} className={styles.tag}>
                                    {tag}
                                    <button
                                        className={styles.tagRemove}
                                        onClick={(e) => { e.stopPropagation(); removeTag(i); }}
                                        type="button"
                                    >
                                        <X size={18} strokeWidth={2.5} />
                                    </button>
                                </span>
                            ))}
                            {tags.length < MAX_TAGS && (
                                <input
                                    id="tag-input-field"
                                    className={styles.tagInput}
                                    placeholder={tags.length === 0 ? 'Áo khoác Zara, Giày Nike...' : ''}
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={handleTagKeyDown}
                                    onBlur={() => addTag(tagInput)}
                                />
                            )}
                        </div>
                        <p className={styles.tagHint}>Nhấn Enter hoặc dấu phẩy để thêm tag</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className={styles.errorBanner}>{error}</div>
                    )}
                </div>
            </div>

            {/* upload progress */}
            {loading && (
                <div className={styles.progressBar}>
                    <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                </div>
            )}

            {/* footer */}
            <div className={styles.modalFooter}>
                <button className={styles.cancelBtn} onClick={onCancel} disabled={loading}>
                    Hủy
                </button>
                <button className={styles.submitBtn} onClick={handleSubmit} disabled={!canSubmit}>
                    {loading && <span className={styles.spinner} />}
                    {loading ? 'Đang đăng...' : 'Đăng bài'}
                </button>
            </div>
        </>
    );
}