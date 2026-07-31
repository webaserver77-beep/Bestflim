import { Language } from '../types';

export const translations = {
  rw: {
    // Brand & Tagline
    appName: 'Best Films',
    appTagline: 'Sinema nyarwanda n\'izo mu mahanga mu Kinyarwanda n\'Icyongereza',

    // Language selection modal
    langModalTitle: 'Hitamo Ururimi Ubengeraho',
    langModalSubtitle: 'Kora uhitemo ururimi wifuza gukoreshamo Best Films. Ushobora kuruhindura igihe icyo ari cyo cyose.',
    selectKinyarwanda: 'Kinyarwanda',
    selectKinyarwandaDesc: 'Koresha ururimi rw\'Ikinyarwanda, kureba filme zigezweho n\'izagabondewe mu Agasobanuye.',
    selectEnglish: 'English',
    selectEnglishDesc: 'Browse and stream movies in English language interface and audio.',
    continueBtn: 'Komeza',

    // Navigation Tabs
    navHome: 'Ahabanza',
    navSearch: 'Shakisha',
    navHelp: 'Ubufasha',
    navAccount: 'Konte',

    // Home Page Sections
    trendingMovies: 'Filme zigezweho',
    trendingSeries: 'Serie zigezweho',
    newReleases: 'Izasohotse vuba',
    agasobanuyeSection: 'Agasobanuye ka Rocky & Junior',
    rwandaLocalSection: 'Filme nyarwanda',
    popularInRwanda: 'Izo mu Rwanda zikunzwe',
    recommendedForYou: 'Izo tukugiriye inama kureba',
    featuredTitle: 'Filme Yihariye y\'Umunsi',

    // Common Buttons & Actions
    play: 'Sankara',
    watchNow: 'Yirebe',
    watchLater: 'Yirebe Nyuma',
    addToFavorites: 'Ongeraho mu byo ukunda',
    removeFromFavorites: 'Ikuramo mu byo ukunda',
    inFavorites: 'Mu byo wamaze gukunda',
    share: 'Sangira',
    download: 'Manura',
    moreDetails: 'Ibisobanuro bindi',
    close: 'Funga',
    back: 'Subira inyuma',
    seeAll: 'Reba zose',

    // Player UI
    audioTrack: 'Ururimi rw\'Amajwi',
    originalAudio: 'Icyongereza (Original)',
    agasobanuyeAudio: 'Agasobanuye (Kinyarwanda)',
    subtitles: 'Ibirango mu nyandiko (Subtitles)',
    quality: 'Ubwinshi bw\'amashusho (Quality)',
    dataSaver: 'Iziparanya Data (360p)',
    highQuality: 'Urwego rwa HD (1080p)',
    ultraQuality: 'Urwego rwa 4K',
    playbackSpeed: 'Umuduko',
    episodes: 'Izagace (Episodes)',
    season: 'Igice',
    relatedMovies: 'Filme zisa n\'iyi',

    // Search Page
    searchPlaceholder: 'Shakisha filme, serie, cyangwa umusobanuzi...',
    filterByGenre: 'Ibyo ikoraho (Genre)',
    filterByYear: 'Umwaka',
    filterByLang: 'Ururimi',
    filterByType: 'Ubwoko',
    allGenres: 'Ubwoko bwose',
    allYears: 'Imyaka yose',
    allLanguages: 'Ndarurimi zose',
    agasobanuyeOnly: 'Agasobanuye gusa',
    englishOnly: 'Icyongereza gusa',
    moviesOnly: 'Filme gusa',
    seriesOnly: 'Serie gusa',
    noResults: 'Nta filme cyangwa serie ibonetse kuri ibi ushakisha.',
    tryDifferentSearch: 'Gera geza gukoresha amagambo cyangwa akayunguruzo gashya.',
    aiAssistantTitle: 'Mufasha wa AI mu gushaka filme',
    aiAssistantSubtitle: 'Andika kureba k\'uburyo bwihariye, urugero: "Nshakira filme y\'action irimo Agasobanuye ka Rocky"',
    aiAskBtn: 'Baza AI',
    aiThinking: 'Mufasha wa AI ari gushakisha filme zikubereye...',

    // Account Page
    accountNoticeTitle: 'Ushobora kureba filme udakeneye konte!',
    accountNoticeDesc: 'Best Films ikwemerera kureba filme zose no gushakisha ku buntu ntarintege za konte. Kurema konte ni amahitamo y’abashaka kubika ibyo bakunda, kureba nka nyuma n\'amalist yihariye.',
    guestUser: 'Umushyitsi (Guest)',
    createAccount: 'Kora Konte',
    login: 'Injira',
    logout: 'Sohoka',
    emailLabel: 'Imeri (Email)',
    passwordLabel: 'Ijambo ry\'ibanga (Password)',
    nameLabel: 'Izina ryawe',
    loginWithGoogle: 'Injiza ukoresheje Google',
    myFavorites: 'Ibyo Nakunze',
    myWatchLater: 'Ibyo Nzareba Nyuma',
    myHistory: 'Ibyo Nahembwe Kureba',
    myPlaylists: 'Amalisti Yanjye',
    noFavoritesYet: 'Nta filme urashyira mu byo ukunda.',
    noWatchLaterYet: 'Nta filme uri kuri liste ya Yirebe Nyuma.',
    noHistoryYet: 'Nta amateka y\'ibyo warebye aratabwa.',
    createPlaylistBtn: 'Kora Liste Nshya',
    newPlaylistName: 'Izina rya liste nshya',
    savePlaylist: 'Bika Liste',

    // Help & Contact Page
    helpTitle: 'Ubufasha & Ibibazo Bikunze Kubazwa (FAQ)',
    contactFormTitle: 'Tucohereze Ubumenyi cyangwa Icyifuzo',
    contactName: 'Izina ryawe',
    contactEmail: 'Imeri yawe',
    contactSubject: 'Icyo utubwira',
    contactMessage: 'Ubutumwa bwawe',
    sendBtn: 'Ohereza Ubutumwa',
    messageSentSuccess: 'Mwarakoze! Ubutumwa bwawe bwamaze kogohewa. Best Films izagusubiza mu gihe gito.',
    whatsappContactTitle: 'Ubufasha no gutanga ibitekerezo kuri WhatsApp',
    whatsappContactBtn: 'Tuvugisha kuri WhatsApp Support',
    whatsappSubtext: 'Kanda hano wandikire icyifuzo cyangwa igitekerezo direct kuri WhatsApp',

    faq1Q: 'Mbese nkeneye kurema konte kugira ngo nrebe filme kuri Best Films?',
    faq1A: 'Oya! Ushobora kureba no gushakisha filme zose ntarintege ya konte. Konte ifasha gusa abashaka kubika ibyo bakunda n\'ibyo barebye nyuma.',

    faq2Q: 'Agasobanuye ni iki kandi gahora mu Best Films gute?',
    faq2A: 'Agasobanuye ni filme ziri mu rurimi rwo mu mahanga zigasobanurwa mu Kinyarwanda n\'abasobanuzi b\'ingirakamaro nk\'Rocky Kirabiranya, Junior Giti, Sankara n\'abandi.',

    faq3Q: 'Ni gute nashobora kureba filme ntarangeje Intaneti (Data Saver)?',
    faq3A: 'Mu gihe urimo kureba filme, ukanda ku kiziga cy\'Ibisobanuro bw\'Amashusho (Quality Settings) ukahamo "Data Saver (360p)".',

    faq4Q: 'Mbese nshobora kureba Best Films kuri Telefoni n\'ikoranabuhanga rya TV?',
    faq4A: 'Yego, Best Films ikorana neza ku ma telefoni agezweho, ku ma tablet, mudasobwa, hamwe na Smart TV.',

    // Footer & Misc
    allRightsReserved: 'Uburenganzira bwose ni ubwa Best Films. Sinema nyarwanda n\'izo mu mahanga.',
    privacyPolicy: 'Ibihanye n\'Amakuru Yihariye',
    termsOfService: 'Amategeko y\'Igikoresho',
  },
  en: {
    // Brand & Tagline
    appName: 'Best Films',
    appTagline: 'Rwandan & International Movies in English and Kinyarwanda',

    // Language selection modal
    langModalTitle: 'Choose Your Preferred Language',
    langModalSubtitle: 'Select your preferred language to customize your Best Films experience. You can switch anytime.',
    selectKinyarwanda: 'Kinyarwanda',
    selectKinyarwandaDesc: 'Enjoy full Kinyarwanda interface, local Rwandan films & Agasobanuye voiceovers.',
    selectEnglish: 'English',
    selectEnglishDesc: 'Browse and stream movies with an English language interface and audio.',
    continueBtn: 'Continue',

    // Navigation Tabs
    navHome: 'Home',
    navSearch: 'Search',
    navHelp: 'Help & Contact',
    navAccount: 'Account',

    // Home Page Sections
    trendingMovies: 'Trending Movies',
    trendingSeries: 'Trending Series',
    newReleases: 'New Releases',
    agasobanuyeSection: 'Agasobanuye Specials (Rocky & Junior)',
    rwandaLocalSection: 'Rwandan Cinema',
    popularInRwanda: 'Popular in Rwanda',
    recommendedForYou: 'Recommended for You',
    featuredTitle: 'Featured Movie of the Day',

    // Common Buttons & Actions
    play: 'Play',
    watchNow: 'Watch Now',
    watchLater: 'Watch Later',
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites',
    inFavorites: 'Saved to Favorites',
    share: 'Share',
    download: 'Download',
    moreDetails: 'More Details',
    close: 'Close',
    back: 'Back',
    seeAll: 'See All',

    // Player UI
    audioTrack: 'Audio Language',
    originalAudio: 'English (Original)',
    agasobanuyeAudio: 'Agasobanuye (Kinyarwanda Dub)',
    subtitles: 'Subtitles',
    quality: 'Video Quality',
    dataSaver: 'Data Saver (360p)',
    highQuality: 'HD Quality (1080p)',
    ultraQuality: '4K Ultra HD',
    playbackSpeed: 'Speed',
    episodes: 'Episodes',
    season: 'Season',
    relatedMovies: 'You May Also Like',

    // Search Page
    searchPlaceholder: 'Search movies, series, genres, or interpreters...',
    filterByGenre: 'Genre',
    filterByYear: 'Year',
    filterByLang: 'Language',
    filterByType: 'Media Type',
    allGenres: 'All Genres',
    allYears: 'All Years',
    allLanguages: 'All Languages',
    agasobanuyeOnly: 'Agasobanuye Only',
    englishOnly: 'English Only',
    moviesOnly: 'Movies Only',
    seriesOnly: 'Series Only',
    noResults: 'No movies or series found matching your criteria.',
    tryDifferentSearch: 'Try adjusting your search terms or filter selections.',
    aiAssistantTitle: 'AI Movie Guide Assistant',
    aiAssistantSubtitle: 'Describe what you want to watch, e.g. "Action movie with Rocky Kinyarwanda voiceover"',
    aiAskBtn: 'Ask AI Guide',
    aiThinking: 'AI Assistant is finding the best matches for you...',

    // Account Page
    accountNoticeTitle: 'You can enjoy movies without an account!',
    accountNoticeDesc: 'Best Films allows free browsing and movie playback without sign up. Account creation is completely optional for saving favorites, watch history, and custom playlists.',
    guestUser: 'Guest User',
    createAccount: 'Create Account',
    login: 'Log In',
    logout: 'Log Out',
    emailLabel: 'Email Address',
    passwordLabel: 'Password',
    nameLabel: 'Full Name',
    loginWithGoogle: 'Continue with Google',
    myFavorites: 'My Favorites',
    myWatchLater: 'Watch Later List',
    myHistory: 'Watch History',
    myPlaylists: 'My Playlists',
    noFavoritesYet: 'You haven\'t saved any movies to your favorites yet.',
    noWatchLaterYet: 'Your Watch Later list is empty.',
    noHistoryYet: 'No watch history recorded yet.',
    createPlaylistBtn: 'Create New Playlist',
    newPlaylistName: 'Playlist Name',
    savePlaylist: 'Save Playlist',

    // Help & Contact Page
    helpTitle: 'Help Center & Frequently Asked Questions',
    contactFormTitle: 'Send us Feedback or Support Requests',
    contactName: 'Your Name',
    contactEmail: 'Your Email',
    contactSubject: 'Subject',
    contactMessage: 'Message',
    sendBtn: 'Send Message',
    messageSentSuccess: 'Thank you! Your message has been sent. Best Films support will get back to you shortly.',
    whatsappContactTitle: 'WhatsApp Support & Feedback',
    whatsappContactBtn: 'Chat on WhatsApp Support',
    whatsappSubtext: 'Send your feedback or questions directly on WhatsApp',

    faq1Q: 'Do I need an account to watch movies on Best Films?',
    faq1A: 'No! You can browse and watch all movies and series freely without an account. Creating an account is optional to sync favorites and watch progress.',

    faq2Q: 'What is Agasobanuye and how does it work?',
    faq2A: 'Agasobanuye is the popular Rwandan film interpretation style where foreign cinema is dynamically translated into Kinyarwanda by famous voice interpreters like Rocky Kirabiranya, Junior Giti, and Sankara.',

    faq3Q: 'How do I save mobile data while streaming (Data Saver)?',
    faq3A: 'While streaming in the player, click on the Quality gear icon and select "Data Saver (360p)" to drastically reduce bandwidth consumption.',

    faq4Q: 'Can I watch Best Films on Smart TV or Mobile devices?',
    faq4A: 'Yes! Best Films is fully responsive and optimized for mobile phones, tablets, laptops, and smart TVs.',

    // Footer & Misc
    allRightsReserved: 'All rights reserved by Best Films. Rwandan & International Streaming Platform.',
    privacyPolicy: 'Privacy Policy',
    termsOfService: 'Terms of Service',
  },
} as const;

export function getTranslation(lang: Language, key: keyof typeof translations.en): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}
