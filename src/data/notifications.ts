import { sendLocalPushNotification } from '../lib/pushNotifications';
import { addNotificationToFirestore, deleteNotificationFromFirestore } from '../lib/firebase';

export interface MovieNotification {
  id: string;
  movieId?: string;
  movieTitle: string;
  posterUrl?: string;
  type: 'added' | 'updated' | 'broadcast' | 'promo' | 'announcement';
  message: string;
  kinyarwandaMessage: string;
  createdAt: string;
  isRead: boolean;
  targetAudience?: 'all' | 'vip' | 'guests';
  author?: string;
}

const INITIAL_NOTIFICATIONS: MovieNotification[] = [
  {
    id: 'notif_1',
    movieId: 'm_1',
    movieTitle: 'Deadpool & Wolverine',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    type: 'added',
    message: '🎬 New Movie Added: "Deadpool & Wolverine" (Agasobanuye ka Rocky Kirabiranya) is now ready to stream & download in 4K!',
    kinyarwandaMessage: '🎬 Filme Nshya Yongewe: "Deadpool & Wolverine" (Agasobanuye ka Rocky Kirabiranya) iraboneka mu mashusho ya 4K HD!',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    isRead: false,
    targetAudience: 'all'
  },
  {
    id: 'notif_2',
    movieId: 'm_2',
    movieTitle: 'Dune: Part Two',
    posterUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80',
    type: 'updated',
    message: '🔄 Movie Updated: "Dune: Part Two" has been updated with enhanced Agasobanuye ka Junior Giti audio & high download speed.',
    kinyarwandaMessage: '🔄 Filme Yaguwe: "Dune: Part Two" yavuguruwe n\'amajwi meza ya Junior Giti n\'umuduko wo kumanura!',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    isRead: false,
    targetAudience: 'all'
  },
  {
    id: 'notif_3',
    movieId: 'm_3',
    movieTitle: 'Gladiator II',
    posterUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=800&q=80',
    type: 'added',
    message: '🎬 New Action Movie Added: "Gladiator II" featuring Kinyarwanda commentary is now available!',
    kinyarwandaMessage: '🎬 Filme Nshya y\'Intambara Yongewe: "Gladiator II" hamwe n\'Agasobanuye ka Sankara iraboneka!',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    isRead: true,
    targetAudience: 'all'
  }
];

export function getStoredNotifications(): MovieNotification[] {
  try {
    const raw = localStorage.getItem('bestfilms_movie_notifications');
    if (!raw) {
      localStorage.setItem('bestfilms_movie_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading notifications:', e);
    return INITIAL_NOTIFICATIONS;
  }
}

export function saveNotifications(notifications: MovieNotification[]): void {
  try {
    localStorage.setItem('bestfilms_movie_notifications', JSON.stringify(notifications));
    window.dispatchEvent(new Event('bestfilms_notifications_updated'));
  } catch (e) {
    console.error('Error saving notifications:', e);
  }
}

export function addMovieNotification(data: {
  movieId?: string;
  movieTitle: string;
  posterUrl?: string;
  type: 'added' | 'updated';
  interpreter?: string;
}): MovieNotification {
  const current = getStoredNotifications();
  const isAdded = data.type === 'added';
  const interpreter = data.interpreter || 'Rocky Kirabiranya';

  const newNotif: MovieNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    movieId: data.movieId,
    movieTitle: data.movieTitle,
    posterUrl: data.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    type: data.type,
    message: isAdded
      ? `🎬 New Movie Added: "${data.movieTitle}" (Agasobanuye ka ${interpreter}) is now available to watch & download!`
      : `🔄 Movie Updated: "${data.movieTitle}" was updated with new HD quality & sound!`,
    kinyarwandaMessage: isAdded
      ? `🎬 Filme Nshya Yongewe: "${data.movieTitle}" (Agasobanuye ka ${interpreter}) ubu iraboneka kureba no kumanura!`
      : `🔄 Filme Yaguwe: "${data.movieTitle}" yaguye amashusho n'amajwi meza agasobanuye!`,
    createdAt: new Date().toISOString(),
    isRead: false,
    targetAudience: 'all'
  };

  const updatedList = [newNotif, ...current];
  saveNotifications(updatedList);
  
  // Also push to Firestore & local browser push alert
  addNotificationToFirestore(newNotif).catch(e => console.error('Firestore notif sync error:', e));
  sendLocalPushNotification(`Best Films: ${newNotif.movieTitle}`, newNotif.kinyarwandaMessage);

  return newNotif;
}

export function createAdminBroadcastNotification(data: {
  title: string;
  message: string;
  kinyarwandaMessage: string;
  type?: 'broadcast' | 'announcement' | 'promo' | 'added' | 'updated';
  movieId?: string;
  posterUrl?: string;
  targetAudience?: 'all' | 'vip' | 'guests';
}): MovieNotification {
  const current = getStoredNotifications();

  const newNotif: MovieNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    movieId: data.movieId,
    movieTitle: data.title,
    posterUrl: data.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    type: data.type || 'broadcast',
    message: data.message,
    kinyarwandaMessage: data.kinyarwandaMessage || data.message,
    createdAt: new Date().toISOString(),
    isRead: false,
    targetAudience: data.targetAudience || 'all',
    author: 'Admin'
  };

  const updatedList = [newNotif, ...current];
  saveNotifications(updatedList);

  // Sync with Firestore so every account gets it in real-time
  addNotificationToFirestore(newNotif).catch(e => console.error('Firestore notif sync error:', e));
  // Send native browser push alert
  sendLocalPushNotification(`📢 Best Films Alert: ${data.title}`, data.kinyarwandaMessage || data.message);

  return newNotif;
}

export function markNotificationAsRead(id: string): void {
  const current = getStoredNotifications();
  const updated = current.map(n => n.id === id ? { ...n, isRead: true } : n);
  saveNotifications(updated);
}

export function markAllNotificationsAsRead(): void {
  const current = getStoredNotifications();
  const updated = current.map(n => ({ ...n, isRead: true }));
  saveNotifications(updated);
}

export function deleteNotification(id: string): void {
  const current = getStoredNotifications();
  const updated = current.filter(n => n.id !== id);
  saveNotifications(updated);
  deleteNotificationFromFirestore(id).catch(e => console.error('Firestore notif delete error:', e));
}
