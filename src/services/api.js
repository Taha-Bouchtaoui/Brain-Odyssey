// 1. Set the BASE URL to the 'api' root only
/*const API_URL = "http://127.0.0.1:8000/api"; 

const apiRequest = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  // 2. Ensure there is a slash between the base and the endpoint
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || 'Erreur API');
  }
  
  return response.json();
};

export const worldService = {
  // Now this correctly points to http://127.0.0.1:8000/api/worlds/
  getWorlds: () => apiRequest('/worlds/'), 
  
  selectWorld: (worldId) => apiRequest(`/worlds/${worldId}/select/`, {
    method: 'POST',
  }),
  
  getProgress: () => apiRequest('/progress/'),
};*/

//test api 2
// src/services/api.js
const API_URL = "http://127.0.0.1:8000/api";

const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('access_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || 'Erreur API');
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Service pour les mondes
export const worldService = {
  getWorlds: () => apiRequest('/worlds/'),
  selectWorld: (worldId) => apiRequest(`/worlds/${worldId}/select/`, { method: 'POST' }),
};

// Service pour l'authentification
export const authService = {
  getUserStats: () => apiRequest('/profile/stats/'),
  
  logout: async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await apiRequest('/logout/', { 
          method: 'POST',
          body: JSON.stringify({ refresh: refreshToken })
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('selectedWorld');
    localStorage.removeItem('user');
  }
};