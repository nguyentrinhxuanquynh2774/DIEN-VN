import { supabase } from '../supabaseClient';

export const updateProfileImage = async (userId, file, type) => {
    try {
        const bucketName = 'Users';
        const fileExt = file.name.split('.').pop();
        
        const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(fileName, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);

        const dbColumnMap = { avatarUrl: 'avatarUrl', coverUrl: 'coverUrl' };
        const targetColumn = dbColumnMap[type] || type;

        const { error: dbError } = await supabase
            .from('Users')
            .update({ [targetColumn]: publicUrl })
            .eq('id', userId);

        if (dbError) throw dbError;

        const authKeyMap = { avatarUrl: 'avatar_url', coverUrl: 'cover_url' };
        const authKey = authKeyMap[type] || type;

        const { error: authError } = await supabase.auth.updateUser({
            data: { [authKey]: publicUrl }
        });

        if (authError) throw authError;

        return publicUrl;
    } catch (error) {
        console.error(`Lỗi dịch vụ cập nhật ${type}:`, error.message);
        throw error;
    }
};