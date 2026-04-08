export type TradeModel = 'BINARY' | 'RANGE' | 'MOMENTUM';

export interface DataInsight {
  id: string;
  type: 'insight';
  title: string;
  score: number;
  growth: number;
  trend: 'up' | 'down' | 'stable';
  chartData: number[];
  relatedMarketId?: string;
}

export interface PredictionOption {
  id: string;
  label: string;
  price: number;
  color: 'green' | 'red' | 'blue' | 'yellow' | 'purple';
}

export interface MarketStats {
  score: number;
  growth: number;
  reach: string;
  engagement: string;
  trend: 'up' | 'down' | 'stable';
}

export interface PredictionMarket {
  id: string;
  type: 'market';
  model: TradeModel;
  title: string;
  volume: string;
  isLive: boolean;
  probability: number;
  imageUrl: string;
  aiSignal?: string;
  stats: MarketStats;
  options: PredictionOption[];
}

export const MOCK_INSIGHTS: DataInsight[] = [
  {
    id: 'i1',
    type: 'insight',
    title: 'TikTok Viral Momentum: AI Tokens',
    score: 92,
    growth: 145,
    trend: 'up',
    chartData: [20, 35, 45, 60, 85, 92],
    relatedMarketId: '1'
  },
  {
    id: 'i2',
    type: 'insight',
    title: 'Social Sentiment: US Elections',
    score: 78,
    growth: -12,
    trend: 'down',
    chartData: [90, 85, 88, 70, 75, 78],
    relatedMarketId: '2'
  }
];

export const MOCK_MARKETS: PredictionMarket[] = [
  {
    id: '1',
    type: 'market',
    model: 'BINARY',
    title: 'Will BTC cross $65,000 in the next 5 minutes?',
    volume: '$34M',
    isLive: true,
    probability: 62,
    imageUrl: 'https://picsum.photos/seed/btc/400/400',
    aiSignal: 'BULLISH',
    stats: { score: 92, growth: 145, reach: '1.2M', engagement: '45K', trend: 'up' },
    options: [
      { id: 'yes', label: 'YES', price: 62, color: 'green' },
      { id: 'no', label: 'NO', price: 38, color: 'red' },
    ]
  },
  {
    id: '2',
    type: 'market',
    model: 'RANGE',
    title: 'What will be the peak concurrent viewers for the Super Bowl Halftime Show?',
    volume: '$12M',
    isLive: false,
    probability: 0,
    imageUrl: 'https://picsum.photos/seed/superbowl/400/400',
    aiSignal: 'VOLATILE',
    stats: { score: 78, growth: 25, reach: '110M', engagement: '2M', trend: 'stable' },
    options: [
      { id: 'under_115', label: '< 115M', price: 30, color: 'blue' },
      { id: '115_120', label: '115M - 120M', price: 45, color: 'yellow' },
      { id: 'over_120', label: '> 120M', price: 25, color: 'purple' },
    ]
  },
  {
    id: '3',
    type: 'market',
    model: 'MOMENTUM',
    title: 'Time to reach 1M views on MrBeast new video',
    volume: '$8.5M',
    isLive: true,
    probability: 0,
    imageUrl: 'https://picsum.photos/seed/mrbeast/400/400',
    aiSignal: 'FAST',
    stats: { score: 98, growth: 300, reach: '50M', engagement: '5M', trend: 'up' },
    options: [
      { id: 'under_1h', label: '< 1 Hour', price: 60, color: 'green' },
      { id: '1_3h', label: '1 - 3 Hours', price: 30, color: 'yellow' },
      { id: 'over_3h', label: '> 3 Hours', price: 10, color: 'red' },
    ]
  },
  {
    id: '4',
    type: 'market',
    model: 'BINARY',
    title: 'Will TikTok be banned in the US by end of 2026?',
    volume: '$55M',
    isLive: true,
    probability: 45,
    imageUrl: 'https://picsum.photos/seed/tiktok/400/400',
    aiSignal: 'BEARISH',
    stats: { score: 45, growth: -10, reach: '150M', engagement: '10M', trend: 'down' },
    options: [
      { id: 'yes', label: 'YES', price: 45, color: 'green' },
      { id: 'no', label: 'NO', price: 55, color: 'red' },
    ]
  }
];
