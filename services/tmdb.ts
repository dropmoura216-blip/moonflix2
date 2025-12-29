import { Movie } from '../types';

const API_KEY = '8bccc5e289c3133b4b27f9c368b2040f';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w342'; // Leve para cards
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280'; // HD para Hero

const movieCache: Record<string, any> = {};

// --- SISTEMA DE FILA DE REQUISIÇÕES (CONCURRENCY CONTROL) ---
class RequestQueue {
  private queue: (() => Promise<void>)[] = [];
  private pendingCount = 0;
  private maxConcurrency = 4; // REDUZIDO DE 8 PARA 4: Melhora estabilidade em mobile e redes 4G

  add(task: () => Promise<void>) {
    this.queue.push(task);
    this.processNext();
  }

  private processNext() {
    if (this.pendingCount >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const task = this.queue.shift();
    if (task) {
      this.pendingCount++;
      task().finally(() => {
        this.pendingCount--;
        this.processNext();
      });
    }
  }
}

const tmdbQueue = new RequestQueue();

const formatRuntime = (minutes: number): string => {
  if (!minutes) return 'N/A';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
};

export const TmdbService = {
  // Retorna uma Promise que resolve quando a vez dela na fila chegar
  async getMovieDetails(id: string, currentMovie: Movie): Promise<Movie> {
    if (!id) return currentMovie;
    // Retorna cache imediatamente se existir
    if (movieCache[id]) return { ...currentMovie, ...movieCache[id] };

    // Envolvemos a lógica real numa Promise controlada pela fila
    return new Promise((resolve) => {
      tmdbQueue.add(async () => {
        try {
          // Double check cache inside worker in case it was populated while waiting
          if (movieCache[id]) {
             resolve({ ...currentMovie, ...movieCache[id] });
             return;
          }

          let tmdbId = '';
          // Determina o tipo para a API (anime e cartoon são tratados como tv/serie no TMDB)
          let apiMediaType = (currentMovie.type === 'anime' || currentMovie.type === 'series' || currentMovie.type === 'cartoon') ? 'tv' : 'movie';

          // 1. Resolver ID (IMDB -> TMDB) e descobrir se é Filme ou Série
          if (id.startsWith('tt')) {
            const findUrl = `${BASE_URL}/find/${id}?api_key=${API_KEY}&external_source=imdb_id&language=pt-BR`;
            const findRes = await fetch(findUrl);
            const findData = await findRes.json();

            // Se o tipo original for Anime, Cartoon ou Série, prioriza resultados de TV
            if (currentMovie.type === 'anime' || currentMovie.type === 'series' || currentMovie.type === 'cartoon') {
                 if (findData.tv_results && findData.tv_results.length > 0) {
                    tmdbId = findData.tv_results[0].id;
                    apiMediaType = 'tv';
                 }
            } else {
                // Lógica padrão (auto-detecção)
                if (findData.movie_results && findData.movie_results.length > 0) {
                    tmdbId = findData.movie_results[0].id;
                    apiMediaType = 'movie';
                } else if (findData.tv_results && findData.tv_results.length > 0) {
                    tmdbId = findData.tv_results[0].id;
                    apiMediaType = 'tv';
                }
            }
          } else {
            tmdbId = id;
          }

          if (tmdbId) {
            // 2. Buscar Detalhes (Endpoint dinâmico: movie ou tv)
            const detailsUrl = `${BASE_URL}/${apiMediaType}/${tmdbId}?api_key=${API_KEY}&language=pt-BR&append_to_response=credits`;
            
            const detailsRes = await fetch(detailsUrl);
            const detailsData = await detailsRes.json();

            // Mantém o tipo original se foi passado assim, caso contrário usa a detecção
            let finalType = currentMovie.type;
            if (!finalType) {
                finalType = apiMediaType === 'tv' ? 'series' : 'movie';
            }
            
            const genreLabel = finalType === 'anime' ? 'Anime' : finalType === 'cartoon' ? 'Desenho' : (finalType === 'series' ? 'Série' : 'Filme');

            const genres = detailsData.genres?.map((g: any) => g.name) || [genreLabel];
            const cast = detailsData.credits?.cast?.slice(0, 5).map((c: any) => c.name) || [];

            // Mapeamento condicional
            const title = detailsData.title || detailsData.name;
            const releaseDate = detailsData.release_date || detailsData.first_air_date;
            const runtime = detailsData.runtime || (detailsData.episode_run_time && detailsData.episode_run_time.length > 0 ? detailsData.episode_run_time[0] : 0);

            const enrichedMovie: Partial<Movie> = {
              title: title,
              description: detailsData.overview || currentMovie.description,
              imageUrl: detailsData.poster_path ? `${IMAGE_BASE_URL}${detailsData.poster_path}` : currentMovie.imageUrl,
              backdropUrl: detailsData.backdrop_path ? `${BACKDROP_BASE_URL}${detailsData.backdrop_path}` : undefined,
              rating: detailsData.vote_average ? detailsData.vote_average.toFixed(1) : currentMovie.rating,
              voteCount: detailsData.vote_count,
              year: releaseDate ? parseInt(releaseDate.split('-')[0]) : currentMovie.year,
              fullReleaseDate: formatDate(releaseDate),
              duration: formatRuntime(runtime),
              genres: genres,
              genre: genres[0],
              cast: cast,
              type: finalType
            };

            movieCache[id] = enrichedMovie;
            resolve({ ...currentMovie, ...enrichedMovie });
          } else {
            // Se não achou ID, retorna o original mas marca no cache para não tentar de novo
            movieCache[id] = {}; 
            resolve(currentMovie);
          }
        } catch (error) {
          // Em caso de erro, resolve com o filme original para não travar a UI
          resolve(currentMovie);
        }
      });
    });
  },

  // --- NOVOS MÉTODOS DE BUSCA GLOBAL ---

  // Pesquisa na API do TMDB pelo nome
  async searchMovies(query: string): Promise<any[]> {
    try {
      // Busca filmes e séries (multi search)
      const searchUrl = `${BASE_URL}/search/multi?api_key=${API_KEY}&language=pt-BR&query=${encodeURIComponent(query)}&page=1&include_adult=false`;
      const res = await fetch(searchUrl);
      const data = await res.json();
      
      // Filtra apenas filmes e séries, normalizando o título
      return (data.results || []).filter((r: any) => r.media_type === 'movie' || r.media_type === 'tv').map((r: any) => ({
          ...r,
          title: r.title || r.name,
          release_date: r.release_date || r.first_air_date
      }));
    } catch (e) {
      console.error("TMDB Search Error", e);
      return [];
    }
  },

  // Obtém o ID IMDB (tt...) a partir de um ID TMDB
  async getImdbIdFromTmdb(tmdbId: number, mediaType?: 'movie' | 'tv'): Promise<string | null> {
    try {
      const endpoints = mediaType ? [mediaType] : ['movie', 'tv'];
      
      for (const type of endpoints) {
        const url = `${BASE_URL}/${type}/${tmdbId}/external_ids?api_key=${API_KEY}`;
        const res = await fetch(url);
        if (res.ok) {
            const data = await res.json();
            if (data.imdb_id) return data.imdb_id;
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  }
};