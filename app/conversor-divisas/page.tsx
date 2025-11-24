'use client';

import { useState, useEffect } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import styles from './ConversorDivisas.module.css';

// Tipos
interface ExchangeRates {
  [key: string]: number;
}

interface HistoryItem {
  from: string;
  to: string;
  amountFrom: number;
  amountTo: number;
  rate: number;
  timestamp: number;
}

// API Base URL
const API_URL = 'https://api.frankfurter.app';

export default function ConversorDivisasPage() {
  // Lista de divisas disponibles (API frankfurter.app - BCE)
  const currencies: Record<string, string> = {
    'EUR': 'Euro',
    'USD': 'Dólar estadounidense',
    'GBP': 'Libra esterlina',
    'JPY': 'Yen japonés',
    'CHF': 'Franco suizo',
    'CAD': 'Dólar canadiense',
    'AUD': 'Dólar australiano',
    'NZD': 'Dólar neozelandés',
    'CNY': 'Yuan chino',
    'HKD': 'Dólar de Hong Kong',
    'SGD': 'Dólar de Singapur',
    'SEK': 'Corona sueca',
    'NOK': 'Corona noruega',
    'DKK': 'Corona danesa',
    'PLN': 'Zloty polaco',
    'CZK': 'Corona checa',
    'HUF': 'Forinto húngaro',
    'RON': 'Leu rumano',
    'BGN': 'Lev búlgaro',
    'TRY': 'Lira turca',
    'ILS': 'Shekel israelí',
    'ZAR': 'Rand sudafricano',
    'BRL': 'Real brasileño',
    'MXN': 'Peso mexicano',
    'ARS': 'Peso argentino',
    'CLP': 'Peso chileno',
    'INR': 'Rupia india',
    'KRW': 'Won surcoreano',
    'THB': 'Baht tailandés',
    'MYR': 'Ringgit malayo',
    'IDR': 'Rupia indonesia',
    'PHP': 'Peso filipino',
    'ISK': 'Corona islandesa'
  };

  // Divisas favoritas para mostrar
  const favoriteCurrencies = ['USD', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD'];
  const [amountFrom, setAmountFrom] = useState<string>('100');
  const [amountTo, setAmountTo] = useState<string>('');
  const [currencyFrom, setCurrencyFrom] = useState<string>('EUR');
  const [currencyTo, setCurrencyTo] = useState<string>('USD');
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates>({});
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Cargar desde localStorage al montar
  useEffect(() => {
    setIsClient(true);
    loadFromCache();
    const savedHistory = localStorage.getItem('meskeIA_currency_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error al cargar historial', e);
      }
    }
  }, []);

  // Obtener tipos de cambio al montar
  useEffect(() => {
    if (isClient) {
      fetchExchangeRates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]);

  // Convertir cuando cambien los valores
  useEffect(() => {
    if (isClient && Object.keys(exchangeRates).length > 0) {
      convert();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amountFrom, currencyFrom, currencyTo, exchangeRates, isClient]);

  // Guardar historial en localStorage
  useEffect(() => {
    if (isClient && history.length > 0) {
      localStorage.setItem('meskeIA_currency_history', JSON.stringify(history));
    }
  }, [history, isClient]);

  // Cargar desde cache
  const loadFromCache = () => {
    const cached = localStorage.getItem('meskeIA_exchange_rates');
    if (cached) {
      try {
        const data = JSON.parse(cached);
        setExchangeRates(data.rates);
        setLastUpdate(data.date);
      } catch (e) {
        console.error('Error al cargar cache', e);
      }
    }
  };

  // Obtener tipos de cambio de la API
  const fetchExchangeRates = async () => {
    try {
      const response = await fetch(`${API_URL}/latest`);
      const data = await response.json();

      const rates: ExchangeRates = data.rates;
      rates['EUR'] = 1; // EUR es la base

      setExchangeRates(rates);
      setLastUpdate(data.date);

      // Guardar en cache
      localStorage.setItem('meskeIA_exchange_rates', JSON.stringify({
        rates,
        date: data.date
      }));
    } catch (error) {
      console.error('Error al obtener tipos de cambio:', error);
    }
  };

  // Convertir divisas
  const convert = () => {
    const amount = parseFloat(amountFrom);
    if (isNaN(amount) || amount <= 0 || Object.keys(exchangeRates).length === 0) {
      setAmountTo('');
      return;
    }

    // Convertir de FROM a EUR, luego de EUR a TO
    const fromRate = exchangeRates[currencyFrom] || 1;
    const toRate = exchangeRates[currencyTo] || 1;
    const amountInEUR = amount / fromRate;
    const result = amountInEUR * toRate;

    setAmountTo(result.toFixed(2));

    // Añadir al historial solo si la cantidad es válida y diferente
    if (amount > 0) {
      addToHistory(amount, result, toRate / fromRate);
    }
  };

  // Intercambiar divisas
  const swapCurrencies = () => {
    setCurrencyFrom(currencyTo);
    setCurrencyTo(currencyFrom);
    setAmountFrom(amountTo || '0');
  };

  // Añadir al historial
  const addToHistory = (from: number, to: number, rate: number) => {
    const newItem: HistoryItem = {
      from: currencyFrom,
      to: currencyTo,
      amountFrom: from,
      amountTo: to,
      rate,
      timestamp: Date.now()
    };

    // Evitar duplicados recientes (misma conversión en menos de 1 minuto)
    const isDuplicate = history.some(item =>
      item.from === newItem.from &&
      item.to === newItem.to &&
      Math.abs(item.timestamp - newItem.timestamp) < 60000 &&
      Math.abs(item.amountFrom - newItem.amountFrom) < 0.01
    );

    if (!isDuplicate) {
      const newHistory = [newItem, ...history].slice(0, 10); // Mantener solo las últimas 10
      setHistory(newHistory);
    }
  };

  // Limpiar historial
  const clearHistory = () => {
    if (confirm('¿Estás seguro de que quieres eliminar el historial?')) {
      setHistory([]);
      localStorage.removeItem('meskeIA_currency_history');
    }
  };

  // Formatear fecha para mostrar
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Cargando...';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formatear número con separadores españoles
  const formatNumber = (num: number) => {
    return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  // Calcular tasa de cambio directa
  const getRate = () => {
    if (Object.keys(exchangeRates).length === 0) return 0;
    const fromRate = exchangeRates[currencyFrom] || 1;
    const toRate = exchangeRates[currencyTo] || 1;
    return toRate / fromRate;
  };

  // Validación para evitar errores en SSG
  if (!isClient) {
    return (
      <>
        <MeskeiaLogo />
        <AnalyticsTracker appName="conversor-divisas" />
        <div className={styles.container}>
          <header className={styles.header}>
            <h1>💱 Conversor de Divisas</h1>
            <p>Cargando...</p>
          </header>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <MeskeiaLogo />
      <AnalyticsTracker appName="conversor-divisas" />

      <div className={styles.container}>
        <header className={styles.header}>
          <h1>💱 Conversor de Divisas</h1>
          <p>Tipos de cambio actualizados del Banco Central Europeo</p>
        </header>

        <div className={styles.updateInfo}>
          📅 Última actualización: {formatDate(lastUpdate)}
        </div>

        <div className={styles.converterCard}>
          <div className={styles.currencyInput}>
            <label htmlFor="amount-from">Cantidad a convertir</label>
            <div className={styles.inputGroup}>
              <input
                type="number"
                id="amount-from"
                value={amountFrom}
                onChange={(e) => setAmountFrom(e.target.value)}
                min="0"
                step="0.01"
              />
              <select
                id="currency-from"
                value={currencyFrom}
                onChange={(e) => setCurrencyFrom(e.target.value)}
              >
                {Object.entries(currencies).map(([code, name]) => (
                  <option key={code} value={code}>
                    {code} - {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className={styles.swapButton}>
            <button type="button" className={styles.btnSwap} onClick={swapCurrencies} title="Intercambiar divisas">
              ⇅
            </button>
          </div>

          <div className={styles.currencyInput}>
            <label htmlFor="amount-to">Cantidad convertida</label>
            <div className={styles.inputGroup}>
              <input
                type="text"
                id="amount-to"
                value={amountTo}
                readOnly
              />
              <select
                id="currency-to"
                value={currencyTo}
                onChange={(e) => setCurrencyTo(e.target.value)}
              >
                {Object.entries(currencies).map(([code, name]) => (
                  <option key={code} value={code}>
                    {code} - {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {amountTo && (
            <div className={styles.result}>
              <div className={styles.resultAmount}>
                {parseFloat(amountTo).toLocaleString('es-ES', { minimumFractionDigits: 2 })} {currencyTo}
              </div>
              <div className={styles.resultRate}>
                1 {currencyFrom} = {formatNumber(getRate())} {currencyTo}
              </div>
            </div>
          )}
        </div>

        {/* Divisas populares */}
        <div className={styles.favorites}>
          <h3>💫 Divisas populares</h3>
          <div className={styles.favoriteGrid}>
            {favoriteCurrencies.map(currency => {
              const rate = getRate();
              const fromRate = exchangeRates[currencyFrom] || 1;
              const toRate = exchangeRates[currency] || 1;
              const favoriteRate = toRate / fromRate;

              return (
                <div
                  key={currency}
                  className={styles.favoriteCard}
                  onClick={() => setCurrencyTo(currency)}
                >
                  <div className={styles.favoriteCode}>{currency}</div>
                  <div className={styles.favoriteName}>{currencies[currency]}</div>
                  <div className={styles.favoriteRate}>
                    1 {currencyFrom} = {formatNumber(favoriteRate)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Historial */}
        <div className={styles.history}>
          <h3>
            <span>📜 Historial de conversiones</span>
            {history.length > 0 && (
              <button type="button" className={styles.btnClear} onClick={clearHistory}>
                Limpiar
              </button>
            )}
          </h3>
          <div id="history-list">
            {history.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>💱</div>
                <p>No hay conversiones recientes</p>
              </div>
            ) : (
              history.map((item, index) => (
                <div key={index} className={styles.historyItem}>
                  <div className={styles.historyAmount}>
                    {formatNumber(item.amountFrom)} {item.from}
                  </div>
                  <div className={styles.historyArrow}>→</div>
                  <div className={styles.historyAmount}>
                    {formatNumber(item.amountTo)} {item.to}
                  </div>
                  <div className={styles.historyRate}>
                    1 {item.from} = {formatNumber(item.rate)} {item.to}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Secciones educativas - Siempre visibles */}
      <div className={styles.eduSection}>
        <h2>¿Cómo funciona este conversor de divisas?</h2>
        <p>Convierte entre 33 monedas internacionales con tipos de cambio oficiales del Banco Central Europeo (BCE). Los datos se actualizan diariamente y funcionan offline con caché.</p>
        <ul>
          <li><strong>Datos oficiales del BCE</strong>: Tipos de cambio de referencia utilizados por bancos e instituciones financieras europeas</li>
          <li><strong>33 divisas disponibles</strong>: EUR, USD, GBP, JPY, CHF, CAD, AUD y 26 más de todo el mundo</li>
          <li><strong>Conversión bidireccional</strong>: Intercambia divisas con un clic y convierte en ambas direcciones simultáneamente</li>
          <li><strong>Historial automático</strong>: Guarda las últimas 10 conversiones en tu navegador para consulta rápida</li>
          <li><strong>Funciona offline</strong>: Una vez cargados los tipos, funciona sin conexión hasta la próxima actualización</li>
        </ul>
      </div>

      <div className={styles.eduSection}>
        <h2>Casos de uso prácticos</h2>
        <ul>
          <li><strong>Compras internacionales</strong>: Calcula el precio real en euros antes de comprar en tiendas online extranjeras (Amazon US, AliExpress)</li>
          <li><strong>Viajes al extranjero</strong>: Planifica tu presupuesto convirtiendo euros a dólares, libras o yenes antes del viaje</li>
          <li><strong>Transferencias bancarias</strong>: Verifica el tipo de cambio del BCE antes de hacer transferencias internacionales (detecta comisiones ocultas)</li>
          <li><strong>Inversiones en forex</strong>: Consulta cotizaciones de referencia para comparar con brokers (EUR/USD, GBP/JPY, etc.)</li>
          <li><strong>Freelance internacional</strong>: Convierte pagos en dólares, libras o francos suizos a tu moneda local para facturación</li>
          <li><strong>Control de gastos en viajes</strong>: Rastrea cuánto gastas en divisa extranjera usando el historial de conversiones</li>
        </ul>
      </div>

      <Footer />
    </>
  );
}
