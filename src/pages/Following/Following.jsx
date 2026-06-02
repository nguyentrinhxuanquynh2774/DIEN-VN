import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../supabaseClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFollow } from '../../hooks/useFollow.js';
import { getFollowingIds } from '../../services/followService.js';
import PostCardInteractive from '../../components/Post/PostCard/PostCardInteractive.jsx';
import { UserPlus, Dot } from 'lucide-react';
import styles from './Following.module.css';

export default function Following() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { isFollowed, handleToggleFollow } = useFollow(user);

    const [posts,   setPosts]   = useState([]);
    const [loading, setLoading] = useState(true);
    const [isEmpty, setIsEmpty] = useState(false); 

    const fetchFollowingPosts = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const ids = await getFollowingIds(user.id);

            if (ids.length === 0) {
                setIsEmpty(true);
                setPosts([]);
                return;
            }

            const { data, error } = await supabase
                .from('Posts')
                .select(`
                    *,
                    author:userId(*),
                    tags:ProductTags(*),
                    likes:Likes(userId),
                    saves:Saves(userId),
                    comments:Comments(count)
                `)
                .in('userId', ids)
                .order('createdAt', { ascending: false });

            if (error) throw error;
            setIsEmpty(false);
            setPosts(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchFollowingPosts(); }, [fetchFollowingPosts]);

    return (
        <div className={styles.container}>
            <div className={styles.heading}>
                <h1>Following</h1>
                <p>Bài đăng từ những người bạn đang theo dõi</p>
            </div>

            {loading ? (
                <div className={styles.loadingWrapper}>
                    <div className={styles.loadingDots}>
                        {[1, 2, 3].map(i => (
                            <Dot key={i} size={37} strokeWidth={2.5} color="currentColor" className={styles.dot} />
                        ))}
                    </div>
                    <p>Đang tải...</p>
                </div>
            ) : isEmpty ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}><UserPlus size={48} strokeWidth={1.5} /></div>
                    <p>Bạn chưa theo dõi ai</p>
                    <span>Khám phá và theo dõi những người có style bạn thích</span>
                    <button className={styles.exploreBtn} onClick={() => navigate('/explore')}>
                        Khám phá ngay
                    </button>
                </div>
            ) : posts.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>Những người bạn follow chưa đăng bài nào</p>
                    <span>Quay lại sau nhé!</span>
                </div>
            ) : (
                <div className={styles.feedGrid}>
                    {posts.map(post => (
                        <PostCardInteractive
                            key={post.id}
                            post={post}
                            user={post.author}
                            productTags={post.tags}
                            isFollowed={isFollowed(post.userId)}
                            onToggleFollow={() => handleToggleFollow(post.userId)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}