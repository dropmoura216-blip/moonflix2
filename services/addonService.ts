import { AddonManifest, InstalledAddon, Movie, Category } from '../types';

const STORAGE_KEY = 'moonflix_addons';

export const AddonService = {
  // 0. Inicializar com Defaults
  async initializeDefaults() {
    const current = this.getAddons();
    // Verifica se o Brazuca já está instalado
    const hasBrazuca = current.some(a => a.manifestUrl.includes('brazuca-torrents'));
    
    if (!hasBrazuca) {
      console.log("Inicializando addon Brazuca...");
      try {
        await this.installAddon('https://94c8cb9f702d-brazuca-torrents.baby-beamup.club/manifest.json');
      } catch (e) {
        console.warn("Falha ao instalar addon padrão:", e);
      }
    }
  },

  // 1. Validar e Instalar Addon
  async installAddon(url: string): Promise<InstalledAddon> {
    try {
      // Normalizar URL (remover trailing slash)
      const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
      const manifestUrl = cleanUrl.endsWith('manifest.json') ? cleanUrl : `${cleanUrl}/manifest.json`;

      const response = await fetch(manifestUrl);
      if (!response.ok) throw new Error('Falha ao baixar manifest');
      
      const manifest: AddonManifest = await response.json();

      // Validação Mínima
      if (!manifest.id || !manifest.name || !manifest.version) {
        throw new Error('Manifest inválido: campos obrigatórios ausentes (id, name, version)');
      }

      // Adicionar BaseURL para requests futuros
      const baseUrl = manifestUrl.substring(0, manifestUrl.lastIndexOf('/'));
      manifest.baseUrl = baseUrl;

      const newAddon: InstalledAddon = {
        manifest,
        manifestUrl,
        active: true,
        installedAt: Date.now(),
      };

      // Salvar
      const currentAddons = this.getAddons();
      // Remove se já existir (atualização)
      const filtered = currentAddons.filter(a => a.manifest.id !== manifest.id);
      filtered.push(newAddon);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

      return newAddon;
    } catch (error) {
      console.error("Addon Install Error:", error);
      throw error;
    }
  },

  // 2. Recuperar Addons
  getAddons(): InstalledAddon[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  // 3. Remover Addon
  removeAddon(addonId: string) {
    const current = this.getAddons();
    const updated = current.filter(a => a.manifest.id !== addonId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  // 4. Toggle Ativo/Inativo
  toggleAddon(addonId: string) {
    const current = this.getAddons();
    const updated = current.map(a => 
      a.manifest.id === addonId ? { ...a, active: !a.active } : a
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  // 5. Fetch Conteúdo dos Addons
  async fetchAddonCatalogs(): Promise<Category[]> {
    const addons = this.getAddons().filter(a => a.active);
    const categories: Category[] = [];

    for (const addon of addons) {
      if (addon.manifest.resources.includes('catalog') && addon.manifest.catalogs) {
        
        // Itera sobre todos os catálogos disponíveis no addon
        for (const catalog of addon.manifest.catalogs) {
           // Ignora catálogos que exigem pesquisa (search) para exibir conteúdo inicial
           if (catalog.extra && catalog.extra.some(e => e.isRequired && e.name === 'search')) {
             continue;
           }

           try {
            // Monta URL: /catalog/{type}/{id}.json
            const url = `${addon.manifest.baseUrl}/catalog/${catalog.type}/${catalog.id}.json`;
            const res = await fetch(url);
            
            if (res.ok) {
              const data = await res.json();
              const metas = data.metas || [];

              if (metas.length > 0) {
                const movies: Movie[] = metas.map((meta: any) => {
                  
                  // Lógica de URL de vídeo usando PlayerFlix API
                  let videoUrl = `stremio://${addon.manifest.id}/${meta.type}/${meta.id}`;
                  
                  // Verifica se é um ID do IMDB (começa com 'tt')
                  if (meta.id && typeof meta.id === 'string' && meta.id.startsWith('tt')) {
                      // Usamos o endpoint /filme/ da PlayerFlix API.
                      // Nota: Mesmo para séries, se tivermos apenas o IMDB ID (tt...), usamos este endpoint,
                      // pois o endpoint /serie/ exige TMDB ID + Season + Episode, dados que não temos
                      // diretamente na listagem do catálogo do Stremio sem conversão adicional.
                      videoUrl = `https://playerflixapi.com/filme/${meta.id}`;
                  }

                  return {
                    id: meta.id, 
                    title: meta.name,
                    imageUrl: meta.poster,
                    rating: meta.imdbRating || 'N/A',
                    year: parseInt(meta.releaseInfo) || new Date().getFullYear(),
                    description: meta.description || `Conteúdo fornecido por ${addon.manifest.name}`,
                    genre: meta.genres ? meta.genres[0] : 'Streaming',
                    duration: meta.runtime ? meta.runtime : 'N/A',
                    source: addon.manifest.id,
                    videoUrl: videoUrl 
                  };
                });

                categories.push({
                  id: `addon-${addon.manifest.id}-${catalog.id}`,
                  title: `${addon.manifest.name} - ${catalog.name}`,
                  movies: movies
                });
              }
            }
          } catch (e) {
            console.warn(`Falha ao carregar catálogo ${catalog.name} do addon ${addon.manifest.name}`, e);
          }
        }
      }
    }

    return categories;
  }
};