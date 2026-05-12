export const seedData = {
  stats: [
    { title: 'Total Engagement', value: '1.2M', trend: 15.2, description: 'vs last month', icon: 'Zap' },
    { title: 'Average Reach', value: '4.8M', trend: 10.5, description: 'vs last month', icon: 'Users' },
    { title: 'Sentiment Score', value: '92.4%', trend: 5.1, description: 'Positive growth', icon: 'Smile' },
    { title: 'Total Posts', value: '842', trend: 2.4, description: 'vs last month', icon: 'Target' },
  ],
  engagement: [
    { name: 'Mon', engagement: 4000, reach: 9000 },
    { name: 'Tue', engagement: 5000, reach: 11000 },
    { name: 'Wed', engagement: 4500, reach: 10000 },
    { name: 'Thu', engagement: 6000, reach: 13000 },
    { name: 'Fri', engagement: 8000, reach: 18000 },
    { name: 'Sat', engagement: 7500, reach: 16000 },
    { name: 'Sun', engagement: 9000, reach: 21000 },
  ],
  reach: [
    { name: 'Twitter', value: 45, color: '#3b82f6' },
    { name: 'LinkedIn', value: 30, color: '#22d3a5' },
    { name: 'Facebook', value: 15, color: '#7c3aed' },
    { name: 'Instagram', value: 10, color: '#f97316' },
  ],
  sentiment: {
    positive: 75,
    neutral: 15,
    negative: 10
  },
  topics: [
    { topic: '#AIInnovation', count: '45.2K', growth: '+25%' },
    { topic: 'TechTrends2024', count: '32.1K', growth: '+18%' },
    { topic: 'SocialStrategy', count: '28.5K', growth: '+12%' },
    { topic: 'DataInsights', count: '19.9K', growth: '+5%' },
  ],
  posts: [
    { id: 1, platform: 'Twitter', content: 'Excited to announce our new AI features!', likes: '12,500', comments: 1250, time: '2h ago' },
    { id: 2, platform: 'LinkedIn', content: 'How AI is transforming social media strategy.', likes: '8,400', comments: 840, time: '5h ago' },
    { id: 3, platform: 'Instagram', content: 'Behind the scenes at our latest AI workshop 🤖✨', likes: '15,200', comments: 1520, time: '1d ago' },
    { id: 4, platform: 'Facebook', content: 'Join our upcoming webinar on data analytics.', likes: '4,100', comments: 410, time: '2d ago' },
    { id: 5, platform: 'Twitter', content: 'The future of social intelligence is here.', likes: '9,800', comments: 980, time: '3d ago' },
  ],
  reports: [
    { id: '1', title: 'Q1 AI Trends Analysis', status: 'Completed', date: '2024-03-31', url: '#' },
    { id: '2', title: 'Competitor Sentiment Overview', status: 'Completed', date: '2024-03-15', url: '#' },
    { id: '3', title: 'Campaign Engagement Deep Dive', status: 'Processing', date: '2024-04-10', url: '#' },
  ],
  socialAccounts: [
    { id: 1, platform: 'Twitter', handle: '@AI_Platform', status: 'Connected', followers: '125K' },
    { id: 2, platform: 'LinkedIn', handle: 'AI Social Platform', status: 'Connected', followers: '84K' },
    { id: 3, platform: 'Instagram', handle: '@ai.social', status: 'Disconnected', followers: '0' },
  ]
};

export const isDemoMode = () => {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
};
