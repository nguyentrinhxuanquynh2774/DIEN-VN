import { useState, useEffect } from 'react';
import { toggleInteraction } from '../services/interactionService'; 
import { useAuth } from '../context/AuthContext'; 

export function usePostInteraction(post, currentUser) {
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [saveCount, setSaveCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);
    
    const { setShowAuthModal } = useAuth(); 

    useEffect(() => {
        if (!post) return;

        setLikeCount(post.likes?.length ?? post.like_count ?? 0);
        setSaveCount(post.saves?.length ?? post.save_count ?? 0);

        let totalComments = 0;
        if (typeof post.comment_count === 'number') {
            totalComments = post.comment_count;
        } else if (Array.isArray(post.comments)) {
            if (post.comments[0]?.count !== undefined) {
                totalComments = post.comments[0].count; 
            } else {
                const mainCommentsCount = post.comments.filter(c => !c.parentId).length;
                const repliesCount = post.comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0);
                totalComments = mainCommentsCount + repliesCount;
            }
        }
        setCommentCount(totalComments);

        setIsLiked(post.likes?.some(l => l.userId === currentUser?.id) || false);
        setIsSaved(post.saves?.some(s => s.userId === currentUser?.id) || false);
    }, [post, currentUser]);

    const handleToggleAction = async (targetId, type) => {
        if (!currentUser) {
            setShowAuthModal(true);
            return;
        }

        const isActive = type === 'Likes' ? isLiked : isSaved;
        const setActive = type === 'Likes' ? setIsLiked : setIsSaved;
        const setCount = type === 'Likes' ? setLikeCount : setSaveCount;

        try {
            const newState = await toggleInteraction(type, targetId, currentUser.id, isActive);
            
            setActive(newState);
            setCount(prev => newState ? prev + 1 : Math.max(prev - 1, 0));
        } catch (err) {
            console.error(`Lỗi tương tác ${type}:`, err.message);
        }
    };

    return {
        isLiked, isSaved, likeCount, saveCount, commentCount,
        setCommentCount, handleToggleAction
    };
}