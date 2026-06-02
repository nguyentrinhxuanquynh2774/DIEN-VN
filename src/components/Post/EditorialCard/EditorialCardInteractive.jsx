import React, { useState, useRef, useEffect } from 'react';
import EditorialCard from './EditorialCard';
import { usePostInteraction } from '../../../hooks/usePostInteraction';
import { useAuth } from '../../../context/AuthContext';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import styles from './EditorialCardInteractive.module.css';

export default function EditorialCardInteractive({
    post,
    user,
    isOwner = false,
    onEdit,
    onDelete,
    ...props
}) {
    const { user: currentUser } = useAuth();
    const isMyPost = currentUser?.id === user?.id;
    const displayUser = isMyPost ? currentUser : user;

    const { isLiked, isSaved, likeCount, saveCount, commentCount } =
        usePostInteraction(post, currentUser);

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        if (!menuOpen) return;
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [menuOpen]);

    return (
        <div className={styles.cardWrapper}>
            {isOwner && (
                <div className={styles.menuContainer} ref={menuRef}>
                    <button
                        className={styles.menuTrigger}
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen((prev) => !prev);
                        }}
                        aria-label="Tùy chọn bài viết"
                    >
                        <MoreVertical size={16} strokeWidth={2} />
                    </button>

                    {menuOpen && (
                        <div className={styles.dropdown}>
                            <button
                                className={styles.dropdownItem}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpen(false);
                                    onEdit?.();
                                }}
                            >
                                <Pencil size={14} strokeWidth={2} />
                                Chỉnh sửa
                            </button>
                            <button
                                className={`${styles.dropdownItem} ${styles.danger}`}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setMenuOpen(false);
                                    onDelete?.();
                                }}
                            >
                                <Trash2 size={14} strokeWidth={2} />
                                Xóa bài
                            </button>
                        </div>
                    )}
                </div>
            )}

            <EditorialCard
                post={post}
                user={displayUser}
                isLiked={isLiked}
                isSaved={isSaved}
                likeCount={likeCount}
                saveCount={saveCount}
                commentCount={commentCount}
                {...props}
            />
        </div>
    );
}