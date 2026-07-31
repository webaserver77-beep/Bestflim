import { SupportMessage, PlatformAd, BusinessAdRequest } from '../types';

export function getStoredAdRequests(): BusinessAdRequest[] {
  try {
    const data = localStorage.getItem('bestfilms_ad_requests');
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Failed to read ad requests from localStorage', e);
  }
  return [];
}

export function saveAdRequests(requests: BusinessAdRequest[]): void {
  try {
    localStorage.setItem('bestfilms_ad_requests', JSON.stringify(requests));
  } catch (e) {
    console.error('Failed to save ad requests to localStorage', e);
  }
}

export function addAdRequest(req: Omit<BusinessAdRequest, 'id' | 'createdAt' | 'status'>): BusinessAdRequest {
  const requests = getStoredAdRequests();
  const newReq: BusinessAdRequest = {
    ...req,
    id: `adreq-${Date.now()}`,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    status: 'pending',
  };
  const updated = [newReq, ...requests];
  saveAdRequests(updated);

  // Automatically record as a support message for platform admin as well
  addSupportMessage({
    name: req.userName,
    email: req.userEmail,
    subject: `📢 Business Ad Request: ${req.businessName}`,
    message: `BUSINESS ADVERTISER REQUEST:\n\n- Business Name: ${req.businessName}\n- Headline / Title: ${req.adTitle}\n- Contact Phone: ${req.phone}\n- Target Link: ${req.targetUrl || 'N/A'}\n- Image URL: ${req.imageUrl || 'N/A'}\n- Description: ${req.description}`,
  });

  return newReq;
}

const INITIAL_SUPPORT_MESSAGES: SupportMessage[] = [
  {
    id: 'msg-101',
    name: 'Jean Claude Habimana',
    email: 'jean.c@gmail.com',
    subject: 'Filme nshya ya Agasobanuye',
    message: 'Muraho! Ndasaba ko mushyiramo filme nshya ya Rocky Kirabiranya irimo Agasobanuye.',
    createdAt: '2026-07-28 14:20',
    isRead: false,
    status: 'new',
  },
  {
    id: 'msg-102',
    name: 'Aline Uwase',
    email: 'aline.u@yahoo.com',
    subject: 'Kwishyura na MoMo Pay (1461297)',
    message: 'Nishyuye kuri MTN MoMo Code 1461297 ariko konti yanjye ntiyahise yemererwa VIP. Mwamfasha?',
    createdAt: '2026-07-29 09:15',
    isRead: true,
    status: 'replied',
    replyText: 'Muraho Aline! Twagenzuye payment transaction yawe turayemeza. Konti yawe ni VIP ubu.',
  },
  {
    id: 'msg-103',
    name: 'Eric Ndayishimiye',
    email: 'eric.nday@gmail.com',
    subject: 'Gushimira na Request',
    message: 'App yanyu irakora neza cyane! Mwashyiraho no gukuza download speed ku terefone.',
    createdAt: '2026-07-29 10:45',
    isRead: false,
    status: 'new',
  },
];

const INITIAL_PLATFORM_ADS: PlatformAd[] = [
  {
    id: 'ad-101',
    title: 'MTN Mobile Money Special - Save 20% on Monthly VIP',
    imageUrl: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1200&q=80',
    targetUrl: 'https://wa.me/250796119924',
    location: 'banner_top',
    isActive: true,
    createdAt: '2026-07-25',
    clicksCount: 142,
  },
  {
    id: 'ad-102',
    title: 'Best Films VIP Cinema Club - Unlimited Downloads',
    imageUrl: 'https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&w=1200&q=80',
    targetUrl: '',
    location: 'home_hero',
    isActive: true,
    createdAt: '2026-07-26',
    clicksCount: 89,
  },
];

export function getStoredSupportMessages(): SupportMessage[] {
  try {
    const data = localStorage.getItem('bestfilms_support_messages');
    if (data) {
      return JSON.parse(data);
    }
    localStorage.setItem('bestfilms_support_messages', JSON.stringify(INITIAL_SUPPORT_MESSAGES));
    return INITIAL_SUPPORT_MESSAGES;
  } catch (e) {
    console.error('Failed to read support messages from localStorage', e);
    return INITIAL_SUPPORT_MESSAGES;
  }
}

export function saveSupportMessages(messages: SupportMessage[]): void {
  try {
    localStorage.setItem('bestfilms_support_messages', JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save support messages to localStorage', e);
  }
}

export function addSupportMessage(msg: Omit<SupportMessage, 'id' | 'createdAt' | 'isRead' | 'status'>): SupportMessage {
  const messages = getStoredSupportMessages();
  const newMsg: SupportMessage = {
    ...msg,
    id: `msg-${Date.now()}`,
    createdAt: new Date().toLocaleString(),
    isRead: false,
    status: 'new',
  };
  const updated = [newMsg, ...messages];
  saveSupportMessages(updated);
  return newMsg;
}

export function getStoredAds(): PlatformAd[] {
  try {
    const data = localStorage.getItem('bestfilms_platform_ads');
    if (data) {
      return JSON.parse(data);
    }
    localStorage.setItem('bestfilms_platform_ads', JSON.stringify(INITIAL_PLATFORM_ADS));
    return INITIAL_PLATFORM_ADS;
  } catch (e) {
    console.error('Failed to read platform ads from localStorage', e);
    return INITIAL_PLATFORM_ADS;
  }
}

export function saveAds(ads: PlatformAd[]): void {
  try {
    localStorage.setItem('bestfilms_platform_ads', JSON.stringify(ads));
  } catch (e) {
    console.error('Failed to save platform ads to localStorage', e);
  }
}

export function recordAdClick(adId: string): void {
  const ads = getStoredAds();
  const updated = ads.map(ad => ad.id === adId ? { ...ad, clicksCount: ad.clicksCount + 1 } : ad);
  saveAds(updated);
}
