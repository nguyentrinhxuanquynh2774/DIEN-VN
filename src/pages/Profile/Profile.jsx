import styles from './Profile.module.css';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateProfileImage } from '../../services/userService';
import defaultAvatar from '../../assets/images/avatar.jpg';
import defaultCover from '../../assets/images/cover.jpg';
import {
    getPostsByUser,
    getLikedPostsByUser,
    getSavedPostsByUser,
    getUserStats,
    deletePost,
    updatePost,
} from '../../services/postService';
import EditorialCardInteractive from '../../components/Post/EditorialCard/EditorialCardInteractive';
import CreatePostModal from '../../components/Post/CreatePost/CreatePostModal';
import EditPostModal from '../../components/Post/EditPost/EditPostModal';
import { supabase } from '../../supabaseClient';
import { useFollow } from '../../hooks/useFollow';
import { SquarePen, Plus } from 'lucide-react';

const TABS_OWNER = [
    { key: 'posts', label: 'Bài đăng' },
    { key: 'liked', label: 'Yêu thích' },
    { key: 'saved', label: 'Đã lưu' },
];

const TABS_VIEWER = [
    { key: 'posts', label: 'Bài đăng' },
];

const fetcherByTab = {
    posts: getPostsByUser,
    liked: getLikedPostsByUser,
    saved: getSavedPostsByUser,
};

export default function Profile() {
    const { userId } = useParams();
    const { user: authUser, setUser } = useAuth();
    const isOwner = authUser?.id === userId;

    const [profileUser, setProfileUser] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);
    const [uploadLoading, setUploadLoading] = useState(null);

    const [stats, setStats] = useState({ totalPosts: 0, totalLikes: 0, totalSaves: 0 });
    const [statsLoading, setStatsLoading] = useState(true);

    const TABS = isOwner ? TABS_OWNER : TABS_VIEWER;
    const [activeTab, setActiveTab] = useState('posts');
    const [tabData, setTabData]     = useState({ posts: [], liked: [], saved: [] });
    const [tabLoading, setTabLoading] = useState({ posts: false, liked: false, saved: false });
    const [tabError, setTabError]   = useState({ posts: null, liked: null, saved: null });
    const [fetched, setFetched]     = useState({ posts: false, liked: false, saved: false });

    const { isFollowed, handleToggleFollow } = useFollow(authUser);

    const [showCreate, setShowCreate] = useState(false);
    const [editingPost, setEditingPost] = useState(null);

    useEffect(() => {
        setActiveTab('posts');
        setTabData({ posts: [], liked: [], saved: [] });
        setFetched({ posts: false, liked: false, saved: false });
        setStats({ totalPosts: 0, totalLikes: 0, totalSaves: 0 });
    }, [userId]);

    useEffect(() => {
        if (!userId) return;
        const fetchProfile = async () => {
            setProfileLoading(true);
            try {
                const { data, error } = await supabase
                    .from('Users')
                    .select('id, userName, displayName, avatarUrl, coverUrl')
                    .eq('id', userId)
                    .single();
                if (error) throw error;
                setProfileUser(data);
            } catch (err) {
                console.error('Lỗi tải profile từ Database:', err.message);
                if (isOwner) setProfileUser(authUser);
            } finally {
                setProfileLoading(false);
            }
        };
        fetchProfile();
    }, [userId]);

    useEffect(() => {
        if (!userId) return;
        const loadStats = async () => {
            setStatsLoading(true);
            try {
                const data = await getUserStats(userId);
                setStats(data);
            } catch (err) {
                console.error('Lỗi tải stats:', err.message);
            } finally {
                setStatsLoading(false);
            }
        };
        loadStats();
    }, [userId]);

    useEffect(() => {
        if (!userId || fetched[activeTab]) return;
        const load = async () => {
            setTabLoading(prev => ({ ...prev, [activeTab]: true }));
            setTabError(prev => ({ ...prev, [activeTab]: null }));
            try {
                const data = await fetcherByTab[activeTab](userId);
                setTabData(prev => ({ ...prev, [activeTab]: data }));
                setFetched(prev => ({ ...prev, [activeTab]: true }));
            } catch (err) {
                setTabError(prev => ({ ...prev, [activeTab]: err.message }));
            } finally {
                setTabLoading(prev => ({ ...prev, [activeTab]: false }));
            }
        };
        load();
    }, [activeTab, userId, fetched]);

    const handleUpload = async (e, type) => {
        const file = e.target.files[0];
        if (!file || !authUser) return;
        setUploadLoading(type);
        try {
            const newUrl = await updateProfileImage(authUser.id, file, type);
            setUser(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    [type]: newUrl,
                    user_metadata: {
                        ...prev.user_metadata,
                        avatar_url: type === 'avatarUrl' ? newUrl : prev.user_metadata?.avatar_url,
                        cover_url:  type === 'coverUrl'  ? newUrl : prev.user_metadata?.cover_url,
                        avatarUrl:  type === 'avatarUrl' ? newUrl : prev.user_metadata?.avatarUrl,
                        coverUrl:   type === 'coverUrl'  ? newUrl : prev.user_metadata?.coverUrl,
                    }
                };
            });
            setProfileUser(prev => prev ? { ...prev, [type]: newUrl } : prev);
            alert('Cập nhật thành công!');
        } catch (err) {
            alert('Lỗi: ' + err.message);
        } finally {
            setUploadLoading(null);
        }
    };

    const handlePostCreated = () => {
        setShowCreate(false);
        setFetched(prev => ({ ...prev, posts: false }));
    };

    const handleDeletePost = async (postId) => {
        if (!window.confirm('Bạn có chắc muốn xóa bài viết này không?')) return;
        try {
            await deletePost(postId, authUser.id);
            setTabData(prev => ({
                ...prev,
                posts: prev.posts.filter(p => p.id !== postId),
            }));
            setStats(prev => ({ ...prev, totalPosts: Math.max(0, prev.totalPosts - 1) }));
        } catch (err) {
            alert('Lỗi xóa bài: ' + err.message);
        }
    };

    const handleEditSuccess = (updatedPost) => {
        setTabData(prev => ({
            ...prev,
            posts: prev.posts.map(p =>
                p.id === updatedPost.id ? { ...p, ...updatedPost } : p
            ),
        }));
        setEditingPost(null);
    };

    const currentPosts = tabData[activeTab];
    const isLoading    = tabLoading[activeTab];
    const currentError = tabError[activeTab];

    if (profileLoading) return <p className={styles.statusText}>Đang tải trang cá nhân...</p>;
    if (!profileUser)   return <p className={styles.statusText}>Không tìm thấy người dùng này.</p>;

    return (
        <div className={styles.container}>
            <div className={styles.contentWrapper}>
                <div className={styles.profileWrapper}>
                    <div className={styles.coverSection}>
                        <img
                            className={styles.coverImg}
                            src={profileUser?.coverUrl || defaultCover}
                            alt="Cover"
                        />
                        {isOwner && (
                            <>
                                <input type="file" id="cover-input" hidden
                                    onChange={(e) => handleUpload(e, 'coverUrl')} />
                                <button className={styles.editBtn}
                                    onClick={() => document.getElementById('cover-input').click()}>
                                    {uploadLoading === 'coverUrl' ? 'Đang tải...' :
                                        <SquarePen size={19} strokeWidth={2.5} />}
                                </button>
                            </>
                        )}
                    </div>

                    <div className={styles.avatarSection}>
                        <div className={styles.avatarWrapper}>
                            <img
                                className={styles.avatarImg}
                                src={profileUser?.avatarUrl || defaultAvatar}
                                alt="Avatar"
                            />
                            {isOwner && (
                                <>
                                    <input type="file" id="avatar-input" hidden
                                        onChange={(e) => handleUpload(e, 'avatarUrl')} />
                                    <button className={styles.editBtn}
                                        onClick={() => document.getElementById('avatar-input').click()}>
                                        {uploadLoading === 'avatarUrl' ? '...' :
                                            <SquarePen size={19} strokeWidth={2.5} />}
                                    </button>
                                </>
                            )}
                        </div>

                        <div className={styles.userInfo}>
                            <div className={styles.nameRow}>
                                <h2 className={styles.displayName}>
                                    {profileUser.displayName || 'Người dùng'}
                                </h2>
                                {!isOwner && (
                                    <button
                                        className={`${styles.followBtn} ${isFollowed(userId) ? styles.followed : ''}`}
                                        onClick={() => handleToggleFollow(userId)}
                                    >
                                        {isFollowed(userId) ? 'Đang theo dõi' : 'Theo dõi'}
                                    </button>
                                )}
                            </div>
                            <div className={styles.statsRow}>
                                <div className={styles.statItem}>
                                    <span className={styles.statNumber}>
                                        {statsLoading ? '—' : stats.totalPosts}
                                    </span>
                                    <span className={styles.statLabel}> Bài đăng</span>
                                </div>
                                <div className={styles.statDivider} />
                                <div className={styles.statItem}>
                                    <span className={styles.statNumber}>
                                        {statsLoading ? '—' : stats.totalLikes}
                                    </span>
                                    <span className={styles.statLabel}> Lượt thích</span>
                                </div>
                                <div className={styles.statDivider} />
                                <div className={styles.statItem}>
                                    <span className={styles.statNumber}>
                                        {statsLoading ? '—' : stats.totalSaves}
                                    </span>
                                    <span className={styles.statLabel}> Lượt lưu</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.tabContainer}>
                    <div className={styles.tabBarRow}>
                        <div className={styles.tabBar}>
                            {TABS.map(tab => (
                                <button
                                    key={tab.key}
                                    className={`${styles.tabBtn} ${activeTab === tab.key ? styles.tabActive : ''}`}
                                    onClick={() => setActiveTab(tab.key)}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {isOwner && (
                            <button
                                className={styles.createPostBtn}
                                onClick={() => setShowCreate(true)}
                            >
                                <Plus size={16} strokeWidth={2.5} />
                                Đăng bài
                            </button>
                        )}
                    </div>

                    <div className={styles.postsSection}>
                        {isLoading && <p className={styles.statusText}>Đang tải...</p>}
                        {currentError && <p className={styles.errorText}>Lỗi: {currentError}</p>}
                        {!isLoading && !currentError && currentPosts.length === 0 && (
                            <p className={styles.statusText}>
                                {activeTab === 'posts' && 'Bạn chưa có bài đăng nào.'}
                                {activeTab === 'liked' && 'Bạn chưa yêu thích bài viết nào.'}
                                {activeTab === 'saved' && 'Bạn chưa lưu bài viết nào.'}
                            </p>
                        )}
                        <div className={styles.postsList}>
                            {currentPosts.map(post => {
                                console.log("Dữ liệu một bài post nhận được ở Profile:", post);
                                return (
                                    <EditorialCardInteractive
                                        key={post.id}
                                        post={post}
                                        user={post.Users || profileUser}
                                        productTags={post.tags}
                                        isFollowed={isFollowed(post.userId)}
                                        onToggleFollow={() => handleToggleFollow(post.userId)}
                                        isOwner={isOwner}
                                        onEdit={() => setEditingPost(post)}
                                        onDelete={() => handleDeletePost(post.id)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {showCreate && (
                <CreatePostModal
                    onClose={() => setShowCreate(false)}
                    onSuccess={handlePostCreated}
                />
            )}

            {editingPost && (
                <EditPostModal
                    post={editingPost}
                    onClose={() => setEditingPost(null)}
                    onSuccess={handleEditSuccess}
                />
            )}
        </div>
    );
}