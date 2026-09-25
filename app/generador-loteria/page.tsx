'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import styles from './GeneradorLoteria.module.css';
import { MeskeiaLogo, Footer, RelatedApps, DisclaimerCard, LegalNotice, ShareCard, EducationalSection } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatDate } from '@/lib';

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
  /** Ancla de la sección propia de esta modalidad (enlazable desde fuera). */
  anchor: string;
  /** Probabilidad del primer premio, calculada sobre las reglas de la propia modalidad. */
  odds: string;
  /** Qué combinación hay que acertar para esa probabilidad. */
  oddsLabel: string;
  /** Párrafo funcional de la sección propia: reglas y uso, sin hablar de botes. */
  blurb: string;
}

interface GeneratedResult {
  id: string;
  type: LotteryType;
  mainNumbers: number[];
  extraNumbers?: number[];
  timestamp: Date;
}

/**
 * Las combinaciones marcadas como favoritas se guardan en el navegador del usuario.
 *
 * Antes vivían solo en el estado de React, así que se perdían al recargar o al cerrar
 * la pestaña — justo lo contrario de lo que promete el texto de la página ("guardar las
 * que quieras conservar", "guardarlas para la semana" en Bonoloto, que sortea todos los
 * días). Quien las apunta lo hace para jugarlas otro día: si no sobreviven a la sesión,
 * la función no sirve para nada.
 *
 * No sale del dispositivo: no hay servidor ni cuenta detrás, solo `localStorage`.
 *
 * Con varias pestañas abiertas (hallazgo 1630, 25/09/2026): cada cambio parte de lo que hay
 * EN ESE MOMENTO en el almacén, no de la copia en memoria de la pestaña, y la página escucha
 * el evento `storage` para repintar lo que guarde otra. Antes cada pestaña leía una sola vez
 * al montarse y reescribía la clave entera con su copia: lo guardado en otra pestaña después
 * desaparecía sin aviso.
 */
const CLAVE_FAVORITAS = 'meskeia-loteria-favoritas';

/**
 * Tope de combinaciones guardadas. Al llegar a él NO se descarta ninguna guardada: la nueva
 * no entra y se avisa (hallazgo 1631). Antes se hacía `[nueva, ...previas].slice(0, 20)` y la
 * más antigua se borraba en silencio, contra lo que promete la página («siguen aquí cuando
 * vuelvas»). El tope se enseña en la propia lista antes de alcanzarlo.
 */
const MAX_FAVORITAS = 20;

/**
 * Reconstruye la lista guardada validando cada combinación una por una.
 *
 * Lo que hay en `localStorage` es dato de fuera: puede venir de una versión anterior de la
 * app, de otra pestaña o de una edición manual. Una entrada con un `type` desconocido
 * dejaría `LOTTERY_CONFIG[result.type]` en `undefined` y la página entera caería al pintar
 * su icono, así que se descarta todo lo que no encaje en lugar de confiar en la forma.
 *
 * Devuelve `null` si el almacenamiento no está disponible (navegación privada, bloqueado),
 * para que quien llama distinga «no hay nada guardado» de «no se puede leer».
 */
function leerFavoritasGuardadas(): GeneratedResult[] | null {
  let crudo: string | null = null;
  try {
    crudo = window.localStorage.getItem(CLAVE_FAVORITAS);
  } catch {
    return null; // Navegación privada o almacenamiento bloqueado: se sigue sin persistencia
  }
  if (!crudo) return [];

  try {
    const datos: unknown = JSON.parse(crudo);
    if (!Array.isArray(datos)) return [];

    const validas: GeneratedResult[] = [];
    for (const item of datos) {
      if (!item || typeof item !== 'object') continue;
      const c = item as Partial<GeneratedResult>;
      if (typeof c.type !== 'string' || !(c.type in LOTTERY_CONFIG)) continue;
      if (!Array.isArray(c.mainNumbers) || !c.mainNumbers.every(n => typeof n === 'number' && Number.isFinite(n))) continue;
      if (c.extraNumbers !== undefined && (!Array.isArray(c.extraNumbers) || !c.extraNumbers.every(n => typeof n === 'number' && Number.isFinite(n)))) continue;

      // El timestamp viaja como texto ISO en el JSON; si no se puede reconstruir, se pone la fecha actual
      const fecha = c.timestamp ? new Date(c.timestamp as unknown as string) : new Date();
      validas.push({
        id: typeof c.id === 'string' && c.id ? c.id : `${Date.now()}-${validas.length}`,
        type: c.type as LotteryType,
        mainNumbers: c.mainNumbers,
        extraNumbers: c.extraNumbers,
        timestamp: Number.isNaN(fecha.getTime()) ? new Date() : fecha
      });
    }
    return validas.slice(0, MAX_FAVORITAS);
  } catch {
    return []; // JSON corrupto: mejor empezar de cero que tumbar la página
  }
}

/** Escribe la lista en el almacén; si está bloqueado o lleno, la sesión sigue en memoria. */
function escribirFavoritasGuardadas(lista: GeneratedResult[]): void {
  try {
    window.localStorage.setItem(CLAVE_FAVORITAS, JSON.stringify(lista));
  } catch {
    // Cuota agotada o almacenamiento bloqueado: la sesión sigue funcionando en memoria
  }
}

/** Huella de una combinación, para no guardar dos veces la misma apuesta. */
function firmaCombinacion(result: GeneratedResult): string {
  return `${result.type}|${result.mainNumbers.join('-')}|${(result.extraNumbers ?? []).join('-')}`;
}

/** Texto de una combinación tal como se copia y se anuncia: «Euromillones: 3 - 9 - … | Estrellas: 2, 7». */
function textoCombinacion(result: GeneratedResult): string {
  const config = LOTTERY_CONFIG[result.type];
  let texto = `${config.name}: ${result.mainNumbers.join(' - ')}`;
  if (result.extraNumbers) {
    texto += ` | ${config.extraName}: ${result.extraNumbers.join(', ')}`;
  }
  return texto;
}

const LOTTERY_CONFIG: Record<LotteryType, LotteryConfig> = {
  primitiva: {
    name: 'La Primitiva',
    icon: '🎱',
    mainNumbers: 6,
    mainMax: 49,
    extraNumbers: 1,
    extraMax: 9,
    extraName: 'Reintegro',
    description: '6 números del 1 al 49 + Reintegro (0-9)',
    drawDays: 'Lunes, jueves y sábados',
    price: '1,00 €',
    anchor: 'generador-primitiva',
    odds: '1 entre 13.983.816',
    oddsLabel: 'acertar los 6 números',
    blurb: 'Genera combinaciones de 6 números del 1 al 49 para La Primitiva, más el Reintegro (un dígito del 0 al 9). Puedes producir varias apuestas de golpe si juegas boleto múltiple y guardar las que quieras conservar. Hay sorteo los lunes, jueves y sábados.'
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
    price: '2,50 €',
    anchor: 'generador-euromillones',
    odds: '1 entre 139.838.160',
    oddsLabel: 'acertar los 5 números y las 2 estrellas',
    blurb: 'Genera combinaciones de Euromillones: 5 números del 1 al 50 y 2 estrellas del 1 al 12, los dos bloques a la vez y sin repetir números dentro de cada uno. Es la modalidad con más combinaciones posibles de las cinco, porque hay que acertar dos sorteos independientes. Se juega martes y viernes.'
  },
  bonoloto: {
    name: 'Bonoloto',
    icon: '🍀',
    mainNumbers: 6,
    mainMax: 49,
    extraNumbers: 1,
    extraMax: 9,
    extraName: 'Reintegro',
    description: '6 números del 1 al 49 + Reintegro (0-9)',
    drawDays: 'Lunes a domingo (todos los días)',
    price: '0,50 €',
    anchor: 'generador-bonoloto',
    odds: '1 entre 13.983.816',
    oddsLabel: 'acertar los 6 números',
    blurb: 'Genera combinaciones de Bonoloto: 6 números del 1 al 49 y Reintegro, con las mismas reglas que La Primitiva pero sorteo todos los días, de lunes a domingo. Como hay sorteo a diario, aquí es donde más sentido tiene generar varias combinaciones seguidas y guardarlas para la semana.'
  },
  gordo: {
    name: 'El Gordo de la Primitiva',
    icon: '🎰',
    mainNumbers: 5,
    mainMax: 54,
    extraNumbers: 1,
    extraMax: 9,
    extraName: 'Clave',
    description: '5 números del 1 al 54 + Clave (0-9)',
    drawDays: 'Domingos',
    price: '1,50 €',
    anchor: 'generador-gordo-primitiva',
    odds: '1 entre 31.625.100',
    oddsLabel: 'acertar los 5 números y la clave',
    blurb: 'Genera combinaciones de El Gordo de la Primitiva: 5 números del 1 al 54 más la Clave (un dígito del 0 al 9). Al pedir solo 5 aciertos sobre 54 bolas, tiene menos combinaciones posibles que La Primitiva pese a usar más números. Sorteo los domingos.'
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
    price: '1,00 €',
    anchor: 'generador-lototurf',
    odds: '1 entre 8.835.372',
    oddsLabel: 'acertar los 6 números y el caballo',
    blurb: 'Genera combinaciones de Lototurf: 6 números del 1 al 31 más el Caballo ganador (del 1 al 12). Es la modalidad con menos combinaciones posibles de las cinco, porque solo entran 31 bolas en el bombo principal. Se sortea los domingos, ligado a una carrera hípica.'
  }
};

export default function GeneradorLoteriaPage() {
  const [selectedLottery, setSelectedLottery] = useState<LotteryType>('primitiva');
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [favorites, setFavorites] = useState<GeneratedResult[]>([]);
  const generadorRef = useRef<HTMLDivElement>(null);

  /** Copia en memoria de la lista, para cuando el almacén no se puede leer. */
  const favoritasRef = useRef<GeneratedResult[]>([]);

  /** Combinación cuyo guardado se rechazó por el tope: su tarjeta enseña el aviso. */
  const [topeEn, setTopeEn] = useState<string | null>(null);

  /** Resultado del último «Copiar», por botón (`r-<id>` en resultados, `f-<id>` en guardadas). */
  const [copia, setCopia] = useState<{ clave: string; ok: boolean } | null>(null);
  const temporizadorCopiaRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Texto de la región aria-live: generar, copiar y el tope se anuncian a quien no ve la pantalla. */
  const [anuncio, setAnuncio] = useState('');

  /** Cuenta de generaciones: cada una lleva la vista hasta la combinación nueva. */
  const [generacion, setGeneracion] = useState(0);
  const primeraNuevaRef = useRef<HTMLDivElement>(null);

  /**
   * `localStorage` no existe en el servidor, y leerlo dentro del `useState` inicial haría
   * que el HTML servido y el primer render del navegador no coincidieran (error de
   * hidratación). Por eso se carga después de montar. Se reescribe la clave ya saneada, y
   * se escucha `storage` para enterarse de lo que guarde otra pestaña.
   */
  useEffect(() => {
    const guardadas = leerFavoritasGuardadas() ?? [];
    favoritasRef.current = guardadas;
    setFavorites(guardadas);
    escribirFavoritasGuardadas(guardadas);

    const alCambiarEnOtraPestana = (e: StorageEvent) => {
      if (e.key !== null && e.key !== CLAVE_FAVORITAS) return; // key null = se vació todo
      const lista = leerFavoritasGuardadas() ?? [];
      favoritasRef.current = lista;
      setFavorites(lista);
    };
    window.addEventListener('storage', alCambiarEnOtraPestana);
    return () => window.removeEventListener('storage', alCambiarEnOtraPestana);
  }, []);

  useEffect(() => () => {
    if (temporizadorCopiaRef.current) clearTimeout(temporizadorCopiaRef.current);
  }, []);

  /**
   * Aplica un cambio a la lista guardada partiendo de lo que hay AHORA en el almacén (puede
   * haberlo cambiado otra pestaña), no de la copia en memoria. Solo si el almacén no se puede
   * leer se parte de la memoria.
   */
  const modificarFavoritas = useCallback((cambio: (lista: GeneratedResult[]) => GeneratedResult[]) => {
    const base = leerFavoritasGuardadas() ?? favoritasRef.current;
    const nueva = cambio(base);
    favoritasRef.current = nueva;
    setFavorites(nueva);
    escribirFavoritasGuardadas(nueva);
  }, []);

  // Tras generar, la vista baja hasta la combinación nueva si ha quedado fuera de la pantalla
  // (hallazgo 1632: en móvil, con el botón al pie, el resultado se pintaba por debajo y no se
  // veía ni una bola). `block: 'nearest'` no mueve nada si la tarjeta ya se ve.
  useEffect(() => {
    if (generacion === 0) return;
    const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    primeraNuevaRef.current?.scrollIntoView({ behavior: reducirMovimiento ? 'auto' : 'smooth', block: 'nearest' });
  }, [generacion]);

  // Desde la ficha de cada modalidad: seleccionarla y subir al generador
  const irAlGenerador = useCallback((type: LotteryType) => {
    setSelectedLottery(type);
    generadorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

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
      setTopeEn(null);
      setGeneracion(g => g + 1);
      setAnuncio(newResults.length === 1
        ? `Combinación generada. ${textoCombinacion(newResults[0])}`
        : `${newResults.length} combinaciones de ${config.name} generadas`);
    }, 300);
  }, [selectedLottery, quantity]);

  // Añadir a favoritos.
  // Se compara por la combinación en sí, no por el id: al conservarse entre sesiones, una
  // apuesta repetida se generaría con un id nuevo y quedaría duplicada para siempre.
  // Con la lista llena NO se descarta ninguna guardada: la nueva no entra y se avisa.
  const addToFavorites = useCallback((result: GeneratedResult) => {
    let llena = false;
    modificarFavoritas(lista => {
      const firma = firmaCombinacion(result);
      if (lista.some(f => firmaCombinacion(f) === firma)) return lista;
      if (lista.length >= MAX_FAVORITAS) {
        llena = true;
        return lista;
      }
      return [result, ...lista];
    });
    if (llena) {
      setTopeEn(result.id);
      setAnuncio(`No se ha guardado: ya tienes ${MAX_FAVORITAS} combinaciones guardadas, el máximo. Quita alguna para guardar esta.`);
    } else {
      setTopeEn(null);
      setAnuncio('Combinación guardada en este navegador');
    }
  }, [modificarFavoritas]);

  // Eliminar de favoritos
  const removeFromFavorites = useCallback((id: string) => {
    modificarFavoritas(lista => lista.filter(f => f.id !== id));
    setTopeEn(null);
  }, [modificarFavoritas]);

  // Vaciar la lista guardada
  const clearFavorites = useCallback(() => {
    modificarFavoritas(() => []);
    setTopeEn(null);
  }, [modificarFavoritas]);

  // Copiar al portapapeles, confirmando en el propio botón y en la región aria-live
  // (hallazgo 1633: antes no cambiaba nada en pantalla y un fallo del portapapeles se perdía).
  const copyToClipboard = useCallback(async (result: GeneratedResult, clave: string) => {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(textoCombinacion(result));
        ok = true;
      }
    } catch {
      ok = false; // Permiso denegado o contexto no seguro
    }
    setCopia({ clave, ok });
    setAnuncio(ok
      ? 'Combinación copiada al portapapeles'
      : 'No se ha podido copiar: el navegador no ha dado acceso al portapapeles. Puedes seleccionar los números y copiarlos a mano.');
    if (temporizadorCopiaRef.current) clearTimeout(temporizadorCopiaRef.current);
    temporizadorCopiaRef.current = setTimeout(() => setCopia(null), 2500);
  }, []);

  /** Contenido del botón Copiar: el icono, o la confirmación durante unos segundos. */
  const contenidoCopiar = (clave: string) => {
    if (copia?.clave !== clave) return '📋';
    return copia.ok
      ? <><span aria-hidden="true">✓</span> Copiada</>
      : <><span aria-hidden="true">✕</span> No copiada</>;
  };

  // Limpiar historial
  const clearHistory = useCallback(() => {
    setResults([]);
  }, []);

  const config = LOTTERY_CONFIG[selectedLottery];

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🎲</span>
        <h1 className={styles.title}>Generador de Lotería</h1>
        <p className={styles.subtitle}>
          Genera combinaciones aleatorias de Primitiva, Euromillones, Bonoloto,
          El Gordo de la Primitiva y Lototurf.
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <main className={styles.mainContent}>
        {/* Selector de lotería */}
        <div className={styles.lotterySelector}>
          {(Object.keys(LOTTERY_CONFIG) as LotteryType[]).map(type => (
            <button
              key={type}
              type="button"
              onClick={() => setSelectedLottery(type)}
              aria-pressed={selectedLottery === type}
              className={`${styles.lotteryButton} ${selectedLottery === type ? styles.active : ''}`}
            >
              <span className={styles.lotteryIcon} aria-hidden="true">{LOTTERY_CONFIG[type].icon}</span>
              <span className={styles.lotteryName}>{LOTTERY_CONFIG[type].name}</span>
            </button>
          ))}
        </div>

        {/* Info de la lotería seleccionada */}
        <div className={styles.lotteryInfo}>
          <div className={styles.infoHeader}>
            <span className={styles.infoBigIcon} aria-hidden="true">{config.icon}</span>
            <h2>{config.name}</h2>
          </div>
          <div className={styles.infoDetails}>
            <span className={styles.infoItem}><span aria-hidden="true">📋</span> {config.description}</span>
            <span className={styles.infoItem}><span aria-hidden="true">📅</span> {config.drawDays}</span>
            <span className={styles.infoItem}><span aria-hidden="true">💰</span> {config.price} / apuesta</span>
          </div>
        </div>

        {/* Generador */}
        <div className={styles.generatorPanel} ref={generadorRef}>
          <div className={styles.quantitySelector}>
            <label>Combinaciones a generar:</label>
            <div className={styles.quantityButtons}>
              {[1, 3, 5, 10].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuantity(num)}
                  aria-pressed={quantity === num}
                  className={`${styles.quantityBtn} ${quantity === num ? styles.active : ''}`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={generateCombination}
            className={styles.generateButton}
            disabled={isGenerating}
          >
            {isGenerating
              ? <><span aria-hidden="true">🎲</span> Generando...</>
              : <><span aria-hidden="true">🎯</span> {`Generar ${quantity} ${quantity > 1 ? 'combinaciones' : 'combinación'} de ${config.name}`}</>}
          </button>
        </div>

        {/* Resultados */}
        {results.length > 0 && (
          <div className={styles.resultsSection}>
            <div className={styles.resultsSectionHeader}>
              <h2><span aria-hidden="true">🎰</span> Combinaciones generadas</h2>
              <button type="button" onClick={clearHistory} className={styles.btnSmall}>
                <span aria-hidden="true">🗑️</span> Limpiar
              </button>
            </div>

            <div className={styles.resultsList}>
              {results.map((result, index) => {
                const resultConfig = LOTTERY_CONFIG[result.type];
                // Por combinación, no por id: la guardada en otra sesión tiene un id distinto
                // aunque los números sean los mismos, y la estrella debe salir marcada igual.
                const favoritaEquivalente = favorites.find(f => firmaCombinacion(f) === firmaCombinacion(result));
                const isFavorite = Boolean(favoritaEquivalente);

                return (
                  <div
                    key={result.id}
                    ref={index === 0 ? primeraNuevaRef : undefined}
                    className={`${styles.resultCard} ${index === 0 ? styles.latest : ''}`}
                  >
                    <div className={styles.resultHeader}>
                      <span className={styles.resultType}>
                        <span aria-hidden="true">{resultConfig.icon}</span> {resultConfig.name}
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
                        type="button"
                        onClick={() => copyToClipboard(result, `r-${result.id}`)}
                        className={`${styles.actionBtn} ${copia?.clave === `r-${result.id}` ? styles.actionBtnConTexto : ''}`}
                        title="Copiar"
                        aria-label="Copiar combinación"
                      >
                        {contenidoCopiar(`r-${result.id}`)}
                      </button>
                      <button
                        type="button"
                        onClick={() => favoritaEquivalente ? removeFromFavorites(favoritaEquivalente.id) : addToFavorites(result)}
                        className={`${styles.actionBtn} ${isFavorite ? styles.favorited : ''}`}
                        title={isFavorite ? 'Quitar de guardadas' : 'Guardar en este navegador'}
                        aria-label={isFavorite ? 'Quitar de las combinaciones guardadas' : 'Guardar esta combinación en este navegador'}
                        aria-pressed={isFavorite}
                      >
                        {isFavorite ? '⭐' : '☆'}
                      </button>
                    </div>
                    {topeEn === result.id && (
                      <p className={styles.avisoTope}>
                        No se ha guardado: ya tienes {MAX_FAVORITAS} combinaciones guardadas, el
                        máximo. Quita alguna de «Mis combinaciones guardadas» para guardar esta.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Favoritos */}
        {favorites.length > 0 && (
          <div className={styles.favoritesSection}>
            <div className={styles.resultsSectionHeader}>
              <h2><span aria-hidden="true">⭐</span> Mis combinaciones guardadas</h2>
              <button type="button" onClick={clearFavorites} className={styles.btnSmall}>
                <span aria-hidden="true">🗑️</span> Vaciar
              </button>
            </div>
            <p className={styles.favoritesNota}>
              Se guardan en este navegador y siguen aquí cuando vuelvas, aunque cierres la
              página. No se envían a ningún sitio: si vacías los datos del navegador o entras
              desde otro dispositivo, no aparecerán.{' '}
              <span className={styles.favoritesCupo}>
                Caben hasta {MAX_FAVORITAS}: llevas {favorites.length}.
              </span>
            </p>
            <div className={styles.favoritesList}>
              {favorites.map(result => {
                const resultConfig = LOTTERY_CONFIG[result.type];
                return (
                  <div key={result.id} className={styles.favoriteCard}>
                    <span className={styles.favoriteType} aria-hidden="true">{resultConfig.icon}</span>
                    <div className={styles.favoriteNumbers}>
                      {result.mainNumbers.join(' - ')}
                      {result.extraNumbers && (
                        <span className={styles.favoriteExtra}>
                          | {resultConfig.extraName}: {result.extraNumbers.join(', ')}
                        </span>
                      )}
                      <span className={styles.favoriteFecha}>
                        {resultConfig.name} · guardada el {formatDate(result.timestamp)}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(result, `f-${result.id}`)}
                      className={`${styles.actionBtn} ${copia?.clave === `f-${result.id}` ? styles.actionBtnConTexto : ''}`}
                      title="Copiar"
                      aria-label={`Copiar la combinación guardada ${result.mainNumbers.join(', ')}`}
                    >
                      {contenidoCopiar(`f-${result.id}`)}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeFromFavorites(result.id)}
                      className={styles.removeFavorite}
                      aria-label={`Quitar la combinación ${result.mainNumbers.join(', ')} de las guardadas`}
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

      {/* Anuncios para lectores de pantalla: combinaciones generadas, copiadas o no guardadas.
          Fuera de <main> para que su texto no duplique la confirmación visible del botón. */}
      <p className="sr-only" role="status" aria-live="polite">{anuncio}</p>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <DisclaimerCard
        variant="general"
        severity="low"
        context="generador-loteria"
        collapsible={true}
      />

      

      {/* Ficha propia de cada modalidad. Visible (no colapsable) a propósito: es el
          contenido que asocia la página a cada lotería concreta, no solo a La Primitiva. */}
      <div className={styles.modalidadesSection}>
        <p className={styles.modalidadesIntro}>
          El generador cubre cinco loterías españolas, cada una con sus propias reglas de
          combinación. Estas son las diferencias y el enlace directo para generar en cada una.
        </p>

        <div className={styles.modalidadesGrid}>
          {(Object.keys(LOTTERY_CONFIG) as LotteryType[]).map(type => {
            const c = LOTTERY_CONFIG[type];
            return (
              <section key={type} id={c.anchor} className={styles.modalidadCard}>
                <h2 className={styles.modalidadTitulo}>
                  <span aria-hidden="true">{c.icon}</span> {`Generador de ${c.name}`}
                </h2>
                <p className={styles.modalidadTexto}>{c.blurb}</p>
                <dl className={styles.modalidadDatos}>
                  <div>
                    <dt>Combinación</dt>
                    <dd>{c.description}</dd>
                  </div>
                  <div>
                    <dt>Sorteos</dt>
                    <dd>{c.drawDays}</dd>
                  </div>
                  <div>
                    <dt>Precio por apuesta</dt>
                    <dd>{c.price}</dd>
                  </div>
                  <div>
                    <dt>Probabilidad de {c.oddsLabel}</dt>
                    <dd>{c.odds}</dd>
                  </div>
                </dl>
                <button
                  type="button"
                  onClick={() => irAlGenerador(type)}
                  className={styles.modalidadBoton}
                >
                  {`Generar números de ${c.name}`}
                </button>
              </section>
            );
          })}
        </div>
      </div>

      {/* Contenido educativo colapsable */}
      <EducationalSection
        title="¿Quieres entender mejor las loterías y la probabilidad?"
        subtitle="Compara loterías españolas, resuelve dudas frecuentes y aprende a jugar con cabeza"
      >
        {/* ── SECCIÓN 1: Tabla Comparativa ── */}
        <section className={styles.guideSection}>
          <h2>Comparativa de loterías españolas</h2>
          <p>
            Las principales loterías de Loterías y Apuestas del Estado (LAE) tienen reglas y probabilidades muy distintas.
            Esta tabla te ayuda a elegir la que mejor se adapta a tu presupuesto y preferencias.
          </p>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Lotería</th>
                  <th>Combinación</th>
                  <th>Probabilidad bote</th>
                  <th>Precio / apuesta</th>
                  <th>Bote mínimo</th>
                  <th>Días de sorteo</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span aria-hidden="true">🎱</span> La Primitiva</td>
                  <td>6 de 49 + Reintegro</td>
                  <td>1 entre 13.983.816</td>
                  <td>1,00 €</td>
                  <td>3.000.000 €</td>
                  <td>Lunes, jueves y sábados</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">🍀</span> Bonoloto</td>
                  <td>6 de 49 + Reintegro</td>
                  <td>1 entre 13.983.816</td>
                  <td>0,50 €</td>
                  <td>400.000 €</td>
                  <td>Lunes a domingo</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">⭐</span> Euromillones</td>
                  <td>5 de 50 + 2 Estrellas</td>
                  <td>1 entre 139.838.160</td>
                  <td>2,50 €</td>
                  <td>17.000.000 €</td>
                  <td>Martes y Viernes</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">🎰</span> El Gordo</td>
                  <td>5 de 54 + Clave</td>
                  <td>1 entre 31.625.100</td>
                  <td>1,50 €</td>
                  <td>5.000.000 €</td>
                  <td>Domingos</td>
                </tr>
                <tr>
                  <td><span aria-hidden="true">🏇</span> Lototurf</td>
                  <td>6 de 31 + Caballo</td>
                  <td>1 entre 8.835.372</td>
                  <td>1,00 €</td>
                  {/* Las normas de LAE (Resolución de 27/07/2007, norma 16.ª) garantizan un fondo
                      para la primera categoría del primer sorteo de cada ciclo, sin fijar la
                      cuantía: el millón de euros que repiten muchas webs era solo para el primer
                      concurso (disposición transitoria primera). No se inventa una cifra. */}
                  <td>Fondo garantizado por ciclo</td>
                  <td>Domingos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* ── SECCIÓN 2: Casos de Uso ── */}
        <section className={styles.guideSection}>
          <h2>¿Para quién es útil este generador?</h2>
          <p>
            Aunque los números generados aleatoriamente tienen la misma probabilidad que cualquier
            otro, el generador aporta valor en situaciones muy concretas.
          </p>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🎲</span>
                <h4>Jugador ocasional</h4>
              </div>
              <p className={styles.escenarioExample}>
                Juegas de vez en cuando y no quieres repetir las mismas combinaciones de
                siempre. El generador te da una selección nueva cada vez, sin esfuerzo.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: guarda con la estrella las combinaciones que quieras jugar. Se
                quedan en este navegador, así que puedes volver otro día y llevar los números
                exactos a la administración de lotería o jugarlos por internet.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">👥</span>
                <h4>Grupo de amigos o peña</h4>
              </div>
              <p className={styles.escenarioExample}>
                Jugáis en grupo y necesitáis varios boletos distintos. Genera varias
                combinaciones a la vez (hasta 10) para repartir entre los participantes
                sin duplicados.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: jugando en peña el coste individual baja, pero el premio también
                se divide. Acordad por escrito el porcentaje de cada miembro antes del sorteo.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">📊</span>
                <h4>Usuario curioso sobre probabilidad</h4>
              </div>
              <p className={styles.escenarioExample}>
                Quieres entender la diferencia real de probabilidades entre loterías y
                comprobar que ningún número es &quot;más afortunado&quot; que otro estadísticamente.
              </p>
              <p className={styles.escenarioTip}>
                Consejo: compara la tabla de probabilidades. La diferencia entre Euromillones
                (1/139M) y El Gordo (1/31M) es enorme, aunque ambos botes sean tentadores.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 3: FAQ ── */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes sobre loterías y probabilidad</h2>
          <ul className={styles.faqList}>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Los números generados aleatoriamente tienen más probabilidad de ganar?</summary>
                <p>
                  No. Cada combinación posible tiene exactamente la misma probabilidad de salir premiada,
                  independientemente de si la elegiste tú, la generó un ordenador o la elige la máquina
                  del sorteo. La aleatoriedad del generador es tan válida como cualquier otro método.
                </p>
                <p className={styles.faqTip}>
                  Dato matemático: en La Primitiva hay 13.983.816 combinaciones posibles. Todas tienen
                  la misma probabilidad: 1 entre 13.983.816.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Existe algún número &quot;más frecuente&quot; en La Primitiva?</summary>
                <p>
                  No en términos estadísticos. Aunque en el pasado ciertos números hayan salido más veces,
                  cada sorteo es independiente. La &quot;frecuencia histórica&quot; de un número no influye
                  en la probabilidad del siguiente sorteo. Es la llamada falacia del jugador.
                </p>
                <p className={styles.faqTip}>
                  Los sorteos de La Primitiva están supervisados por el organismo regulador español
                  (Loterías y Apuestas del Estado) y son auditados para garantizar la aleatoriedad.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Qué probabilidad tengo de acertar el bote de La Primitiva?</summary>
                <p>
                  La probabilidad de acertar los 6 números principales es de 1 entre 13.983.816.
                  Para tener una probabilidad del 50% de acertar al menos una vez necesitarías
                  comprar más de 9,6 millones de boletos. Si compras uno por semana, estadísticamente
                  tardarías unos 269.000 años en acertar.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Merece la pena jugar en grupo (peña)?</summary>
                <p>
                  Depende del objetivo. En grupo reduces el coste individual y aumentas el número
                  de combinaciones jugadas por el mismo precio, lo que incrementa la probabilidad
                  de ganar algo. Sin embargo, si ganáis el bote, el premio se divide entre todos.
                  El valor esperado por euro invertido es el mismo que jugando solo.
                </p>
                <p className={styles.faqTip}>
                  Consejo práctico: firmad un acuerdo escrito con el porcentaje de cada participante
                  antes del sorteo. Evita conflictos en caso de premio.
                </p>
              </details>
            </li>
            <li className={styles.faqItem}>
              <details>
                <summary>¿Cuánto se lleva Hacienda de un premio de lotería en España?</summary>
                <p>
                  Los premios de loterías del Estado superiores a 40.000 € tributan al 20% sobre
                  el exceso. Por ejemplo, si ganas 1.000.000 €, pagas el 20% sobre 960.000 €
                  (el exceso sobre 40.000 €), es decir, 192.000 € de impuestos. El tipo es fijo,
                  no progresivo como el IRPF general.
                </p>
                <p className={styles.faqTip}>
                  Referencia legal: artículo 13 de la Ley 16/2012, de 27 de diciembre. Los premios
                  de la ONCE y Cruz Roja también están incluidos.
                </p>
              </details>
            </li>
          </ul>
        </section>

        {/* ── SECCIÓN 4: Guía Paso a Paso ── */}
        <section className={styles.guideSection}>
          <h2>Cómo usar el generador: 5 pasos</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">1</span>
              <div className={styles.stepContent}>
                <strong>Elige la lotería que quieres jugar</strong>
                <p>
                  Selecciona entre Primitiva, Bonoloto, Euromillones, El Gordo o Lototurf. Cada una tiene
                  rangos de números y reglas distintas. Compara la tabla de probabilidades antes
                  de decidir cuánto dinero invertir.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">2</span>
              <div className={styles.stepContent}>
                <strong>Genera los números aleatorios</strong>
                <p>
                  Pulsa el botón de generar. Los números son estadísticamente iguales de válidos
                  que cualquier combinación que elijas manualmente. No hay estrategia que mejore
                  las probabilidades matemáticas.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">3</span>
              <div className={styles.stepContent}>
                <strong>Verifica si ya tienes ese boleto</strong>
                <p>
                  Si juegas en grupo o tienes boletos anteriores activos, comprueba que la
                  combinación generada no coincide con ninguna que ya tengas. Dos boletos
                  iguales no aumentan las probabilidades de manera significativa.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">4</span>
              <div className={styles.stepContent}>
                <strong>Establece un presupuesto mensual máximo</strong>
                <p>
                  Decide cuánto dinero puedes dedicar al juego sin que afecte a tu economía.
                  El valor esperado de la lotería es siempre negativo: por cada euro invertido
                  el retorno medio es inferior a 1 €. Juega solo con dinero que puedes perder.
                </p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber} aria-hidden="true">5</span>
              <div className={styles.stepContent}>
                <strong>Guarda el comprobante de compra para reclamar premios</strong>
                <p>
                  Una vez jugado el boleto, guarda siempre el resguardo físico o el justificante
                  digital. Sin él no podrás cobrar ningún premio, independientemente de que
                  puedas demostrar que jugaste esa combinación.
                </p>
              </div>
            </li>
          </ol>
        </section>

        {/* ── SECCIÓN 5: Mejores Prácticas ── */}
        <section className={styles.guideSection}>
          <h2>4 consejos para jugar con responsabilidad</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💶</span>
              <h4>Fija un presupuesto mensual y no lo superes</h4>
              <p>
                Decide de antemano cuánto dinero destinas a lotería al mes y cúmplelo.
                El gasto en juego debe ser una partida de ocio, nunca una inversión ni
                una estrategia de ahorro.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">👥</span>
              <h4>Jugar en grupo reduce el coste, pero también el premio</h4>
              <p>
                Una peña te permite comprar más combinaciones por menos dinero, pero si
                ganáis el bote cada miembro recibe solo su parte proporcional. El valor
                esperado por euro es idéntico jugando solo o en grupo.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📊</span>
              <h4>Ningún número tiene más probabilidad que otro</h4>
              <p>
                Las estadísticas de &quot;números calientes&quot; o &quot;números fríos&quot; son un mito.
                Cada sorteo es independiente del anterior. No existe ningún método
                matemático que mejore las probabilidades de acertar.
              </p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧾</span>
              <h4>Guarda siempre el resguardo de la apuesta</h4>
              <p>
                Sin el resguardo original (físico o digital) no podrás cobrar ningún
                premio. Guárdalo en un lugar seguro hasta que se celebre el sorteo y
                compruebes el resultado oficial.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECCIÓN 6: Warning Box ── */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h3>4 errores frecuentes al jugar a la lotería</h3>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Gastar más de lo que puedes permitirte creyendo en &quot;sistemas&quot; ganadores.</strong>{' '}
                No existe ningún sistema matemático que mejore las probabilidades de ganar.
                Cualquier método de selección de números tiene la misma probabilidad que
                los generados aleatoriamente.
              </li>
              <li>
                <strong>Pensar que los números frecuentes tienen más probabilidad (falacia del jugador).</strong>{' '}
                Que un número haya salido muchas veces en el pasado no aumenta ni disminuye
                su probabilidad en el próximo sorteo. Cada sorteo es un evento independiente.
              </li>
              <li>
                <strong>No declarar premios a Hacienda (obligatorio si superan 40.000 €).</strong>{' '}
                Los premios de lotería del Estado superiores a 40.000 € tributan al 20% sobre
                el exceso. No declararlos constituye una infracción tributaria grave con
                sanciones adicionales.
              </li>
              <li>
                <strong>Perder el resguardo de la apuesta ganadora.</strong>{' '}
                Sin el comprobante de compra no podrás cobrar el premio, aunque puedas
                demostrar que jugaste esa combinación. Guarda siempre el resguardo físico
                o el justificante digital hasta comprobar el resultado oficial.
              </li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-loteria')} />

      <ShareCard appName="generador-loteria" />
      <Footer appName="generador-loteria" />
    </div>
  );
}
