import PostDetailInfo from './PostDetailInfo';
import { usePostInteraction } from '../../../hooks/usePostInteraction';
import { useAuth } from '../../../context/AuthContext';

export default function PostDetailInfoInteractive({ post, user, productTags, isFollowed, onToggleFollow, onCommentClick }) {
    const { user: currentUser } = useAuth();
    const { isLiked, isSaved, likeCount, saveCount, commentCount, handleToggleAction } = usePostInteraction(post, currentUser);
    const isMyPost = currentUser?.id === user?.id;
   
    return (
        <PostDetailInfo
            post={post}
            user={user}
            productTags={productTags}
            isLiked={isLiked}
            isSaved={isSaved}
            likeCount={likeCount}
            saveCount={saveCount}
            commentCount={commentCount}
            isFollowed={isFollowed}
            onToggleLike={() => handleToggleAction(post.id, 'Likes')}
            onToggleSave={() => handleToggleAction(post.id, 'Saves')}
            onToggleFollow={isMyPost ? null : onToggleFollow}
            onCommentClick={onCommentClick}
        />
    );
}