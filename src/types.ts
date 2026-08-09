export type Language = 'rw' | 'en';

export type MediaType = 'movie' | 'series';

export interface Episode {
  id: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  kinyarwandaTitle: string;
  runtime: string;
  description: string;
  kinyarwandaDescription: string;
  thumbnailUrl: string;
  videoUrl: string;
}

export interface MoviePart {
  id: string;
  partNumber: number;
  title: string;
  kinyarwandaTitle: string;
  runtime: string;
  videoUrl: string;
  thumbnailUrl?: string;
}

export interface MovieAd {
  id: string;
  title: string;
  videoUrl: string;
  placement: 'preroll' | 'midroll' | 'postroll';
  midrollTimestamp?: number; // timestamp in seconds e.g. 120 for 2:00
  skipAfterSeconds?: number; // default 5s
  targetUrl?: string;
  advertiserName?: string;
}

export interface Movie {
  id: string;
  title: string;
  kinyarwandaTitle: string;
  type: MediaType;
  posterUrl: string;
  backdropUrl: string;
  videoUrl: string;
  rating: number;
  year: number;
  runtime: string; // e.g. "2h 15m" or "3 Seasons"
  genres: string[];
  description: string;
  kinyarwandaDescription: string;
  cast: string[];
  director: string;
  isAgasobanuye: boolean; // Has Rwandan narrator audio track
  interpreterName?: string; // e.g., "Rocky Kirabiranya", "Sankara", "Junior Giti"
  isTrending?: boolean;
  isFeatured?: boolean;
  isNew?: boolean;
  isPopularInRwanda?: boolean;
  episodes?: Episode[];
  parts?: MoviePart[];
  franchiseName?: string;
  ads?: MovieAd[];
}

export interface SubscriptionPlan {
  id: string; // 'free' | 'weekly_vip' | 'monthly_vip' | 'ad_weekly' | 'annual_vip'
  name: string;
  type: 'free' | 'vip' | 'advertiser';
  price: string;
  amountRwf: number;
  startedAt: string;
  endsAt: string;
  paymentMethod?: string;
  paymentPhone?: string;
  isActive: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  isGuest: boolean;
  favorites: string[]; // movie IDs
  watchLater: string[]; // movie IDs
  watchHistory: {
    movieId: string;
    progress: number; // percentage 0 - 100
    lastWatchedAt: string;
  }[];
  playlists: {
    id: string;
    name: string;
    movieIds: string[];
  }[];
  subscription?: SubscriptionPlan;
}

export interface BusinessAdRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  phone: string;
  businessName: string;
  adTitle: string;
  targetUrl: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
  planName?: string;
}

export interface SupportMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  status: 'new' | 'reviewed' | 'replied';
  replyText?: string;
}

export interface PlatformAd {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl?: string;
  location: 'home_hero' | 'search_top' | 'banner_top';
  isActive: boolean;
  createdAt: string;
  clicksCount: number;
}

export interface SearchFilters {
  query: string;
  genre: string;
  year: string;
  language: 'all' | 'rw' | 'en' | 'agasobanuye';
  type: 'all' | 'movie' | 'series';
  sortBy: 'popular' | 'newest' | 'rating';
}
