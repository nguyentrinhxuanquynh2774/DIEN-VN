import styles from './Detail.module.css';
import  PostDetailInfoInteractive from '../../components/Post/PostDetailInfo/PostDetailInfoInteractive.jsx';
import ExpandableText from '../../components/Common/ExpandableText/ExpandableText.jsx';
import { useParams, useLocation } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import PostCard from '../../components/Post/PostCard/PostCard';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFollow } from '../../hooks/useFollow';
import { Send } from 'lucide-react';
import defaultAvatar from '../../assets/images/avatar.jpg';
import CommentSection from '../../components/Post/CommentSection/CommentSection.jsx';

const formatRelativeTime = (dateString) => {
    if (!dateString) return '';
    const now = new Date();
    const past = new Date(dateString);
    const diffInMs = now - past;

    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return 'Vừa xong';
    if (diffInMins < 60) return `${diffInMins} phút trước`;
    if (diffInHours < 24) return `${diffInHours} giờ trước`;
    if (diffInDays < 7) return `${diffInDays} ngày trước`;
    return past.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

export default function Detail() {
    const { id } = useParams();
    const { user, setShowAuthModal } = useAuth();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const commentInputRef = useRef(null);

    const { isFollowed, handleToggleFollow } = useFollow(user);

    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);

    const fetchPostDetail = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('Posts')
                .select(`
                    *,
                    author:userId(*),
                    tags:ProductTags(*),
                    likes:Likes(userId),
                    saves:Saves(userId),
                    comments:Comments(*, user:userId(id, displayName, avatarUrl))
                `)
                .eq('id', id)
                .single();

            if (error) throw error;

            const allComments = data.comments || [];
            const rootComments = allComments
                .filter(c => !c.parentId)
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .map(c => ({
                    ...c,
                    replies: allComments
                        .filter(r => r.parentId === c.id)
                        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
                }));

            setPost({ ...data, comments: rootComments });
        } catch (err) {
            console.error(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComment = async () => {
        if (!user) {
            setShowAuthModal(true); 
            return;
        }
        if (!commentText.trim()) return;

        const isReply = !!replyingTo;

        const optimisticComment = {
            id: `temp-${Date.now()}`,
            content: commentText.trim(),
            user: { displayName: user.displayName, avatarUrl: user.avatarUrl },
            userId: user.id,
            postId: post.id,
            parentId: replyingTo?.id || null,
            created_at: new Date().toISOString(),
            replies: [],
        };

        if (isReply) {
            setPost(prev => ({
                ...prev,
                comments: prev.comments.map(c =>
                    c.id === replyingTo.id
                        ? { ...c, replies: [...(c.replies || []), optimisticComment] }
                        : c
                ),
            }));
        } else {
            setPost(prev => ({
                ...prev,
                comments: [optimisticComment, ...(prev.comments || [])],
            }));
        }

        setCommentText('');
        setReplyingTo(null);
        setIsSubmitting(true);

        try {
            const { data, error } = await supabase
                .from('Comments')
                .insert({
                    content: optimisticComment.content,
                    userId: user.id,
                    postId: post.id,
                    parentId: optimisticComment.parentId,
                })
                .select('*, user:userId(displayName, avatarUrl)')
                .single();

            if (error) throw error;

            if (isReply) {
                setPost(prev => ({
                    ...prev,
                    comments: prev.comments.map(c =>
                        c.id === replyingTo.id
                            ? { ...c, replies: c.replies.map(r => r.id === optimisticComment.id ? data : r) }
                            : c
                    ),
                }));
            } else {
                setPost(prev => ({
                    ...prev,
                    comments: prev.comments.map(c =>
                        c.id === optimisticComment.id ? { ...data, replies: [] } : c
                    ),
                }));
            }
        } catch (err) {
            console.error(err);
            if (isReply) {
                setPost(prev => ({
                    ...prev,
                    comments: prev.comments.map(c =>
                        c.id === replyingTo?.id
                            ? { ...c, replies: c.replies.filter(r => r.id !== optimisticComment.id) }
                            : c
                    ),
                }));
            } else {
                setPost(prev => ({
                    ...prev,
                    comments: prev.comments.filter(c => c.id !== optimisticComment.id),
                }));
            }
            setCommentText(optimisticComment.content);
            alert('Gửi thất bại, vui lòng thử lại!');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (id) fetchPostDetail();
    }, [id]);

    useEffect(() => {
        if (loading) return;
        if (location.hash === '#comments') {
            commentInputRef.current?.scrollIntoView({ behavior: 'smooth' });
            commentInputRef.current?.focus();
        }
    }, [loading, location.hash]);

    if (loading) return <div className={styles.loading}>Đang tải bài viết...</div>;
    if (!post) return <div className={styles.error}>Không tìm thấy bài viết!</div>;

    return (
        <div className={styles.container}>
           
            <div className={styles.contentWrapper}>
                <div className={styles.contentwrapperLeft}>                  
                    <img src={post.imageUrl} className={styles.postImage} />           
                </div>

                <div className={styles.contentwrapperRight}>
                    <div className={styles.postSection}>
                        <PostDetailInfoInteractive
                            post={post}
                            user={post.author}
                            isFollowed={isFollowed(post.userId)}
                            onToggleFollow={() => handleToggleFollow(post.userId)}
                            onCommentClick={() => commentInputRef.current?.focus()} 
                        />
                    </div>

                    <CommentSection
                    postAuthorId={post.userId}
                    comments={post.comments}
                    user={user}
                    replyingTo={replyingTo}
                    setReplyingTo={setReplyingTo}
                    commentText={commentText}
                    setCommentText={setCommentText}
                    isSubmitting={isSubmitting}
                    handleSubmitComment={handleSubmitComment}
                    commentInputRef={commentInputRef}
                    formatRelativeTime={formatRelativeTime}
                    />
                </div>
            </div>
            <div className={styles.productTagsSection}>
                        <h3>Chi tiết sản phẩm</h3>
                        <div className={ styles.tagList}>
                            {post.tags && post.tags.length > 0 ? (
                                post.tags.map(tag => (
                                    <span key={tag.id} className={styles.productTagItem}>
                                        {tag.name}
                                    </span>
                                ))
                            ) : (
                                <span className={styles.noTags}>Sản phẩm này chưa cập nhật thông tin.</span>
                            )}
                        </div>
            </div>
        </div>
    );
}