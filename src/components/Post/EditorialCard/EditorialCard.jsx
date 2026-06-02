import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import defaultAvatar from '../../../assets/images/avatar.jpg';
import styles from './EditorialCard.module.css';

export default function EditorialCard({
    post = {},
    user = {},
    likeCount = 0,
    saveCount = 0,
    commentCount = 0,
    isLiked = false,
    isSaved = false,
}) {
    const navigate = useNavigate();
    const { imageUrl, caption } = post;

    const authorName = user?.displayName || 
                       user?.display_name ||
                       user?.username || 
                       user?.user_metadata?.username || 
                       user?.user_metadata?.full_name || 
                       post?.author_name || 
                       'Editorial Creator';

    return (
        <div className={styles.editorialCard} onClick={() => navigate(`/post/${post.id}`)}>
            <div className={styles.imageContainer}>
                <img src={imageUrl} alt="Editorial Visual" className={styles.cardImage} />
            </div>

            <div className={styles.cardContent}>
                <div className={styles.authorInfo}>
                    <img className={styles.authorAvatar} 
                        src={(user?.avatarUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.avatarUrl) 
                                        ? `${user.avatarUrl || user.user_metadata.avatar_url || user.user_metadata.avatarUrl}?t=${new Date().getTime()}` 
                                     : defaultAvatar} 
                        alt={authorName} /> 
                    <span className={styles.authorName}>{authorName}</span>
                </div>
                <p className={styles.cardCaption}>{caption}</p>
                
            </div>
        </div>
    );
}