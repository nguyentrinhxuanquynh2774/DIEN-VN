import styles from './PostCard.module.css';
import ExpandableText from '../../Common/ExpandableText/ExpandableText';
import defaultAvatar from '../../../assets/images/avatar.jpg';

import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import relativeTime from 'dayjs/plugin/relativeTime';
import { Link, useNavigate } from 'react-router-dom';


dayjs.locale('vi');
dayjs.extend(relativeTime);

const stop = (e) => e.stopPropagation();

export default function PostCard({
    post = {},
    user = {},
    productTags = [],
    size = 'default',
    likeCount = 0,
    saveCount = 0,
    commentCount = 0,
    isLiked = false,
    isSaved = false,
    isFollowed = false,
    onToggleLike,
    onToggleSave,
    onToggleFollow,
}) {
    const { imageUrl, caption, styleTag, occasion, createdAt } = post;
    const fromNow = createdAt ? dayjs(createdAt).fromNow() : 'Mới đây';
    const navigate = useNavigate();
    const cardClass = `${styles.card} ${styles[size]}`;

    const stopAndNavigate = (e, path) => { 
        e.stopPropagation(); 
        navigate(path); 
    };

    const handleCardClick = () => {
        navigate(`/post/${post.id}`);
    };

    const handleCommentClick = (e) => {
        stop(e);
        navigate(`/post/${post.id}#comments`);
    };

    return (
        <div className={cardClass} onClick={handleCardClick}>
            <div className={styles.imageWrapper}>
                    <img src={imageUrl} alt={caption} />
            </div>

            <div className={styles.body}>
                <div className={styles.header}>
                    <div className={styles.userProfile}>
                        <Link to={`/profile/${user?.id}`} onClick={stop}>
                            <img src={user?.avatarUrl || defaultAvatar} alt={user?.displayName} />
                        </Link>
                        <div className={styles.userInfo}>
                            <Link to={`/profile/${user?.id}`} onClick={stop}>
                                <h5 className={styles.userName}>{user?.displayName}</h5>
                            </Link>
                            <span className={styles.time}>{fromNow}</span>
                        </div>
                    </div>

                    {onToggleFollow && (
                    <button
                        className={`${styles.followButton} ${isFollowed ? styles.followed : ''}`}
                        onClick={(e) => { stop(e); onToggleFollow?.(); }}
                    >
                        {isFollowed ? 'Đang theo dõi' : 'Theo dõi'}
                    </button>
                    )}
                </div>

                <div className={styles.mainContent}>
                    <p className={styles.caption}>{caption}</p>
                    <div className={styles.description}>
                        {occasion && <span className={styles.tagOccasion} onClick={(e) => stopAndNavigate(e, `/explore?occasion=${encodeURIComponent(occasion)}`)}>{occasion}</span>}
                        {styleTag && <span className={styles.tagStyle} onClick={(e) => stopAndNavigate(e, `/explore?style=${encodeURIComponent(styleTag)}`)}>{styleTag}</span>}
                    </div>
                    <div className={styles.detail}>
                        <p>{productTags?.map(tag => tag.name).join(', ')}</p>
                    </div>
                </div>

                <div className={styles.footer}>
                    <div className={styles.button}>
                        <button
                            className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
                            onClick={(e) => { stop(e); onToggleLike?.(post?.id); }}
                        >
                            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
                            <span className={styles.count}>{likeCount}</span>
                        </button>

                        <button
                            className={styles.commentButton}
                            onClick={handleCommentClick}
                        >
                            <MessageCircle size={20} />
                            <span className={styles.count}>{commentCount}</span>
                        </button>

                        <button
                            className={`${styles.saveButton} ${isSaved ? styles.saved : ''}`}
                            onClick={(e) => { stop(e); onToggleSave?.(post?.id); }}
                        >
                            <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
                            <span className={styles.count}>{saveCount}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}