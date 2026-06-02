import styles from './PostDetailInfo.module.css';
import defaultAvatar from '../../../assets/images/avatar.jpg';

import ExpandableText from '../../Common/ExpandableText/ExpandableText';
import { Heart, MessageCircle, Bookmark } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

export default function PostDetailInfo({
    post = {}, user = {},
    likeCount = 0, saveCount = 0, commentCount = 0,
    isLiked = false, isSaved = false, isFollowed = false,
    onToggleLike, onToggleSave, onToggleFollow, onCommentClick
}) {
    const fromNow = post.createdAt ? dayjs(post.createdAt).fromNow() : 'Mới đây';
    const navigate = useNavigate();
    
    return (
        <div className={styles.infoContainer}>
            {(post.occasion || post.styleTag) && (
                <div className={styles.rightTagsSection}>
                    {post.occasion && <span className={styles.tagOccasion} onClick={() => navigate(`/explore?occasion=${encodeURIComponent(post.occasion)}`)}>{post.occasion}</span>}
                    {post.styleTag && <span className={styles.tagStyle} onClick={() => navigate(`/explore?style=${encodeURIComponent(post.styleTag)}`)}>{post.styleTag}</span>}
                </div>
            )}
            <div className={styles.header}>
                <div className={styles.userProfile}>
                    <Link to={`/profile/${user?.id}`}>
                        <img src={user?.avatarUrl || defaultAvatar} alt={user?.displayName} />
                    </Link>
                    <div className={styles.userInfo}>
                        <h5 className={styles.userName}>{user?.displayName}</h5>
                        <span className={styles.time}>{fromNow}</span>
                    </div>
                    
                </div>
                {onToggleFollow &&(
                    <button className={`${styles.followBtn} ${isFollowed ? styles.followed : ''}`} onClick={onToggleFollow}>
                        {isFollowed ? 'Đang theo dõi' : 'Theo dõi'}
                    </button>

                )}

            </div>

            <div className={styles.mainContent}>
                <ExpandableText text={post.caption} lines={4} />
            </div>

            <div className={styles.footerActions}>
                <button className={`${styles.actionBtn} ${isLiked ? styles.liked : ''}`} onClick={onToggleLike}>
                    <Heart size={22} fill={isLiked ? 'currentColor' : 'none'} /> <span>{likeCount}</span>
                </button>
                <button className={styles.actionBtn} onClick={onCommentClick}>
                    <MessageCircle size={22} /> <span>{commentCount}</span>
                </button>
                <button className={`${styles.actionBtn} ${isSaved ? styles.saved : ''}`} onClick={onToggleSave}>
                    <Bookmark size={22} fill={isSaved ? 'currentColor' : 'none'} /> <span>{saveCount}</span>
                </button>
            </div>
        </div>
    );
}