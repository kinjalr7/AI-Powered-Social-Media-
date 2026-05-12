import axios from 'axios';
import { seedData, isDemoMode } from '../lib/seedData';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authService = {
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    return api.post('/api/v1/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },

  register: async (email, password) => {
    return api.post('/api/v1/auth/register', { email, password });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },

  getMe: async () => {
    return api.get('/api/v1/auth/me');
  }
};

export const socialService = {
  getAccounts: async () => {
    try {
      const res = await api.get('/api/v1/social/accounts');
      if (isDemoMode() && (!res.data || res.data.length === 0)) {
        return { data: seedData.socialAccounts };
      }
      return res;
    } catch (error) {
      if (isDemoMode()) return { data: seedData.socialAccounts };
      throw error;
    }
  }
};

export const reportsService = {
  getStatus: async () => {
    try {
      const res = await api.get('/api/v1/reports/status');
      if (isDemoMode() && (!res.data || res.data.recent_reports?.length === 0)) {
        return { data: seedData.reports };
      }
      return res;
    } catch (error) {
      if (isDemoMode()) return { data: seedData.reports };
      throw error;
    }
  },
  generate: async () => {
    try {
      return await api.post('/api/v1/reports/');
    } catch (error) {
      if (isDemoMode()) return { data: { message: "Demo report generated" } };
      throw error;
    }
  }
};

export const dashboardService = {
  getStats: async (timeframe = 'week') => {
    try {
      return await api.get(`/api/v1/stats?timeframe=${timeframe}`);
    } catch (error) {
      if (isDemoMode()) return { data: seedData.stats };
      throw error;
    }
  },

  getEngagementData: async (timeframe = 'week') => {
    try {
      return await api.get(`/api/v1/engagement?timeframe=${timeframe}`);
    } catch (error) {
      if (isDemoMode()) return { data: seedData.engagement };
      throw error;
    }
  },

  getPlatformReach: async (timeframe = 'week') => {
    try {
      return await api.get(`/api/v1/reach?timeframe=${timeframe}`);
    } catch (error) {
      if (isDemoMode()) return { data: seedData.reach };
      throw error;
    }
  },

  getSentimentOverview: async (timeframe = 'week') => {
    try {
      return await api.get(`/api/v1/sentiment?timeframe=${timeframe}`);
    } catch (error) {
      if (isDemoMode()) return { data: seedData.sentiment };
      throw error;
    }
  },

  getTopTopics: async (timeframe = 'week') => {
    try {
      return await api.get(`/api/v1/topics?timeframe=${timeframe}`);
    } catch (error) {
      if (isDemoMode()) return { data: seedData.topics };
      throw error;
    }
  },

  getRecentPosts: async (timeframe = 'week') => {
    try {
      return await api.get(`/api/v1/posts?timeframe=${timeframe}`);
    } catch (error) {
      if (isDemoMode()) return { data: seedData.posts };
      throw error;
    }
  }
};

export default api;
