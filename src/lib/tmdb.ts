import axios from 'axios';
import { TMDBResponse, Movie, Genre, SearchResult } from '../types';

// Hardcoded fallback keys retained from your source configuration specs
export const API_KEY = '043a45de34cc570b9ef0f18ee99aa867'; 
export const BASE_URL = 'https://api.themoviedb.org/3';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '8265bd1679663a7ea12ac168da84d2e8';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

// Simple, fast in-memory cache map to serve as a client-side edge emulation layer
const requestCache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000; // Cache data for exactly 5 minutes (Golden ratio aligned sub-intervals)

export const tmdb = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: 5000, // Retained your 5-second catch-fallback timeout threshold
  params: {
    api_key: TMDB_API_KEY,
    language: 'en-US',
  },
});

// ── ADVANCED NETWORK INTERCEPTOR RIG ──
// Intercepts outbound traffic to instantly deliver cached promises if they exist
tmdb.interceptors.request.use((config) => {
  // Generate a unique tracking key using the endpoint url string and its query parameters
  const cacheKey = `${config.url}?${new URLSearchParams(config.params as Record<string, string>).toString()}`;
  const cachedResponse = requestCache.get(cacheKey);

  if (cachedResponse && cachedResponse.expiry > Date.now()) {
    // If the cache hits and hasn't expired, cancel the request chain and pass the clean data through an Axios CancelToken
    const source = axios.CancelToken.source();
    config.cancelToken = source.token;
    source.cancel(JSON.stringify(cachedResponse.data));
  }
  return config;
});

// Intercepts successful incoming network data packages to save them in our memory track line
tmdb.interceptors.response.use(
  (response) => {
    const cacheKey = `${response.config.url}?${new URLSearchParams(response.config.params as Record<string, string>).toString()}`;
    requestCache.set(cacheKey, {
      data: response.data,
      expiry: Date.now() + CACHE_TTL,
    });
    return response;
  },
  (error) => {
    // If the request was cancelled by our cache system interrupter, parse and return the saved data cleanly
    if (axios.isCancel(error)) {
      return Promise.resolve({ data: JSON.parse(error.message) });
    }
    return Promise.reject(error);
  }
);

// ── Keep your image helpers and endpoint functions exactly the same below this line ──
export const getImageUrl = (path: string | null, size: string = 'original'): string => {
  if (!path) return '/placeholder.jpg';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getPosterUrl = (path: string | null): string => getImageUrl(path, 'w500');
export const getBackdropUrl = (path: string | null): string => getImageUrl(path, 'w1280');
export const getThumbUrl = (path: string | null): string => getImageUrl(path, 'w342');
export const getLogoUrl = (path: string | null): string => getImageUrl(path, 'w500');

// ── Trending ──
export const getTrending = async (mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<TMDBResponse<Movie>> => {
  const { data } = await tmdb.get(`/trending/${mediaType}/${timeWindow}`);
  return data;
};

// ── Popular ──
export const getPopularMovies = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const { data } = await tmdb.get('/movie/popular', { params: { page } });
  return data;
};

export const getPopularTV = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const { data } = await tmdb.get('/tv/popular', { params: { page } });
  return data;
};

// ── Top Rated ──
export const getTopRatedMovies = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const { data } = await tmdb.get('/movie/top_rated', { params: { page } });
  return data;
};

export const getTopRatedTV = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const { data } = await tmdb.get('/tv/top_rated', { params: { page } });
  return data;
};

// ── Now Playing / Airing Today ──
export const getNowPlaying = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const { data } = await tmdb.get('/movie/now_playing', { params: { page } });
  return data;
};

// Named to match your core series tab import requirements cleanly
export const getAiringTodayTV = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const { data } = await tmdb.get('/tv/airing_today', { params: { page } });
  return data;
};

// Retained for backward-compatibility hooks
export const getAiringToday = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const { data } = await tmdb.get('/tv/airing_today', { params: { page } });
  return data;
};

// ── On The Air TV (Added explicitly to resolve missing export crash) ──
export const getOnTheAirTV = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const { data } = await tmdb.get('/tv/on_the_air', { params: { page } });
  return data;
};

// ── Upcoming ──
export const getUpcomingMovies = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const { data } = await tmdb.get('/movie/upcoming', { params: { page } });
  return data;
};

// ── Details ──
export const getMovieDetails = async (id: number): Promise<any> => {
  const response = await fetch(
    `${BASE_URL}/movie/${id}?api_key=${API_KEY}&append_to_response=videos,credits,similar,recommendations,external_ids,images,release_dates,content_ratings`
  );
  return response.json();
};

export const getTVDetails = async (id: number): Promise<any> => {
  const response = await fetch(
    `${BASE_URL}/tv/${id}?api_key=${API_KEY}&append_to_response=videos,credits,similar,recommendations,external_ids,images,release_dates,content_ratings`
  );
  return response.json();
};

/**
 * Dynamic Season & Episode Track Mapping Resolver Engine
 * Pulls episode stills, air dates, and titles for target seasons.
 */
export const getTVSeasonDetails = async (seriesId: number, seasonNumber: number): Promise<any> => {
  const { data } = await tmdb.get(`/tv/${seriesId}/season/${seasonNumber}`);
  return data;
};

// ── Search ──
export const searchMulti = async (query: string, page = 1): Promise<TMDBResponse<SearchResult>> => {
  const { data } = await tmdb.get('/search/multi', { params: { query, page, include_adult: false } });
  return data;
};

export const searchMovies = async (query: string, page = 1): Promise<TMDBResponse<Movie>> => {
  const { data } = await tmdb.get('/search/movie', { params: { query, page, include_adult: false } });
  return data;
};

export const searchTV = async (query: string, page = 1): Promise<TMDBResponse<Movie>> => {
  const { data } = await tmdb.get('/search/tv', { params: { query, page, include_adult: false } });
  return data;
};

// ── Genres ──
export const getMovieGenres = async (): Promise<{ genres: Genre[] }> => {
  const { data } = await tmdb.get('/genre/movie/list');
  return data;
};

export const getTVGenres = async (): Promise<{ genres: Genre[] }> => {
  const { data } = await tmdb.get('/genre/tv/list');
  return data;
};

// ── Discover by Genre ──
export const discoverByGenre = async (genreId: number, mediaType: 'movie' | 'tv' = 'movie', page = 1): Promise<TMDBResponse<Movie>> => {
  const { data } = await tmdb.get(`/discover/${mediaType}`, {
    params: { with_genres: genreId, page, sort_by: 'popularity.desc' },
  });
  return data;
};

// ── Formatting Helpers ──
export const getTitle = (item: Movie): string => item.title || item.name || 'Unknown';
export const getReleaseYear = (item: Movie): string => {
  const date = item.release_date || item.first_air_date;
  return date ? new Date(date).getFullYear().toString() : 'N/A';
};