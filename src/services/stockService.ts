import { supabase } from '../lib/supabase';

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
  name: string;
  high: number;
  low: number;
  volume: number;
}

const API_KEY = '3a5e1ff11de9499c8417ac7d3d93a1c9'; 

export async function getStockQuote(query: string): Promise<StockQuote | null> {
  try {
    const cleanQuery = query.trim();
    console.log(`Buscando activo en el mercado: ${cleanQuery}`);
    
    let response = await fetch(`https://api.twelvedata.com/quote?symbol=${cleanQuery.toUpperCase()}&apikey=${API_KEY}`);
    let data = await response.json();

    if (data.code && data.code !== 200 || !data.symbol) {
      console.log("Realizando búsqueda abierta en la bolsa...");
      
      const searchResponse = await fetch(`https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(cleanQuery)}&apikey=${API_KEY}`);
      const searchData = await searchResponse.json();

      if (!searchData.data || searchData.data.length === 0) {
        console.error("No se encontró ningún activo en la bolsa con ese nombre.");
        return null;
      }

      const matches = searchData.data;
      const bestMatch = matches.find((m: any) => m.country === 'United States' && m.instrument_type === 'Common Stock') || matches[0];
      
      const symbol = bestMatch.symbol;
      console.log(`Mejor coincidencia encontrada en bolsa: ${symbol} (${bestMatch.instrument_name})`);

      response = await fetch(`https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${API_KEY}`);
      data = await response.json();

      if (data.code && data.code !== 200) {
        console.error("Error de la API:", data.message);
        return null;
      }
    }

    return {
      symbol: data.symbol,
      price: parseFloat(data.close || data.price || 0),
      change: parseFloat(data.change || 0),
      percentChange: parseFloat(data.percent_change || 0),
      name: data.name || data.symbol,
      high: parseFloat(data.high || 0),
      low: parseFloat(data.low || 0),
      volume: parseInt(data.volume || 0)
    };
  } catch (error) {
    console.error("Error al obtener los datos de la acción:", error);
    return null;
  }
}

export async function getStockHistory(symbol: string) {
  try {
    const response = await fetch(`https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=30&apikey=${API_KEY}`);
    const data = await response.json();
    if (data.values) {
      return data.values.reverse(); 
    }
    return [];
  } catch (error) {
    console.error('Error al obtener histórico:', error);
    return [];
  }
}

export async function saveFavorite(symbol: string) {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .insert([{ symbol: symbol.toUpperCase(), user_id: 'default_user' }]);

    if (error) throw error;
    console.log("Guardado con éxito en Supabase:", data);
    return true;
  } catch (error) {
    console.error("Error al guardar favorito:", error);
    return false;
  }
}

export async function getFavorites() {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error al obtener favoritos:", error);
    return [];
  }
}