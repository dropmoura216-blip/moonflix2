import { supabase } from './supabase';

const FALLBACK_PREFIX = 'moonflix_fallback_';

// Helper para gerenciar fallback local (Offline Mode)
const LocalStorageFallback = {
  get(type: 'favorites' | 'likes', userId: string): string[] {
    try {
      const key = `${FALLBACK_PREFIX}${type}_${userId}`;
      return JSON.parse(localStorage.getItem(key) || '[]');
    } catch (e) {
      return [];
    }
  },
  
  add(type: 'favorites' | 'likes', userId: string, movieId: string) {
    const key = `${FALLBACK_PREFIX}${type}_${userId}`;
    const current = this.get(type, userId);
    if (!current.includes(movieId)) {
      current.push(movieId);
      localStorage.setItem(key, JSON.stringify(current));
    }
  },
  
  remove(type: 'favorites' | 'likes', userId: string, movieId: string) {
    const key = `${FALLBACK_PREFIX}${type}_${userId}`;
    const current = this.get(type, userId);
    const updated = current.filter(id => id !== movieId);
    localStorage.setItem(key, JSON.stringify(updated));
  },
  
  has(type: 'favorites' | 'likes', userId: string, movieId: string): boolean {
    return this.get(type, userId).includes(movieId);
  }
};

export const UserService = {
  // --- FAVORITOS ---
  
  async addToFavorites(userId: string, movieId: string) {
    // Tenta salvar no Supabase
    const { error } = await supabase
      .from('favorites')
      .insert([{ user_id: userId, movie_id: movieId.toString() }]);
    
    // Se falhar (ex: sem internet), salva localmente
    if (error) {
      console.warn("Sync error (Favorites):", error.message);
      LocalStorageFallback.add('favorites', userId, movieId.toString());
    }
  },

  async removeFromFavorites(userId: string, movieId: string) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('movie_id', movieId.toString());
      
    if (error) {
      console.warn("Sync error (Favorites):", error.message);
      LocalStorageFallback.remove('favorites', userId, movieId.toString());
    }
  },

  async isFavorite(userId: string, movieId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('movie_id', movieId.toString())
      .maybeSingle();
    
    if (error) {
      return LocalStorageFallback.has('favorites', userId, movieId.toString());
    }
    return !!data;
  },

  async getUserFavorites(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('favorites')
      .select('movie_id')
      .eq('user_id', userId);
      
    if (error) {
      return LocalStorageFallback.get('favorites', userId);
    }
    
    // Combina dados do banco com dados locais temporários se necessário, 
    // ou apenas retorna do banco. Aqui priorizamos o banco.
    if (!data) return [];
    return data.map((item: any) => item.movie_id);
  },

  // --- LIKES ---

  async toggleLike(userId: string, movieId: string) {
    const { data, error: fetchError } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('movie_id', movieId.toString())
      .maybeSingle();

    if (fetchError) {
       // Fallback logic
       const hasLiked = LocalStorageFallback.has('likes', userId, movieId.toString());
       if (hasLiked) {
         LocalStorageFallback.remove('likes', userId, movieId.toString());
         return false;
       } else {
         LocalStorageFallback.add('likes', userId, movieId.toString());
         return true;
       }
    }

    if (data) {
      // Remove like
      const { error } = await supabase.from('likes').delete().eq('id', data.id);
      if (error) throw error;
      return false; 
    } else {
      // Adiciona like
      const { error } = await supabase.from('likes').insert([{ user_id: userId, movie_id: movieId.toString() }]);
      if (error) throw error;
      return true; 
    }
  },

  async hasLiked(userId: string, movieId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', userId)
      .eq('movie_id', movieId.toString())
      .maybeSingle();
      
    if (error) {
      return LocalStorageFallback.has('likes', userId, movieId.toString());
    }
    return !!data;
  }
};
