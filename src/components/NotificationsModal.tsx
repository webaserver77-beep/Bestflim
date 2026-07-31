import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  MovieNotification, 
  getStoredNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification 
} from '../data/notifications';
import { Movie } from '../types';
import { Bell, Film, CheckCheck, Trash2, X, Sparkles, RefreshCw, Play, Check } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  movies: Movie[];
  onSelectMovie: (movie: Movie) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  movies,
  onSelectMovie,
}) => {
  const { lang } = useLanguage();
  const [notifications, setNotifications] = useState<MovieNotification[]>(getStoredNotifications);

  useEffect(() => {
    const handleUpdate = () => {
      setNotifications(getStoredNotifications());
    };
    window.addEventListener('bestfilms_notifications_updated', handleUpdate);
    return () => window.removeEventListener('bestfilms_notifications_updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotifClick = (notif: MovieNotification) => {
    markNotificationAsRead(notif.id);
    if (notif.movieId) {
      const foundMovie = movies.find(m => m.id === notif.movieId || m.title.toLowerCase() === notif.movieTitle.toLowerCase());
      if (foundMovie) {
        onSelectMovie(foundMovie);
        onClose();
      }
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / (3600000 * 24));

    if (diffMins < 2) return lang === 'rw' ? 'Aka kanya' : 'Just now';
    if (diffMins < 60) return `${diffMins} ${lang === 'rw' ? 'iminota ishize' : 'mins ago'}`;
    if (diffHours < 24) return `${diffHours} ${lang === 'rw' ? 'amasaha ashize' : 'hours ago'}`;
    return `${diffDays} ${lang === 'rw' ? 'iminsi ishize' : 'days ago'}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 w-full max-w-lg rounded-3xl p-6 space-y-5 shadow-2xl relative max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-red-600/20 border border-red-500/40 rounded-2xl text-red-500 relative">
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] font-black flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-white text-lg flex items-center space-x-2">
                <span>{lang === 'rw' ? 'Ubutumwa bw\'Amakuru ya Filme' : 'Movie Update Notifications'}</span>
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                {lang === 'rw' 
                  ? `${unreadCount} Ubutumwa bushya bw'azongewe cyangwa zavuguruwe` 
                  : `${unreadCount} unread update alerts for added or updated movies`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions Bar */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between px-1 text-xs">
            <button
              onClick={() => markAllNotificationsAsRead()}
              className="text-zinc-400 hover:text-amber-400 flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <CheckCheck className="w-4 h-4" />
              <span>{lang === 'rw' ? 'Soma zose (Mark all read)' : 'Mark all as read'}</span>
            </button>
            <span className="text-zinc-600">•</span>
            <span className="text-zinc-500 font-mono text-[11px]">
              {notifications.length} {lang === 'rw' ? 'ubutumwa bwose' : 'total notifications'}
            </span>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 space-y-3">
              <Bell className="w-12 h-12 mx-auto text-zinc-700 opacity-50" />
              <p className="text-sm font-semibold">{lang === 'rw' ? 'Nta butumwa buhari ubu.' : 'No movie notifications yet.'}</p>
              <p className="text-xs text-zinc-600">{lang === 'rw' ? 'Iyo filme nshya yongewe cyangwa ivuguruwe, uzabibona hano!' : 'When new movies are added or updated by Admin, you will get alerts here!'}</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const matchedMovie = movies.find(m => m.id === notif.movieId || m.title.toLowerCase() === notif.movieTitle.toLowerCase());
              const isAdded = notif.type === 'added';

              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition-all space-y-3 relative group ${
                    !notif.isRead
                      ? 'bg-gradient-to-r from-red-950/40 via-zinc-900 to-zinc-900 border-red-500/40 shadow-lg'
                      : 'bg-zinc-950/80 border-zinc-800/80 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      {/* Movie Thumbnail / Badge */}
                      <div className="relative shrink-0">
                        <img
                          src={notif.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80'}
                          alt={notif.movieTitle}
                          className="w-12 h-16 rounded-xl object-cover border border-zinc-700 shadow-md"
                        />
                        <span className={`absolute -top-1.5 -left-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase text-white shadow ${
                          isAdded ? 'bg-emerald-600' : 'bg-amber-600'
                        }`}>
                          {isAdded ? (lang === 'rw' ? 'NSHYA' : 'NEW') : (lang === 'rw' ? 'UPDATE' : 'UPDATED')}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-white text-sm hover:text-red-400 transition-colors cursor-pointer" onClick={() => handleNotifClick(notif)}>
                            {notif.movieTitle}
                          </h4>
                          {!notif.isRead && (
                            <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping"></span>
                          )}
                        </div>

                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {lang === 'rw' ? notif.kinyarwandaMessage : notif.message}
                        </p>

                        <p className="text-[10px] text-zinc-500 font-mono">
                          {formatTimeAgo(notif.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => deleteNotification(notif.id)}
                      className="text-zinc-600 hover:text-red-400 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60 text-xs">
                    {matchedMovie ? (
                      <button
                        onClick={() => handleNotifClick(notif)}
                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs flex items-center space-x-1.5 transition-all shadow-md cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>{lang === 'rw' ? 'Kureba filme (Stream Now)' : 'Stream & Download'}</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-zinc-500 italic">
                        {lang === 'rw' ? 'Filme iraboneka mu mbonerahamwe' : 'Movie active in list'}
                      </span>
                    )}

                    {!notif.isRead && (
                      <button
                        onClick={() => markNotificationAsRead(notif.id)}
                        className="text-[11px] font-medium text-zinc-400 hover:text-amber-400 flex items-center space-x-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{lang === 'rw' ? 'Bika nka somwe' : 'Mark as read'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="pt-2 border-t border-zinc-800 text-center text-[11px] text-zinc-500">
          {lang === 'rw' 
            ? '💡 Uzajya ubona amakuru ya filme nshya igihe cyose Admin agize icyo ahindura.' 
            : '💡 You will automatically receive alerts whenever new movies are added or updated by Admin.'}
        </div>

      </div>
    </div>
  );
};
