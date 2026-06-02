import styles from './Home.module.css';
import PostCardInteractive from '../../components/Post/PostCard/PostCardInteractive.jsx';
import EditorialCardInteractive from '../../components/Post/EditorialCard/EditorialCardInteractive.jsx';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '../../supabaseClient.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Dot, ChevronRight, ChevronLeft } from 'lucide-react';

import { useFollow } from '../../hooks/useFollow';

const TRENDING_TABS = [
    { key: 'trending', label: 'Đang xu hướng' },
    { key: 'mustSave', label: 'Bộ sưu tập' },
    { key: 'discussed', label: 'Nhiều người thảo luận' }
];

export default function Home() {
    const { user } = useAuth();
    
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeTrendingTab, setActiveTrendingTab] = useState('trending');

    const { isFollowed, handleToggleFollow } = useFollow(user);

    const carouselTrackRef = useRef(null);

    const scroll = (direction) => {
        if (carouselTrackRef.current) {
            carouselTrackRef.current.scrollBy({ left: direction === 'left' ? -340 : 340, behavior: 'smooth' });
        }
    };

    const topLikedPosts = useMemo(() =>
        [...posts].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)).slice(0, 10),
    [posts]);

    const topSavedPosts = useMemo(() =>
        [...posts].sort((a, b) => (b.saves?.length || 0) - (a.saves?.length || 0)).slice(0, 10),
    [posts]);

    const topCommentedPosts = useMemo(() =>
        [...posts].sort((a, b) => {
            const countA = a.comments?.[0]?.count || 0;
            const countB = b.comments?.[0]?.count || 0;
            return countB - countA;
        }).slice(0, 10),
    [posts]);

    const currentCarouselData = useMemo(() => {
        if (activeTrendingTab === 'mustSave') return topSavedPosts;
        if (activeTrendingTab === 'discussed') return topCommentedPosts;
        return topLikedPosts; 
    }, [activeTrendingTab, topLikedPosts, topSavedPosts, topCommentedPosts]);

    const fetchData = useCallback(async () => {
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
                    comments:Comments(count)
                `)
                .order('createdAt', { ascending: false });

            if (error) throw error;
            setPosts(data || []);
        } catch (err) {
            console.error('Network Error:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    
    return (
        <div className={styles.pageWrapper}>
            {loading && posts.length === 0 ? (
                <div className={styles.loadingWrapper}>
                    <div className={styles.loadingDots}>
                        {[1, 2, 3].map(i => <Dot key={i} size={37} strokeWidth={2.5} color={'currentColor'} className={styles.dot} />)}
                    </div>
                    <p>Đang tải trang...</p>
                </div>
            ) : (
                <div className={styles.mainContent}>
                    
                    <div className={styles.trendingContainer}>
                        <div className={styles.trendingTabBar}>
                            {TRENDING_TABS.map(tab => (
                                <button
                                    key={tab.key}
                                    className={`${styles.trendingTabBtn} ${activeTrendingTab === tab.key ? styles.trendingTabActive : ''}`}
                                    onClick={() => {
                                        setActiveTrendingTab(tab.key);
                                        if (carouselTrackRef.current) carouselTrackRef.current.scrollLeft = 0;
                                    }}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {currentCarouselData.length > 0 && (
                            <section className={styles.carouselSection}>
                                <div className={styles.carouselContainer}>
                                    <button className={styles.carouselNavBtn} onClick={() => scroll('left')}><ChevronLeft /></button>
                                    <div className={styles.carouselTrack} ref={carouselTrackRef}>
                                        {currentCarouselData.map(post => (
                                            <div className={`${styles.carouselItem} trendingZone`} key={`${activeTrendingTab}-${post.id}`}>
                                                <EditorialCardInteractive 
                                                    post={post}
                                                    user={post.author}
                                                    isFollowed={isFollowed(post.userId)}
                                                    onToggleFollow={() => handleToggleFollow(post.userId)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <button className={styles.carouselNavBtn} onClick={() => scroll('right')}><ChevronRight /></button>
                                </div>
                            </section>
                        )}
                    </div>

                    <div className={styles.feedSection}>
                        <h1 className={styles.feedTitle}>Recent Posts</h1>
                        <div className={styles.feedGrid}>
                            {posts.map(post => (
                                <PostCardInteractive
                                    key={`main-${post.id}`}
                                    post={post}
                                    user={post.author}
                                    productTags={post.tags}
                                    isFollowed={isFollowed(post.userId)}
                                    onToggleFollow={() => handleToggleFollow(post.userId)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}