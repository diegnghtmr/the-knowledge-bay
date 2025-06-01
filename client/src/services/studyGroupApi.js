import axios from 'axios';
import authApi from './authApi'; // Import authApi for authenticated requests

const API_URL = '/api/studygroups';

// Helper to get current user for authoring comments (simplified)
const getCurrentUser = () => {
    try {
        const user = JSON.parse(sessionStorage.getItem("user")) || {};
        return {
            authorId: user.id || 'anonymousUser',
            authorName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Usuario Anónimo'
        };
    } catch (error) {
        console.error("Error retrieving user data:", error);
        return { authorId: 'anonymousUser', authorName: 'Usuario Anónimo' };
    }
};

export const getAllGroups = async () => {
    try {
        const response = await axios.get(API_URL);
        if (response && response.data && Array.isArray(response.data)) {
            return response.data.map(group => ({
                ...group,
                heroImage: `https://placehold.co/600x300/4A5568/FFFFFF?text=${encodeURIComponent(group.interest || 'Grupo')}`
            }));
        } else {
            console.error('API_ERROR: getAllGroups did not receive an array. Response status:', response ? response.status : 'N/A', 'Response data:', response ? response.data : 'No response object');
            return []; // Return empty array to prevent crash downstream
        }
    } catch (error) {
        console.error('API_EXCEPTION: Error in getAllGroups:', error.response ? error.response : error.message);
        return []; // Return empty array on exception
    }
};

export const getGroupById = async (groupId) => {
    try {
        const response = await axios.get(`${API_URL}/${groupId}`);
        const group = response.data;
        if (group && typeof group === 'object') { // Basic check for an object
            return {
                ...group,
                heroImage: `https://placehold.co/600x300/4A5568/FFFFFF?text=${encodeURIComponent(group.interest || 'Grupo')}`
            };
        }
        console.error('API_ERROR: getGroupById did not receive a valid object. Response data:', response ? response.data : 'No response object');
        return null; // Or throw error
    } catch (error) {
        console.error(`API_EXCEPTION: Error in getGroupById for ${groupId}:`, error.response ? error.response : error.message);
        return null; // Or throw error
    }
};

export const getPostsByGroupId = async (groupId, page = 0, size = 10) => {
    try {
        const response = await axios.get(`${API_URL}/${groupId}/posts?page=${page}&size=${size}`);
        if (response && response.data && Array.isArray(response.data)) {
            return response.data;
        }
        console.error(`API_ERROR: getPostsByGroupId for ${groupId} did not receive an array. Response data:`, response ? response.data : 'No response object');
        return [];
    } catch (error) {
        console.error(`API_EXCEPTION: Error in getPostsByGroupId for ${groupId}:`, error.response ? error.response : error.message);
        return [];
    }
};

export const likePost = async (groupId, postId) => {
    try {
        console.log(`🔍 [StudyGroupAPI] Attempting to like post ${postId} in group ${groupId}`);
        
        // Extract contentId from postId (format: "content-17" -> "17")
        if (postId.startsWith('content-')) {
            const contentId = postId.replace('content-', '');
            console.log(`🎯 [StudyGroupAPI] Extracted contentId: ${contentId}`);
            
            // Use the content API endpoint instead of group endpoint
            const response = await authApi.post(`/api/content/${contentId}/like`);
            console.log(`✅ [StudyGroupAPI] Like successful:`, response);
            return response.data;
        } else {
            console.error(`❌ [StudyGroupAPI] Invalid postId format: ${postId}`);
            throw new Error(`Invalid postId format: ${postId}. Expected format: content-{id}`);
        }
    } catch (error) {
        console.error(`❌ [StudyGroupAPI] Error in likePost for ${postId}:`, error.response ? error.response : error.message);
        throw error; // Re-throw to be handled by caller
    }
};

export const addCommentToPost = async (groupId, postId, text) => {
    try {
        console.log(`🔍 [StudyGroupAPI] Attempting to add comment to post ${postId} in group ${groupId}`);
        
        const currentUser = getCurrentUser();
        const commentData = { 
            text,
            authorId: currentUser.authorId,
            authorName: currentUser.authorName
        };
        
        // For now, use the study group endpoint for comments since there's no content-specific comment endpoint
        const response = await authApi.post(`/api/studygroups/${groupId}/posts/${postId}/comments`, commentData);
        console.log(`✅ [StudyGroupAPI] Comment added successfully:`, response);
        return response.data;
    } catch (error) {
        console.error(`❌ [StudyGroupAPI] Error in addCommentToPost for ${postId}:`, error.response ? error.response : error.message);
        throw error; // Re-throw to be handled by caller
    }
};

// Placeholder: Create Post (Not implemented due to student restrictions)
// export const createPost = async (groupId, postData) => {
//     const response = await axios.post(`${API_URL}/${groupId}/posts`, postData);
//     return response.data;
// };

// Placeholder: Create Group (Not implemented due to student restrictions)
// export const createStudyGroup = async (groupData) => {
//     const response = await axios.post(API_URL, groupData);
//     return response.data.map(group => ({ ...group, heroImage: `https://placehold.co/600x300/...`}));
// }; 