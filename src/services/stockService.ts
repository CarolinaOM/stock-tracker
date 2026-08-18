import { supabase } from '../Lib/supabase';

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  percentChange: number;
  name: string;
}

export async function getStockQuote(symbol: string): Promise<StockQuote | null> {
  try {
    console.log(`Consultando activo: ${symbol}`);
    
    return {
      symbol: symbol.toUpperCase(),
      price: 150.25,
      change: 2.50,
      percentChange: 1.69,
      name: "Empresa de Ejemplo S.A."
    };
  } catch (error) {
    console.error("Error al obtener los datos de la acción:", error);
    return null;
  }
}

// Nueva función para guardar en Supabase
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