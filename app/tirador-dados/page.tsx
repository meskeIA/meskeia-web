'use client';

import { useState, useCallback } from 'react';
import styles from './TiradorDados.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Tipos de dados disponibles
interface DiceType {
  id: string;
  name: string;
  sides: number;
  icon: string;
  color: string;
}

const DICE_TYPES: DiceType[] = [
  { id: 'd4', name: 'D4', sides: 4, icon: '🔺', color: '#10B981' },
  { id: 'd6', name: 'D6', sides: 6, icon: '🎲', color: '#3B82F6' },
  { id: 'd8', name: 'D8', sides: 8, icon: '💎', color: '#8B5CF6' },
  { id: 'd10', name: 'D10', sides: 10, icon: '🔷', color: '#EC4899' },
  { id: 'd12', name: 'D12', sides: 12, icon: '⬡', color: '#F59E0B' },
  { id: 'd20', name: 'D20', sides: 20, icon: '⚀', color: '#EF4444' },
  { id: 'd100', name: 'D100', sides: 100, icon: '%', color: '#6366F1' },
];

interface DiceRoll {
  id: string;
  diceType: DiceType;
  quantity: number;
  results: number[];
  total: number;
  modifier: number;
  finalTotal: number;
  timestamp: Date;
}

export default function TiradorDadosPage() {
  const [selectedDice, setSelectedDice] = useState<DiceType>(DICE_TYPES[5]); // D20 por defecto
  const [quantity, setQuantity] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [history, setHistory] = useState<DiceRoll[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const [currentResults, setCurrentResults] = useState<number[]>([]);
  const [animatingDice, setAnimatingDice] = useState<number[]>([]);

  // Generar número aleatorio
  const rollDie = (sides: number): number => {
    return Math.floor(Math.random() * sides) + 1;
  };

  // Lanzar dados
  const rollDice = useCallback(() => {
    setIsRolling(true);
    setAnimatingDice(Array(quantity).fill(0).map(() => rollDie(selectedDice.sides)));

    // Animación de dados girando
    let animationCount = 0;
    const animationInterval = setInterval(() => {
      setAnimatingDice(Array(quantity).fill(0).map(() => rollDie(selectedDice.sides)));
      animationCount++;
      if (animationCount >= 10) {
        clearInterval(animationInterval);

        // Resultado final
        const results = Array(quantity).fill(0).map(() => rollDie(selectedDice.sides));
        const total = results.reduce((sum, val) => sum + val, 0);
        const finalTotal = total + modifier;

        setCurrentResults(results);
        setAnimatingDice([]);
        setIsRolling(false);

        // Añadir al historial
        const roll: DiceRoll = {
          id: Date.now().toString(),
          diceType: selectedDice,
          quantity,
          results,
          total,
          modifier,
          finalTotal,
          timestamp: new Date(),
        };

        setHistory(prev => [roll, ...prev].slice(0, 50)); // Máximo 50 entradas
      }
    }, 50);
  }, [selectedDice, quantity, modifier]);

  // Lanzar dados rápido (sin animación)
  const quickRoll = useCallback(() => {
    const results = Array(quantity).fill(0).map(() => rollDie(selectedDice.sides));
    const total = results.reduce((sum, val) => sum + val, 0);
    const finalTotal = total + modifier;

    setCurrentResults(results);

    const roll: DiceRoll = {
      id: Date.now().toString(),
      diceType: selectedDice,
      quantity,
      results,
      total,
      modifier,
      finalTotal,
      timestamp: new Date(),
    };

    setHistory(prev => [roll, ...prev].slice(0, 50));
  }, [selectedDice, quantity, modifier]);

  // Limpiar historial
  const clearHistory = () => {
    setHistory([]);
    setCurrentResults([]);
  };

  // Formatear hora
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  // Detectar crítico o pifia (solo para D20)
  const isCritical = (result: number, sides: number): boolean => sides === 20 && result === 20;
  const isFumble = (result: number, sides: number): boolean => sides === 20 && result === 1;

  // Obtener el valor mínimo y máximo posible
  const getMinMax = (): { min: number; max: number } => {
    const min = quantity + modifier;
    const max = quantity * selectedDice.sides + modifier;
    return { min, max };
  };

  const { min, max } = getMinMax();

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Tirador de Dados</h1>
        <p className={styles.subtitle}>
          Dados virtuales para juegos de rol, D&D, Pathfinder y juegos de mesa
        </p>
      </header>

      <div className={styles.mainContent}>
        {/* Panel de selección */}
        <div className={styles.controlPanel}>
          <h2 className={styles.sectionTitle}>🎲 Selecciona el dado</h2>

          <div className={styles.diceGrid}>
            {DICE_TYPES.map(dice => (
              <button
                key={dice.id}
                className={`${styles.diceCard} ${selectedDice.id === dice.id ? styles.diceCardActive : ''}`}
                onClick={() => setSelectedDice(dice)}
                style={{ '--dice-color': dice.color } as React.CSSProperties}
              >
                <span className={styles.diceIcon}>{dice.icon}</span>
                <span className={styles.diceName}>{dice.name}</span>
                <span className={styles.diceSides}>1-{dice.sides}</span>
              </button>
            ))}
          </div>

          <div className={styles.optionsRow}>
            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>Cantidad de dados</label>
              <div className={styles.quantityControl}>
                <button
                  className={styles.quantityBtn}
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  −
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, Math.min(20, parseInt(e.target.value) || 1)))}
                  className={styles.quantityInput}
                  min={1}
                  max={20}
                />
                <button
                  className={styles.quantityBtn}
                  onClick={() => setQuantity(Math.min(20, quantity + 1))}
                  disabled={quantity >= 20}
                >
                  +
                </button>
              </div>
            </div>

            <div className={styles.optionGroup}>
              <label className={styles.optionLabel}>Modificador</label>
              <div className={styles.quantityControl}>
                <button
                  className={styles.quantityBtn}
                  onClick={() => setModifier(modifier - 1)}
                >
                  −
                </button>
                <input
                  type="number"
                  value={modifier}
                  onChange={e => setModifier(parseInt(e.target.value) || 0)}
                  className={styles.quantityInput}
                />
                <button
                  className={styles.quantityBtn}
                  onClick={() => setModifier(modifier + 1)}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className={styles.rollInfo}>
            <span className={styles.rollFormula}>
              {quantity}{selectedDice.name}{modifier !== 0 ? (modifier > 0 ? `+${modifier}` : modifier) : ''}
            </span>
            <span className={styles.rollRange}>
              Rango: {min} - {max}
            </span>
          </div>

          <div className={styles.rollButtons}>
            <button
              className={styles.rollBtn}
              onClick={rollDice}
              disabled={isRolling}
            >
              {isRolling ? '🎲 Lanzando...' : '🎲 Lanzar dados'}
            </button>
            <button
              className={styles.quickRollBtn}
              onClick={quickRoll}
              disabled={isRolling}
              title="Lanzamiento rápido sin animación"
            >
              ⚡
            </button>
          </div>

          {/* Presets rápidos */}
          <div className={styles.presetsSection}>
            <h3 className={styles.presetsTitle}>Lanzamientos rápidos</h3>
            <div className={styles.presetsGrid}>
              <button
                className={styles.presetBtn}
                onClick={() => {
                  setSelectedDice(DICE_TYPES[5]); // D20
                  setQuantity(1);
                  setModifier(0);
                }}
              >
                1D20
              </button>
              <button
                className={styles.presetBtn}
                onClick={() => {
                  setSelectedDice(DICE_TYPES[1]); // D6
                  setQuantity(2);
                  setModifier(0);
                }}
              >
                2D6
              </button>
              <button
                className={styles.presetBtn}
                onClick={() => {
                  setSelectedDice(DICE_TYPES[1]); // D6
                  setQuantity(4);
                  setModifier(0);
                }}
              >
                4D6
              </button>
              <button
                className={styles.presetBtn}
                onClick={() => {
                  setSelectedDice(DICE_TYPES[2]); // D8
                  setQuantity(1);
                  setModifier(3);
                }}
              >
                1D8+3
              </button>
              <button
                className={styles.presetBtn}
                onClick={() => {
                  setSelectedDice(DICE_TYPES[6]); // D100
                  setQuantity(1);
                  setModifier(0);
                }}
              >
                1D100
              </button>
              <button
                className={styles.presetBtn}
                onClick={() => {
                  setSelectedDice(DICE_TYPES[3]); // D10
                  setQuantity(2);
                  setModifier(0);
                }}
              >
                2D10
              </button>
            </div>
          </div>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {/* Resultado actual */}
          <div className={styles.currentResult}>
            <h2 className={styles.sectionTitle}>🎯 Resultado</h2>

            {(currentResults.length > 0 || isRolling) ? (
              <div className={styles.resultDisplay}>
                <div className={styles.diceResults}>
                  {(isRolling ? animatingDice : currentResults).map((result, index) => (
                    <div
                      key={index}
                      className={`${styles.dieResult} ${isRolling ? styles.dieRolling : ''} ${isCritical(result, selectedDice.sides) ? styles.dieCritical : ''} ${isFumble(result, selectedDice.sides) ? styles.dieFumble : ''}`}
                      style={{ '--dice-color': selectedDice.color } as React.CSSProperties}
                    >
                      {result}
                    </div>
                  ))}
                </div>

                {!isRolling && currentResults.length > 0 && (
                  <>
                    {currentResults.length > 1 && (
                      <div className={styles.subtotal}>
                        Suma: {currentResults.reduce((a, b) => a + b, 0)}
                      </div>
                    )}

                    {modifier !== 0 && (
                      <div className={styles.modifierDisplay}>
                        {modifier > 0 ? '+' : ''}{modifier} modificador
                      </div>
                    )}

                    <div className={styles.totalResult}>
                      <span className={styles.totalLabel}>Total:</span>
                      <span className={styles.totalValue}>
                        {currentResults.reduce((a, b) => a + b, 0) + modifier}
                      </span>
                    </div>

                    {selectedDice.sides === 20 && currentResults.length === 1 && (
                      <>
                        {isCritical(currentResults[0], 20) && (
                          <div className={styles.criticalBadge}>🎉 ¡CRÍTICO!</div>
                        )}
                        {isFumble(currentResults[0], 20) && (
                          <div className={styles.fumbleBadge}>💀 ¡PIFIA!</div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className={styles.placeholderResult}>
                <span className={styles.placeholderIcon}>🎲</span>
                <p>Lanza los dados para ver el resultado</p>
              </div>
            )}
          </div>

          {/* Historial */}
          <div className={styles.historySection}>
            <div className={styles.historyHeader}>
              <h2 className={styles.sectionTitle}>📜 Historial</h2>
              {history.length > 0 && (
                <button
                  className={styles.clearHistoryBtn}
                  onClick={clearHistory}
                >
                  Limpiar
                </button>
              )}
            </div>

            {history.length > 0 ? (
              <div className={styles.historyList}>
                {history.map(roll => (
                  <div key={roll.id} className={styles.historyItem}>
                    <div className={styles.historyInfo}>
                      <span
                        className={styles.historyDice}
                        style={{ color: roll.diceType.color }}
                      >
                        {roll.quantity}{roll.diceType.name}
                        {roll.modifier !== 0 && (roll.modifier > 0 ? `+${roll.modifier}` : roll.modifier)}
                      </span>
                      <span className={styles.historyTime}>
                        {formatTime(roll.timestamp)}
                      </span>
                    </div>
                    <div className={styles.historyResults}>
                      <span className={styles.historyRolls}>
                        [{roll.results.join(', ')}]
                      </span>
                      <span className={styles.historyTotal}>
                        = {roll.finalTotal}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noHistory}>
                El historial de tiradas aparecerá aquí
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      {history.length >= 3 && (
        <div className={styles.statsSection}>
          <h3 className={styles.statsTitle}>📊 Estadísticas de la sesión</h3>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{history.length}</span>
              <span className={styles.statLabel}>Tiradas</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>
                {Math.max(...history.map(r => r.finalTotal))}
              </span>
              <span className={styles.statLabel}>Máximo</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>
                {Math.min(...history.map(r => r.finalTotal))}
              </span>
              <span className={styles.statLabel}>Mínimo</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>
                {Math.round(history.reduce((sum, r) => sum + r.finalTotal, 0) / history.length)}
              </span>
              <span className={styles.statLabel}>Media</span>
            </div>
          </div>
        </div>
      )}

      <EducationalSection
        title="📚 ¿Quieres saber más sobre dados de rol?"
        subtitle="Tipos de dados, probabilidades y usos en juegos de mesa"
      >
        <div className={styles.eduContent}>
          <section className={styles.eduSection}>
            <h3>🎲 Tipos de dados poliédricos</h3>
            <div className={styles.diceExplanation}>
              <div className={styles.diceInfo}>
                <strong>D4 (Tetraedro)</strong>
                <p>4 caras triangulares. Usado para daño de armas pequeñas o curación menor.</p>
              </div>
              <div className={styles.diceInfo}>
                <strong>D6 (Cubo)</strong>
                <p>El dado clásico de 6 caras. El más común en juegos de mesa tradicionales.</p>
              </div>
              <div className={styles.diceInfo}>
                <strong>D8 (Octaedro)</strong>
                <p>8 caras triangulares. Común para daño de armas medianas.</p>
              </div>
              <div className={styles.diceInfo}>
                <strong>D10 (Decaedro)</strong>
                <p>10 caras. Se usa solo o en parejas para generar porcentajes (D100).</p>
              </div>
              <div className={styles.diceInfo}>
                <strong>D12 (Dodecaedro)</strong>
                <p>12 caras pentagonales. Para armas grandes como hachas de guerra.</p>
              </div>
              <div className={styles.diceInfo}>
                <strong>D20 (Icosaedro)</strong>
                <p>El rey de los dados de rol. Usado para ataques, salvaciones y habilidades en D&D.</p>
              </div>
              <div className={styles.diceInfo}>
                <strong>D100 (Percentil)</strong>
                <p>Genera números del 1 al 100. Suele usarse con dos D10.</p>
              </div>
            </div>
          </section>

          <section className={styles.eduSection}>
            <h3>🎯 Críticos y pifias en D20</h3>
            <p>
              En muchos sistemas de rol, sacar un <strong>20 natural</strong> en un D20 es un
              <strong> golpe crítico</strong> (éxito automático con bonificación), mientras que
              un <strong>1 natural</strong> es una <strong>pifia</strong> (fallo automático,
              a veces con consecuencias negativas).
            </p>
          </section>

          <section className={styles.eduSection}>
            <h3>📐 Notación de dados</h3>
            <p>La notación estándar es <strong>XdY+Z</strong> donde:</p>
            <ul>
              <li><strong>X</strong> = número de dados a lanzar</li>
              <li><strong>d</strong> = separador (de &quot;dice&quot; en inglés)</li>
              <li><strong>Y</strong> = número de caras del dado</li>
              <li><strong>+Z</strong> = modificador opcional (puede ser negativo)</li>
            </ul>
            <p>Ejemplo: <strong>2d6+3</strong> = lanzar 2 dados de 6 caras y sumar 3 al total.</p>
          </section>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('tirador-dados')} />
      <Footer appName="tirador-dados" />
    </div>
  );
}
