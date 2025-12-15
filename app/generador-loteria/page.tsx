'use client';

import { useState, useCallback } from 'react';
import styles from './GeneradorLoteria.module.css';
import { MeskeiaLogo, Footer } from '@/components';

type LotteryType = 'primitiva' | 'euromillones' | 'bonoloto' | 'gordo' | 'lototurf';

interface LotteryConfig {
  name: string;
  icon: string;
  mainNumbers: number;
  mainMax: number;
  extraNumbers?: number;
  extraMax?: number;
  extraName?: string;
  description: string;
  drawDays: string;
  price: string;
}

interface GeneratedResult {
  id: string;
  type: LotteryType;
  mainNumbers: number[];
  extraNumbers?: number[];
  timestamp: Date;
}

const LOTTERY_CONFIG: Record<LotteryType, LotteryConfig> = {
  primitiva: {
    name: 'La Primitiva',
    icon: '🎱',
    mainNumbers: 6,
    mainMax: 49,
    extraNumbers: 1,
    extraMax: 10,
    extraName: 'Reintegro',
    description: '6 números del 1 al 49 + Reintegro (0-9)',
    drawDays: 'Jueves y Sábados',
    price: '1,00 €'
  },
  euromillones: {
    name: 'Euromillones',
    icon: '⭐',
    mainNumbers: 5,
    mainMax: 50,
    extraNumbers: 2,
    extraMax: 12,
    extraName: 'Estrellas',
    description: '5 números del 1 al 50 + 2 Estrellas (1-12)',
    drawDays: 'Martes y Viernes',
    price: '2,50 €'
  },
  bonoloto: {
    name: 'Bonoloto',
    icon: '🍀',
    mainNumbers: 6,
    mainMax: 49,
    extraNumbers: 1,
    extraMax: 10,
    extraName: 'Reintegro',
    description: '6 números del 1 al 49 + Reintegro (0-9)',
    drawDays: 'Lunes a Sábado',
    price: '0,50 €'
  },
  gordo: {
    name: 'El Gordo de la Primitiva',
    icon: '🎰',
    mainNumbers: 5,
    mainMax: 54,
    extraNumbers: 1,
    extraMax: 10,
    extraName: 'Clave',
    description: '5 números del 1 al 54 + Clave (0-9)',
    drawDays: 'Domingos',
    price: '1,50 €'
  },
  lototurf: {
    name: 'Lototurf',
    icon: '🏇',
    mainNumbers: 6,
    mainMax: 31,
    extraNumbers: 1,
    extraMax: 12,
    extraName: 'Caballo',
    description: '6 números del 1 al 31 + Caballo ganador (1-12)',
    drawDays: 'Domingos',
    price: '1,00 €'
  }
};

export default function GeneradorLoteriaPage() {
  const [selectedLottery, setSelectedLottery] = useState<LotteryType>('primitiva');
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [favorites, setFavorites] = useState<GeneratedResult[]>([]);

  // Generar números aleatorios únicos
  const generateUniqueNumbers = (count: number, max: number, startFrom: number = 1): number[] => {
    const numbers: number[] = [];
    while (numbers.length < count) {
      const num = Math.floor(Math.random() * (max - startFrom + 1)) + startFrom;
      if (!numbers.includes(num)) {
        numbers.push(num);
      }
    }
    return numbers.sort((a, b) => a - b);
  };

  // Generar combinación
  const generateCombination = useCallback(() => {
    setIsGenerating(true);

    setTimeout(() => {
      const config = LOTTERY_CONFIG[selectedLottery];
      const newResults: GeneratedResult[] = [];

      for (let i = 0; i < quantity; i++) {
        const mainNumbers = generateUniqueNumbers(config.mainNumbers, config.mainMax);

        let extraNumbers: number[] | undefined;
        if (config.extraNumbers) {
          const startFrom = selectedLottery === 'primitiva' || selectedLottery === 'bonoloto' || selectedLottery === 'gordo' ? 0 : 1;
          extraNumbers = generateUniqueNumbers(config.extraNumbers, config.extraMax!, startFrom);
        }

        newResults.push({
          id: Date.now().toString() + i,
          type: selectedLottery,
          mainNumbers,
          extraNumbers,
          timestamp: new Date()
        });
      }

      setResults(prev => [...newResults, ...prev].slice(0, 50));
      setIsGenerating(false);
    }, 300);
  }, [selectedLottery, quantity]);

  // Añadir a favoritos
  const addToFavorites = useCallback((result: GeneratedResult) => {
    if (!favorites.find(f => f.id === result.id)) {
      setFavorites(prev => [result, ...prev].slice(0, 20));
    }
  }, [favorites]);

  // Eliminar de favoritos
  const removeFromFavorites = useCallback((id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  }, []);

  // Copiar al portapapeles
  const copyToClipboard = useCallback((result: GeneratedResult) => {
    const config = LOTTERY_CONFIG[result.type];
    let text = `${config.name}: ${result.mainNumbers.join(' - ')}`;
    if (result.extraNumbers) {
      text += ` | ${config.extraName}: ${result.extraNumbers.join(', ')}`;
    }
    navigator.clipboard.writeText(text);
  }, []);

  // Limpiar historial
  const clearHistory = useCallback(() => {
    setResults([]);
  }, []);

  const config = LOTTERY_CONFIG[selectedLottery];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon}>🎲</span>
        <h1 className={styles.title}>Generador de Lotería</h1>
        <p className={styles.subtitle}>
          Genera números aleatorios para las principales loterías españolas. ¡Prueba tu suerte!
        </p>
      </header>

      <main className={styles.mainContent}>
        {/* Selector de lotería */}
        <div className={styles.lotterySelector}>
          {(Object.keys(LOTTERY_CONFIG) as LotteryType[]).map(type => (
            <button
              key={type}
              onClick={() => setSelectedLottery(type)}
              className={`${styles.lotteryButton} ${selectedLottery === type ? styles.active : ''}`}
            >
              <span className={styles.lotteryIcon}>{LOTTERY_CONFIG[type].icon}</span>
              <span className={styles.lotteryName}>{LOTTERY_CONFIG[type].name}</span>
            </button>
          ))}
        </div>

        {/* Info de la lotería seleccionada */}
        <div className={styles.lotteryInfo}>
          <div className={styles.infoHeader}>
            <span className={styles.infoBigIcon}>{config.icon}</span>
            <h2>{config.name}</h2>
          </div>
          <div className={styles.infoDetails}>
            <span className={styles.infoItem}>📋 {config.description}</span>
            <span className={styles.infoItem}>📅 {config.drawDays}</span>
            <span className={styles.infoItem}>💰 {config.price} / apuesta</span>
          </div>
        </div>

        {/* Generador */}
        <div className={styles.generatorPanel}>
          <div className={styles.quantitySelector}>
            <label>Combinaciones a generar:</label>
            <div className={styles.quantityButtons}>
              {[1, 3, 5, 10].map(num => (
                <button
                  key={num}
                  onClick={() => setQuantity(num)}
                  className={`${styles.quantityBtn} ${quantity === num ? styles.active : ''}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateCombination}
            className={styles.generateButton}
            disabled={isGenerating}
          >
            {isGenerating ? '🎲 Generando...' : `🎯 Generar ${quantity} combinación${quantity > 1 ? 'es' : ''}`}
          </button>
        </div>

        {/* Resultados */}
        {results.length > 0 && (
          <div className={styles.resultsSection}>
            <div className={styles.resultsSectionHeader}>
              <h2>🎰 Combinaciones generadas</h2>
              <button onClick={clearHistory} className={styles.btnSmall}>
                🗑️ Limpiar
              </button>
            </div>

            <div className={styles.resultsList}>
              {results.map((result, index) => {
                const resultConfig = LOTTERY_CONFIG[result.type];
                const isFavorite = favorites.find(f => f.id === result.id);

                return (
                  <div
                    key={result.id}
                    className={`${styles.resultCard} ${index === 0 ? styles.latest : ''}`}
                  >
                    <div className={styles.resultHeader}>
                      <span className={styles.resultType}>
                        {resultConfig.icon} {resultConfig.name}
                      </span>
                      <span className={styles.resultTime}>
                        {result.timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <div className={styles.numbersRow}>
                      <div className={styles.mainNumbers}>
                        {result.mainNumbers.map((num, i) => (
                          <span key={i} className={styles.numberBall}>
                            {num}
                          </span>
                        ))}
                      </div>
                      {result.extraNumbers && (
                        <div className={styles.extraNumbers}>
                          <span className={styles.extraLabel}>{resultConfig.extraName}:</span>
                          {result.extraNumbers.map((num, i) => (
                            <span key={i} className={styles.extraBall}>
                              {num}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className={styles.resultActions}>
                      <button
                        onClick={() => copyToClipboard(result)}
                        className={styles.actionBtn}
                        title="Copiar"
                      >
                        📋
                      </button>
                      <button
                        onClick={() => isFavorite ? removeFromFavorites(result.id) : addToFavorites(result)}
                        className={`${styles.actionBtn} ${isFavorite ? styles.favorited : ''}`}
                        title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                      >
                        {isFavorite ? '⭐' : '☆'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Favoritos */}
        {favorites.length > 0 && (
          <div className={styles.favoritesSection}>
            <h2>⭐ Mis combinaciones favoritas</h2>
            <div className={styles.favoritesList}>
              {favorites.map(result => {
                const resultConfig = LOTTERY_CONFIG[result.type];
                return (
                  <div key={result.id} className={styles.favoriteCard}>
                    <span className={styles.favoriteType}>{resultConfig.icon}</span>
                    <div className={styles.favoriteNumbers}>
                      {result.mainNumbers.join(' - ')}
                      {result.extraNumbers && (
                        <span className={styles.favoriteExtra}>
                          | {resultConfig.extraName}: {result.extraNumbers.join(', ')}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromFavorites(result.id)}
                      className={styles.removeFavorite}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso importante</h3>
        <p>
          Este generador produce números <strong>completamente aleatorios</strong>.
          No existe ningún sistema ni algoritmo que pueda predecir los números ganadores de la lotería.
          Juega con responsabilidad y solo dinero que puedas permitirte perder.
        </p>
        <p className={styles.disclaimerSmall}>
          📞 Si tienes problemas con el juego: <strong>900 200 225</strong> (línea gratuita DGOJ)
        </p>
      </div>

      {/* Info adicional */}
      <div className={styles.infoSection}>
        <h3>💡 Sobre las loterías</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <h4>🎱 La Primitiva</h4>
            <p>La lotería más antigua de España (desde 1763). Sorteos jueves y sábados con bote acumulado que puede superar los 100 millones de euros.</p>
          </div>
          <div className={styles.infoCard}>
            <h4>⭐ Euromillones</h4>
            <p>Lotería europea con participantes de 9 países. Los botes pueden superar los 200 millones de euros. Sorteos martes y viernes.</p>
          </div>
          <div className={styles.infoCard}>
            <h4>🍀 Bonoloto</h4>
            <p>Sorteo diario (lunes a sábado) con apuestas desde 0,50€. Ideal para jugar más frecuentemente con menor inversión.</p>
          </div>
          <div className={styles.infoCard}>
            <h4>🎰 El Gordo</h4>
            <p>Bote mínimo garantizado de 5 millones de euros todos los domingos. Mayor probabilidad de premio que La Primitiva.</p>
          </div>
        </div>
      </div>

      <Footer appName="generador-loteria" />
    </div>
  );
}
