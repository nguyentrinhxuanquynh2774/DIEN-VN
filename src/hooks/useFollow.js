import { useState, useEffect, useCallback } from 'react';
import { getFollowingIds, toggleFollow } from '../services/followService';
import { useAuth } from '../context/AuthContext';

export const useFollow = (currentUser, initialIds = null) => {
    const [followedIds, setFollowedIds] = useState(initialIds ?? []);
    const [loading, setLoading] = useState(false);
    
    const { setShowAuthModal } = useAuth(); 

    useEffect(() => {
        if (!currentUser?.id || initialIds !== null) return;

        const fetchIds = async () => {
            setLoading(true);
            try {
                const ids = await getFollowingIds(currentUser.id);
                setFollowedIds(ids);
            } catch (err) {
                console.error('Lỗi tải danh sách follow:', err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchIds();
    }, [currentUser?.id]);

    useEffect(() => {
        if (initialIds !== null) setFollowedIds(initialIds);
    }, [initialIds]);

    const handleToggleFollow = useCallback(async (targetId) => {
        if (!currentUser) {
            setShowAuthModal(true);
            return;
        }
        if (currentUser.id === targetId) return; 

        setFollowedIds(prev =>
            prev.includes(targetId)
                ? prev.filter(id => id !== targetId)
                : [...prev, targetId]
        );

        try {
            await toggleFollow(currentUser.id, targetId);
        } catch (err) {
            console.error('Lỗi toggle follow:', err.message);
            setFollowedIds(prev =>
                prev.includes(targetId)
                    ? prev.filter(id => id !== targetId)
                    : [...prev, targetId]
            );
        }
    }, [currentUser, setShowAuthModal]); 

    const isFollowed = useCallback(
        (targetId) => followedIds.includes(targetId),
        [followedIds]
    );

    return { followedIds, setFollowedIds, isFollowed, handleToggleFollow, loading };
};