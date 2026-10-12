import apiClient from './client';

export const matchmakerApi = {
  generateDNA: async (surveyData) => {
    return apiClient.post('/dna/generate', surveyData);
  },

  getDNA: async () => {
    return apiClient.get('/dna/me');
  },

  evaluateTeam: async (payload) => {
    return apiClient.post('/matchmaking/evaluate-team', payload);
  },

  recommendSquads: async (payload = {}) => {
    const defaultPayload = {
      game_name: payload.game_name || 'Valorant',
      squad_size: payload.squad_size || 4,
      target_region: payload.target_region || null,
      candidate_limit: payload.candidate_limit || 20,
    };
    return apiClient.post('/matchmaking/recommend-squad', defaultPayload);
  },

  evaluateCompatibility: async (targetUserId, gameName = 'Valorant') => {
    return apiClient.post('/matchmaking/compatibility', {
      target_user_id: targetUserId,
      game_name: gameName,
    });
  },

  // Legacy alias
  recommendSquad: async (targetPlayerIds) => {
    return apiClient.post('/matchmaking/recommend-squad', {
      candidate_limit: 20,
      squad_size: Array.isArray(targetPlayerIds) ? targetPlayerIds.length : 4,
    });
  },

  getCandidates: async (gameName = 'Valorant') => {
    return apiClient.get(`/matchmaking/candidates?game_name=${encodeURIComponent(gameName)}`);
  },
};

