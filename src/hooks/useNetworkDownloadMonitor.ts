import { useState, useEffect, useCallback } from 'react';

export interface QueuedDownload {
  id: string;
  movieTitle: string;
  videoUrl: string;
  quality: string;
  addedAt: number;
  status: 'queued' | 'interrupted' | 'downloading' | 'completed';
  progress: number;
  errorMessage?: string;
}

const QUEUE_STORAGE_KEY = 'bestfilms_download_queue';

export function useNetworkDownloadMonitor() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });

  const [downloadQueue, setDownloadQueue] = useState<QueuedDownload[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to parse download queue from localStorage:', e);
      return [];
    }
  });

  const [networkToast, setNetworkToast] = useState<{
    type: 'online' | 'offline' | 'resumed' | 'queued';
    message: string;
  } | null>(null);

  // Save queue to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(downloadQueue));
      // Dispatch custom event for cross-component sync
      window.dispatchEvent(new Event('bestfilms_download_queue_updated'));
    } catch (e) {
      console.error('Failed to save download queue:', e);
    }
  }, [downloadQueue]);

  // Helper to trigger direct browser file download
  const triggerBrowserDownload = useCallback((item: QueuedDownload) => {
    const safeTitle = item.movieTitle.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${safeTitle}_${item.quality}_Turbo.mp4`;
    const proxyUrl = `/api/download?url=${encodeURIComponent(item.videoUrl)}&title=${encodeURIComponent(item.movieTitle)}&quality=${encodeURIComponent(item.quality)}`;

    try {
      const a = document.createElement('a');
      a.href = proxyUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (e) {
      console.error('Error triggering auto-resume download:', e);
      window.open(proxyUrl, '_self');
    }
  }, []);

  // Process and auto-resume pending downloads
  const processAndResumeQueue = useCallback(() => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    setDownloadQueue(prevQueue => {
      const pendingItems = prevQueue.filter(
        item => item.status === 'queued' || item.status === 'interrupted'
      );

      if (pendingItems.length === 0) return prevQueue;

      // Automatically trigger downloads for pending items
      pendingItems.forEach(item => {
        setTimeout(() => {
          triggerBrowserDownload(item);
        }, 500);
      });

      setNetworkToast({
        type: 'resumed',
        message: `🌐 Connection restored! Auto-resuming ${pendingItems.length} movie download${pendingItems.length > 1 ? 's' : ''}...`
      });

      // Update status to downloading or completed
      return prevQueue.map(item => {
        if (item.status === 'queued' || item.status === 'interrupted') {
          return { ...item, status: 'completed', progress: 100 };
        }
        return item;
      });
    });
  }, [triggerBrowserDownload]);

  // Network Online/Offline Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNetworkToast({
        type: 'online',
        message: '🟢 You are back online! Syncing download manager...'
      });

      // Automatically resume queued or interrupted downloads
      processAndResumeQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);

      // Mark downloading items as interrupted
      setDownloadQueue(prevQueue => {
        const updated = prevQueue.map(item => {
          if (item.status === 'downloading') {
            return { ...item, status: 'interrupted' as const };
          }
          return item;
        });

        const interruptedCount = updated.filter(i => i.status === 'interrupted' || i.status === 'queued').length;
        if (interruptedCount > 0) {
          setNetworkToast({
            type: 'offline',
            message: `📡 Connection lost! ${interruptedCount} download${interruptedCount > 1 ? 's' : ''} paused and queued for auto-resume.`
          });
        } else {
          setNetworkToast({
            type: 'offline',
            message: '📡 Internet connection lost. Downloads will pause until back online.'
          });
        }

        return updated;
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check on mount if online and has pending
    if (navigator.onLine) {
      const hasPending = downloadQueue.some(
        item => item.status === 'queued' || item.status === 'interrupted'
      );
      if (hasPending) {
        processAndResumeQueue();
      }
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [processAndResumeQueue, downloadQueue]);

  // Add a movie download to the queue
  const addToQueue = useCallback((movieTitle: string, videoUrl: string, quality: string = 'HD') => {
    const newItem: QueuedDownload = {
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      movieTitle,
      videoUrl,
      quality,
      addedAt: Date.now(),
      status: navigator.onLine ? 'completed' : 'queued',
      progress: navigator.onLine ? 100 : 0
    };

    setDownloadQueue(prev => [newItem, ...prev.filter(i => i.movieTitle !== movieTitle || i.quality !== quality)]);

    if (navigator.onLine) {
      triggerBrowserDownload(newItem);
      setNetworkToast({
        type: 'resumed',
        message: `📥 Started downloading "${movieTitle}" (${quality})`
      });
    } else {
      setNetworkToast({
        type: 'queued',
        message: `📡 Offline: "${movieTitle}" added to download queue. Will auto-start when online.`
      });
    }
  }, [triggerBrowserDownload]);

  // Remove item from queue
  const removeFromQueue = useCallback((id: string) => {
    setDownloadQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  // Clear completed downloads
  const clearCompleted = useCallback(() => {
    setDownloadQueue(prev => prev.filter(item => item.status !== 'completed'));
  }, []);

  // Dismiss toast
  const dismissToast = useCallback(() => {
    setNetworkToast(null);
  }, []);

  return {
    isOnline,
    downloadQueue,
    networkToast,
    addToQueue,
    removeFromQueue,
    clearCompleted,
    processAndResumeQueue,
    dismissToast
  };
}
