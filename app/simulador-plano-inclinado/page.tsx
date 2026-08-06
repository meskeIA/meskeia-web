'use client';
// @disclaimer: exempt

import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';
import styles from './SimuladorPlanoInclinado.module.css';

// ============================================================
// Constantes físicas y geometría
// ============================================================
const G = 9.81; // m/s² (gravedad estándar en la superficie terrestre)

const SVG_W = 800;
const SVG_H = 460;
const BASE_Y = 400; // línea del suelo en el lienzo
const VERTICE_X = 90; // vértice del ángulo (esquina inferior izquierda)
const ALTURA_MAX = 300; // altura máxima del triángulo en píxeles
const HIPOTENUSA_MAX = 570; // longitud máxima de la rampa en píxeles

// ============================================================
// Tipos
// ============================================================
interface Material {
  id: string;
  nombre: string;
  muS: number;
  muK: number;
}

interface Vector2 {
  x: number;
  y: number;
}

type Estado = 'reposo' | 'baja' | 'sube';

// Coeficientes de referencia: son valores orientativos de tablas de física general
// (superficies secas y limpias). En la práctica varían mucho con el acabado,
// la humedad y la presencia de lubricantes.
const MATERIALES: Material[] = [
  { id: 'ideal', nombre: 'Sin rozamiento (caso ideal)', muS: 0, muK: 0 },
  { id: 'hielo', nombre: 'Hielo sobre hielo', muS: 0.1, muK: 0.03 },
  { id: 'teflon', nombre: 'Teflón sobre teflón', muS: 0.04, muK: 0.04 },
  { id: 'madera', nombre: 'Madera sobre madera', muS: 0.5, muK: 0.3 },
  { id: 'acero', nombre: 'Acero sobre acero', muS: 0.74, muK: 0.57 },
  { id: 'caucho', nombre: 'Caucho sobre hormigón', muS: 1.0, muK: 0.8 },
];

// ============================================================
// Utilidades geométricas
// ============================================================
const suma = (a: Vector2, b: Vector2): Vector2 => ({ x: a.x + b.x, y: a.y + b.y });
const escala = (v: Vector2, k: number): Vector2 => ({ x: v.x * k, y: v.y * k });

/** Devuelve la geometría del triángulo en coordenadas del lienzo SVG. */
function geometriaPlano(anguloGrados: number) {
  const rad = (anguloGrados * Math.PI) / 180;
  const seno = Math.sin(rad);
  // Se acorta la rampa en ángulos grandes para que el triángulo quepa en el lienzo
  const hip = seno < 0.001 ? HIPOTENUSA_MAX : Math.min(HIPOTENUSA_MAX, ALTURA_MAX / seno);
  const cima: Vector2 = { x: VERTICE_X + hip * Math.cos(rad), y: BASE_Y - hip * seno };
  const esquina: Vector2 = { x: cima.x, y: BASE_Y };
  const vertice: Vector2 = { x: VERTICE_X, y: BASE_Y };
  // Dirección unitaria "cuesta abajo" y normal saliente de la superficie
  const bajada: Vector2 = { x: -Math.cos(rad), y: seno };
  const normal: Vector2 = { x: -seno, y: -Math.cos(rad) };
  return { rad, hip, cima, esquina, vertice, bajada, normal };
}

/** Punto sobre la rampa según la distancia recorrida desde la base (en metros). */
function puntoEnRampa(u: number, longitud: number, geo: ReturnType<typeof geometriaPlano>): Vector2 {
  const frac = longitud > 0 ? Math.min(Math.max(u / longitud, 0), 1) : 0;
  return {
    x: geo.vertice.x + (geo.cima.x - geo.vertice.x) * frac,
    y: geo.vertice.y + (geo.cima.y - geo.vertice.y) * frac,
  };
}

export default function SimuladorPlanoInclinado() {
  // ----------------------------------------------------------
  // Parámetros del problema
  // ----------------------------------------------------------
  const [masa, setMasa] = useState(5); // kg
  const [angulo, setAngulo] = useState(25); // grados
  const [muS, setMuS] = useState(0.5);
  const [muK, setMuK] = useState(0.3);
  const [fuerza, setFuerza] = useState(0); // N, paralela al plano (positiva hacia arriba)
  const [longitud, setLongitud] = useState(4); // m de rampa

  // Opciones de dibujo
  const [verComponentes, setVerComponentes] = useState(true);
  const [verEjes, setVerEjes] = useState(false);
  const [verEtiquetas, setVerEtiquetas] = useState(true);

  // Animación. El estado guarda la clave de los parámetros con los que se calculó:
  // si el usuario mueve cualquier deslizador, el recorrido deja de ser vigente y el
  // bloque vuelve a su posición inicial sin necesidad de un efecto de reinicio.
  const [simulacion, setSimulacion] = useState({ clave: '', u: 0, v: 0 });
  const [animando, setAnimando] = useState(false);
  const rafRef = useRef<number | null>(null);
  const ultimoRef = useRef<number>(0);
  const uRef = useRef(0);
  const velocidadRef = useRef(0);

  // ----------------------------------------------------------
  // Física: todo el análisis del bloque en una sola pasada
  // ----------------------------------------------------------
  const fisica = useMemo(() => {
    const rad = (angulo * Math.PI) / 180;
    const peso = masa * G;
    const pesoParalelo = peso * Math.sin(rad); // tiende a bajar el bloque
    const pesoPerpendicular = peso * Math.cos(rad);
    const normal = pesoPerpendicular; // la fuerza aplicada es paralela al plano
    const rozamientoMaximo = muS * normal;

    // Resultante a lo largo del plano SIN contar el rozamiento (positiva: cuesta arriba)
    const resultanteSinRozar = fuerza - pesoParalelo;
    const enReposo = Math.abs(resultanteSinRozar) <= rozamientoMaximo;

    // Rozamiento real: el estático se ajusta para equilibrar; el cinético es fijo
    const rozamientoReal = enReposo ? Math.abs(resultanteSinRozar) : muK * normal;
    const sentido = Math.sign(resultanteSinRozar); // hacia dónde tiende (o se mueve) el bloque
    const aceleracion = enReposo
      ? 0
      : (Math.abs(resultanteSinRozar) - muK * normal) * sentido / masa;

    const estado: Estado = enReposo ? 'reposo' : sentido > 0 ? 'sube' : 'baja';
    const anguloCritico = (Math.atan(muS) * 180) / Math.PI;

    // Cinemática de la bajada completa (solo tiene sentido si el bloque baja desde la cima)
    const bajaLibremente = estado === 'baja';
    const tiempoRecorrido = bajaLibremente
      ? Math.sqrt((2 * longitud) / Math.abs(aceleracion))
      : null;
    const velocidadFinal = bajaLibremente ? Math.abs(aceleracion) * (tiempoRecorrido ?? 0) : null;

    // Balance energético de la bajada completa
    const alturaTotal = longitud * Math.sin(rad);
    const energiaPotencial = masa * G * alturaTotal;
    const trabajoRozamiento = muK * normal * longitud;
    const energiaCinetica = bajaLibremente
      ? Math.max(energiaPotencial - trabajoRozamiento + fuerza * longitud, 0)
      : null;

    return {
      rad,
      peso,
      pesoParalelo,
      pesoPerpendicular,
      normal,
      rozamientoMaximo,
      resultanteSinRozar,
      rozamientoReal,
      aceleracion,
      estado,
      anguloCritico,
      tiempoRecorrido,
      velocidadFinal,
      alturaTotal,
      energiaPotencial,
      trabajoRozamiento,
      energiaCinetica,
    };
  }, [masa, angulo, muS, muK, fuerza, longitud]);

  // Posición inicial: arriba si va a bajar, abajo si lo empujamos cuesta arriba
  const posicionInicial = fisica.estado === 'sube' ? 0 : longitud;

  // Huella de los parámetros: cualquier cambio invalida el recorrido anterior
  const claveParametros = `${masa}|${angulo}|${muS}|${muK}|${fuerza}|${longitud}`;
  const recorridoVigente = simulacion.clave === claveParametros;
  const u = recorridoVigente ? simulacion.u : posicionInicial;
  const velocidad = recorridoVigente ? simulacion.v : 0;
  const enMarcha = animando && recorridoVigente;

  // Bucle de animación (movimiento uniformemente acelerado sobre la rampa).
  // La integración vive en refs: el estado de React solo recibe el valor de cada fotograma.
  useEffect(() => {
    if (!enMarcha) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      return;
    }
    ultimoRef.current = 0;
    const paso = (ahora: number) => {
      if (ultimoRef.current === 0) ultimoRef.current = ahora;
      const dt = Math.min((ahora - ultimoRef.current) / 1000, 0.05);
      ultimoRef.current = ahora;

      const a = fisica.aceleracion;
      let uNueva = uRef.current + velocidadRef.current * dt + 0.5 * a * dt * dt;
      const vNueva = velocidadRef.current + a * dt;
      let seguir = true;

      if (uNueva <= 0) {
        uNueva = 0;
        seguir = false;
      } else if (uNueva >= longitud) {
        uNueva = longitud;
        seguir = false;
      }

      uRef.current = uNueva;
      velocidadRef.current = vNueva;
      setSimulacion({ clave: claveParametros, u: uNueva, v: vNueva });

      if (!seguir) {
        setAnimando(false);
        return;
      }
      rafRef.current = requestAnimationFrame(paso);
    };
    rafRef.current = requestAnimationFrame(paso);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [enMarcha, fisica.aceleracion, longitud, claveParametros]);

  const handleSoltar = useCallback(() => {
    if (enMarcha) {
      setAnimando(false);
      return;
    }
    // Si el recorrido anterior ya no vale (o terminó), se parte de la posición inicial
    const arranque = recorridoVigente && simulacion.u > 0 && simulacion.u < longitud
      ? simulacion.u
      : posicionInicial;
    uRef.current = arranque;
    velocidadRef.current = recorridoVigente ? simulacion.v : 0;
    setSimulacion({ clave: claveParametros, u: arranque, v: velocidadRef.current });
    setAnimando(true);
  }, [enMarcha, recorridoVigente, simulacion, longitud, posicionInicial, claveParametros]);

  const handleReiniciar = useCallback(() => {
    setAnimando(false);
    uRef.current = posicionInicial;
    velocidadRef.current = 0;
    setSimulacion({ clave: claveParametros, u: posicionInicial, v: 0 });
  }, [posicionInicial, claveParametros]);

  const handleMaterial = useCallback((material: Material) => {
    setMuS(material.muS);
    setMuK(material.muK);
  }, []);

  // El coeficiente cinético nunca debe superar al estático
  const handleMuS = (valor: number) => {
    setMuS(valor);
    if (muK > valor) setMuK(valor);
  };
  const handleMuK = (valor: number) => {
    setMuK(Math.min(valor, muS));
  };

  // ----------------------------------------------------------
  // Dibujo
  // ----------------------------------------------------------
  const geo = useMemo(() => geometriaPlano(angulo), [angulo]);
  const centroBloque = useMemo(() => {
    const sobreRampa = puntoEnRampa(u, longitud, geo);
    // Se separa medio bloque de la superficie para que quede apoyado encima
    return suma(sobreRampa, escala(geo.normal, 22));
  }, [u, longitud, geo]);

  // Escala común para que el vector más largo mida siempre lo mismo en pantalla
  const escalaVector = useMemo(() => {
    const mayor = Math.max(fisica.peso, Math.abs(fuerza), fisica.normal, 1);
    return 105 / mayor;
  }, [fisica.peso, fisica.normal, fuerza]);

  const vectores = useMemo(() => {
    const lista: { nombre: string; desde: Vector2; delta: Vector2; clase: string; valor: number }[] = [];
    const abajo: Vector2 = { x: 0, y: 1 };
    const subida: Vector2 = escala(geo.bajada, -1);
    const haciaDentro: Vector2 = escala(geo.normal, -1);

    lista.push({
      nombre: 'P',
      desde: centroBloque,
      delta: escala(abajo, fisica.peso * escalaVector),
      clase: styles.vPeso,
      valor: fisica.peso,
    });
    lista.push({
      nombre: 'N',
      desde: centroBloque,
      delta: escala(geo.normal, fisica.normal * escalaVector),
      clase: styles.vNormal,
      valor: fisica.normal,
    });

    // Rozamiento: se opone al movimiento real o a la tendencia a moverse
    if (fisica.rozamientoReal > 0.01) {
      const tiende = Math.sign(fisica.resultanteSinRozar);
      const direccion = tiende > 0 ? geo.bajada : subida;
      lista.push({
        nombre: 'Fr',
        desde: centroBloque,
        delta: escala(direccion, fisica.rozamientoReal * escalaVector),
        clase: styles.vRozamiento,
        valor: fisica.rozamientoReal,
      });
    }

    if (Math.abs(fuerza) > 0.01) {
      const direccion = fuerza > 0 ? subida : geo.bajada;
      lista.push({
        nombre: 'F',
        desde: centroBloque,
        delta: escala(direccion, Math.abs(fuerza) * escalaVector),
        clase: styles.vAplicada,
        valor: Math.abs(fuerza),
      });
    }

    if (verComponentes) {
      lista.push({
        nombre: 'Px',
        desde: centroBloque,
        delta: escala(geo.bajada, fisica.pesoParalelo * escalaVector),
        clase: styles.vComponente,
        valor: fisica.pesoParalelo,
      });
      lista.push({
        nombre: 'Py',
        desde: centroBloque,
        delta: escala(haciaDentro, fisica.pesoPerpendicular * escalaVector),
        clase: styles.vComponente,
        valor: fisica.pesoPerpendicular,
      });
    }

    return lista;
  }, [centroBloque, escalaVector, fisica, fuerza, geo, verComponentes]);

  const veredicto = useMemo(() => {
    if (fisica.estado === 'reposo') {
      return {
        titulo: 'El bloque NO desliza',
        detalle: `El rozamiento estático puede llegar a ${formatNumber(fisica.rozamientoMaximo, 2)} N y solo necesita ${formatNumber(Math.abs(fisica.resultanteSinRozar), 2)} N para equilibrar el sistema.`,
        clase: styles.veredictoReposo,
      };
    }
    if (fisica.estado === 'baja') {
      return {
        titulo: 'El bloque desliza cuesta abajo',
        detalle: `La resultante paralela (${formatNumber(Math.abs(fisica.resultanteSinRozar), 2)} N) supera al rozamiento estático máximo (${formatNumber(fisica.rozamientoMaximo, 2)} N).`,
        clase: styles.veredictoBaja,
      };
    }
    return {
      titulo: 'El bloque sube por el plano',
      detalle: `La fuerza aplicada vence al peso paralelo y al rozamiento estático máximo (${formatNumber(fisica.rozamientoMaximo, 2)} N).`,
      clase: styles.veredictoSube,
    };
  }, [fisica]);

  const puedeAnimar = fisica.estado !== 'reposo';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1>Simulador de Plano Inclinado</h1>
        <p>¿Desliza o no desliza? Diagrama de cuerpo libre, rozamiento y aceleración</p>
      </header>

      <LegalNotice />

      <main className={styles.main}>
        {/* Veredicto */}
        <section className={`${styles.veredicto} ${veredicto.clase}`} role="status" aria-live="polite">
          <strong>{veredicto.titulo}</strong>
          <span>{veredicto.detalle}</span>
        </section>

        {/* Parámetros */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Parámetros del problema</h2>

          <div className={styles.inputGrid}>
            <div className={styles.inputGroup}>
              <label htmlFor="masa">
                Masa del bloque
                <span className={styles.valueBadge}>{formatNumber(masa, 1)} kg</span>
              </label>
              <input
                id="masa"
                type="range"
                min="0.5"
                max="50"
                step="0.5"
                value={masa}
                onChange={(e) => setMasa(parseFloat(e.target.value))}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="angulo">
                Ángulo de inclinación θ
                <span className={styles.valueBadge}>{formatNumber(angulo, 0)}°</span>
              </label>
              <input
                id="angulo"
                type="range"
                min="0"
                max="60"
                step="1"
                value={angulo}
                onChange={(e) => setAngulo(parseFloat(e.target.value))}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="mus">
                Coeficiente estático μₛ
                <span className={styles.valueBadge}>{formatNumber(muS, 2)}</span>
              </label>
              <input
                id="mus"
                type="range"
                min="0"
                max="1.5"
                step="0.01"
                value={muS}
                onChange={(e) => handleMuS(parseFloat(e.target.value))}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="muk">
                Coeficiente cinético μₖ
                <span className={styles.valueBadge}>{formatNumber(muK, 2)}</span>
              </label>
              <input
                id="muk"
                type="range"
                min="0"
                max="1.5"
                step="0.01"
                value={muK}
                onChange={(e) => handleMuK(parseFloat(e.target.value))}
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="fuerza">
                Fuerza aplicada paralela al plano
                <span className={styles.valueBadge}>{formatNumber(fuerza, 0)} N</span>
              </label>
              <input
                id="fuerza"
                type="range"
                min="-150"
                max="150"
                step="1"
                value={fuerza}
                onChange={(e) => setFuerza(parseFloat(e.target.value))}
              />
              <span className={styles.inputHint}>
                Positiva = empuja cuesta arriba · Negativa = empuja cuesta abajo
              </span>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="longitud">
                Longitud de la rampa
                <span className={styles.valueBadge}>{formatNumber(longitud, 1)} m</span>
              </label>
              <input
                id="longitud"
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={longitud}
                onChange={(e) => setLongitud(parseFloat(e.target.value))}
              />
              <span className={styles.inputHint}>
                Altura equivalente: {formatNumber(fisica.alturaTotal, 2)} m
              </span>
            </div>
          </div>
        </section>

        {/* Materiales */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Pares de materiales de referencia</h2>
          <p className={styles.panelSubtitle}>
            Valores orientativos de tablas de física general para superficies secas y limpias. En un
            caso real dependen del acabado, la humedad y los lubricantes.
          </p>
          <div className={styles.presetGrid}>
            {MATERIALES.map((material) => (
              <button
                key={material.id}
                type="button"
                className={styles.presetCard}
                onClick={() => handleMaterial(material)}
              >
                {material.nombre}
                <span className={styles.presetValores}>
                  μₛ = {formatNumber(material.muS, 2)} · μₖ = {formatNumber(material.muK, 2)}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* Diagrama */}
        <section className={styles.panel}>
          <h2 className={styles.panelTitle}>Diagrama de cuerpo libre</h2>

          <div className={styles.toggleGroup}>
            <label className={styles.toggleItem}>
              <input
                type="checkbox"
                checked={verComponentes}
                onChange={(e) => setVerComponentes(e.target.checked)}
              />
              Componentes del peso
            </label>
            <label className={styles.toggleItem}>
              <input
                type="checkbox"
                checked={verEjes}
                onChange={(e) => setVerEjes(e.target.checked)}
              />
              Ejes girados
            </label>
            <label className={styles.toggleItem}>
              <input
                type="checkbox"
                checked={verEtiquetas}
                onChange={(e) => setVerEtiquetas(e.target.checked)}
              />
              Valores numéricos
            </label>
          </div>

          <div className={styles.actionBar}>
            <button
              type="button"
              className={styles.calcBtn}
              onClick={handleSoltar}
              disabled={!puedeAnimar}
            >
              <span aria-hidden="true">{enMarcha ? '⏸' : '▶'}</span>{' '}
              {enMarcha ? 'Pausar' : 'Soltar el bloque'}
            </button>
            <button type="button" className={styles.calcBtnGhost} onClick={handleReiniciar}>
              <span aria-hidden="true">↺</span> Reiniciar posición
            </button>
            {!puedeAnimar && (
              <span className={styles.actionHint}>
                En equilibrio no hay movimiento que animar: sube el ángulo o baja μₛ.
              </span>
            )}
          </div>

          <div className={styles.canvasContainer}>
            <div>
              <svg
                className={styles.canvasSvg}
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                aria-label={`Plano inclinado ${formatNumber(angulo, 0)} grados con el bloque y sus fuerzas`}
              >
                {/* Suelo */}
                <line
                  x1={0}
                  y1={BASE_Y}
                  x2={SVG_W}
                  y2={BASE_Y}
                  className={styles.suelo}
                />
                <g className={styles.rayadoSuelo}>
                  {Array.from({ length: 40 }).map((_, i) => (
                    <line
                      key={`sr${i}`}
                      x1={i * 20}
                      y1={BASE_Y}
                      x2={i * 20 - 10}
                      y2={BASE_Y + 12}
                    />
                  ))}
                </g>

                {/* Cuña del plano */}
                <polygon
                  points={`${geo.vertice.x},${geo.vertice.y} ${geo.esquina.x},${geo.esquina.y} ${geo.cima.x},${geo.cima.y}`}
                  className={styles.cuna}
                />

                {/* Arco y etiqueta del ángulo */}
                <path
                  d={`M ${geo.vertice.x + 60} ${geo.vertice.y} A 60 60 0 0 0 ${geo.vertice.x + 60 * Math.cos(geo.rad)} ${geo.vertice.y - 60 * Math.sin(geo.rad)}`}
                  className={styles.arcoAngulo}
                />
                <text
                  x={geo.vertice.x + 74}
                  y={geo.vertice.y - 16}
                  className={styles.textoAngulo}
                >
                  θ = {formatNumber(angulo, 0)}°
                </text>

                {/* Ejes girados (x paralelo al plano, y perpendicular) */}
                {verEjes && (
                  <g className={styles.ejes}>
                    <line
                      x1={centroBloque.x}
                      y1={centroBloque.y}
                      x2={centroBloque.x + geo.bajada.x * 150}
                      y2={centroBloque.y + geo.bajada.y * 150}
                    />
                    <line
                      x1={centroBloque.x}
                      y1={centroBloque.y}
                      x2={centroBloque.x + geo.normal.x * 130}
                      y2={centroBloque.y + geo.normal.y * 130}
                    />
                    <text
                      x={centroBloque.x + geo.bajada.x * 162}
                      y={centroBloque.y + geo.bajada.y * 162}
                      className={styles.textoEje}
                    >
                      x
                    </text>
                    <text
                      x={centroBloque.x + geo.normal.x * 142}
                      y={centroBloque.y + geo.normal.y * 142}
                      className={styles.textoEje}
                    >
                      y
                    </text>
                  </g>
                )}

                {/* Bloque apoyado sobre la rampa */}
                <g
                  transform={`translate(${centroBloque.x} ${centroBloque.y}) rotate(${-angulo})`}
                >
                  <rect x={-24} y={-20} width={48} height={40} rx={4} className={styles.bloque} />
                  <text x={0} y={0} className={styles.textoBloque}>
                    {formatNumber(masa, 1)} kg
                  </text>
                </g>

                {/* Vectores de fuerza */}
                {vectores.map((vector, i) => {
                  const fin = suma(vector.desde, vector.delta);
                  const modulo = Math.hypot(vector.delta.x, vector.delta.y);
                  if (modulo < 2) return null;
                  const ang = Math.atan2(vector.delta.y, vector.delta.x);
                  const punta = 8;
                  const p1 = {
                    x: fin.x - punta * Math.cos(ang - Math.PI / 7),
                    y: fin.y - punta * Math.sin(ang - Math.PI / 7),
                  };
                  const p2 = {
                    x: fin.x - punta * Math.cos(ang + Math.PI / 7),
                    y: fin.y - punta * Math.sin(ang + Math.PI / 7),
                  };
                  return (
                    <g key={`vec${i}`} className={vector.clase}>
                      <line
                        x1={vector.desde.x}
                        y1={vector.desde.y}
                        x2={fin.x}
                        y2={fin.y}
                        className={styles.vectorLinea}
                      />
                      <polygon
                        points={`${fin.x},${fin.y} ${p1.x},${p1.y} ${p2.x},${p2.y}`}
                        className={styles.vectorPunta}
                      />
                      <text
                        x={fin.x + Math.cos(ang) * 16}
                        y={fin.y + Math.sin(ang) * 16}
                        className={styles.vectorTexto}
                      >
                        {vector.nombre}
                        {verEtiquetas ? ` = ${formatNumber(vector.valor, 1)} N` : ''}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <p className={styles.canvasHint}>
                P = peso · N = normal · Fr = rozamiento · F = fuerza aplicada · Px y Py = componentes
                del peso
              </p>
            </div>

            <div className={styles.resultBlock}>
              <h3 className={styles.resultTitle}>Análisis de fuerzas</h3>

              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Peso P = m·g</span>
                <span className={styles.resultValue}>{formatNumber(fisica.peso, 2)} N</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Normal N = m·g·cos θ</span>
                <span className={styles.resultValue}>{formatNumber(fisica.normal, 2)} N</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Peso paralelo m·g·sen θ</span>
                <span className={styles.resultValue}>{formatNumber(fisica.pesoParalelo, 2)} N</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Rozamiento máximo μₛ·N</span>
                <span className={styles.resultValue}>
                  {formatNumber(fisica.rozamientoMaximo, 2)} N
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Rozamiento real</span>
                <span className={styles.resultValue}>
                  {formatNumber(fisica.rozamientoReal, 2)} N
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Aceleración</span>
                <span className={styles.resultValueAccent}>
                  {formatNumber(Math.abs(fisica.aceleracion), 2)} m/s²
                </span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Ángulo crítico arctg(μₛ)</span>
                <span className={styles.resultValue}>
                  {formatNumber(fisica.anguloCritico, 1)}°
                </span>
              </div>

              <h3 className={`${styles.resultTitle} ${styles.resultTitleGap}`}>
                Recorrido completo
              </h3>
              {fisica.tiempoRecorrido !== null && fisica.velocidadFinal !== null ? (
                <>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Tiempo en bajar {formatNumber(longitud, 1)} m</span>
                    <span className={styles.resultValue}>
                      {formatNumber(fisica.tiempoRecorrido, 2)} s
                    </span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Velocidad al llegar abajo</span>
                    <span className={styles.resultValue}>
                      {formatNumber(fisica.velocidadFinal, 2)} m/s
                    </span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Energía potencial inicial</span>
                    <span className={styles.resultValue}>
                      {formatNumber(fisica.energiaPotencial, 2)} J
                    </span>
                  </div>
                  <div className={styles.resultRow}>
                    <span className={styles.resultLabel}>Disipado por rozamiento</span>
                    <span className={styles.resultValue}>
                      {formatNumber(fisica.trabajoRozamiento, 2)} J
                    </span>
                  </div>
                </>
              ) : (
                <p className={styles.resultNota}>
                  {fisica.estado === 'reposo'
                    ? 'El bloque está en equilibrio: no recorre distancia alguna.'
                    : 'El bloque sube empujado por la fuerza aplicada; el recorrido depende de cuánto tiempo se mantenga esa fuerza.'}
                </p>
              )}

              <h3 className={`${styles.resultTitle} ${styles.resultTitleGap}`}>Estado actual</h3>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Posición sobre la rampa</span>
                <span className={styles.resultValue}>{formatNumber(u, 2)} m</span>
              </div>
              <div className={styles.resultRow}>
                <span className={styles.resultLabel}>Velocidad instantánea</span>
                <span className={styles.resultValue}>
                  {formatNumber(Math.abs(velocidad), 2)} m/s
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Sección educativa v2.0 */}
        <EducationalSection
          title="Guía del plano inclinado"
          subtitle="Descomposición del peso, rozamiento y ángulo crítico"
        >
          <h3 className={styles.eduSubtitle}>Fórmulas clave</h3>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Magnitud</th>
                  <th>Fórmula</th>
                  <th>Unidad SI</th>
                  <th>Cuándo se usa</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Fuerza normal</td>
                  <td>N = m·g·cos θ</td>
                  <td>N (newton)</td>
                  <td>Siempre que no haya fuerzas con componente perpendicular al plano</td>
                </tr>
                <tr>
                  <td>Peso paralelo</td>
                  <td>Pₓ = m·g·sen θ</td>
                  <td>N</td>
                  <td>Es la fuerza que tira del bloque cuesta abajo</td>
                </tr>
                <tr>
                  <td>Rozamiento estático máximo</td>
                  <td>Fr,máx = μₛ·N</td>
                  <td>N</td>
                  <td>Para decidir si el bloque arranca o se queda quieto</td>
                </tr>
                <tr>
                  <td>Rozamiento cinético</td>
                  <td>Fr = μₖ·N</td>
                  <td>N</td>
                  <td>Una vez el bloque ya está deslizando</td>
                </tr>
                <tr>
                  <td>Ángulo crítico</td>
                  <td>θc = arctg(μₛ)</td>
                  <td>grados</td>
                  <td>Inclinación a la que el bloque empieza a moverse solo</td>
                </tr>
                <tr>
                  <td>Aceleración al bajar</td>
                  <td>a = g·(sen θ − μₖ·cos θ)</td>
                  <td>m/s²</td>
                  <td>Bajada libre sin fuerza aplicada</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className={styles.eduSubtitle}>Casos de uso reales</h3>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h4>Estudiante de secundaria</h4>
              <p>
                Comprueba por qué el peso se descompone en sen θ y cos θ, y no al revés. Mueve el
                ángulo y observa cómo la normal disminuye mientras la componente paralela crece.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Preparación de examen de acceso</h4>
              <p>
                Resuelve el problema en papel y luego contrasta aquí la normal, el rozamiento y la
                aceleración. Los errores de signo se detectan al instante en el diagrama.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Profesorado de física</h4>
              <p>
                Demuestra en clase que el ángulo crítico no depende de la masa: cambia el bloque de
                0,5 a 50 kg y el ángulo al que resbala sigue siendo el mismo.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h4>Aplicación técnica</h4>
              <p>
                Estima la pendiente máxima de una rampa de carga o de una cinta transportadora para
                que la mercancía no deslice con un coeficiente dado.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <strong>¿Por qué el seno va con la componente paralela y el coseno con la normal?</strong>
              <p>
                Porque el ángulo del plano se repite entre la vertical y la perpendicular a la
                superficie. Al proyectar el peso sobre los ejes girados, la componente pegada al
                plano queda enfrentada al ángulo θ (seno) y la perpendicular queda contigua a él
                (coseno).
              </p>
              <p className={styles.faqTip}>
                Comprobación rápida: con θ = 0 todo el peso debe ir a la normal, y cos 0 = 1.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿La masa influye en si el bloque desliza?</strong>
              <p>
                No, mientras la única fuerza sea el peso. Al comparar m·g·sen θ con μₛ·m·g·cos θ, la
                masa aparece en los dos lados y se cancela: la condición de deslizamiento queda
                reducida a tg θ &gt; μₛ. Sí influye, en cambio, en la fuerza necesaria para frenarlo.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Por qué el rozamiento estático no vale siempre μₛ·N?</strong>
              <p>
                Porque μₛ·N es su valor máximo, no su valor habitual. Mientras el bloque no se mueve,
                el rozamiento vale exactamente lo necesario para equilibrar las demás fuerzas. Es una
                fuerza de respuesta, igual que la normal.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Puede haber rozamiento sin movimiento?</strong>
              <p>
                Sí, y es el caso más frecuente. Un objeto quieto sobre una pendiente tiene rozamiento
                estático actuando cuesta arriba. Si no lo hubiera, cualquier inclinación por pequeña
                que fuese lo pondría en marcha.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿Qué pasa justo cuando el bloque arranca?</strong>
              <p>
                Hay un salto: el rozamiento pasa de μₛ·N a μₖ·N, que suele ser menor. Por eso muchos
                objetos se quedan quietos hasta que ceden y entonces aceleran de golpe. El simulador
                usa cada coeficiente en su situación correspondiente.
              </p>
            </div>
            <div className={styles.faqItem}>
              <strong>¿La normal es siempre igual a m·g·cos θ?</strong>
              <p>
                Solo si no hay fuerzas con componente perpendicular al plano. Si empujas el bloque
                formando un ángulo con la superficie, esa componente se suma o se resta a la normal, y
                eso cambia también el rozamiento. Aquí la fuerza aplicada se mantiene paralela al
                plano precisamente para aislar ese efecto.
              </p>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>
            Cómo resolver un problema de plano inclinado — paso a paso
          </h3>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <strong>Gira los ejes</strong>
                <p>
                  Coloca el eje x paralelo al plano y el eje y perpendicular. Así el movimiento
                  ocurre solo sobre x y la aceleración en y es cero.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <strong>Dibuja todas las fuerzas sobre el bloque</strong>
                <p>
                  Peso (siempre vertical), normal (perpendicular a la superficie), rozamiento
                  (paralelo al plano) y cualquier fuerza aplicada. Nada más.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <strong>Descompón el peso</strong>
                <p>
                  Pₓ = m·g·sen θ hacia abajo del plano, Py = m·g·cos θ contra la superficie. El
                  equilibrio en y da directamente N.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <strong>Decide primero si se mueve</strong>
                <p>
                  Compara la resultante paralela con μₛ·N. Este paso es obligatorio: elegir el
                  coeficiente equivocado invalida todo lo que venga después.
                </p>
              </div>
            </div>
            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <strong>Aplica ΣF = m·a en el eje x</strong>
                <p>
                  Con el rozamiento cinético opuesto al movimiento. Después usa la cinemática del
                  movimiento uniformemente acelerado para tiempos y velocidades.
                </p>
              </div>
            </div>
          </div>

          <h3 className={styles.eduSubtitle}>Mejores prácticas</h3>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📐</span>
              <div>
                <strong>Comprueba los casos límite</strong>
                <p>
                  Con θ = 0 debe salir N = m·g y Pₓ = 0. Con θ = 90° al revés. Si no ocurre, has
                  intercambiado el seno y el coseno.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧭</span>
              <div>
                <strong>Define un sentido positivo y respétalo</strong>
                <p>
                  La mayoría de los errores en dinámica son de signo, no de fórmula. Elige cuesta
                  arriba o cuesta abajo y mantenlo en toda la resolución.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
              <div>
                <strong>El rozamiento estático es variable</strong>
                <p>
                  No sustituyas μₛ·N sin comprobar antes que el bloque está a punto de deslizar. Ese
                  valor solo se alcanza en el límite.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔬</span>
              <div>
                <strong>Mide μₛ con la propia rampa</strong>
                <p>
                  Inclina hasta que el objeto resbale y anota el ángulo: μₛ = tg θc. Es un
                  experimento de laboratorio que funciona con una tabla y un transportador.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔋</span>
              <div>
                <strong>Contrasta con la energía</strong>
                <p>
                  La energía cinética al final debe ser m·g·h menos el trabajo del rozamiento. Si no
                  cuadra, hay un error en la aceleración.
                </p>
              </div>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧱</span>
              <div>
                <strong>Recuerda que los coeficientes son empíricos</strong>
                <p>
                  No se deducen de la teoría: se miden. Las tablas dan órdenes de magnitud, no
                  valores exactos para una superficie concreta.
                </p>
              </div>
            </div>
          </div>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              Errores frecuentes
            </div>
            <ul className={styles.warningList}>
              <li>
                Escribir N = m·g en un plano inclinado. La normal es perpendicular a la superficie,
                no a la horizontal: vale m·g·cos θ.
              </li>
              <li>
                Usar μₖ para decidir si el bloque arranca. Esa decisión se toma siempre con μₛ, que
                es mayor.
              </li>
              <li>
                Dar por hecho que el rozamiento estático vale μₛ·N aunque el bloque esté lejos del
                límite de deslizamiento.
              </li>
              <li>
                Poner el rozamiento siempre cuesta arriba. Su sentido es opuesto al movimiento, así
                que al subir apunta cuesta abajo.
              </li>
              <li>
                Trabajar con los ejes horizontal y vertical en lugar de girarlos. Es válido, pero
                obliga a descomponer también la normal y multiplica los errores.
              </li>
              <li>
                Olvidar que la masa se cancela en la condición de deslizamiento y buscar un bloque
                más pesado para que no resbale.
              </li>
            </ul>
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('simulador-plano-inclinado')} />
        <ShareCard appName="simulador-plano-inclinado" />
      </main>

      <Footer appName="simulador-plano-inclinado" />
    </div>
  );
}
