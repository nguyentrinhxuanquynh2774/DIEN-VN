import React, { useMemo } from 'react';
import CommentItem from './CommentItem';
import CommentInput from './CommentInput';
import styles from './CommentSection.module.css';

export default function CommentSection({
    comments = [],
    postAuthorId,           
    user,
    replyingTo,
    setReplyingTo,
    commentText,
    setCommentText,
    isSubmitting,
    handleSubmitComment,
    commentInputRef,
    formatRelativeTime
}) {
    const sorted = useMemo(() => {
        return [...comments].sort((a, b) => {
            const aIsAuthor = a.user?.id === postAuthorId;
            const bIsAuthor = b.user?.id === postAuthorId;
            if (aIsAuthor !== bIsAuthor) return aIsAuthor ? -1 : 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }, [comments, postAuthorId]);

    return (
        <div className={styles.commentSection}>
            <h3 className={styles.commentSectionHeading}>Bình luận</h3>

            {replyingTo && (
                <div className={styles.replyingBadge}>
                    Đang reply <strong>@{replyingTo.displayName}</strong>
                    <button onClick={() => setReplyingTo(null)}>✕</button>
                </div>
            )}

            <div className={styles.otherCommentWrapper}>
                {sorted.length === 0 ? (
                    <div className={styles.emptyComment}>
                        <p>Chưa có bình luận nào</p>
                        <span>Bạn nghĩ sao về bài viết này?</span>
                    </div>
                ) : (
                    sorted.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            isAuthor={comment.user?.id === postAuthorId}
                            formatRelativeTime={formatRelativeTime}
                            setReplyingTo={setReplyingTo}
                            commentInputRef={commentInputRef}
                        />
                    ))
                )}
            </div>

            <CommentInput
                user={user}
                commentText={commentText}
                setCommentText={setCommentText}
                handleSubmitComment={handleSubmitComment}
                isSubmitting={isSubmitting}
                commentInputRef={commentInputRef}
            />
        </div>
    );
}