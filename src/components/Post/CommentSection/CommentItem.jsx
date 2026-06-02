import ExpandableText from '../../Common/ExpandableText/ExpandableText.jsx';
import defaultAvatar from '../../../assets/images/avatar.jpg';
import { ChevronRight } from 'lucide-react';
import styles from './CommentSection.module.css';
import { useAuth } from '../../../context/AuthContext.jsx'; 

export default function CommentItem({ comment, isAuthor, formatRelativeTime, setReplyingTo, commentInputRef }) {
    
    const { user: currentUser } = useAuth();

    const isMyComment = currentUser?.id === comment.user?.id;

    const mainAvatar = isMyComment 
        ? (currentUser?.avatarUrl || currentUser?.user_metadata?.avatar_url || currentUser?.user_metadata?.avatarUrl || defaultAvatar)
        : (comment.user?.avatarUrl || defaultAvatar);

    return (
        <div className={`${styles.commentItem} ${isAuthor ? styles.commentItemAuthor : ''}`}>
            
            <img
                src={mainAvatar}
                alt="Avatar"
                className={styles.commentAvatar}
            />
            
            <div className={styles.commentInfo}>
                <div className={styles.commentHeader}>
                    <span className={styles.commentName}>
                        {comment.user?.displayName || 'Người dùng chưa đặt tên'}
                    </span>
                    {isAuthor && (
                        <span className={styles.authorBadge}>Tác giả</span>
                    )}
                </div>

                <div className={styles.commentContent}>
                    <ExpandableText text={comment.content} lines={3} className={styles.commentText} />
                    <div className={styles.commentFooter}>
                        <button
                            className={styles.replyBtn}
                            onClick={() => {
                                setReplyingTo({ id: comment.id, displayName: comment.user?.displayName });
                                commentInputRef.current?.focus();
                            }}
                        >
                            Reply
                        </button>
                        <span className={styles.commentTime}>
                            {formatRelativeTime(comment.createdAt)}
                        </span>
                    </div>
                </div>

                {comment.replies?.map(reply => {
                    const isMyReply = currentUser?.id === reply.user?.id;
                    const replyAvatar = isMyReply 
                        ? (currentUser?.avatarUrl || defaultAvatar) 
                        : (reply.user?.avatarUrl || defaultAvatar);

                    return (
                        <div key={reply.id} className={styles.replyItem}>
                            
                            <img
                                src={replyAvatar}
                                alt="Reply Avatar"
                                className={styles.replyAvatar}
                            />
                            
                            <div className={styles.commentInfo}>
                                <div className={styles.commentHeader}>
                                    <span className={styles.commentName}>
                                        {reply.user?.displayName || 'Người dùng chưa đặt tên'}
                                    </span>
                                    <span className={styles.replyTo}>
                                        <ChevronRight size={16} strokeWidth={1.5} color="currentColor" />
                                        {comment.user?.displayName}
                                    </span>
                                </div>
                                <div className={styles.commentContent}>
                                    <ExpandableText text={reply.content} lines={3} className={styles.commentText} />
                                    <span className={styles.commentTime}>
                                        {formatRelativeTime(reply.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}