// Browser & Capacitor Push Notifications Helper
export async function requestPushNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    console.log('This browser does not support desktop notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      try {
        new Notification('Best Films Mobile', {
          body: 'Mwashimwe! Push notifications zose zarakora. Uzajya ubona firime nshya!',
          icon: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=192&h=192&fit=crop&crop=faces',
          badge: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=192&h=192&fit=crop&crop=faces'
        });
      } catch (e) {
        console.log('Notification popup test sent');
      }
      return true;
    }
  }

  return false;
}

export function sendLocalPushNotification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=192&h=192&fit=crop&crop=faces',
      });
    } catch (err) {
      console.log('Push notification failed:', err);
    }
  }
}
