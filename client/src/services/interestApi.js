import apiClient from './apiClient.js';

const interestApi = {
  async getAllInterests(config) {
    const response = await apiClient.get('/api/interests', config);
    if (!response.success) throw response.data ?? { success: false, message: response.message };
    return response.data;
  },
};

export default interestApi;
