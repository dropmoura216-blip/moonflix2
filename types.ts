import React from 'react';

export interface Movie {
  id: number | string; // Permite IDs numéricos (mock) ou Strings (IMDB/Addons)
  imdbId?: string; // ID específico do IMDB (tt123456)
  title: string;
  imageUrl: string;
  backdropUrl?: string; // Imagem horizontal de alta qualidade para o Hero
  rating?: string;
  voteCount?: number; // Nova propriedade: Quantidade de votos
  year?: number;
  description?: string;
  genre?: string; // Mantido para compatibilidade
  genres?: string[]; // Nova propriedade: Lista completa de gêneros
  duration?: string;
  cast?: string[]; // Nova propriedade: Lista de atores principais
  fullReleaseDate?: string; // Nova propriedade: Data completa (DD/MM/AAAA)
  videoUrl?: string; // Mock video URL or Embed URL
  source?: string; // Origem do dado (ex: 'addon-brazuca')
  type?: 'movie' | 'series' | 'anime' | 'cartoon'; // Identificador do tipo de conteúdo
}

export interface Category {
  id: string;
  title: string;
  movies: Movie[];
}

export interface NavItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}

export type ViewState = 'home' | 'search' | 'profile' | 'browse' | 'auth';

export interface AddonCatalog {
  type: string;
  id: string;
  name?: string;
  extra?: Array<{ name: string; isRequired?: boolean }>;
}

export interface AddonManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  resources: string[];
  types?: string[];
  catalogs: AddonCatalog[];
  baseUrl?: string;
}

export interface InstalledAddon {
  manifest: AddonManifest;
  manifestUrl: string;
  active: boolean;
  installedAt: number;
}