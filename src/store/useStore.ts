import { create } from 'zustand';
import { Movie, Genre } from '../types';

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
  isInWatchlist: (id: number) => boolean;

  // Active Tab
  activeTab: 'home' | 'movies' | 'series' | 'genres' | 'search' | 'list';
  setActiveTab: (tab: 'home' | 'movies' | 'series' | 'search' | 'genres') => void;

  // Player
  playerMedia: { id: number; type: 'movie' | 'tv'; season?: number; episode?: number } | null;
  isPlayerOpen: boolean;
  setPlayerMedia: (media: { id: number; type: 'movie' | 'tv'; season?: number; episode?: number } | null) => void;
  setIsPlayerOpen: (open: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
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
  addToWatchlist: (movie) => set((state) => ({ watchlist: [...state.watchlist, movie] })),
  removeFromWatchlist: (id) => set((state) => ({ watchlist: state.watchlist.filter((m) => m.id !== id) })),
  isInWatchlist: (id) => get().watchlist.some((m) => m.id === id),

  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),

  playerMedia: null,
  isPlayerOpen: false,
  setPlayerMedia: (media) => set({ playerMedia: media }),
  setIsPlayerOpen: (open) => set({ isPlayerOpen: open }),
}));
