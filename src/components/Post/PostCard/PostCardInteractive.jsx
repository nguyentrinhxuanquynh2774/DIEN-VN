import PostCard from './PostCard';
import { usePostInteraction } from '../../../hooks/usePostInteraction';
import { useAuth } from '../../../context/AuthContext';

export default function PostCardInteractive({ post, user, isFollowed, onToggleFollow, ...props }) {
    const { user: currentUser, setShowAuthModal } = useAuth();
    
    const {
        isLiked, isSaved,
        likeCount, saveCount, commentCount,
        handleToggleAction
    } = usePostInteraction(post, currentUser);
   
    const isMyPost = currentUser?.id === user?.id;


    return (
        <PostCard
            post={post}
            user={user}
            isLiked={isLiked}
            isSaved={isSaved}
            likeCount={likeCount}
            saveCount={saveCount}
            commentCount={commentCount}
            isFollowed={isFollowed}
            onToggleLike={() => handleToggleAction(post.id, 'Likes')}
            onToggleSave={() => handleToggleAction(post.id, 'Saves')}
            onToggleFollow={isMyPost ? null : onToggleFollow}
            {...props}
        />
    );
}