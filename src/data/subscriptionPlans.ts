export interface SubPlan {
  id: string;
  nameEn: string;
  nameRw: string;
  priceTextEn: string;
  priceTextRw: string;
  amountRwf: number;
  durationDays: number;
  type: 'free' | 'vip' | 'advertiser';
  taglineEn: string;
  taglineRw: string;
  featuresEn: string[];
  featuresRw: string[];
  badgeEn: string;
  badgeRw: string;
  highlight: boolean;
}

export const DEFAULT_SUB_PLANS: SubPlan[] = [
  {
    id: 'free',
    nameEn: 'Free Plan',
    nameRw: "Plan y'Ubuntu (Free Plan)",
    priceTextEn: '0 RWF',
    priceTextRw: '0 RWF',
    amountRwf: 0,
    durationDays: 3650,
    type: 'free',
    taglineEn: 'Free forever with standard access',
    taglineRw: 'Ubuntu burundu, nta kintu uzoza urishyura',
    featuresEn: [
      'Standard SD Streaming (360p/480p)',
      'Search and browse Agasobanuye movies',
      'No compulsory sign-up required',
    ],
    featuresRw: [
      'Kureba filme mu bwinshi bwa SD (360p/480p)',
      "Shakisha filme n'izagabonewe mu Kinyarwanda",
      "Nta konte isabwa ku ngano y'ibanze",
    ],
    badgeEn: 'Free',
    badgeRw: "Y'Ubuntu",
    highlight: false,
  },
  {
    id: 'weekly_vip',
    nameEn: 'VIP Stream Pass (1 Week)',
    nameRw: 'VIP Stream Pass (Icyumweru 1)',
    priceTextEn: '500 RWF / week',
    priceTextRw: '500 RWF / icyumweru',
    amountRwf: 500,
    durationDays: 7,
    type: 'vip',
    taglineEn: '7 Days HD streaming with zero ads',
    taglineRw: 'Iminsi 7 yo kureba filme zose muri HD nta matangazo',
    featuresEn: [
      '7 Days Full HD Streaming (1080p)',
      'All Rocky & Junior Agasobanuye unlocked',
      'Ad-free seamless playback',
      'Fast Movie Downloads unlocked',
    ],
    featuresRw: [
      "Iminsi 7 yose y'ubwinshi rwa HD (1080p)",
      'Filme zose za Rocky & Junior Giti ntarintege',
      "Kureba utabangamiwe n'amatangazo",
      'Kumanura filme kuri telefoni vuba',
    ],
    badgeEn: 'Popular',
    badgeRw: 'Gukoresha gito',
    highlight: false,
  },
  {
    id: 'monthly_vip',
    nameEn: 'VIP Stream Pass (1 Month)',
    nameRw: 'VIP Stream Pass (Ukwezi 1)',
    priceTextEn: '2,000 RWF / month',
    priceTextRw: '2,000 RWF / ukwezi',
    amountRwf: 2000,
    durationDays: 30,
    type: 'vip',
    taglineEn: '30 Days complete VIP streaming & download access',
    taglineRw: "Ukwezi kwarangiye kureba filme n'amaserie zose",
    featuresEn: [
      "30 Days Full HD & 4K Access",
      'Fast Movie Downloads',
      'Zero ads + Priority Support',
      'Multi-device support (Smart TV, Mobile)',
    ],
    featuresRw: [
      "Iminsi 30 yose y'ubwinshi rwa HD & 4K",
      'Kumanura filme kuri telefoni n\'amadasobwa',
      "Nta matangazo nagato n'ubufasha bwa nambere",
      'Gukorana kuri Smart TV n\'ibindi vyuma',
    ],
    badgeEn: 'Best Value',
    badgeRw: 'Zikunzwe Cyane',
    highlight: true,
  },
  {
    id: 'ad_weekly',
    nameEn: 'Website Banner Ad Promotion',
    nameRw: 'Kwamamaza Kuri Best Films (Website Ad Promotion)',
    priceTextEn: '1,000 RWF / week',
    priceTextRw: '1,000 RWF / icyumweru',
    amountRwf: 1000,
    durationDays: 7,
    type: 'advertiser',
    taglineEn: 'Promote your business/website with custom banners reaching 50,000+ Rwandan viewers weekly',
    taglineRw: "Shyira ubucuruzi cyangwa urubuga rwawe ku Best Films kugira ngo ugerweho n'abakoresha 50,000+",
    featuresEn: [
      '1,000 RWF per week for custom banner display',
      'Promotional Banner shown across app header & watch pages',
      'Reach 50,000+ active Rwandan users',
      'Direct link to your WhatsApp or website',
    ],
    featuresRw: [
      '1,000 RWF ku cyumweru (1 Week Web Banner)',
      'Banner yawe igaragara ku shusho zose za Best Films',
      'Kugera ku bakoresha barenga 50,000 mu Rwanda',
      "Kugenerwa lien cyangwa Numero ya WhatsApp y'ubucuruzi bwawe",
    ],
    badgeEn: 'Ad Promo',
    badgeRw: 'Kwamamaza',
    highlight: false,
  },
  {
    id: 'annual_vip',
    nameEn: 'VIP Annual Pass (1 Year)',
    nameRw: 'VIP Stream Pass (Umwaka 1)',
    priceTextEn: '15,000 RWF / year',
    priceTextRw: '15,000 RWF / umwaka',
    amountRwf: 15000,
    durationDays: 365,
    type: 'vip',
    taglineEn: 'Full 365 days VIP access + bonus business ad perk',
    taglineRw: 'Umwaka wose wa VIP access + bonus yo kwamamaza',
    featuresEn: [
      '365 Days Unlimited HD & 4K streaming',
      '1 Free Week of Website Banner Advertising bonus',
      'Priority movie requests & instant downloads',
      'Full VIP badge on user account profile',
    ],
    featuresRw: [
      'Iminsi 365 wose wa VIP Cinema HD',
      "Kwamamaza ubucuruzi bwawe ku buntu ku gihe cy'icyumweru 1",
      'Uburenganzira bwo gusaba filme nshya zigasobanurwa vuba',
      'Ikimenyetso cya VIP kuri konte yawe',
    ],
    badgeEn: 'Annual VIP',
    badgeRw: 'Umwaka Wose',
    highlight: false,
  },
];

export function getStoredSubPlans(): SubPlan[] {
  try {
    const raw = localStorage.getItem('bestfilms_custom_sub_plans');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored sub plans:', e);
  }
  return DEFAULT_SUB_PLANS;
}

export function saveSubPlans(plans: SubPlan[]): void {
  try {
    localStorage.setItem('bestfilms_custom_sub_plans', JSON.stringify(plans));
    window.dispatchEvent(new Event('bestfilms_plans_updated'));
  } catch (e) {
    console.error('Error saving sub plans:', e);
  }
}

export function getStoredPromoMode(): boolean {
  try {
    return localStorage.getItem('bestfilms_global_promo_mode') === 'true';
  } catch (e) {
    return false;
  }
}

export function getStoredPromoMessage(): string {
  try {
    return localStorage.getItem('bestfilms_global_promo_msg') || '🎉 Admin Free Access Promotion Active! All VIP Streaming & Movie Downloads are currently 100% FREE!';
  } catch (e) {
    return '🎉 Admin Free Access Promotion Active!';
  }
}

export function savePromoMode(active: boolean, customMsg?: string): void {
  try {
    localStorage.setItem('bestfilms_global_promo_mode', active ? 'true' : 'false');
    if (customMsg !== undefined) {
      localStorage.setItem('bestfilms_global_promo_msg', customMsg);
    }
    window.dispatchEvent(new Event('bestfilms_promo_mode_updated'));
  } catch (e) {
    console.error('Error saving promo mode:', e);
  }
}
