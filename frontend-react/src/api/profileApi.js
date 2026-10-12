import apiClient from './client';

export const profileApi = {
  // Get current user's full gamer profile
  getProfile: async () => {
    return apiClient.get('/profile/me');
  },

  // Create initial profile
  createProfile: async (profileData) => {
    return apiClient.post('/profile', profileData);
  },

  // Update existing profile (PUT /profile/me)
  updateProfile: async (profileData) => {
    return apiClient.put('/profile/me', profileData);
  },

  // Convenient helper to create or update seamlessly
  saveProfile: async (profileData) => {
    try {
      return await apiClient.put('/profile/me', profileData);
    } catch (err) {
      // If profile doesn't exist yet, fallback to POST
      if (err.message?.includes('not found') || err.message?.includes('404')) {
        return await apiClient.post('/profile', profileData);
      }
      throw err;
    }
  },

  // Get rich Gamer DNA Card
  getDnaCard: async () => {
    return apiClient.get('/dna/me');
  },

  // Get external linked accounts (Steam, Riot)
  getLinkedAccounts: async () => {
    return apiClient.get('/games/accounts');
  },

  // Link an external account
  linkAccount: async (accountData) => {
    return apiClient.post('/games/accounts', accountData);
  },

  // Upload custom avatar image
  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};
