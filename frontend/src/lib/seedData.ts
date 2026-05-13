export const seedData = {
  company: {
    id: "comp_9281",
    name: "Nexus Dynamics",
    industry: "Global Enterprise Technology",
    website: "https://nexus-dynamics.io",
    created_at: "2023-11-12T08:00:00Z",
    status: "active"
  },
  user: {
    id: "usr_4402",
    name: "Sarah Chen",
    email: "sarah.chen@nexus-dynamics.io",
    role: "Head of Digital Strategy",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    last_login: "2026-05-12T18:40:12Z"
  },
  socialAccounts: [
    {
      id: "plt_x",
      platform: "Twitter",
      handle: "@NexusDynamics",
      status: "Connected",
      followers: "84.2K",
      posts_count: 2140,
      engagement_rate: "4.2%",
      last_sync: "2026-05-12T18:30:00Z",
      icon: "Twitter",
      color: "#1DA1F2"
    },
    {
      id: "plt_li",
      platform: "LinkedIn",
      handle: "Nexus Dynamics Official",
      status: "Connected",
      followers: "32.1K",
      posts_count: 850,
      engagement_rate: "6.8%",
      last_sync: "2026-05-12T18:15:00Z",
      icon: "Linkedin",
      color: "#0077B5"
    },
    {
      id: "plt_ig",
      platform: "Instagram",
      handle: "@nexus.dynamics",
      status: "Disconnected",
      followers: "92.4K",
      posts_count: 1120,
      engagement_rate: "5.4%",
      last_sync: "2026-05-10T12:00:00Z",
      icon: "Instagram",
      color: "#E4405F"
    }
  ],
  stats: {
    week: [
      { title: 'Total Engagement', value: '85.2K', trend: 12.5, description: 'vs last week', icon: 'Zap' },
      { title: 'Average Reach', value: '420.5K', trend: 8.2, description: 'vs last week', icon: 'Users' },
      { title: 'Sentiment Score', value: '84.2%', trend: 4.1, description: 'Positive growth', icon: 'Smile' },
      { title: 'Total Posts', value: '142', trend: 5.4, description: 'vs last week', icon: 'Target' },
    ],
    month: [
      { title: 'Total Engagement', value: '342.1K', trend: 15.2, description: 'vs last month', icon: 'Zap' },
      { title: 'Average Reach', value: '1.5M', trend: 10.5, description: 'vs last month', icon: 'Users' },
      { title: 'Sentiment Score', value: '82.4%', trend: 5.1, description: 'Positive growth', icon: 'Smile' },
      { title: 'Total Posts', value: '584', trend: 2.4, description: 'vs last month', icon: 'Target' },
    ],
    year: [
      { title: 'Total Engagement', value: '4.2M', trend: 22.4, description: 'vs last year', icon: 'Zap' },
      { title: 'Average Reach', value: '18.4M', trend: 18.1, description: 'vs last year', icon: 'Users' },
      { title: 'Sentiment Score', value: '79.8%', trend: 2.5, description: 'Annual trend', icon: 'Smile' },
      { title: 'Total Posts', value: '6,420', trend: 12.8, description: 'vs last year', icon: 'Target' },
    ]
  },
  sentiment: {
    week: { positive: 75, neutral: 15, negative: 10 },
    month: { positive: 72, neutral: 20, negative: 8 },
    year: { positive: 68, neutral: 22, negative: 10 }
  },
  engagement: {
    week: [
      { name: 'Mon', engagement: 12400, reach: 31000 },
      { name: 'Tue', engagement: 14200, reach: 35500 },
      { name: 'Wed', engagement: 11800, reach: 29500 },
      { name: 'Thu', engagement: 18500, reach: 46250 },
      { name: 'Fri', engagement: 21000, reach: 52500 },
      { name: 'Sat', engagement: 19200, reach: 48000 },
      { name: 'Sun', engagement: 24800, reach: 62000 },
    ],
    month: [
      { name: 'Week 1', engagement: 82000, reach: 205000 },
      { name: 'Week 2', engagement: 95000, reach: 237500 },
      { name: 'Week 3', engagement: 78000, reach: 195000 },
      { name: 'Week 4', engagement: 87100, reach: 217750 },
    ],
    year: [
      { name: 'Q1', engagement: 850000, reach: 2125000 },
      { name: 'Q2', engagement: 920000, reach: 2300000 },
      { name: 'Q3', engagement: 1100000, reach: 2750000 },
      { name: 'Q4', engagement: 1330000, reach: 3325000 },
    ]
  },
  reach: {
    week: [
      { name: 'Twitter', value: 45000, color: '#1DA1F2' },
      { name: 'LinkedIn', value: 21000, color: '#0077B5' },
      { name: 'Facebook', value: 12000, color: '#1877F2' },
      { name: 'Instagram', value: 34000, color: '#E4405F' },
    ],
    month: [
      { name: 'Twitter', value: 180000, color: '#1DA1F2' },
      { name: 'LinkedIn', value: 95000, color: '#0077B5' },
      { name: 'Facebook', value: 52000, color: '#1877F2' },
      { name: 'Instagram', value: 145000, color: '#E4405F' },
    ],
    year: [
      { name: 'Twitter', value: 2100000, color: '#1DA1F2' },
      { name: 'LinkedIn', value: 1200000, color: '#0077B5' },
      { name: 'Facebook', value: 650000, color: '#1877F2' },
      { name: 'Instagram', value: 1800000, color: '#E4405F' },
    ]
  },
  topics: {
    week: [
      { topic: 'Quantum Computing', count: '12.4K', growth: '+15%' },
      { topic: 'Remote Engineering', count: '8.2K', growth: '+8%' },
      { topic: 'Edge Security', count: '5.1K', growth: '+2%' },
      { topic: 'Digital Sovereignty', count: '3.9K', growth: '-1%' },
    ],
    month: [
      { topic: 'Quantum Computing', count: '45.2K', growth: '+25%' },
      { topic: 'Cloud Migration', count: '32.1K', growth: '+18%' },
      { topic: 'Cyber Resilience', count: '28.5K', growth: '+12%' },
      { topic: 'AI Ethics', count: '19.9K', growth: '+5%' },
    ],
    year: [
      { topic: 'AI Revolution', count: '540K', growth: '+120%' },
      { topic: 'Hybrid Work', count: '420K', growth: '+85%' },
      { topic: 'Cybersecurity', count: '380K', growth: '+45%' },
      { topic: 'Edge Computing', count: '310K', growth: '+30%' },
    ]
  },
  posts: {
    week: [
      { id: 'pst_w1', platform: 'Twitter', content: 'Our weekly tech roundup is out!', likes: '1,240', comments: 85, time: '2h ago' },
      { id: 'pst_w2', platform: 'LinkedIn', content: 'How we achieved 99.9% uptime this week.', likes: '850', comments: 42, time: '5h ago' },
    ],
    month: [
      { id: 'pst_m1', platform: 'Twitter', content: 'Monthly innovation awards results are in!', likes: '12,500', comments: 1250, time: '1w ago' },
      { id: 'pst_m2', platform: 'LinkedIn', content: 'Top 5 cloud trends of the month.', likes: '8,400', comments: 840, time: '2w ago' },
    ],
    year: [
      { id: 'pst_y1', platform: 'Twitter', content: 'Year in review: Nexus Dynamics growth story.', likes: '125K', comments: 12500, time: '3mo ago' },
      { id: 'pst_y2', platform: 'LinkedIn', content: 'Building for the next decade of technology.', likes: '84K', comments: 8400, time: '5mo ago' },
    ]
  },
  reports: [
    { id: 'rep_7710', name: 'Global Digital Strategy Report Q1 2026', status: 'Completed', date: '2026-04-30', type: 'Global', format: 'PDF', size: '2.4 MB', url: '#' },
    { id: 'rep_7711', name: 'Competitor Benchmarking Analysis', status: 'Completed', date: '2026-05-05', type: 'Competitor', format: 'PDF', size: '1.8 MB', url: '#' },
    { id: 'rep_7712', name: 'Annual Sentiment Audit Data', status: 'Failed', date: '2026-03-15', type: 'Global', format: 'PDF', size: '0.5 MB', url: '#', error_message: 'External API source unreachable' },
    { id: 'rep_7713', name: 'Monthly Performance Snapshot', status: 'Processing', date: '2026-05-13', type: 'Global', format: 'PDF', size: '--', url: '#' },
  ],
  scheduledReports: [
    { id: 'sch_1', name: 'Weekly Performance Snapshot', next_run: '2026-05-15', frequency: 'Weekly' },
    { id: 'sch_2', name: 'Monthly Stakeholder Review', next_run: '2026-06-01', frequency: 'Monthly' }
  ],
  alerts: [
    { id: 'al_901', type: 'engagement_anomaly', message: 'Unusual spike in engagement detected on Twitter. +120% vs baseline.', severity: 'info', created_at: '2026-05-12T17:35:00Z' },
    { id: 'al_902', type: 'sentiment_drop', message: 'Negative sentiment regarding \'EMEA Latency\' trending on Twitter.', severity: 'high', created_at: '2026-05-12T12:00:00Z' },
  ],
  syncHistory: [
    { id: 1, platform: 'Twitter', status: 'success', message: 'Cross-platform engagement metrics updated', timestamp: '2026-05-13T11:10:00Z' },
    { id: 2, platform: 'LinkedIn', status: 'success', message: 'Social graph structural analysis complete', timestamp: '2026-05-13T10:15:00Z' },
    { id: 3, platform: 'Twitter', status: 'info', message: 'Automatic intelligence handshake: X (Twitter)', timestamp: '2026-05-13T09:20:00Z' },
    { id: 4, platform: 'Instagram', status: 'failed', message: 'API connection timed out: Rate limit exceeded', timestamp: '2026-05-13T08:00:00Z' },
    { id: 5, platform: 'Facebook', status: 'success', message: 'Bulk post ingestion (128 items) complete', timestamp: '2026-05-13T07:45:00Z' }
  ],
  platformPerformance: [
    { platform: 'Twitter', reach: 45200, engagement: 12400, posts: 142, status: 'active', color: '#1DA1F2' },
    { platform: 'LinkedIn', reach: 32100, engagement: 8500, posts: 84, status: 'active', color: '#0077B5' },
    { platform: 'Instagram', reach: 28400, engagement: 6200, posts: 30, status: 'inactive', color: '#E4405F' },
    { platform: 'Facebook', reach: 12500, engagement: 3100, posts: 12, status: 'active', color: '#1877F2' }
  ],
  socialEngagementSummary: {
    total_engagement: 124500,
    engagement_trend: 12.5,
    avg_reach: 45000,
    reach_trend: 8.2,
    sentiment_score: 84,
    sentiment_trend: 4.1,
    total_posts: 256,
    posts_trend: 5.4
  }
};

export const isDemoMode = () => {
  return process.env.NEXT_PUBLIC_DEMO_MODE === 'true';
};
