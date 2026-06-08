import axios from 'axios';
import { TMDBResponse, Movie, MovieDetails, Genre, SearchResult } from '../types';

// Using a public TMDB API key for demo purposes
const TMDB_API_KEY = '8265bd1679663a7ea12ac168da84d2e8';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const tmdb = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
    language: 'en-US',
  },
});

export const getImageUrl = (path: string | null, size: string = 'original'): string => {
  if (!path) return '/placeholder.jpg';
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
};

export const getPosterUrl = (path: string | null): string => getImageUrl(path, 'w500');
export const getBackdropUrl = (path: string | null): string => getImageUrl(path, 'w1280');
export const getThumbUrl = (path: string | null): string => getImageUrl(path, 'w342');

// Trending
export const getTrending = async (mediaType: 'all' | 'movie' | 'tv' = 'all', timeWindow: 'day' | 'week' = 'week'): Promise<TMDBResponse<Movie>> => {
  const { data } = await tmdb.get(`/trending/${mediaType}/${timeWindow}`);
  return data;
};

// Popular
export const getPopularMovies = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const { data } = await tmdb.get('/movie/popular', { params: { page } });
  return data;
};

export const getPopularTV = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const { data } = await tmdb.get('/tv/popular', { params: { page } });
  return data;
};

// Top Rated
export const getTopRatedMovies = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const { data } = await tmdb.get('/movie/top_rated', { params: { page } });
  return data;
};

export const getTopRatedTV = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const { data } = await tmdb.get('/tv/top_rated', { params: { page } });
  return data;
};

// Now Playing / Airing Today
export const getNowPlaying = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const { data } = await tmdb.get('/movie/now_playing', { params: { page } });
  return data;
};

export const getAiringToday = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const { data } = await tmdb.get('/tv/airing_today', { params: { page } });
  return data;
};

// Upcoming
export const getUpcomingMovies = async (page = 1): Promise<TMDBResponse<Movie>> => {
  const { data } = await tmdb.get('/movie/upcoming', { params: { page } });
  return data;
};

// Details
export const getMovieDetails = async (id: number): Promise<MovieDetails> => {
  const { data } = await tmdb.get(`/movie/${id}`, {
    params: { append_to_response: 'videos,credits,similar,recommendations,external_ids' },
  });
  return data;
};

export const getTVDetails = async (id: number): Promise<MovieDetails> => {
  const { data } = await tmdb.get(`/tv/${id}`, {
    params: { append_to_response: 'videos,credits,similar,recommendations,external_ids' },
  });
  return data;
};

// Search
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

// Genres
export const getMovieGenres = async (): Promise<{ genres: Genre[] }> => {
  const { data } = await tmdb.get('/genre/movie/list');
  return data;
};

export const getTVGenres = async (): Promise<{ genres: Genre[] }> => {
  const { data } = await tmdb.get('/genre/tv/list');
  return data;
};

// Discover by Genre
export const discoverByGenre = async (genreId: number, mediaType: 'movie' | 'tv' = 'movie', page = 1): Promise<TMDBResponse<Movie>> => {
  const { data } = await tmdb.get(`/discover/${mediaType}`, {
    params: { with_genres: genreId, page, sort_by: 'popularity.desc' },
  });
  return data;
};

// Get movie title (works for both movies and TV shows)
export const getTitle = (item: Movie): string => item.title || item.name || 'Unknown';
export const getReleaseYear = (item: Movie): string => {
  const date = item.release_date || item.first_air_date;
  return date ? new Date(date).getFullYear().toString() : 'N/A';
};
