'use client';
// @disclaimer: exempt
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import styles from './NumerosPrimos.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

type Seccion = 'criba' | 'patrones' | 'criptografia' | 'datos';

const SECCIONES = [
  { id: 'criba' as Seccion, titulo: 'Criba', icono: '🔢', subtitulo: 'Eratóstenes paso a paso' },
  { id: 'patrones' as Seccion, titulo: 'Patrones', icono: '🌀', subtitulo: 'Espiral y gemelos' },
  { id: 'criptografia' as Seccion, titulo: 'RSA', icono: '🔐', subtitulo: 'Tu tarjeta depende de ellos' },
  { id: 'datos' as Seccion, titulo: 'Récords', icono: '🏆', subtitulo: 'Datos y curiosidades' },
];

// ─────────────────────────────────────────────
// Utilidades de primos
// ─────────────────────────────────────────────

function esPrimo(n: number): boolean {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}

function generarPrimosHasta(n: number): number[] {
  const primos: number[] = [];
  for (let i = 2; i <= n; i++) {
    if (esPrimo(i)) primos.push(i);
  }
  return primos;
}

// Colores para cada primo eliminador
const COLORES_PRIMOS: Record<number, string> = {
  2: '#e74c3c',
  3: '#e67e22',
  5: '#27ae60',
  7: '#2E86AB',
  11: '#8e44ad',
  13: '#f39c12',
  17: '#1abc9c',
  19: '#c0392b',
  23: '#2980b9',
};

function colorPrimo(p: number): string {
  if (COLORES_PRIMOS[p]) return COLORES_PRIMOS[p];
  const hue = (p * 137) % 360;
  return `hsl(${hue}, 60%, 45%)`;
}

// ─────────────────────────────────────────────
// Espiral de Ulam
// ─────────────────────────────────────────────

function generarEspiralUlam(lado: number): number[][] {
  const grid: number[][] = Array.from({ length: lado }, () => Array(lado).fill(0));
  const cx = Math.floor(lado / 2);
  const cy = Math.floor(lado / 2);
  let x = cx, y = cy;
  let num = 1;
  let pasos = 1;
  let dir = 0; // 0=derecha, 1=arriba, 2=izquierda, 3=abajo
  const dx = [1, 0, -1, 0];
  const dy = [0, -1, 0, 1];

  grid[y][x] = num++;

  while (num <= lado * lado) {
    for (let rep = 0; rep < 2 && num <= lado * lado; rep++) {
      for (let s = 0; s < pasos && num <= lado * lado; s++) {
        x += dx[dir];
        y += dy[dir];
        if (x >= 0 && x < lado && y >= 0 && y < lado) {
          grid[y][x] = num;
        }
        num++;
      }
      dir = (dir + 1) % 4;
    }
    pasos++;
  }
  return grid;
}

// ─────────────────────────────────────────────
// Sección 1: Criba de Eratóstenes
// ─────────────────────────────────────────────

interface CeldaCriba {
  numero: number;
  esPrimo: boolean;
  eliminadoPor: number | null;
  estado: 'pendiente' | 'primo' | 'eliminado' | 'activo';
}

function SeccionCriba() {
  const [limite, setLimite] = useState(100);
  const [celdas, setCeldas] = useState<CeldaCriba[]>([]);
  const [primoActual, setPrimoActual] = useState<number | null>(null);
  const [animando, setAnimando] = useState(false);
  const [velocidad, setVelocidad] = useState(300);
  const [primosEncontrados, setPrimosEncontrados] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pasoRef = useRef(0);
  const primosRef = useRef<number[]>([]);

  // Inicializar grid
  const inicializar = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setAnimando(false);
    setPrimoActual(null);
    setPrimosEncontrados(0);
    pasoRef.current = 0;
    primosRef.current = generarPrimosHasta(Math.sqrt(limite));

    const nuevasCeldas: CeldaCriba[] = [];
    for (let i = 1; i <= limite; i++) {
      nuevasCeldas.push({
        numero: i,
        esPrimo: i >= 2,
        eliminadoPor: null,
        estado: i === 1 ? 'eliminado' : 'pendiente',
      });
    }
    setCeldas(nuevasCeldas);
  }, [limite]);

  useEffect(() => {
    inicializar();
  }, [inicializar]);

  // Cleanup del interval
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Ejecutar un paso de la criba
  const ejecutarPaso = useCallback(() => {
    const primoIdx = pasoRef.current;
    const primos = primosRef.current;

    if (primoIdx >= primos.length) {
      // Terminado: marcar todos los pendientes como primos
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setAnimando(false);
      setCeldas(prev => {
        const nuevas = prev.map(c => ({
          ...c,
          estado: c.estado === 'pendiente' && c.numero >= 2 ? 'primo' as const : c.estado,
        }));
        const total = nuevas.filter(c => c.estado === 'primo').length;
        setPrimosEncontrados(total);
        return nuevas;
      });
      setPrimoActual(null);
      return;
    }

    const p = primos[primoIdx];
    setPrimoActual(p);
    pasoRef.current++;

    setCeldas(prev => {
      const nuevas = prev.map(c => {
        if (c.numero === p) {
          return { ...c, estado: 'primo' as const };
        }
        if (c.numero > p && c.numero % p === 0 && c.estado === 'pendiente') {
          return { ...c, esPrimo: false, eliminadoPor: p, estado: 'eliminado' as const };
        }
        return c;
      });
      const total = nuevas.filter(c => c.estado === 'primo').length;
      setPrimosEncontrados(total);
      return nuevas;
    });
  }, []);

  const pasoAPaso = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      setAnimando(false);
    }
    ejecutarPaso();
  }, [ejecutarPaso]);

  const automatico = useCallback(() => {
    if (animando) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setAnimando(false);
      return;
    }
    setAnimando(true);
    intervalRef.current = setInterval(() => {
      ejecutarPaso();
    }, velocidad);
  }, [animando, velocidad, ejecutarPaso]);

  // Actualizar velocidad del interval
  useEffect(() => {
    if (animando && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        ejecutarPaso();
      }, velocidad);
    }
  }, [velocidad, animando, ejecutarPaso]);

  const columnas = limite <= 100 ? 10 : limite <= 200 ? 15 : limite <= 300 ? 20 : 25;
  const gridClass = columnas === 10 ? styles.gridNumeros10
    : columnas === 15 ? styles.gridNumeros15
    : columnas === 20 ? styles.gridNumeros20
    : styles.gridNumeros25;

  // Leyenda de colores usados
  const coloresUsados = useMemo(() => {
    const usados = new Set<number>();
    celdas.forEach(c => { if (c.eliminadoPor) usados.add(c.eliminadoPor); });
    return Array.from(usados).sort((a, b) => a - b);
  }, [celdas]);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>La <strong>Criba de Eratóstenes</strong> (siglo III a.C.) encuentra todos los primos eliminando múltiplos.
        Empieza por el 2: tacha sus múltiplos. Luego el 3, el 5... Lo que sobrevive es primo.</p>
      </div>

      <div className={styles.controlesCriba}>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Hasta:</span>
          <select
            className={styles.controlSelect}
            value={limite}
            onChange={e => setLimite(Number(e.target.value))}
            aria-label="Límite de la criba"
          >
            <option value={100}>100</option>
            <option value={200}>200</option>
            <option value={300}>300</option>
            <option value={500}>500</option>
          </select>
        </div>
        <div className={styles.controlGroup}>
          <span className={styles.controlLabel}>Velocidad:</span>
          <input
            type="range"
            className={styles.sliderVelocidad}
            min={50}
            max={800}
            step={50}
            value={800 - velocidad}
            onChange={e => setVelocidad(800 - Number(e.target.value))}
            aria-label="Velocidad de la animación"
          />
        </div>
      </div>

      <div className={styles.botonesSimulacion}>
        <button type="button" className={styles.btnSimular} onClick={pasoAPaso}>
          Paso a paso
        </button>
        <button
          type="button"
          className={`${styles.btnSimular} ${animando ? styles.btnActivo : ''}`}
          onClick={automatico}
        >
          {animando ? 'Pausar' : 'Automático'}
        </button>
        <button type="button" className={styles.btnReset} onClick={inicializar}>
          Reiniciar
        </button>
      </div>

      <div className={styles.contadorPrimos}>
        Primos encontrados: <span className={styles.contadorDestacado}>{primosEncontrados}</span> de {formatNumber(limite)}
        {primoActual !== null && (
          <span className={styles.primoActualLabel}>Eliminando múltiplos de {primoActual}</span>
        )}
      </div>

      <div className={`${styles.gridNumeros} ${gridClass}`}>
        {celdas.map(c => {
          let className = styles.celda;
          let bg: string | undefined;
          if (c.numero === 1) {
            className += ` ${styles.celdaUno}`;
          } else if (c.estado === 'primo') {
            className += c.numero === primoActual ? ` ${styles.celdaPrimoActual}` : ` ${styles.celdaPrimo}`;
          } else if (c.estado === 'eliminado' && c.eliminadoPor) {
            className += ` ${styles.celdaEliminada}`;
            bg = colorPrimo(c.eliminadoPor);
          }
          return (
            <div
              key={c.numero}
              className={className}
              style={bg ? { backgroundColor: bg } : undefined}
              title={
                c.numero === 1 ? '1 no es primo'
                : c.estado === 'primo' ? `${c.numero} es primo`
                : c.eliminadoPor ? `${c.numero} eliminado por ${c.eliminadoPor}`
                : `${c.numero}`
              }
            >
              {c.numero}
            </div>
          );
        })}
      </div>

      {coloresUsados.length > 0 && (
        <div className={styles.leyendaCriba}>
          {coloresUsados.map(p => (
            <span key={p} className={styles.leyendaItem}>
              <span className={styles.leyendaColor} style={{ backgroundColor: colorPrimo(p) }} />
              Múltiplos de {p}
            </span>
          ))}
          <span className={styles.leyendaItem}>
            <span className={styles.leyendaColor} style={{ backgroundColor: 'var(--primary)' }} />
            Primo
          </span>
        </div>
      )}

      <div className={styles.insight}>
        <p>
          Solo necesitas comprobar primos hasta <strong>√n</strong>. Para n = {formatNumber(limite)},
          basta con probar hasta {Math.floor(Math.sqrt(limite))}. Todo número compuesto ≤ n tiene
          al menos un factor primo ≤ √n.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 2: Patrones y distribución
// ─────────────────────────────────────────────

function SeccionPatrones() {
  const LADO = 21;
  const espiral = useMemo(() => generarEspiralUlam(LADO), []);

  // Primos gemelos hasta 200
  const primosGemelos = useMemo(() => {
    const pares: [number, number][] = [];
    const primos = generarPrimosHasta(200);
    for (let i = 0; i < primos.length - 1; i++) {
      if (primos[i + 1] - primos[i] === 2) {
        pares.push([primos[i], primos[i + 1]]);
      }
    }
    return pares;
  }, []);

  // Primos de Mersenne conocidos (p pequeños)
  const mersenne = [
    { p: 2, valor: '3', digitos: 1 },
    { p: 3, valor: '7', digitos: 1 },
    { p: 5, valor: '31', digitos: 2 },
    { p: 7, valor: '127', digitos: 3 },
    { p: 13, valor: '8.191', digitos: 4 },
    { p: 17, valor: '131.071', digitos: 6 },
    { p: 19, valor: '524.287', digitos: 6 },
    { p: 31, valor: '2.147.483.647', digitos: 10 },
  ];

  // Distribución: primos en intervalos
  const distribucion = useMemo(() => {
    const intervalos = [
      { rango: '1-100', primos: generarPrimosHasta(100).length },
      { rango: '101-200', primos: generarPrimosHasta(200).length - generarPrimosHasta(100).length },
      { rango: '201-300', primos: generarPrimosHasta(300).length - generarPrimosHasta(200).length },
      { rango: '301-400', primos: generarPrimosHasta(400).length - generarPrimosHasta(300).length },
      { rango: '401-500', primos: generarPrimosHasta(500).length - generarPrimosHasta(400).length },
      { rango: '501-600', primos: generarPrimosHasta(600).length - generarPrimosHasta(500).length },
      { rango: '601-700', primos: generarPrimosHasta(700).length - generarPrimosHasta(600).length },
      { rango: '801-900', primos: generarPrimosHasta(900).length - generarPrimosHasta(800).length },
      { rango: '901-1000', primos: generarPrimosHasta(1000).length - generarPrimosHasta(900).length },
    ];
    return intervalos;
  }, []);

  const maxPrimos = Math.max(...distribucion.map(d => d.primos));

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Los primos parecen aleatorios, pero esconden <strong>patrones fascinantes</strong>.
        La espiral de Ulam revela diagonales inesperadas. Los primos gemelos desafían a las matemáticas.</p>
      </div>

      <h3 className={styles.seccionTitulo}>Espiral de Ulam</h3>
      <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Coloca los números en espiral desde el centro. Los primos (azul) forman diagonales.
      </p>

      <div className={styles.espiralContainer}>
        <div
          className={styles.gridEspiral}
          style={{ gridTemplateColumns: `repeat(${LADO}, 16px)` }}
        >
          {espiral.flat().map((num, idx) => (
            <div
              key={idx}
              className={`${styles.celdaEspiral} ${esPrimo(num) ? styles.celdaEspiralPrimo : styles.celdaEspiralNoPrimo}`}
              title={`${num}${esPrimo(num) ? ' (primo)' : ''}`}
            />
          ))}
        </div>
        <p className={styles.espiralNota}>
          Grid {LADO}×{LADO} = {formatNumber(LADO * LADO)} números. Stanisław Ulam descubrió este patrón
          en 1963, aburrido en una conferencia. Las diagonales corresponden a polinomios cuadráticos.
        </p>
      </div>

      <h3 className={styles.seccionTitulo}>Los primos se espacian</h3>
      <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        Cada intervalo de 100 números tiene menos primos. Teorema: π(n) ≈ n/ln(n).
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginBottom: '1.5rem' }}>
        {distribucion.map(d => (
          <div key={d.rango} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', minWidth: 70, textAlign: 'right' }}>{d.rango}</span>
            <div style={{ flex: 1, height: 16, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ width: `${(d.primos / maxPrimos) * 100}%`, height: '100%', background: 'var(--primary)', borderRadius: 4 }} />
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', minWidth: 25 }}>{d.primos}</span>
          </div>
        ))}
      </div>

      <h3 className={styles.seccionTitulo}>Primos gemelos (p, p+2)</h3>
      <div className={styles.gemelosGrid}>
        {primosGemelos.map(([a, b]) => (
          <div key={a} className={styles.gemelosPar}>
            <span className={styles.gemelosNumero}>{a}</span>
            <span className={styles.gemelosSep}>,</span>
            <span className={styles.gemelosNumero}>{b}</span>
          </div>
        ))}
      </div>
      <div className={styles.insight}>
        <p>
          ¿Son infinitos los primos gemelos? <strong>Nadie lo sabe</strong>. Es una de las conjeturas
          abiertas más antiguas de las matemáticas. En 2013, Yitang Zhang demostró que hay infinitos
          pares de primos con diferencia ≤ 70.000.000 (luego reducido a 246 por el Proyecto Polymath).
        </p>
      </div>

      <h3 className={styles.seccionTitulo}>Primos de Mersenne: 2ᵖ − 1</h3>
      <div className={styles.mersenneGrid}>
        {mersenne.map(m => (
          <div key={m.p} className={styles.mersenneItem}>
            <span className={styles.mersenneP}>p = {m.p}</span>
            <span className={styles.mersenneValor}>{m.valor}</span>
            <span className={styles.mersenneDigitos}>{m.digitos} dígitos</span>
          </div>
        ))}
      </div>
      <div className={styles.insight}>
        <p>
          No todo 2ᵖ − 1 es primo (ej: p = 11 → 2.047 = 23 × 89). Solo se conocen <strong>51 primos
          de Mersenne</strong>. El mayor tiene más de 24 millones de dígitos.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 3: Criptografía RSA
// ─────────────────────────────────────────────

function SeccionCriptografia() {
  const [mostrarRespuesta, setMostrarRespuesta] = useState(false);

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Cada vez que compras online, <strong>tu tarjeta usa números primos</strong>.
        RSA funciona porque multiplicar primos es fácil, pero factorizar el resultado es casi imposible.</p>
      </div>

      <div className={styles.rsaDemo}>
        <div className={styles.rsaCard}>
          <span className={styles.rsaLabel}>Fácil: multiplicar</span>
          <span className={`${styles.rsaEcuacion} ${styles.rsaFacil}`}>13 × 17 = 221</span>
        </div>
        <div className={styles.rsaFlecha} aria-hidden="true">↕</div>
        <div className={styles.rsaCard}>
          <span className={styles.rsaLabel}>Difícil: factorizar</span>
          <span className={`${styles.rsaEcuacion} ${styles.rsaDificil}`}>221 = ? × ?</span>
        </div>
      </div>

      <div className={styles.rsaPregunta}>
        ¿Qué dos primos multiplicados dan {formatNumber(8051)}?
      </div>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <button
          type="button"
          className={styles.btnSimular}
          onClick={() => setMostrarRespuesta(!mostrarRespuesta)}
        >
          {mostrarRespuesta ? 'Ocultar' : 'Ver respuesta'}
        </button>
      </div>
      {mostrarRespuesta && (
        <div className={styles.rsaRespuesta}>
          <strong>83 × 97 = {formatNumber(8051)}</strong>. Con solo 4 dígitos ya cuesta.
          RSA real usa primos de <strong>300+ dígitos</strong>. El producto resultante tiene 600+ dígitos.
          Ni todos los ordenadores del mundo juntos podrían factorizarlo en una vida humana.
        </div>
      )}

      <div className={styles.insight}>
        <p>
          Tu banco genera dos primos enormes (p y q), los multiplica (n = p × q) y publica n.
          Quien conozca p y q puede descifrar mensajes. Quien solo conozca n, necesitaría
          miles de millones de años para encontrar p y q. <strong>Eso es RSA</strong>.
        </p>
      </div>

      <h3 className={styles.seccionTitulo}>Historia de los primos</h3>
      <div className={styles.timeline}>
        <div className={styles.timelineItem}>
          <span className={styles.timelineAnio}>~300 a.C.</span>
          <span className={styles.timelineTexto}> Euclides demuestra que hay infinitos primos</span>
        </div>
        <div className={styles.timelineItem}>
          <span className={styles.timelineAnio}>~240 a.C.</span>
          <span className={styles.timelineTexto}> Eratóstenes inventa su criba para encontrarlos</span>
        </div>
        <div className={styles.timelineItem}>
          <span className={styles.timelineAnio}>1737</span>
          <span className={styles.timelineTexto}> Euler: la suma de inversos de primos diverge (son &quot;muchos&quot;)</span>
        </div>
        <div className={styles.timelineItem}>
          <span className={styles.timelineAnio}>1859</span>
          <span className={styles.timelineTexto}> Riemann conecta los primos con su función zeta (aún sin resolver)</span>
        </div>
        <div className={styles.timelineItem}>
          <span className={styles.timelineAnio}>1977</span>
          <span className={styles.timelineTexto}> Rivest, Shamir y Adleman inventan RSA</span>
        </div>
        <div className={styles.timelineItem}>
          <span className={styles.timelineAnio}>1995</span>
          <span className={styles.timelineTexto}> SSL/TLS con RSA permite el comercio online seguro</span>
        </div>
        <div className={styles.timelineItem}>
          <span className={styles.timelineAnio}>2019</span>
          <span className={styles.timelineTexto}> Google anuncia &quot;supremacía cuántica&quot; — amenaza futura para RSA</span>
        </div>
      </div>

      <div className={styles.rsaCard} style={{ marginTop: '1.5rem' }}>
        <span className={styles.rsaLabel}>Amenaza cuántica</span>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: '0.5rem 0 0' }}>
          Los ordenadores cuánticos podrían usar el <strong>algoritmo de Shor</strong> para factorizar
          números grandes en tiempo razonable. Aún no existen cuánticos suficientemente potentes,
          pero la criptografía post-cuántica ya se está desarrollando como plan B.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sección 4: Datos y récords
// ─────────────────────────────────────────────

function SeccionDatos() {
  const curiosidades = [
    {
      titulo: '1 NO es primo',
      texto: 'Por convención matemática (consolidada ~1899). Si 1 fuera primo, el teorema fundamental de la aritmética (factorización única) no funcionaría. Cada número tendría infinitas factorizaciones: 6 = 2×3 = 1×2×3 = 1×1×2×3...',
    },
    {
      titulo: 'El único primo par es 2',
      texto: 'Todos los demás pares son divisibles por 2, así que no pueden ser primos. El 2 es el primo más extraño: el único par. A veces se le llama "el primo más impar".',
    },
    {
      titulo: 'Conjetura de Goldbach (1742)',
      texto: 'Todo número par mayor que 2 es suma de dos primos. Ejemplos: 4=2+2, 6=3+3, 8=3+5, 10=3+7, 100=3+97. Se ha verificado hasta 4×10¹⁸ pero nadie ha logrado demostrarlo.',
    },
    {
      titulo: 'Cigarras periódicas',
      texto: 'Las cigarras en EE.UU. emergen cada 13 o 17 años (ambos primos). ¿Por qué? Un ciclo primo minimiza la coincidencia con depredadores de ciclos cortos (2, 3, 4 años). La evolución "descubrió" los primos.',
    },
    {
      titulo: 'Primos y la espiral del ADN',
      texto: 'Algunas secuencias biológicas muestran preferencia por longitudes primas. Los organismos usan ciclos de longitud prima para evitar sincronización con amenazas periódicas.',
    },
    {
      titulo: 'GIMPS: búsqueda distribuida',
      texto: 'El Great Internet Mersenne Prime Search usa miles de ordenadores voluntarios desde 1996. Cualquiera puede participar. El mayor primo conocido fue descubierto por un ordenador de un ingeniero en Florida.',
    },
  ];

  return (
    <div className={styles.seccionContent}>
      <div className={styles.contexto}>
        <p>Los primos son uno de los objetos más estudiados en matemáticas.
        Llevan <strong>{formatNumber(2300)}+ años</strong> fascinando a los mejores matemáticos del mundo.</p>
      </div>

      <div className={styles.recordCard}>
        <span className={styles.recordNumero}>{formatNumber(24862048)}</span>
        <p className={styles.recordDescripcion}>
          dígitos tiene el mayor primo conocido: <strong>2⁸²·⁵⁸⁹·⁹³³ − 1</strong> (descubierto en diciembre de 2018).
          Si lo imprimieras con letra pequeña, ocuparía más de {formatNumber(9000)} páginas.
        </p>
      </div>

      <div className={styles.recordCard}>
        <span className={styles.recordNumero} style={{ fontSize: '1.5rem' }}>$1.000.000</span>
        <p className={styles.recordDescripcion}>
          El <strong>Clay Mathematics Institute</strong> ofrece un millón de dólares a quien demuestre
          (o refute) la <strong>Hipótesis de Riemann</strong>. Formulada en 1859, conecta los ceros
          de la función zeta con la distribución de los primos. Es uno de los 7 Problemas del Milenio.
        </p>
      </div>

      <h3 className={styles.seccionTitulo}>Curiosidades</h3>
      <div className={styles.curiosidadesGrid}>
        {curiosidades.map((c, i) => (
          <div key={i} className={styles.curiosidadItem}>
            <div className={styles.curiosidadTitulo}>{c.titulo}</div>
            <p className={styles.curiosidadTexto}>{c.texto}</p>
          </div>
        ))}
      </div>

      <div className={styles.insight}>
        <p>
          Los primos son infinitos (Euclides lo demostró hace {formatNumber(2300)} años con un
          argumento elegantísimo), pero siguen guardando secretos. No sabemos si los primos gemelos
          son infinitos, ni si la Hipótesis de Riemann es verdadera.
          <strong> Lo que sabemos es que internet funciona gracias a ellos.</strong>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorNumerosPrimosPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('criba');

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'criba': return <SeccionCriba />;
      case 'patrones': return <SeccionPatrones />;
      case 'criptografia': return <SeccionCriptografia />;
      case 'datos': return <SeccionDatos />;
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className={styles.container}>
        <MeskeiaLogo />
        <header className={styles.hero}>
          <h1 className={styles.title}>Los Números Primos</h1>
          <p className={styles.subtitle}>Los ladrillos de las matemáticas — y los guardianes de tu tarjeta de crédito</p>
        </header>
        <LegalNotice />

        <nav className={styles.navSecciones} aria-label="Secciones">
          {SECCIONES.map(s => (
            <button key={s.id} type="button"
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)} aria-pressed={seccionActiva === s.id}>
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>
            {SECCIONES.find(s => s.id === seccionActiva)?.icono}{' '}
            {SECCIONES.find(s => s.id === seccionActiva)?.titulo}
          </h2>
          <p className={styles.seccionSub}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {renderSeccion()}

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Más matemáticas →{' '}
          <a href="/visualizador-fibonacci-naturaleza/">Fibonacci en la Naturaleza</a> ·{' '}
          <a href="/visualizador-probabilidad/">Probabilidad</a>
        </div>

        <EducationalSection title="Los primos en profundidad" subtitle="Matemáticas, historia y aplicaciones" defaultOpen={false}>
          <h3>¿Por qué importan los primos?</h3>
          <p>
            El teorema fundamental de la aritmética dice que todo entero mayor que 1 se puede
            descomponer en primos de forma única. Son los &quot;átomos&quot; de los números. Sin ellos,
            no existiría la criptografía moderna, las transacciones bancarias serían inseguras
            y la comunicación por internet sería vulnerable.
          </p>
          <h3>El teorema de los números primos</h3>
          <p>
            Demostrado en 1896 por Hadamard y de la Vallée-Poussin: la cantidad de primos
            menores que n se aproxima a n/ln(n). Entre 1 y {formatNumber(1000000)} hay
            exactamente {formatNumber(78498)} primos. La fórmula predice {formatNumber(72382)}, un
            error del 8% que disminuye a medida que n crece.
          </p>
          <h3>¿Y si se rompe RSA?</h3>
          <p>
            La criptografía post-cuántica ya existe: algoritmos como CRYSTALS-Kyber (basado en
            retículos, no en primos) fueron estandarizados por el NIST en 2024. La transición
            será gradual, pero los primos seguirán siendo fundamentales en muchas otras áreas.
          </p>
          <div className={styles.warningBox}>
            <strong>Nota:</strong> La criba de Eratóstenes en esta app está limitada a 500 números
            por rendimiento del navegador. En la práctica, se usan versiones optimizadas (criba
            segmentada) para trabajar con millones de números. Los datos de primos de Mersenne y
            récords se actualizaron por última vez en 2024.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-numeros-primos')} />
        <ShareCard appName="visualizador-numeros-primos" />
        <Footer appName="visualizador-numeros-primos" />
      </div>
    </>
  );
}
