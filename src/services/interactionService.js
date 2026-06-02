import { supabase } from '../supabaseClient';

export const toggleInteraction = async (type, targetId, userId, isActive) => {
    const idCol = 'postId';
    const userCol = 'userId';

    if (isActive) {
        const { error } = await supabase
            .from(type)
            .delete()
            .eq(userCol, userId)
            .eq(idCol, targetId);
        if (error) throw error;
        return false; 
    } else {
        const { error } = await supabase
            .from(type)
            .insert({ [userCol]: userId, [idCol]: targetId });
        if (error) throw error;
        return true;
    }
};