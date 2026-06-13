import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Movie, Genre } from '../types';

export interface ContinueWatchingItem {
  id: number;
  type: 'movie' | 'tv';
  season?: number;
  episode?: number;
  movie: Movie;
  watchedAt: number;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppState {
  // Search
  searchQuery: string;
  isSearchOpen: boolean;
  setSearchQuery: (query: string) => void;
  setIsSearchOpen: (open: boolean) => void;

  // Selected Media
  selectedMedia: Movie | null;
  isModalOpen: boolean;
  setSelectedMedia: (media: Movie | null) => void;
  setIsModalOpen: (open: boolean) => void;

  // Genres
  genres: Genre[];
  setGenres: (genres: Genre[]) => void;

  // Active Genre Filter
  activeGenreId: number | null;
  setActiveGenreId: (id: number | null) => void;

  // Watchlist
  watchlist: Movie[];
  addToWatchlist: (movie: Movie) => void;
  removeFromWatchlist: (id: number) => void;
  clearWatchlist: () => void;
  isInWatchlist: (id: number) => boolean;

  // Continue Watching
  continueWatching: ContinueWatchingItem[];
  addToContinueWatching: (item: Omit<ContinueWatchingItem, 'watchedAt'>) => void;
  removeFromContinueWatching: (id: number) => void;

  // Active Tab
  activeTab: 'home' | 'movies' | 'series' | 'search' | 'genres' | 'watchlist';
  setActiveTab: (tab: 'home' | 'movies' | 'series' | 'search' | 'genres' | 'watchlist') => void;

  // Player
  playerMedia: {
    id: number;
    type: 'movie' | 'tv';
    season?: number;
    episode?: number;
    movie?: Movie;
  } | null;
  isPlayerOpen: boolean;
  setPlayerMedia: (media: {
    id: number;
    type: 'movie' | 'tv';
    season?: number;
    episode?: number;
    movie?: Movie;
  } | null) => void;
  setIsPlayerOpen: (open: boolean) => void;

  // Toasts
  toasts: ToastItem[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      searchQuery: '',
      isSearchOpen: false,
      setSearchQuery: (query) => set({ searchQuery: query }),
      setIsSearchOpen: (open) => set({ isSearchOpen: open }),

      selectedMedia: null,
      isModalOpen: false,
      setSelectedMedia: (media) => set({ selectedMedia: media }),
      setIsModalOpen: (open) => set({ isModalOpen: open }),

      genres: [],
      setGenres: (genres) => set({ genres }),

      activeGenreId: null,
      setActiveGenreId: (id) => set({ activeGenreId: id }),

      watchlist: [],
      addToWatchlist: (movie) => {
        set((state) => ({ watchlist: [...state.watchlist, movie] }));
        get().addToast('Added to watchlist', 'success');
      },
      removeFromWatchlist: (id) => {
        set((state) => ({ watchlist: state.watchlist.filter((m) => m.id !== id) }));
        get().addToast('Removed from watchlist', 'info');
      },
      clearWatchlist: () => {
        set({ watchlist: [] });
        get().addToast('Watchlist cleared', 'info');
      },
      isInWatchlist: (id) => get().watchlist.some((m) => m.id === id),

      continueWatching: [],
      addToContinueWatching: (item) =>
        set((state) => {
          const filtered = state.continueWatching.filter((c) => c.id !== item.id);
          return {
            continueWatching: [
              { ...item, watchedAt: Date.now() },
              ...filtered,
            ].slice(0, 20),
          };
        }),
      removeFromContinueWatching: (id) =>
        set((state) => ({
          continueWatching: state.continueWatching.filter((c) => c.id !== id),
        })),

      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),

      playerMedia: null,
      isPlayerOpen: false,
      setPlayerMedia: (media) => set({ playerMedia: media }),
      setIsPlayerOpen: (open) => set({ isPlayerOpen: open }),

      toasts: [],
      addToast: (message, type = 'success') => {
        const id = Math.random().toString(36).slice(2, 9);
        set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
        setTimeout(() => get().removeToast(id), 3000);
      },
      removeToast: (id) =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
    }),
    {
      name: 'me-time-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        watchlist: state.watchlist,
        continueWatching: state.continueWatching,
      }),
    }
  )
);