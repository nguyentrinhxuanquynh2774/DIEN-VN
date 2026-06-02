import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { supabase } from '../../supabaseClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useFollow } from '../../hooks/useFollow.js';
import { getFollowingIds } from '../../services/followService.js';
import EditorialCardInteractive from '../../components/Post/EditorialCard/EditorialCardInteractive.jsx';
import styles from './Explore.module.css';

const STYLE_TAGS = [
    'Bánh bèo', 'Vintage', 'Y2K', 'Streetwear',
    'Minimalist', 'Casual', 'Formal', 'Sporty',
    'Elegant', 'Bohemian', 'Old Money', 'Dark Academia',
];

const STOPWORDS = new Set([
    'mặc', 'gì', 'thì', 'là', 'của', 'cho', 'với', 'và', 'hay',
    'hoặc', 'có', 'không', 'được', 'như', 'để', 'trong', 'nào',
    'cái', 'các', 'những', 'một', 'này', 'khi', 'thế', 'sao',
    'tôi', 'mình', 'bạn', 'ơi', 'nhé', 'nha', 'vậy', 'đi',
]);

function tokenize(str) {
    return str
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .filter(t => t.length > 1 && !STOPWORDS.has(t));
}


function scorePost(post, tokens) {
    if (!tokens.length) return 1;

    const haystack = [
        post.caption,
        post.styleTag,
        post.occasion,
        post.tags?.map(t => t.name).join(' '),
        post.author?.displayName,
    ].filter(Boolean).join(' ').toLowerCase();

    const matched = tokens.filter(token => haystack.includes(token));
    return matched.length;
}

function extractOccasions(posts) {
    const set = new Set();
    posts.forEach(post => {
        if (!post.occasion) return;
        post.occasion.split(',').forEach(o => {
            const trimmed = o.trim();
            if (trimmed) set.add(trimmed);
        });
    });
    return [...set].sort();
}

function filterPosts(posts, query, styleFilter, occasionFilter) {
    const tokens = tokenize(query);

    return posts
        .map(post => {
            if (styleFilter && post.styleTag !== styleFilter) return null;
            if (occasionFilter) {
                const occasions = post.occasion?.split(',').map(o => o.trim()) || [];
                if (!occasions.includes(occasionFilter)) return null;
            }
            const score = scorePost(post, tokens);
            if (tokens.length > 0 && score === 0) return null;
            return { post, score };
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score)
        .map(({ post }) => post);
}

export default function Explore() {
    const { user } = useAuth();
    const { isFollowed, handleToggleFollow } = useFollow(user);
    const [searchParams] = useSearchParams();

    const urlQuery    = searchParams.get('q')        || '';
    const urlStyle    = searchParams.get('style')    || '';
    const urlOccasion = searchParams.get('occasion') || '';

    const [styleFilter,    setStyleFilter]    = useState(urlStyle);
    const [occasionFilter, setOccasionFilter] = useState(urlOccasion);
    const [activeTab,      setActiveTab]      = useState('explore');
    const [showFilters,    setShowFilters]    = useState(false);

    const [allPosts,       setAllPosts]       = useState([]);
    const [followingPosts, setFollowingPosts] = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [followingLoading, setFollowingLoading] = useState(false);

    useEffect(() => {
        if (urlStyle)    setStyleFilter(urlStyle);
        if (urlOccasion) setOccasionFilter(urlOccasion);
        if (urlStyle || urlOccasion) setShowFilters(true);
    }, [urlStyle, urlOccasion]);

    const allOccasions = useMemo(() => extractOccasions(allPosts), [allPosts]);

    const fetchAllPosts = useCallback(async () => {
        setLoading(true);
        try {
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
                .order('createdAt', { ascending: false });
            if (error) throw error;
            setAllPosts(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchFollowingPosts = useCallback(async () => {
        if (!user) return;
        setFollowingLoading(true);
        try {
            const ids = await getFollowingIds(user.id);
            if (ids.length === 0) { setFollowingPosts([]); return; }
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
            setFollowingPosts(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setFollowingLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchAllPosts(); }, [fetchAllPosts]);

    useEffect(() => {
        if (user) {
            fetchFollowingPosts();
        }
    }, [user, fetchFollowingPosts]);

    const filteredExplore   = useMemo(
        () => filterPosts(allPosts,      urlQuery, styleFilter, occasionFilter),
        [allPosts,      urlQuery, styleFilter, occasionFilter]
    );
    const filteredFollowing = useMemo(
        () => filterPosts(followingPosts, urlQuery, styleFilter, occasionFilter),
        [followingPosts, urlQuery, styleFilter, occasionFilter]
    );

    const currentPosts   = activeTab === 'following' ? filteredFollowing : filteredExplore;
    const currentLoading = activeTab === 'following' ? followingLoading  : loading;

    const hasFilter = urlQuery || styleFilter || occasionFilter;

    const clearFilters = () => {
        setStyleFilter('');
        setOccasionFilter('');
    };

    return (
        <div className={styles.container}>

            <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                    {!hasFilter && <h1 className={styles.pageTitle}>Khám phá</h1>}
                    {urlQuery && (
                        <span className={styles.queryBadge}>
                            🔍 "{urlQuery}"
                        </span>
                    )}
                    {(styleFilter || occasionFilter) && (
                        <button className={styles.clearFiltersBtn} onClick={clearFilters}>
                            Xoá bộ lọc ×
                        </button>
                    )}
                </div>
                <button
                    className={`${styles.filterToggleBtn} ${showFilters ? styles.filterToggleActive : ''}`}
                    onClick={() => setShowFilters(v => !v)}
                >
                    <SlidersHorizontal size={15} />
                    Bộ lọc
                    {(styleFilter || occasionFilter) && <span className={styles.filterDot} />}
                </button>
            </div>

            {showFilters && (
                <div className={styles.filterPanel}>
                    <div className={styles.filterGroup}>
                        <span className={styles.filterLabel}>Phong cách</span>
                        <div className={styles.filterChips}>
                            <button
                                className={`${styles.chip} ${!styleFilter ? styles.chipActive : ''}`}
                                onClick={() => setStyleFilter('')}
                            >Tất cả</button>
                            {STYLE_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    className={`${styles.chip} ${styleFilter === tag ? styles.chipActive : ''}`}
                                    onClick={() => setStyleFilter(p => p === tag ? '' : tag)}
                                >{tag}</button>
                            ))}
                        </div>
                    </div>

                    {allOccasions.length > 0 && (
                        <div className={styles.filterGroup}>
                            <span className={styles.filterLabel}>Dịp</span>
                            <div className={styles.filterChips}>
                                <button
                                    className={`${styles.chip} ${!occasionFilter ? styles.chipActive : ''}`}
                                    onClick={() => setOccasionFilter('')}
                                >Tất cả</button>
                                {allOccasions.map(occ => (
                                    <button
                                        key={occ}
                                        className={`${styles.chip} ${occasionFilter === occ ? styles.chipActive : ''}`}
                                        onClick={() => setOccasionFilter(p => p === occ ? '' : occ)}
                                    >{occ}</button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {hasFilter && (
                <div className={styles.tabBar}>
                    <button
                        className={`${styles.tab} ${activeTab === 'explore' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('explore')}
                    >
                        Khám phá
                        <span className={styles.tabCount}>{filteredExplore.length}</span>
                    </button>
                    <button
                        className={`${styles.tab} ${activeTab === 'following' ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab('following')}
                    >
                        Đang theo dõi
                        <span className={styles.tabCount}>{filteredFollowing.length}</span>
                    </button>
                </div>
            )}

            {currentLoading ? (
                <div className={styles.loadingState}>
                    <div className={styles.loadingDots}>
                        {[1,2,3].map(i => <span key={i} className={styles.dot} />)}
                    </div>
                </div>
            ) : currentPosts.length === 0 ? (
                <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>🔍</span>
                    <p>Không tìm thấy kết quả nào</p>
                    <span>Thử từ khoá khác hoặc bỏ bộ lọc</span>
                </div>
            ) : (
                <div className={styles.editorialGrid}>
                    {currentPosts.map(post => (
                        <EditorialCardInteractive
                            key={post.id}
                            post={post}
                            user={post.author}
                            isFollowed={isFollowed(post.userId)}
                            onToggleFollow={() => handleToggleFollow(post.userId)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}