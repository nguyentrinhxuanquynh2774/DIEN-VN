import { supabase } from '../supabaseClient';

export const getFollowingIds = async (userId) => {
    const { data, error } = await supabase
        .from('Follows')
        .select('following_id')
        .eq('follower_id', userId);

    if (error) throw error;
    return data.map(row => row.following_id);
};

export const toggleFollow = async (followerId, targetId) => {
    const { data, error: checkError } = await supabase
        .from('Follows')
        .select('follower_id')
        .eq('follower_id', followerId)
        .eq('following_id', targetId)
        .single();

    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    const isCurrentlyFollowed = !!data;

    if (isCurrentlyFollowed) {
        const { error } = await supabase
            .from('Follows')
            .delete()
            .eq('follower_id', followerId)
            .eq('following_id', targetId);
        if (error) throw error;
        return false; 
    } else {
        const { error } = await supabase
            .from('Follows')
            .insert({ follower_id: followerId, following_id: targetId });
        if (error) throw error;
        return true; 
    }
};