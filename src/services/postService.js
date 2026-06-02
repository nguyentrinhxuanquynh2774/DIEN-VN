import { supabase } from '../supabaseClient';

const POST_FIELDS = `
    id, imageUrl, caption, styleTag, occasion, createdAt, userId, 
      Users!Posts_userId_fkey(id, displayName, avatarUrl),
      likes:Likes(userId),  
        saves:Saves(userId),   
        comments:Comments(count),
         tags:ProductTags(id, name)
`;

const POST_IMAGES_BUCKET = 'post-images';

export const getPostsByUser = async (userId) => {
    const { data, error } = await supabase
        .from('Posts')
        .select(POST_FIELDS)
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

    if (error) throw error;
        console.log('post[0].tags =', data?.[0]?.tags); 

    return data;
};

export const getLikedPostsByUser = async (userId) => {
    const { data, error } = await supabase
        .from('Likes')
        .select(`createdAt, Posts(${POST_FIELDS})`)
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

    if (error) throw error;
    return data.map(row => row.Posts).filter(Boolean);
};

export const getSavedPostsByUser = async (userId) => {
    const { data, error } = await supabase
        .from('Saves')
        .select(`createdAt, Posts(${POST_FIELDS})`)
        .eq('userId', userId)
        .order('createdAt', { ascending: false });

    if (error) throw error;
    return data.map(row => row.Posts).filter(Boolean);
};

export const getUserStats = async (userId) => {
    const { data, error } = await supabase
        .from('Posts')
        .select('id, Likes(count), Saves(count)')
        .eq('userId', userId);

    if (error) throw error;

    const totalLikes = data.reduce((sum, post) => sum + (post.Likes?.[0]?.count ?? 0), 0);
    const totalSaves = data.reduce((sum, post) => sum + (post.Saves?.[0]?.count ?? 0), 0);
    const totalPosts = data.length;

    return { totalPosts, totalLikes, totalSaves };
};

const uploadPostImage = async (userId, file) => {
    const ext      = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${ext}`;
 
    const { error: uploadError } = await supabase.storage
        .from(POST_IMAGES_BUCKET)
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
        });
 
    if (uploadError) throw new Error('Upload ảnh thất bại: ' + uploadError.message);
 
    const { data } = supabase.storage
        .from(POST_IMAGES_BUCKET)
        .getPublicUrl(fileName);
 
    return data.publicUrl;
}
 


export const createPost = async(userId, imageFile, { caption, styleTag, occasion, productTags = [] }) => {
    const imageUrl = await uploadPostImage(userId, imageFile);
    const { data: post, error: postError } = await supabase
        .from('Posts')
        .insert({
            userId,
            imageUrl,
            caption,
            styleTag,
            occasion,
            createdAt: new Date().toISOString(),
        })
        .select()    
        .single();
 
    if (postError) throw new Error('Tạo bài đăng thất bại: ' + postError.message);
 
    if (productTags.length > 0) {
        const tagRows = productTags.map(name => ({ postId: post.id, name }));
        const { error: tagError } = await supabase
            .from('ProductTags')
            .insert(tagRows);
 
        if (tagError) {
            console.warn('Lưu product tags thất bại:', tagError.message);
        }
    }
 
    return post;
}
 
export const logStyleTagSuggestion = async (userId, suggestion) => {
    if (!suggestion?.trim()) return;
    const { error } = await supabase
        .from('StyleTagSuggestions')
        .insert({
            userId,
            suggestion: suggestion.trim(),
            createdAt:  new Date().toISOString(),
        });
    if (error) console.warn('logStyleTagSuggestion failed:', error.message);
}
 
export const deletePost = async (postId, userId) => {

    const { error } = await supabase
        .from('Posts')
        .delete()
        .eq('id', postId)
        .eq('userId', userId); 
 
    if (error) throw new Error('Xoá bài thất bại: ' + error.message);
}
export const updatePost = async (postId, userId, { caption, styleTag, occasion, productTags }) => {
    const { data, error: postError } = await supabase
        .from('Posts')
        .update({ caption, styleTag, occasion })
        .eq('id', postId)
        .eq('userId', userId)
        .select();

    if (postError) throw new Error('Cập nhật thất bại: ' + postError.message);

    const post = data?.[0];
    if (!post) throw new Error('Không tìm thấy bài viết để cập nhật');

    if (productTags !== undefined) {
        
        if (productTags.length > 0) {
            const cleanTagsString = productTags.map(t => `'${t.trim()}'`).join(',');

            const { error: clearError } = await supabase
                .from('ProductTags')
                .delete()
                .eq('postId', postId)
                .not('name', 'in', `(${cleanTagsString})`); 
                
            if (clearError) throw new Error('Dọn dẹp tags cũ thất bại: ' + clearError.message);
        } else {
            await supabase.from('ProductTags').delete().eq('postId', postId);
        }

        if (productTags.length > 0) {
            const tagRows = productTags.map(name => ({ postId, name }));
            
            const { error: tagError } = await supabase
                .from('ProductTags')
                .upsert(tagRows, { onConflict: 'postId,name', ignoreDuplicates: true }); 

            if (tagError) {
                console.warn('Cập nhật tags mới thất bại:', tagError.message);
                throw new Error('Thêm tags mới thất bại: ' + tagError.message);
            }
        }
    }

    return post;
};