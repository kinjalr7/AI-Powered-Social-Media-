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
    try {
      return await api.get('/api/v1/auth/me');
    } catch (error) {
      if (isDemoMode()) {
        return { 
          data: {
            ...seedData.user,
            settings: seedData.settings
          } 
        };
      }
      throw error;
    }
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
  },
  getPosts: async (platform?: string) => {
    try {
      const url = platform ? `/api/v1/social/posts?platform=${platform}` : '/api/v1/social/posts';
      const res = await api.get(url);
      if (isDemoMode() && (!res.data || res.data.length === 0)) {
        return { data: seedData.posts.week };
      }
      return res;
    } catch (error) {
      if (isDemoMode()) return { data: seedData.posts.week };
      throw error;
    }
  },
  getSyncHistory: async () => {
    try {
      const res = await api.get('/api/v1/social/sync-history');
      if (isDemoMode() && (!res.data || res.data.length === 0)) {
        return { data: seedData.syncHistory };
      }
      return res;
    } catch (error) {
      if (isDemoMode()) return { data: seedData.syncHistory };
      throw error;
    }
  },
  getEngagementSummary: async () => {
    try {
      const res = await api.get('/api/v1/social/engagement-summary');
      if (isDemoMode() && !res.data) {
        return { data: seedData.socialEngagementSummary };
      }
      return res;
    } catch (error) {
      if (isDemoMode()) return { data: seedData.socialEngagementSummary };
      throw error;
    }
  },
  getPlatformSummary: async () => {
    try {
      const res = await api.get('/api/v1/social/platform-summary');
      if (isDemoMode() && (!res.data || res.data.length === 0)) {
        return { data: seedData.platformPerformance };
      }
      return res;
    } catch (error) {
      if (isDemoMode()) return { data: seedData.platformPerformance };
      throw error;
    }
  },
  syncAccount: async (accountId: number) => {
    return api.post(`/api/v1/social/accounts/${accountId}/sync`);
  },
  disconnectAccount: async (accountId: number) => {
    return api.delete(`/api/v1/social/accounts/${accountId}`);
  },
  connectPlatform: async (companyId: number, platform: string, accessToken: string) => {
    return api.post(`/api/v1/social/companies/${companyId}/connect/${platform}`, {
      access_token: accessToken
    });
  },
  getFullSocialData: async () => {
    try {
      const res = await api.get('/api/v1/social/full-data');
      return res;
    } catch (error) {
      if (isDemoMode()) {
        return {
          data: {
            accounts: seedData.socialAccounts,
            posts: seedData.posts.week,
            sync_history: seedData.syncHistory,
            summary: seedData.socialEngagementSummary,
            performance: seedData.platformPerformance,
            companies: [seedData.company]
          }
        };
      }
      throw error;
    }
  }
};

export const companyService = {
  getCompanies: async () => {
    return api.get('/api/v1/companies/');
  }
};

export const reportsService = {
  getStatus: async () => {
    try {
      const res = await api.get('/api/v1/reports/status');
      if (isDemoMode()) {
        const realReports = res.data?.recent_reports || [];
        return { data: { 
          recent_reports: [...realReports, ...seedData.reports],
          scheduled_reports: seedData.scheduledReports,
          active_generations: realReports.filter((r: any) => r.status === 'Processing').length
        }};
      }
      return res;
    } catch (error) {
      if (isDemoMode()) return { data: { 
        recent_reports: seedData.reports,
        scheduled_reports: seedData.scheduledReports,
        active_generations: 1
      }};
      throw error;
    }
  },
  getDetails: async (id: number | string) => {
    try {
      return await api.get(`/api/v1/reports/${id}`);
    } catch (error) {
      if (isDemoMode()) {
        const report = seedData.reports.find(r => r.id === id);
        return { data: report };
      }
      throw error;
    }
  },
  generate: async () => {
    try {
      return await api.post('/api/v1/reports/');
    } catch (error) {
      if (isDemoMode()) return { data: { message: "Demo report generation started", status: "Processing" } };
      throw error;
    }
  },
  retry: async (id: number | string) => {
    try {
      return await api.post(`/api/v1/reports/${id}/retry`);
    } catch (error) {
      if (isDemoMode()) return { data: { message: "Demo report retry success" } };
      throw error;
    }
  },
  delete: async (id: number | string) => {
    try {
      return await api.delete(`/api/v1/reports/${id}`);
    } catch (error) {
      if (isDemoMode()) return { data: { message: "Demo report deletion success" } };
      throw error;
    }
  },
  download: async (report: any) => {
    if (isDemoMode() || report.url === '#') {
      // For demo mode or if no real URL, we'll keep the client-side generation for now 
      // but we wrap it in a service call style
      return { demo: true };
    }
    
    // For real data, we fetch the blob
    return api.get(report.url, { responseType: 'blob' });
  }
};

export const dashboardService = {
  getDashboardSummary: async (timeframe = 'week') => {
    try {
      const res = await api.get(`/api/v1/dashboard-summary?timeframe=${timeframe}`);
      return res;
    } catch (error) {
      if (isDemoMode()) {
        const tf = (timeframe === 'week' || timeframe === 'month' || timeframe === 'year') ? timeframe : 'week';
        return { data: {
          stats: seedData.stats[tf],
          engagement: seedData.engagement[tf],
          reach: seedData.reach[tf],
          sentiment: seedData.sentiment[tf],
          topics: seedData.topics[tf],
          posts: seedData.posts[tf]
        }};
      }
      throw error;
    }
  },

  getStats: async (timeframe = 'week') => {
    try {
      const res = await api.get(`/api/v1/stats?timeframe=${timeframe}`);
      if (isDemoMode() && (!res.data || res.data.length === 0)) {
        const tf = (timeframe === 'week' || timeframe === 'month' || timeframe === 'year') ? timeframe : 'week';
        return { data: seedData.stats[tf] };
      }
      return res;
    } catch (error) {
      if (isDemoMode()) {
        const tf = (timeframe === 'week' || timeframe === 'month' || timeframe === 'year') ? timeframe : 'week';
        return { data: seedData.stats[tf] };
      }
      throw error;
    }
  },

  getEngagementData: async (timeframe = 'week') => {
    try {
      const res = await api.get(`/api/v1/engagement?timeframe=${timeframe}`);
      if (isDemoMode() && (!res.data || res.data.length === 0)) {
        const tf = (timeframe === 'week' || timeframe === 'month' || timeframe === 'year') ? timeframe : 'week';
        return { data: seedData.engagement[tf] };
      }
      return res;
    } catch (error) {
      if (isDemoMode()) {
        const tf = (timeframe === 'week' || timeframe === 'month' || timeframe === 'year') ? timeframe : 'week';
        return { data: seedData.engagement[tf] };
      }
      throw error;
    }
  },

  getPlatformReach: async (timeframe = 'week') => {
    try {
      const res = await api.get(`/api/v1/reach?timeframe=${timeframe}`);
      if (isDemoMode() && (!res.data || res.data.length === 0)) {
        const tf = (timeframe === 'week' || timeframe === 'month' || timeframe === 'year') ? timeframe : 'week';
        return { data: seedData.reach[tf] };
      }
      return res;
    } catch (error) {
      if (isDemoMode()) {
        const tf = (timeframe === 'week' || timeframe === 'month' || timeframe === 'year') ? timeframe : 'week';
        return { data: seedData.reach[tf] };
      }
      throw error;
    }
  },

  getSentimentOverview: async (timeframe = 'week') => {
    try {
      const res = await api.get(`/api/v1/sentiment?timeframe=${timeframe}`);
      if (isDemoMode() && (!res.data || Object.keys(res.data).length === 0 || (res.data.positive === 0 && res.data.negative === 0))) {
        const tf = (timeframe === 'week' || timeframe === 'month' || timeframe === 'year') ? timeframe : 'week';
        return { data: seedData.sentiment[tf] };
      }
      return res;
    } catch (error) {
      if (isDemoMode()) {
        const tf = (timeframe === 'week' || timeframe === 'month' || timeframe === 'year') ? timeframe : 'week';
        return { data: seedData.sentiment[tf] };
      }
      throw error;
    }
  },

  getTopTopics: async (timeframe = 'week') => {
    try {
      const res = await api.get(`/api/v1/topics?timeframe=${timeframe}`);
      if (isDemoMode() && (!res.data || res.data.length === 0)) {
        const tf = (timeframe === 'week' || timeframe === 'month' || timeframe === 'year') ? timeframe : 'week';
        return { data: seedData.topics[tf] };
      }
      return res;
    } catch (error) {
      if (isDemoMode()) {
        const tf = (timeframe === 'week' || timeframe === 'month' || timeframe === 'year') ? timeframe : 'week';
        return { data: seedData.topics[tf] };
      }
      throw error;
    }
  },

  getRecentPosts: async (timeframe = 'week', page = 1, limit = 5) => {
    try {
      const res = await api.get(`/api/v1/posts?timeframe=${timeframe}&page=${page}&limit=${limit}`);
      if (isDemoMode() && (!res.data || res.data.length === 0)) {
        const tf = (timeframe === 'week' || timeframe === 'month' || timeframe === 'year') ? timeframe : 'week';
        return { data: seedData.posts[tf] };
      }
      return res;
    } catch (error) {
      if (isDemoMode()) {
        const tf = (timeframe === 'week' || timeframe === 'month' || timeframe === 'year') ? timeframe : 'week';
        return { data: seedData.posts[tf] };
      }
      throw error;
    }
  }
};

export const analyticsService = {
  getSummary: async (timeframe = 'week', companyId?: number) => {
    try {
      const url = companyId ? `/api/v1/analytics/summary?timeframe=${timeframe}&company_id=${companyId}` : `/api/v1/analytics/summary?timeframe=${timeframe}`;
      const res = await api.get(url);
      return res;
    } catch (error) {
      if (isDemoMode()) return { data: [
        { id: "engagement", title: "Engagement Dynamics", value: "24.8K", trend: 12.5, description: "Total interactions across all platforms", status: "positive" },
        { id: "sentiment", title: "Brand Sentiment", value: "82%", trend: 4.2, description: "Positive sentiment ratio", status: "positive" },
        { id: "reach", title: "Global Reach", value: "1.2M", trend: -2.1, description: "Total impressions this period", status: "neutral" },
        { id: "hiring", title: "Talent Signals", value: "14", trend: 8.7, description: "Hiring-related posts detected", status: "positive" }
      ]};
      throw error;
    }
  },

  getFullReport: async (timeframe = 'week', platform?: string) => {
    try {
      const url = platform ? `/api/v1/analytics/full-report?timeframe=${timeframe}&platform=${platform}` : `/api/v1/analytics/full-report?timeframe=${timeframe}`;
      return await api.get(url);
    } catch (error) {
      if (isDemoMode()) {
        const tf = (timeframe === 'week' || timeframe === 'month' || timeframe === 'year') ? timeframe : 'week';
        const sentiment = seedData.sentiment[tf];
        return { data: {
          summary: [
            { id: "engagement", title: "Engagement Dynamics", value: "24.8K", trend: 12.5, description: "Total interactions across all platforms", status: "positive" },
            { id: "sentiment", title: "Brand Sentiment", value: "82%", trend: 4.2, description: "Positive sentiment ratio", status: "positive" },
            { id: "reach", title: "Global Reach", value: "1.2M", trend: -2.1, description: "Total impressions this period", status: "neutral" },
            { id: "hiring", title: "Talent Signals", value: "14", trend: 8.7, description: "Hiring-related posts detected", status: "positive" }
          ],
          engagement: seedData.engagement[tf],
          sentiment: {
            overall: sentiment.positive,
            segments: [
              { name: "Positive", value: sentiment.positive, color: "#10b981" },
              { name: "Neutral", value: sentiment.neutral, color: "#64748b" },
              { name: "Negative", value: sentiment.negative, color: "#ef4444" }
            ],
            trends: [
              { date: "Mon", score: 78 }, { date: "Tue", score: 82 }, { date: "Wed", score: 85 },
              { date: "Thu", score: 80 }, { date: "Fri", score: 84 }, { date: "Sat", score: 88 }, { date: "Sun", score: 82 }
            ]
          },
          platforms: [
            { platform: "Twitter", engagement: 4500, growth: 12.5, color: "#1DA1F2" },
            { platform: "LinkedIn", engagement: 3800, growth: 8.2, color: "#0A66C2" },
            { platform: "Facebook", engagement: 2900, growth: -2.4, color: "#1877F2" },
            { platform: "Instagram", engagement: 5200, growth: 15.8, color: "#E4405F" }
          ],
          content: [
            { id: 1, content: "Excited to announce our new AI-powered analytics engine! #Innovation #AI", platform: "twitter", engagement: 1240, sentiment: "Positive", date: "2024-05-10" },
            { id: 2, content: "How we scaled our infrastructure to handle 1M+ requests per second.", platform: "linkedin", engagement: 890, sentiment: "Positive", date: "2024-05-08" },
            { id: 3, content: "Join us for our upcoming webinar on future of social intelligence.", platform: "facebook", engagement: 450, sentiment: "Neutral", date: "2024-05-12" }
          ],
          hiring: [
            { month: "Jan", count: 4 }, { month: "Feb", count: 7 }, { month: "Mar", count: 5 },
            { month: "Apr", count: 12 }, { month: "May", count: 14 }
          ],
          growth: [
            { name: "Week 1", followers: 10500 }, { name: "Week 2", followers: 11200 },
            { name: "Week 3", followers: 11800 }, { name: "Week 4", followers: 12500 }
          ]
        }};
      }
      throw error;
    }
  },

  getEngagementTrends: async (timeframe = 'week', platform?: string) => {
    try {
      const url = platform ? `/api/v1/analytics/engagement-trends?timeframe=${timeframe}&platform=${platform}` : `/api/v1/analytics/engagement-trends?timeframe=${timeframe}`;
      return await api.get(url);
    } catch (error) {
      if (isDemoMode()) {
        const tf = (timeframe === 'week' || timeframe === 'month' || timeframe === 'year') ? timeframe : 'week';
        return { data: seedData.engagement[tf] };
      }
      throw error;
    }
  },

  getSentimentBreakdown: async (timeframe = 'week') => {
    try {
      return await api.get(`/api/v1/analytics/sentiment-breakdown?timeframe=${timeframe}`);
    } catch (error) {
      if (isDemoMode()) {
        const tf = (timeframe === 'week' || timeframe === 'month' || timeframe === 'year') ? timeframe : 'week';
        const sentiment = seedData.sentiment[tf];
        return { data: {
          overall: sentiment.positive,
          segments: [
            { name: "Positive", value: sentiment.positive, color: "#10b981" },
            { name: "Neutral", value: sentiment.neutral, color: "#64748b" },
            { name: "Negative", value: sentiment.negative, color: "#ef4444" }
          ],
          trends: [
            { date: "Mon", score: 78 }, { date: "Tue", score: 82 }, { date: "Wed", score: 85 },
            { date: "Thu", score: 80 }, { date: "Fri", score: 84 }, { date: "Sat", score: 88 }, { date: "Sun", score: 82 }
          ]
        }};
      }
      throw error;
    }
  },

  getPlatformComparison: async () => {
    try {
      return await api.get('/api/v1/analytics/platform-comparison');
    } catch (error) {
      if (isDemoMode()) return { data: [
        { platform: "Twitter", engagement: 4500, growth: 12.5, color: "#1DA1F2" },
        { platform: "LinkedIn", engagement: 3800, growth: 8.2, color: "#0A66C2" },
        { platform: "Facebook", engagement: 2900, growth: -2.4, color: "#1877F2" },
        { platform: "Instagram", engagement: 5200, growth: 15.8, color: "#E4405F" }
      ]};
      throw error;
    }
  },

  getTopContent: async (limit = 5) => {
    try {
      return await api.get(`/api/v1/analytics/top-content?limit=${limit}`);
    } catch (error) {
      if (isDemoMode()) return { data: [
        { id: 1, content: "Excited to announce our new AI-powered analytics engine! #Innovation #AI", platform: "twitter", engagement: 1240, sentiment: "Positive", date: "2024-05-10" },
        { id: 2, content: "How we scaled our infrastructure to handle 1M+ requests per second.", platform: "linkedin", engagement: 890, sentiment: "Positive", date: "2024-05-08" },
        { id: 3, content: "Join us for our upcoming webinar on future of social intelligence.", platform: "facebook", engagement: 450, sentiment: "Neutral", date: "2024-05-12" }
      ]};
      throw error;
    }
  },

  getHiringTrends: async () => {
    try {
      return await api.get('/api/v1/analytics/hiring-trends');
    } catch (error) {
      if (isDemoMode()) return { data: [
        { month: "Jan", count: 4 }, { month: "Feb", count: 7 }, { month: "Mar", count: 5 },
        { month: "Apr", count: 12 }, { month: "May", count: 14 }
      ]};
      throw error;
    }
  },

  getAudienceGrowth: async () => {
    try {
      return await api.get('/api/v1/analytics/audience-growth');
    } catch (error) {
      if (isDemoMode()) return { data: [
        { name: "Week 1", followers: 10500 }, { name: "Week 2", followers: 11200 },
        { name: "Week 3", followers: 11800 }, { name: "Week 4", followers: 12500 }
      ]};
      throw error;
    }
  },

  exportData: async (format: 'pdf' | 'csv') => {
    return api.post(`/api/v1/analytics/export?format=${format}`);
  },

  recalculateInsights: async (companyId: number) => {
    return api.post(`/api/v1/analytics/recalculate?company_id=${companyId}`);
  }
};

export const chartsService = {
  getEngagementTrend: async (timeframe = 'week', platform?: string) => {
    try {
      const url = platform && platform !== 'all' ? `/api/v1/charts/engagement-trend?timeframe=${timeframe}&platform=${platform}` : `/api/v1/charts/engagement-trend?timeframe=${timeframe}`;
      return await api.get(url);
    } catch (error) {
      if (isDemoMode()) return { data: seedData.engagement[timeframe] || seedData.engagement.week };
      throw error;
    }
  },

  getPlatformDistribution: async (timeframe = 'week', platform?: string) => {
    try {
      const url = platform && platform !== 'all' ? `/api/v1/charts/platform-distribution?timeframe=${timeframe}&platform=${platform}` : `/api/v1/charts/platform-distribution?timeframe=${timeframe}`;
      return await api.get(url);
    } catch (error) {
      if (isDemoMode()) return { data: seedData.reach[timeframe] || seedData.reach.week };
      throw error;
    }
  },

  getSentimentBreakdown: async (timeframe = 'week', platform?: string) => {
    try {
      const url = platform && platform !== 'all' ? `/api/v1/charts/sentiment-breakdown?timeframe=${timeframe}&platform=${platform}` : `/api/v1/charts/sentiment-breakdown?timeframe=${timeframe}`;
      return await api.get(url);
    } catch (error) {
      if (isDemoMode()) {
        const sentiment = seedData.sentiment[timeframe] || seedData.sentiment.week;
        return { data: {
          overall: sentiment.positive,
          segments: [
            { name: "Positive", value: sentiment.positive, color: "#10b981" },
            { name: "Neutral", value: sentiment.neutral, color: "#64748b" },
            { name: "Negative", value: sentiment.negative, color: "#ef4444" }
          ]
        }};
      }
      throw error;
    }
  },

  getTopTopics: async (timeframe = 'week', platform?: string) => {
    try {
      const url = platform && platform !== 'all' ? `/api/v1/charts/top-topics?timeframe=${timeframe}&platform=${platform}` : `/api/v1/charts/top-topics?timeframe=${timeframe}`;
      return await api.get(url);
    } catch (error) {
      if (isDemoMode()) return { data: seedData.topics[timeframe] || seedData.topics.week };
      throw error;
    }
  },

  getComparisonData: async (type: 'platform' | 'trend' = 'platform', timeframe = 'week', platform?: string) => {
    try {
      const url = platform && platform !== 'all' 
        ? `/api/v1/charts/comparison?type=${type}&timeframe=${timeframe}&platform=${platform}` 
        : `/api/v1/charts/comparison?type=${type}&timeframe=${timeframe}`;
      return await api.get(url);
    } catch (error) {
      if (isDemoMode()) {
        if (type === 'platform') {
          return { data: [
            { name: "Twitter", engagement: 4500, reach: 15000, posts: 42 },
            { name: "LinkedIn", engagement: 3800, reach: 12000, posts: 28 },
            { name: "Instagram", engagement: 5200, reach: 18000, posts: 35 },
            { name: "Facebook", engagement: 2900, reach: 8000, posts: 15 }
          ]};
        } else {
          return { data: [
            { name: "Mon", current: 2400, previous: 2100 },
            { name: "Tue", current: 1398, previous: 1200 },
            { name: "Wed", current: 9800, previous: 8500 },
            { name: "Thu", current: 3908, previous: 4200 },
            { name: "Fri", current: 4800, previous: 4500 }
          ]};
        }
      }
      throw error;
    }
  },

  getFullChartsData: async (timeframe = 'week', platform?: string) => {
    try {
      const url = platform && platform !== 'all' 
        ? `/api/v1/charts/full-data?timeframe=${timeframe}&platform=${platform}` 
        : `/api/v1/charts/full-data?timeframe=${timeframe}`;
      return await api.get(url);
    } catch (error) {
      if (isDemoMode()) {
        const tf = (timeframe === 'week' || timeframe === 'month' || timeframe === 'year') ? timeframe : 'week';
        return { data: {
          engagement: seedData.engagement[tf],
          distribution: seedData.reach[tf],
          sentiment: {
            overall: 84,
            segments: [
              { name: "Positive", value: 65, color: "#10b981" },
              { name: "Neutral", value: 25, color: "#64748b" },
              { name: "Negative", value: 10, color: "#ef4444" }
            ]
          },
          topics: seedData.topics[tf],
          platformComparison: [
            { name: "Twitter", engagement: 4500, reach: 15000, posts: 42 },
            { name: "LinkedIn", engagement: 3800, reach: 12000, posts: 28 },
            { name: "Instagram", engagement: 5200, reach: 18000, posts: 35 },
            { name: "Facebook", engagement: 2900, reach: 8000, posts: 15 }
          ],
          trendComparison: [
            { name: "Mon", current: 2400, previous: 2100 },
            { name: "Tue", current: 1398, previous: 1200 }
          ]
        }};
      }
      throw error;
    }
  }
};

export const settingsService = {
  getSettings: async () => {
    try {
      const res = await api.get('/api/v1/settings/');
      return res;
    } catch (error) {
      if (isDemoMode()) return { data: seedData.settings };
      throw error;
    }
  },
  updateSettings: async (settings: any) => {
    try {
      const res = await api.patch('/api/v1/settings/', settings);
      return res;
    } catch (error) {
      if (isDemoMode()) {
        // Mock update in demo mode
        Object.assign(seedData.settings, settings);
        return { data: seedData.settings };
      }
      throw error;
    }
  }
};
;

export default api;
