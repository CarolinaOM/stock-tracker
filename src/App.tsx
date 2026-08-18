import { useState } from 'react';
import { getStockQuote, saveFavorite, type StockQuote } from './services/stockService';
import { Search, TrendingUp, DollarSign, BookmarkPlus } from 'lucide-react';

function App() {
  const [symbol, setSymbol] = useState('');
  const [stock, setStock] = useState<StockQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;

    setLoading(true);
    setSaved(false);
    const data = await getStockQuote(symbol);
    setStock(data);
    setLoading(false);
  };

  const handleSaveFavorite = async () => {
    if (!stock) return;
    const success = await saveFavorite(stock.symbol);
    if (success) {
      setSaved(true);
    }
  };

  return (
    <div className="app-container">
      <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', marginBottom: '0.5rem', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
        <TrendingUp style={{ color: '#34d399', width: '28px', height: '28px' }} /> StockTracker Pro
      </h1>
      <p style={{ color: '#9ca3af', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
        Tu gestor y rastreador de bolsa personal
      </p>

      <form onSubmit={handleSearch} className="search-box">
        <input
          type="text"
          placeholder="Ej. AAPL, TSLA, MSFT..."
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="btn-primary">
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </form>

      {stock && (
        <div className="card-result">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: '600', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>
                {stock.symbol}
              </span>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#ffffff' }}>
                {stock.name}
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', color: '#ffffff' }}>
                <DollarSign style={{ width: '20px', height: '20px', color: '#34d399' }} />
                {stock.price}
              </p>
              <p style={{ color: '#34d399', fontSize: '0.875rem', fontWeight: '500' }}>
                +{stock.change} (+{stock.percentChange}%)
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveFavorite}
            disabled={saved}
            style={{
              width: '100%',
              marginTop: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.5rem',
              borderRadius: '0.5rem',
              fontWeight: '500',
              border: 'none',
              cursor: saved ? 'default' : 'pointer',
              backgroundColor: saved ? '#064e3b' : '#059669',
              color: saved ? '#34d399' : '#ffffff',
              transition: 'background-color 0.2s'
            }}
          >
            <BookmarkPlus style={{ width: '20px', height: '20px' }} />
            {saved ? '¡Guardado en Favoritos!' : 'Guardar en Favoritos'}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;