import { Send } from 'lucide-react';
import defaultAvatar from '../../../assets/images/avatar.jpg';
import styles from './CommentSection.module.css';
import { useEffect } from 'react';

export default function CommentInput({ 
    user, 
    commentText, 
    setCommentText, 
    handleSubmitComment, 
    isSubmitting, 
    commentInputRef 
}) {
    
    useEffect(() => {
        if (!commentText && commentInputRef.current) {
            commentInputRef.current.style.height = 'auto';
        }
    }, [commentText]);

    return (
        <div className={styles.myCommentWrapper}>
            <img
                src={
                        (user?.avatarUrl || user?.user_metadata?.avatar_url || user?.user_metadata?.avatarUrl)
                            ? `${user.avatarUrl || user.user_metadata.avatar_url || user.user_metadata.avatarUrl}?t=${new Date().getTime()}`
                            : defaultAvatar
                    }
                alt={user?.displayName}
                className={styles.myCommentAvatar}
            />
            <textarea
                className={styles.myCommentInput}
                ref={commentInputRef}
                placeholder="Nhập bình luận..."
                value={commentText}
                onChange={e => {
                    e.target.style.height = 'auto';
                    const lineHeight = 1.5 * 14; 
                    const maxHeight = lineHeight * 4 + 20; 
                    const newHeight = Math.min(e.target.scrollHeight, maxHeight);
                    e.target.style.height = newHeight + 'px';
                    e.target.style.overflowY = e.target.scrollHeight > maxHeight ? 'auto' : 'hidden';
                    setCommentText(e.target.value);
                }}
                onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmitComment();
                    }
                }}
                disabled={isSubmitting}
                rows={1}
            />
            <button
                className={styles.myCommentSubmit}
                onClick={handleSubmitComment}
                disabled={isSubmitting || !commentText.trim()}
            >
                <Send size={28} strokeWidth={2} />
            </button>
        </div>
    );
}