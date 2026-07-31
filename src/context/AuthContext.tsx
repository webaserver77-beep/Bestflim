import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, SubscriptionPlan } from '../types';

interface AuthContextType {
  user: UserProfile;
  login: (name: string, email: string) => void;
  logout: () => void;
  toggleFavorite: (movieId: string) => void;
  isFavorite: (movieId: string) => boolean;
  toggleWatchLater: (movieId: string) => void;
  isInWatchLater: (movieId: string) => boolean;
  updateWatchHistory: (movieId: string, progress: number) => void;
  createPlaylist: (name: string, movieIds: string[]) => void;
  updateSubscription: (plan: SubscriptionPlan) => void;
}

const DEFAULT_FREE_PLAN: SubscriptionPlan = {
  id: 'free',
  name: "Plan y'Ubuntu (Free Plan)",
  type: 'free',
  price: '0 RWF',
  amountRwf: 0,
  startedAt: new Date().toISOString().split('T')[0],
  endsAt: 'Lifetime (Ntabwo Irangira)',
  isActive: true,
};

const DEFAULT_GUEST_USER: UserProfile = {
  id: 'guest_user',
  name: 'Umushyitsi (Guest)',
  email: 'guest@bestfilms.com',
  isGuest: true,
  favorites: ['m1', 's1'],
  watchLater: ['m2', 'm4'],
  watchHistory: [
    { movieId: 'm1', progress: 65, lastWatchedAt: new Date().toISOString() },
    { movieId: 's1', progress: 30, lastWatchedAt: new Date().toISOString() },
  ],
  playlists: [
    { id: 'p1', name: 'Agasobanuye ka Rocky', movieIds: ['m1', 's2'] },
  ],
  subscription: DEFAULT_FREE_PLAN,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('rebamovie_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user profile', e);
      }
    }
    return DEFAULT_GUEST_USER;
  });

  useEffect(() => {
    localStorage.setItem('rebamovie_user_profile', JSON.stringify(user));
  }, [user]);

  const login = (name: string, email: string) => {
    const newUser: UserProfile = {
      ...user,
      id: `user_${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      isGuest: false,
    };
    setUser(newUser);
  };

  const logout = () => {
    setUser(DEFAULT_GUEST_USER);
  };

  const toggleFavorite = (movieId: string) => {
    setUser((prev) => {
      const exists = prev.favorites.includes(movieId);
      const newFavs = exists
        ? prev.favorites.filter((id) => id !== movieId)
        : [...prev.favorites, movieId];
      return { ...prev, favorites: newFavs };
    });
  };

  const isFavorite = (movieId: string) => {
    return user.favorites.includes(movieId);
  };

  const toggleWatchLater = (movieId: string) => {
    setUser((prev) => {
      const exists = prev.watchLater.includes(movieId);
      const newWatchLater = exists
        ? prev.watchLater.filter((id) => id !== movieId)
        : [...prev.watchLater, movieId];
      return { ...prev, watchLater: newWatchLater };
    });
  };

  const isInWatchLater = (movieId: string) => {
    return user.watchLater.includes(movieId);
  };

  const updateWatchHistory = (movieId: string, progress: number) => {
    setUser((prev) => {
      const existingIdx = prev.watchHistory.findIndex((item) => item.movieId === movieId);
      let newHistory = [...prev.watchHistory];
      if (existingIdx >= 0) {
        newHistory[existingIdx] = {
          movieId,
          progress,
          lastWatchedAt: new Date().toISOString(),
        };
      } else {
        newHistory.unshift({
          movieId,
          progress,
          lastWatchedAt: new Date().toISOString(),
        });
      }
      return { ...prev, watchHistory: newHistory };
    });
  };

  const createPlaylist = (name: string, movieIds: string[]) => {
    setUser((prev) => ({
      ...prev,
      playlists: [
        ...prev.playlists,
        {
          id: `playlist_${Date.now()}`,
          name,
          movieIds,
        },
      ],
    }));
  };

  const updateSubscription = (plan: SubscriptionPlan) => {
    setUser((prev) => ({
      ...prev,
      subscription: plan,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        toggleFavorite,
        isFavorite,
        toggleWatchLater,
        isInWatchLater,
        updateWatchHistory,
        createPlaylist,
        updateSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
