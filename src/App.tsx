import { useState, useEffect } from 'react';
import { getStockQuote, saveFavorite, getFavorites, getStockHistory, type StockQuote } from './services/stockService';
import { supabase } from './lib/supabase';
import { Search, TrendingUp, DollarSign, BookmarkPlus, Star, BarChart2, Trash2 } from 'lucide-react';

function App() {
  const [symbol, setSymbol] = useState('');
  const [stock, setStock] = useState<StockQuote | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [timeframe, setTimeframe] = useState('1M');

  useEffect(() => {
    loadFavoritesList();
  }, []);

  const loadFavoritesList = async () => {
    const data = await getFavorites();
    setFavorites(data);
  };

  const handleSearch = async (queryToSearch: string) => {
    if (!queryToSearch.trim()) return;

    setLoading(true);
    setSaved(false);
    
    const data = await getStockQuote(queryToSearch);
    setStock(data);

    if (data) {
      const histData = await getStockHistory(data.symbol);
      setHistory(histData);
    }

    setLoading(false);
  };

  const onSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(symbol);
  };

  const handleSelectFavorite = (favSymbol: string) => {
    setSymbol(favSymbol);
    handleSearch(favSymbol);
  };

  const handleSaveFavorite = async () => {
    if (!stock) return;
    const success = await saveFavorite(stock.symbol);
    if (success) {
      setSaved(true);
      loadFavoritesList();
    }
  };

  const handleDeleteFavorite = async (e: React.MouseEvent, favSymbol: string) => {
    e.stopPropagation(); 
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('symbol', favSymbol);

      if (error) throw error;
      
      if (stock && stock.symbol === favSymbol) {
        setStock(null);
        setSymbol('');
        setHistory([]);
      }

      loadFavoritesList(); 
    } catch (error) {
      console.error('Error al eliminar favorito:', error);
    }
  };

  return (
    <div className="dashboard-layout">
      
      <aside className="sidebar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', paddingLeft: '0.25rem' }}>
          <TrendingUp style={{ color: '#c084fc', width: '24px', height: '24px' }} />
          <span style={{ fontWeight: 'bold', fontSize: '1.1rem', letterSpacing: '0.5px' }}>StockTracker</span>
        </div>

        <h3 style={{ fontSize: '0.75rem', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', paddingLeft: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Star style={{ width: '14px', height: '14px', color: '#c084fc' }} /> Mis Activos Favoritos
        </h3>

        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {favorites.length === 0 ? (
            <p style={{ fontSize: '0.8rem', color: '#6b7280', padding: '1rem 0.25rem', textAlign: 'center' }}>No tienes favoritos guardados aún.</p>
          ) : (
            favorites.map((fav, index) => (
              <div 
                key={index} 
                onClick={() => handleSelectFavorite(fav.symbol)}
                className="favorite-item"
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#181b24', border: '1px solid #232936', transition: 'all 0.2s' }}
              >
                <div>
                  <span style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#ffffff' }}>{fav.symbol}</span>
                  <p style={{ fontSize: '0.7rem', color: '#9ca3af', margin: 0 }}>Guardado</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#c084fc', backgroundColor: 'rgba(168, 85, 247, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '0.375rem' }}>
                    Ver
                  </span>
                  <button 
                    onClick={(e) => handleDeleteFavorite(e, fav.symbol)}
                    title="Eliminar de favoritos"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '0.2rem', display: 'flex', alignItems: 'center' }}
                  >
                    <Trash2 style={{ width: '15px', height: '15px' }} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>

      <main className="main-content">
        
        <div className="search-card">
          <form onSubmit={onSubmitSearch} style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
              <Search style={{ position: 'absolute', left: '0.875rem', color: '#9ca3af', width: '20px', height: '20px' }} />
              <input
                type="text"
                placeholder="Busca cualquier empresa (Ej. AAPL, TSLA, MSFT...)"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                className="search-input"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
            <button type="submit" className="search-btn">
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </form>
        </div>

        <div className="results-grid">
          
          {stock ? (
            <div className="card-box" style={{ gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, backgroundColor: 'rgba(168, 85, 247, 0.1)', color: '#c084fc', padding: '0.25rem 0.6rem', borderRadius: '0.375rem' }}>
                      {stock.symbol}
                    </span>
                    <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginTop: '0.4rem', color: '#ffffff', margin: '0.4rem 0 0 0' }}>{stock.name}</h2>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: '#ffffff', margin: 0 }}>
                      <DollarSign style={{ width: '22px', height: '22px', color: '#c084fc' }} />
                      {stock.price}
                    </p>
                    <p style={{ fontSize: '0.85rem', fontWeight: 600, marginTop: '0.2rem', color: stock.change >= 0 ? '#34d399' : '#f87171' }}>
                      {stock.change >= 0 ? `+${stock.change}` : stock.change} ({stock.percentChange}%)
                    </p>
                  </div>
                </div>

                <div style={{ backgroundColor: '#090a0f', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #232936', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <BarChart2 style={{ width: '14px', height: '14px', color: '#c084fc' }} /> GRÁFICO PRINCIPAL
                    </span>
                    <div style={{ display: 'flex', gap: '0.3rem' }}>
                      {['1D', '1W', '1M', 'YTD'].map((t) => (
                        <button
                          key={t}
                          onClick={() => setTimeframe(t)}
                          style={{
                            backgroundColor: timeframe === t ? '#9333ea' : '#181b24',
                            color: timeframe === t ? '#ffffff' : '#9ca3af',
                            border: '1px solid #232936',
                            borderRadius: '0.375rem',
                            padding: '0.15rem 0.5rem',
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {history.length > 0 ? (
                    <div style={{ height: '130px', display: 'flex', alignItems: 'flex-end', gap: '4px', paddingTop: '10px' }}>
                      {history.map((item, idx) => {
                        const val = parseFloat(item.close);
                        const min = Math.min(...history.map(h => parseFloat(h.close)));
                        const max = Math.max(...history.map(h => parseFloat(h.close)));
                        const heightPercent = Math.max(15, Math.min(100, ((val - min) / (max - min || 1)) * 100));

                        return (
                          <div 
                            key={idx} 
                            title={`${item.datetime}: $${item.close}`}
                            style={{ 
                              flex: 1, 
                              height: `${heightPercent}%`, 
                              backgroundColor: stock.change >= 0 ? '#34d399' : '#f87171',
                              opacity: 0.85,
                              borderRadius: '2px 2px 0 0'
                            }} 
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center', padding: '2rem 0' }}>Cargando gráfico histórico...</p>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginTop: '1rem' }}>
                  <div style={{ backgroundColor: '#181b24', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #232936' }}>
                    <span style={{ fontSize: '0.65rem', color: '#9ca3af', display: 'block' }}>MÁXIMO</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#ffffff' }}>${stock.high?.toFixed(2)}</span>
                  </div>
                  <div style={{ backgroundColor: '#181b24', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #232936' }}>
                    <span style={{ fontSize: '0.65rem', color: '#9ca3af', display: 'block' }}>MÍNIMO</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#ffffff' }}>${stock.low?.toFixed(2)}</span>
                  </div>
                  <div style={{ backgroundColor: '#181b24', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #232936' }}>
                    <span style={{ fontSize: '0.65rem', color: '#9ca3af', display: 'block' }}>VOLUMEN</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#ffffff' }}>{stock.volume ? `${(stock.volume / 1000000).toFixed(1)}M` : 'N/A'}</span>
                  </div>
                </div>

              </div>

              <button
                onClick={handleSaveFavorite}
                disabled={saved}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderRadius: '0.75rem',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  border: saved ? '1px solid rgba(147, 51, 234, 0.4)' : 'none',
                  backgroundColor: saved ? 'rgba(76, 29, 149, 0.4)' : '#9333ea',
                  color: saved ? '#d8b4fe' : '#ffffff',
                  cursor: saved ? 'default' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <BookmarkPlus style={{ width: '20px', height: '20px' }} />
                {saved ? '¡Guardado en Favoritos!' : 'Guardar en Favoritos'}
              </button>
            </div>
          ) : (
            <div className="card-box" style={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem' }}>
              <TrendingUp style={{ width: '48px', height: '48px', color: '#4b5563', marginBottom: '0.75rem' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#d1d5db', margin: 0 }}>Ningún activo seleccionado</h3>
              <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.5rem' }}>Busca una acción arriba o haz clic en "Ver" en tus favoritos.</p>
            </div>
          )}

          <div className="card-box" style={{ justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#d1d5db', marginBottom: '1rem', letterSpacing: '0.05em' }}>ESTADO DEL MERCADO</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ backgroundColor: '#181b24', padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid #232936' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Tendencia Global</span>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#34d399', margin: '0.2rem 0 0 0' }}>Mercado Activo (Bullish)</p>
                </div>
                <div style={{ backgroundColor: '#181b24', padding: '0.875rem', borderRadius: '0.75rem', border: '1px solid #232936' }}>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af' }}>Sincronización API</span>
                  <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#c084fc', margin: '0.2rem 0 0 0' }}>Twelve Data (Conectado)</p>
                </div>
              </div>
            </div>
            <div style={{ fontSize: '0.7rem', color: '#6b7280', textAlign: 'center', marginTop: '1.5rem' }}>
              StockTracker &bull; Panel Financiero
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

export default App;