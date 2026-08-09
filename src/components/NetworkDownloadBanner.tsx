import React, { useState } from 'react';
import { useNetworkDownloadMonitor } from '../hooks/useNetworkDownloadMonitor';
import { Wifi, WifiOff, Download, RefreshCw, X, CheckCircle2, AlertCircle, Trash2, Play, Film } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const NetworkDownloadBanner: React.FC = () => {
  const { lang } = useLanguage();
  const {
    isOnline,
    downloadQueue,
    networkToast,
    removeFromQueue,
    clearCompleted,
    processAndResumeQueue,
    dismissToast
  } = useNetworkDownloadMonitor();

  const [isQueueOpen, setIsQueueOpen] = useState<boolean>(false);

  const pendingCount = downloadQueue.filter(
    i => i.status === 'queued' || i.status === 'interrupted'
  ).length;

  return (
    <>
      {/* Network Alert Toast Banner */}
      {networkToast && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-50 max-w-sm w-full animate-slideUp">
          <div
            className={`p-3.5 rounded-2xl shadow-2xl border flex items-center justify-between space-x-3 backdrop-blur-md ${
              networkToast.type === 'offline'
                ? 'bg-amber-950/95 border-amber-500/80 text-amber-200'
                : networkToast.type === 'online' || networkToast.type === 'resumed'
                ? 'bg-emerald-950/95 border-emerald-500/80 text-emerald-200'
                : 'bg-zinc-900/95 border-zinc-700 text-zinc-200'
            }`}
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              {!isOnline ? (
                <WifiOff className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
              ) : (
                <Wifi className="w-5 h-5 text-emerald-400 shrink-0" />
              )}
              <span className="text-xs font-bold leading-tight truncate">
                {networkToast.message}
              </span>
            </div>

            <div className="flex items-center space-x-1 shrink-0">
              {pendingCount > 0 && isOnline && (
                <button
                  type="button"
                  onClick={processAndResumeQueue}
                  className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                  title="Resume Downloads"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={dismissToast}
                className="p-1 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Status Persistent Bar (When device loses internet) */}
      {!isOnline && (
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-zinc-950 px-4 py-1.5 font-bold text-xs shadow-inner flex items-center justify-between z-40">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-4 h-4 text-zinc-950 animate-pulse" />
            <span>
              {lang === 'rw'
                ? 'Nta Interineti iriho! Kumanura filme bizasubukura interineti nizagera...'
                : 'You are Offline. Interrupted downloads queued & will auto-resume when reconnected.'}
            </span>
          </div>

          {pendingCount > 0 && (
            <button
              type="button"
              onClick={() => setIsQueueOpen(true)}
              className="px-2.5 py-0.5 bg-zinc-950 text-amber-400 rounded-md text-[10px] uppercase font-mono tracking-wider hover:bg-zinc-900 cursor-pointer"
            >
              {pendingCount} Queued
            </button>
          )}
        </div>
      )}

      {/* Floating Download Manager Button (When items exist in queue) */}
      {downloadQueue.length > 0 && !isQueueOpen && (
        <button
          type="button"
          onClick={() => setIsQueueOpen(true)}
          className="fixed bottom-20 md:bottom-6 left-4 z-40 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 text-white px-3.5 py-2 rounded-2xl shadow-xl flex items-center space-x-2 transition-all cursor-pointer group backdrop-blur-md"
        >
          <div className="relative">
            <Download className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-amber-500 text-zinc-950 font-black text-[9px] rounded-full flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-zinc-200">
            {lang === 'rw' ? 'Ibyo Umanura' : 'Download Manager'}
          </span>
        </button>
      )}

      {/* Download Queue Modal Drawer */}
      {isQueueOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center space-x-2">
                <Download className="w-5 h-5 text-amber-400" />
                <h3 className="font-extrabold text-white text-sm">
                  {lang === 'rw' ? 'Gucunga Ibimanurwa (Download Queue)' : 'Download Queue & Monitor'}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsQueueOpen(false)}
                className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Network Status Badge */}
            <div className="px-4 py-2 bg-zinc-950/60 border-b border-zinc-800 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="font-bold text-zinc-300">
                  {isOnline ? (lang === 'rw' ? 'Interineti Irariho (Online)' : 'Network Connected') : (lang === 'rw' ? 'Nta Interineti (Offline)' : 'Offline Mode')}
                </span>
              </div>

              {isOnline && pendingCount > 0 && (
                <button
                  type="button"
                  onClick={processAndResumeQueue}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] flex items-center space-x-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{lang === 'rw' ? 'Subukura Zose' : 'Resume All'}</span>
                </button>
              )}
            </div>

            {/* Queue List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {downloadQueue.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-xs">
                  {lang === 'rw' ? 'Nta filme ziri mu mumanuro.' : 'No movie downloads in queue.'}
                </div>
              ) : (
                downloadQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between space-x-3"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white text-xs truncate">
                          {item.movieTitle}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.2 bg-zinc-800 text-amber-300 rounded font-mono">
                          {item.quality}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-[10px]">
                        {item.status === 'completed' && (
                          <span className="text-emerald-400 font-bold flex items-center space-x-1">
                            <span>✓ {lang === 'rw' ? 'Yarangiye' : 'Downloaded'}</span>
                          </span>
                        )}
                        {(item.status === 'queued' || item.status === 'interrupted') && (
                          <span className="text-amber-400 font-bold flex items-center space-x-1">
                            <span>⏳ {lang === 'rw' ? 'Itegereje interineti...' : 'Queued (Auto-resumes online)'}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      {item.status === 'completed' && (
                        <a
                          href={`/api/download?url=${encodeURIComponent(item.videoUrl)}&title=${encodeURIComponent(item.movieTitle)}&quality=${encodeURIComponent(item.quality)}`}
                          download={`${item.movieTitle.replace(/[^a-zA-Z0-9_\-]/g, '_')}_${item.quality}_BestFilms.mp4`}
                          className="px-2 py-1 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-[11px] rounded-lg flex items-center space-x-1 cursor-pointer transition-colors shadow"
                          title="Save MP4 Video File"
                        >
                          <Download className="w-3 h-3 fill-zinc-950" />
                          <span>MP4</span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => removeFromQueue(item.id)}
                        className="p-1.5 hover:bg-red-950/50 text-zinc-500 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {downloadQueue.some(i => i.status === 'completed') && (
              <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex justify-end">
                <button
                  type="button"
                  onClick={clearCompleted}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  {lang === 'rw' ? 'Siba ibyarangiye' : 'Clear Completed'}
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </>
  );
};
