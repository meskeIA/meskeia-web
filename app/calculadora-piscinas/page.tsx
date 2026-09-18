'use client';

import { useState, useCallback } from 'react';
import styles from './CalculadoraPiscinas.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

type FormaType = 'rectangular' | 'circular' | 'ovalada';

interface DosisPiscina {
  cloro: { mantenimiento: number; choque: number; unidad: string };
  cloro_liquido: { mantenimiento: number; choque: number };
  ph_elevador: number;
  ph_reductor: number;
  alguicida: { preventivo: number; choque: number };
  sal: number;
}

/**
 * ── De dónde sale cada dosis (reparado el 18/09/2026) ──
 *
 * El cloro se dosifica por CLORO LIBRE objetivo en ppm (= mg/L), no por gramos de producto
 * sacados de ninguna parte: 1 ppm en 1 m³ son 1.000 L × 1 mg/L = 1 g de cloro activo, así
 * que el producto necesario es ese gramo dividido por su riqueza. Escrito así, cada cifra
 * de la pantalla se puede comprobar con una división, y la guía, los escenarios resueltos y
 * el FAQPage pueden decir todos lo mismo — que es justo lo que no ocurría: la página
 * publicaba tres cifras distintas de mantenimiento y dos de eficacia del cloro.
 */
const PPM_CHOQUE = 10;               // cloro libre objetivo en un tratamiento de choque
const PPM_MANTENIMIENTO_SEMANA = 7;  // repone ~1 ppm/día, el consumo típico al aire libre en verano
const RIQUEZA_GRANULADO = 0.65;      // hipoclorito cálcico ~65 % de cloro activo
const RIQUEZA_LIQUIDO_G_ML = 0.156;  // hipoclorito sódico 13 % p/p × 1,2 kg/L de densidad

/**
 * Sal para electrólisis: valor central del rango que declaran los fabricantes de
 * electrolizadores domésticos (4–6 g/L). La app dosificaba 6 g/L, el extremo superior, y
 * su propio FAQPage publicaba «3-5 g/L»: el valor usado quedaba FUERA del rango que la
 * misma página anunciaba. El nivel exacto lo fija el manual del clorador, y la tarjeta lo dice.
 */
const SAL_G_L = 5;

/**
 * Alguicida de amonio cuaternario: 10 mL/m³ de choque y 2 mL/m³ preventivo semanal.
 * Aquí estaba el defecto grave: el código multiplicaba por 100 y por 20 mL/m³, DIEZ VECES
 * la dosis que la propia app documenta en el paso 5 de su guía («100 mL/10 m³»), en su
 * escenario «Agua verde» (400 mL para 40 m³) y en su FAQPage. Eran 7,5 litros de alguicida
 * en una piscina familiar en vez de 750 mL.
 */
const ALGUICIDA_CHOQUE_ML_M3 = 10;
const ALGUICIDA_PREVENTIVO_ML_M3 = 2;

/** Por encima de esto no es una piscina, es un error de tecleo. */
const MAX_DIMENSION_M = 100;
const MAX_PROFUNDIDAD_M = 5;

function calcularVolumen(forma: FormaType, largo: number, ancho: number, diametro: number, profMedia: number): number {
  if (forma === 'rectangular') return largo * ancho * profMedia;
  if (forma === 'circular') return Math.PI * Math.pow(diametro / 2, 2) * profMedia;
  if (forma === 'ovalada') return Math.PI * (largo / 2) * (ancho / 2) * profMedia;
  return 0;
}

/**
 * Comprueba UNA medida y devuelve el motivo del rechazo, o null si vale.
 *
 * Se valida cada dimensión por separado, no el producto: la única guarda que había era
 * `vol <= 0`, y el producto de dos negativos es positivo, así que una piscina de −10 × −5
 * pasaba entera y se dosificaba. Y por arriba no había nada: una profundidad de «1.500»
 * —millar español legítimo para el parser, y la forma en que se escribe 1,5 en buena parte
 * de Latinoamérica— daba 75.000 m³ y 450.000 kg de sal sin un solo aviso.
 */
function validarMedida(etiqueta: string, texto: string, maximo: number): string | null {
  const valor = parseSpanishNumber(texto);
  if (!Number.isFinite(valor)) return `${etiqueta}: escribe un número (por ejemplo 8 o 1,5).`;
  if (valor <= 0) return `${etiqueta}: la medida tiene que ser mayor que cero.`;
  if (valor > maximo) {
    // El punto en una medida desorbitada casi siempre es un decimal escrito a la americana
    // que el parser ha leído como millar. Decirlo evita que el usuario crea que su piscina
    // necesita media tonelada de sal.
    return texto.includes('.')
      ? `${etiqueta}: ${formatNumber(valor, 1)} m no puede ser una piscina. Para los decimales usa la coma: «1,5» en vez de «1.5».`
      : `${etiqueta}: ${formatNumber(valor, 1)} m no puede ser una piscina (máximo ${formatNumber(maximo, 0)} m).`;
  }
  return null;
}

function calcularDosis(volumen: number): DosisPiscina {
  const m3 = volumen;
  return {
    // Cloro granulado (hipoclorito cálcico ~65 %): ppm objetivo ÷ riqueza.
    cloro: {
      mantenimiento: Math.ceil((m3 * PPM_MANTENIMIENTO_SEMANA) / RIQUEZA_GRANULADO),
      choque: Math.ceil((m3 * PPM_CHOQUE) / RIQUEZA_GRANULADO),
      unidad: 'g',
    },
    // Cloro líquido (hipoclorito sódico ~13 %): los mismos ppm, otra riqueza.
    cloro_liquido: {
      mantenimiento: Math.ceil((m3 * PPM_MANTENIMIENTO_SEMANA) / RIQUEZA_LIQUIDO_G_ML),
      choque: Math.ceil((m3 * PPM_CHOQUE) / RIQUEZA_LIQUIDO_G_ML),
    },
    // pH elevador (carbonato sódico) - g/m³ para subir ~0,2 unidades
    ph_elevador: Math.ceil(m3 * 15),
    // pH reductor (bisulfato sódico granulado) - g/m³ para bajar ~0,2 unidades
    ph_reductor: Math.ceil(m3 * 12),
    // Alguicida - mL/m³
    alguicida: {
      preventivo: Math.ceil(m3 * ALGUICIDA_PREVENTIVO_ML_M3),
      choque: Math.ceil(m3 * ALGUICIDA_CHOQUE_ML_M3),
    },
    // Sal (electrólisis) - 1 m³ a 1 g/L = 1 kg, así que kg = m³ × g/L
    sal: Math.ceil(m3 * SAL_G_L),
  };
}

export default function CalculadoraPiscinasPage() {
  const [forma, setForma] = useState<FormaType>('rectangular');
  const [largo, setLargo] = useState('');
  const [ancho, setAncho] = useState('');
  const [diametro, setDiametro] = useState('');
  const [profMedia, setProfMedia] = useState('1,5');
  const [volumen, setVolumen] = useState<number | null>(null);
  const [dosis, setDosis] = useState<DosisPiscina | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calcular = useCallback(() => {
    // Las medidas que hacen falta según la forma elegida, con su etiqueta y su tope.
    const medidas: { etiqueta: string; texto: string; maximo: number }[] =
      forma === 'circular'
        ? [{ etiqueta: 'Diámetro', texto: diametro, maximo: MAX_DIMENSION_M }]
        : forma === 'ovalada'
          ? [
              { etiqueta: 'Eje mayor', texto: largo, maximo: MAX_DIMENSION_M },
              { etiqueta: 'Eje menor', texto: ancho, maximo: MAX_DIMENSION_M },
            ]
          : [
              { etiqueta: 'Largo', texto: largo, maximo: MAX_DIMENSION_M },
              { etiqueta: 'Ancho', texto: ancho, maximo: MAX_DIMENSION_M },
            ];
    medidas.push({ etiqueta: 'Profundidad media', texto: profMedia, maximo: MAX_PROFUNDIDAD_M });

    const vacias = medidas.filter(m => m.texto.trim() === '');
    // Un recálculo que no sale adelante RETIRA el resultado anterior y dice por qué. Antes
    // hacía `return` sin tocar el estado: el usuario seguía leyendo las dosis de la piscina
    // de antes, con otros datos en los campos y sin ningún aviso, y el botón parecía averiado.
    const fallar = (mensaje: string) => {
      setError(mensaje);
      setVolumen(null);
      setDosis(null);
    };

    if (vacias.length > 0) {
      fallar(`Faltan medidas: ${vacias.map(m => m.etiqueta.toLowerCase()).join(', ')}.`);
      return;
    }
    const motivo = medidas.map(m => validarMedida(m.etiqueta, m.texto, m.maximo)).find(Boolean);
    if (motivo) {
      fallar(motivo);
      return;
    }

    const vol = calcularVolumen(
      forma,
      parseSpanishNumber(largo),
      parseSpanishNumber(ancho),
      parseSpanishNumber(diametro),
      parseSpanishNumber(profMedia),
    );
    if (!Number.isFinite(vol) || vol <= 0) {
      fallar('No se ha podido calcular el volumen con esas medidas.');
      return;
    }
    setError(null);
    setVolumen(vol);
    setDosis(calcularDosis(vol));
  }, [forma, largo, ancho, diametro, profMedia]);

  const cambiarForma = (f: FormaType) => {
    setForma(f);
    setVolumen(null);
    setDosis(null);
    setError(null);
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🏊</span> Calculadora de Piscinas, Albercas y Piletas</h1>
          <p className={styles.subtitle}>
            Volumen y dosis de cloro, pH, alguicida y sal para tu piscina, alberca o pileta — todo en un clic
          </p>
        </header>

        <LegalNotice />

        {/* Advertencia de seguridad */}
        <div className={styles.warningBox} role="alert">
          <strong><span aria-hidden="true">⚠️</span> Importante:</strong> Los productos químicos para piscinas son sustancias reactivas.
          Sigue siempre las instrucciones del fabricante, usa guantes y no mezcles productos entre sí.
          Las dosis de esta calculadora son orientativas; ajusta siempre con un test de agua.
        </div>

        {/* Sección volumen */}
        <div className={styles.volumenCard}>
          <p className={styles.sectionTitle}><span aria-hidden="true">📐</span> Paso 1: Calcular volumen de la piscina</p>

          {/* Selector de forma */}
          <div className={styles.shapeGrid} role="group" aria-label="Forma de la piscina">
            {([
              { id: 'rectangular', label: '⬛ Rectangular', desc: 'Largo × Ancho' },
              { id: 'circular', label: '🔵 Circular', desc: 'Diámetro' },
              { id: 'ovalada', label: '🫧 Ovalada', desc: 'Eje mayor × Eje menor' },
            ] as { id: FormaType; label: string; desc: string }[]).map(f => (
              <button
                key={f.id}
                type="button"
                className={`${styles.shapeBtn} ${forma === f.id ? styles.shapeBtnActive : ''}`}
                onClick={() => cambiarForma(f.id)}
                aria-pressed={forma === f.id}
              >
                <div>{f.label}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>{f.desc}</div>
              </button>
            ))}
          </div>

          {/* Inputs de dimensiones */}
          <div className={styles.inputGrid}>
            {forma === 'rectangular' && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="largo">Largo (m)</label>
                  <input id="largo" type="text" inputMode="decimal" className={styles.input} placeholder="8" value={largo} onChange={e => setLargo(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="ancho">Ancho (m)</label>
                  <input id="ancho" type="text" inputMode="decimal" className={styles.input} placeholder="4" value={ancho} onChange={e => setAncho(e.target.value)} />
                </div>
              </>
            )}
            {forma === 'circular' && (
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="diametro">Diámetro (m)</label>
                <input id="diametro" type="text" inputMode="decimal" className={styles.input} placeholder="5" value={diametro} onChange={e => setDiametro(e.target.value)} />
              </div>
            )}
            {forma === 'ovalada' && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="largo-oval">Eje mayor (m)</label>
                  <input id="largo-oval" type="text" inputMode="decimal" className={styles.input} placeholder="8" value={largo} onChange={e => setLargo(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="ancho-oval">Eje menor (m)</label>
                  <input id="ancho-oval" type="text" inputMode="decimal" className={styles.input} placeholder="4" value={ancho} onChange={e => setAncho(e.target.value)} />
                </div>
              </>
            )}
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="prof">Profundidad media (m)</label>
              <input id="prof" type="text" inputMode="decimal" className={styles.input} placeholder="1,5" value={profMedia} onChange={e => setProfMedia(e.target.value)} />
              <p className={styles.hint}>Media entre la zona poco profunda y la más honda</p>
            </div>
          </div>

          <button type="button" onClick={calcular} className={styles.btnPrimary}>
            Calcular volumen y dosis de productos
          </button>

          {error !== null && (
            <div className={styles.errorBox} role="alert" style={{ marginTop: '1rem' }}>
              {error}
            </div>
          )}

          {volumen !== null && (
            <div className={styles.volumenResultado} role="status" style={{ marginTop: '1rem' }}>
              <span className={styles.volumenLabel}>Volumen total de la piscina</span>
              <span className={styles.volumenValue}>{formatNumber(volumen, 1)} m³ ({formatNumber(volumen * 1000, 0)} litros)</span>
            </div>
          )}
        </div>

        {/* Sección productos */}
        {dosis && volumen !== null && (
          <>
            <div className={styles.tipBox} role="note">
              <span aria-hidden="true">💧</span> Dosis calculadas para <strong>{formatNumber(volumen, 1)} m³</strong> ({formatNumber(volumen * 1000, 0)} litros).
              Mide siempre el pH (7,2 – 7,6) y el cloro libre (1 – 3 ppm) antes de añadir productos.
            </div>

            <div className={styles.productosGrid}>
              {/* Cloro */}
              <div className={styles.productoCard}>
                <div className={styles.productoHeader}>
                  <span aria-hidden="true">🧴</span> Cloro
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Granulado (hipoclorito cálcico ~65%)
                </p>
                <div className={styles.dosisItem}>
                  <span className={styles.dosisLabel}>Mantenimiento semanal</span>
                  <span className={styles.dosisValue}>{formatNumber(dosis.cloro.mantenimiento, 0)} g</span>
                </div>
                <div className={`${styles.dosisItem} ${styles.dosisChoque}`}>
                  <span className={styles.dosisLabel}>Choque / arranque temporada</span>
                  <span className={styles.dosisValue}>{formatNumber(dosis.cloro.choque, 0)} g</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0.75rem 0 0.5rem' }}>
                  Cloro líquido (hipoclorito sódico ~13%)
                </p>
                <div className={styles.dosisItem}>
                  <span className={styles.dosisLabel}>Mantenimiento semanal</span>
                  <span className={styles.dosisValue}>{formatNumber(dosis.cloro_liquido.mantenimiento, 0)} mL</span>
                </div>
                <div className={`${styles.dosisItem} ${styles.dosisChoque}`}>
                  <span className={styles.dosisLabel}>Choque</span>
                  <span className={styles.dosisValue}>{formatNumber(dosis.cloro_liquido.choque, 0)} mL</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem', lineHeight: 1.5 }}>
                  El choque lleva el cloro libre a <strong>{PPM_CHOQUE} ppm</strong> y el mantenimiento
                  repone <strong>{PPM_MANTENIMIENTO_SEMANA} ppm</strong> a la semana (≈1 ppm al día, el
                  consumo habitual al aire libre en verano). Cada ppm en 1 m³ es 1 g de cloro activo:
                  de ahí salen los gramos, dividiendo por la riqueza del producto. Mide y ajusta:
                  el consumo real depende del sol, la temperatura y los bañistas.
                </p>
              </div>

              {/* pH */}
              <div className={styles.productoCard}>
                <div className={styles.productoHeader}>
                  <span aria-hidden="true">⚗️</span> Corrector de pH
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Objetivo: pH entre 7,2 y 7,6. Ajusta tras cada medición.
                </p>
                <div className={styles.dosisItem}>
                  <span className={styles.dosisLabel}>pH+ Elevador (subir ~0,2 unidades)</span>
                  <span className={styles.dosisValue}>{formatNumber(dosis.ph_elevador, 0)} g</span>
                </div>
                <div className={styles.dosisItem}>
                  <span className={styles.dosisLabel}>pH− Reductor (bajar ~0,2 unidades)</span>
                  <span className={styles.dosisValue}>{formatNumber(dosis.ph_reductor, 0)} g</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem', lineHeight: 1.5 }}>
                  Ajusta siempre en pequeñas dosis, espera 4 h entre cada corrección y vuelve a medir.
                </p>
              </div>

              {/* Alguicida */}
              <div className={styles.productoCard}>
                <div className={styles.productoHeader}>
                  <span aria-hidden="true">🌿</span> Alguicida
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Previene la aparición de algas. Añadir al inicio de temporada y semanalmente.
                </p>
                <div className={styles.dosisItem}>
                  <span className={styles.dosisLabel}>Preventivo semanal</span>
                  <span className={styles.dosisValue}>{formatNumber(dosis.alguicida.preventivo, 0)} mL</span>
                </div>
                <div className={`${styles.dosisItem} ${styles.dosisChoque}`}>
                  <span className={styles.dosisLabel}>Choque (con algas visibles)</span>
                  <span className={styles.dosisValue}>{formatNumber(dosis.alguicida.choque, 0)} mL</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem', lineHeight: 1.5 }}>
                  En otoño e invierno añade alguicida de invierno cada 4-6 semanas si la piscina permanece llena.
                </p>
              </div>

              {/* Sal */}
              <div className={styles.productoCard}>
                <div className={styles.productoHeader}>
                  <span aria-hidden="true">🧂</span> Sal (cloración salina)
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  Solo para sistemas de electrólisis salina. Dosificado a {formatNumber(SAL_G_L, 0)} g/L;
                  lo habitual es 4 – 6 g/L, pero el nivel exacto lo fija el manual de tu clorador.
                </p>
                <div className={styles.dosisItem}>
                  <span className={styles.dosisLabel}>Carga inicial (piscina vacía)</span>
                  <span className={styles.dosisValue}>{formatNumber(dosis.sal, 0)} kg</span>
                </div>
                <div className={styles.dosisItem}>
                  <span className={styles.dosisLabel}>Reposición anual (~20%)</span>
                  <span className={styles.dosisValue}>{formatNumber(Math.ceil(dosis.sal * 0.2), 0)} kg</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem', lineHeight: 1.5 }}>
                  Usa sal específica para piscinas (calidad alimentaria, 99,9% NaCl). Disuelve fuera de la piscina.
                </p>
              </div>
            </div>
          </>
        )}

        {/*
          Aquí no se decide ninguna inversión: se decide cuántos gramos de hipoclorito echar a
          un agua donde se bañan personas. El aviso financiero que había («asesor fiscal,
          gestor, abogado o entidad financiera regulada») apuntaba a un riesgo que esta app no
          tiene, y callaba el que sí. Nivel 2 ALTO: no colapsable, con texto propio, porque
          ninguna de las variantes estándar habla de productos químicos.
        */}
        <DisclaimerCard
          variant="general"
          severity="high"
          title="Aviso importante: productos químicos para piscina"
          context="calculadora-piscinas"
        >
          <p>
            Estas dosis tienen <strong>carácter orientativo</strong>. Son un punto de partida
            calculado sobre el volumen y sobre productos de riqueza estándar (cloro granulado al
            65 %, cloro líquido al 13 %): la dosis que necesitas depende de la concentración real
            del producto que tengas en la mano y del estado del agua, y solo un test te lo dice.
          </p>
          <p>
            <strong>
              Manda siempre la etiqueta del fabricante y la medición del agua, no esta pantalla.
            </strong>{' '}
            No mezcles nunca productos entre sí, añádelos por separado y respeta los tiempos de
            espera antes del baño.
          </p>
          <p>
            Una sobredosis de cloro o de alguicida irrita piel, ojos y vías respiratorias, y
            algunas mezclas desprenden gases tóxicos. meskeIA no se responsabiliza de las
            consecuencias derivadas del uso de esta herramienta.
          </p>
        </DisclaimerCard>

        <EducationalSection
          title="Guía de mantenimiento de piscinas"
          subtitle="Todo lo que necesitas saber para mantener el agua en perfectas condiciones todo el año"
        >
          <section className={styles.guideSection}>
            <h2>Todo lo que necesitas saber para mantener el agua de tu piscina, alberca o pileta</h2>
            <p>
              La piscina se conoce como <strong>alberca</strong> en México y como <strong>pileta</strong> en
              Argentina y Uruguay, pero el cuidado del agua es el mismo en todos los casos. El mantenimiento
              no es complicado si conoces el orden correcto y las dosis adecuadas. Un agua bien equilibrada
              protege la salud de los bañistas y alarga la vida de los equipos de tu pileta o alberca.
            </p>

            {/* Guía paso a paso: apertura de temporada */}
            <h3><span aria-hidden="true">📋</span> Apertura de temporada paso a paso</h3>
            <div className={styles.stepGuide}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <div className={styles.stepContent}>
                  <strong>Limpia el fondo y el perímetro antes de encender la bomba</strong>
                  <p>Retira hojas, suciedad y cualquier residuo del invierno con la manga de aspiración manual. No arranques la depuradora aún: el agua sucia puede obturar el filtro. Si el agua está muy verde, añade floculante primero y deja reposar 12–24 h.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <div className={styles.stepContent}>
                  <strong>Revisa y limpia el filtro de arena o cartucho</strong>
                  <p>Realiza una contracorriente (backwash) de 3–5 minutos y luego enjuague. Si la arena del filtro tiene más de 5 años, cámbiala. Inspecciona también el skimmer, la bomba y las conexiones antes de encender.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <div className={styles.stepContent}>
                  <strong>Ajusta el pH entre 7,2 y 7,6</strong>
                  <p>El pH es el parámetro más importante. Sin él en rango, el cloro apenas funciona. Mide con kit de test o tiras reactivas. Añade pH+ (carbonato sódico) o pH- (bisulfato sódico) según el resultado. Espera 4–6 horas antes de volver a medir.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>4</div>
                <div className={styles.stepContent}>
                  <strong>Realiza el choque de cloro (10 ppm de cloro libre)</strong>
                  <p>Diez ppm son unos 15 g/m³ de granulado al 65 % o 64 mL/m³ de cloro líquido al 13 %: cada ppm en 1 m³ es 1 g de cloro activo, dividido por la riqueza del producto. Hazlo por la tarde-noche para evitar que el sol degrade el cloro antes de actuar. Disuelve el cloro granulado en un cubo con agua antes de añadirlo. No te bañes hasta que el cloro libre baje por debajo de 3 ppm (mínimo 12–24 horas).</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>5</div>
                <div className={styles.stepContent}>
                  <strong>Añade alguicida de apertura</strong>
                  <p>Aplica la dosis de choque de alguicida (100 mL/10 m³) después del cloro, nunca simultáneamente. El alguicida previene la aparición de algas durante semanas. A partir de ahí, mantén con dosis semanales de 20 mL/10 m³.</p>
                </div>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>6</div>
                <div className={styles.stepContent}>
                  <strong>Establece la rutina de mantenimiento semanal</strong>
                  <p>Mide pH y cloro cada semana. Añade la dosis de mantenimiento de cloro —unos 7 ppm a la semana, que son ~11 g/m³ de granulado al 65 %— y alguicida preventivo. Esos 7 ppm reponen un consumo de ~1 ppm al día; si tu medición dice otra cosa, manda la medición. En días de mucho uso (más de 6 bañistas), añade media dosis extra de cloro esa misma tarde.</p>
                </div>
              </div>
            </div>

            {/* Tabla comparativa productos de cloro */}
            <h3><span aria-hidden="true">⚖️</span> Comparativa: formas de clorar la piscina</h3>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Concentración</th>
                    <th>Ventajas</th>
                    <th>Inconvenientes</th>
                    <th>Ideal para</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Cloro granulado</strong></td>
                    <td>60 – 70%</td>
                    <td>Acción rápida, fácil de dosificar</td>
                    <td>Sube el calcio, no apto en exceso para piscinas de sal</td>
                    <td>Choque y mantenimiento general</td>
                  </tr>
                  <tr>
                    <td><strong>Cloro líquido</strong></td>
                    <td>12 – 15%</td>
                    <td>Muy económico, sin residuos sólidos</td>
                    <td>Se degrada rápido, transporte voluminoso</td>
                    <td>Mantenimiento diario automatizado</td>
                  </tr>
                  <tr>
                    <td><strong>Pastillas tricloroisocianúrico</strong></td>
                    <td>90%</td>
                    <td>Liberación lenta, muy cómodo</td>
                    <td>Baja el pH y sube el CYA; no usar para choque</td>
                    <td>Mantenimiento en skimmer o flotador</td>
                  </tr>
                  <tr>
                    <td><strong>Electrólisis salina</strong></td>
                    <td>Genera cloro in situ</td>
                    <td>Agua más suave, sin compras periódicas</td>
                    <td>Alta inversión inicial (1.200–3.000 €), ajuste de sal</td>
                    <td>Piscinas privadas de uso frecuente</td>
                  </tr>
                  <tr>
                    <td><strong>UV + cloro reducido</strong></td>
                    <td>Complemento</td>
                    <td>Reduce el cloro necesario un 50–70%</td>
                    <td>Requiere instalación adicional</td>
                    <td>Alérgicos o piscinas cubiertas</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Casos de uso */}
            <h3><span aria-hidden="true">💼</span> Situaciones habituales de tratamiento</h3>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🌿</span>
                  <strong>Agua verde (algas)</strong>
                </div>
                <div className={styles.escenarioExample}>
                  Piscina 40 m³ con agua verdosa.<br/>
                  1. Choque cloro: 616 g granulado (10 ppm).<br/>
                  2. Alguicida de choque: 400 mL.<br/>
                  3. Floculante + aspiración fondo al día siguiente.<br/>
                  4. Filtrado 24 h seguidas.
                </div>
                <p className={styles.escenarioTip}><strong>Clave:</strong> No añadas alguicida y cloro a la vez. Primero el cloro (mañana), luego el alguicida (tarde). Mezclarlos juntos reduce la eficacia de ambos.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🎉</span>
                  <strong>Después de un uso intensivo</strong>
                </div>
                <div className={styles.escenarioExample}>
                  Fiesta con 15 personas en piscina de 30 m³.<br/>
                  Cloro después de la fiesta: +162 g (media dosis semanal).<br/>
                  Al día siguiente: medir pH y cloro libre.<br/>
                  Si cloro &lt; 0,5 ppm: choque completo (462 g).
                </div>
                <p className={styles.escenarioTip}><strong>Clave:</strong> El sudor, la crema solar y la orina consumen el cloro muy rápido. Añade siempre media dosis extra después de una jornada con más de 6 bañistas.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🍂</span>
                  <strong>Piscina en otoño-invierno</strong>
                </div>
                <div className={styles.escenarioExample}>
                  Piscina 50 m³ sin uso, cubierta.<br/>
                  Cada 4 semanas: medir pH + cloro.<br/>
                  Alguicida invernal: 40 mL/10 m³, el doble de la dosis preventiva (cada 4–6 semanas).<br/>
                  Reducir filtrado a 2 h/día.
                </div>
                <p className={styles.escenarioTip}><strong>Clave:</strong> Cubrir la piscina en invierno reduce el consumo de productos un 70%. Pero no la abandones: un tratamiento mínimo mensual evita tener que hacer un choque intensivo en primavera.</p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🧂</span>
                  <strong>Primera carga de sal (electrólisis)</strong>
                </div>
                <div className={styles.escenarioExample}>
                  Piscina 40 m³, nivel objetivo 5 g/L.<br/>
                  Sal necesaria: 40 × 5 = 200 kg.<br/>
                  Añadir en 4 tandas de 50 kg, disolviendo fuera.<br/>
                  Esperar 24 h antes de encender el clorador.
                </div>
                <p className={styles.escenarioTip}><strong>Clave:</strong> Usa sal específica para piscinas (99,9% NaCl sin aditivos anti-apelmazantes). La sal de mesa o la de alimentación contienen yodo u otros aditivos que dañan el clorador.</p>
              </div>
            </div>

            {/* Mejores prácticas */}
            <h3><span aria-hidden="true">✅</span> Hábitos de mantenimiento que marcan la diferencia</h3>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🌅</span>
                <strong>Añade el cloro por la tarde-noche</strong>
                <p>La radiación UV degrada el cloro hasta un 90% en pocas horas. Añadirlo al atardecer permite que actúe toda la noche sin pérdidas.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">📊</span>
                <strong>Ajusta el pH siempre antes del cloro</strong>
                <p>A pH 8,0 solo un 26% del cloro está como ácido hipocloroso, que es la forma que desinfecta; a pH 7,2, un 69%, y a pH 7,6, un 47%. Sale de la curva de disociación del ácido hipocloroso (pKa 7,54 a 25 °C). El orden correcto es: medir → ajustar pH → añadir cloro.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔄</span>
                <strong>Filtra al menos 8 horas al día en verano</strong>
                <p>Una regla práctica: filtra 1 hora por cada 2 °C de temperatura del agua. Con 28 °C, filtra al menos 14 horas. El filtrado insuficiente es la causa más común de agua turbia.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🧪</span>
                <strong>Test de agua completo cada 2 semanas</strong>
                <p>Además de pH y cloro, mide TAC (alcalinidad) y dureza cálcica. Un TAC bajo causa oscilaciones bruscas de pH; un TH alto genera incrustaciones en el skimmer.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🧹</span>
                <strong>Limpia el filtro en contracorriente semanalmente</strong>
                <p>Un filtro sucio reduce el caudal y la eficacia de la depuración. El backwash semanal de 3 minutos mantiene el filtro en óptimas condiciones durante toda la temporada.</p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">☁️</span>
                <strong>Refuerza el cloro después de la lluvia</strong>
                <p>La lluvia diluye los productos y puede aportarmateria orgánica. Después de lluvias abundantes, añade media dosis de cloro y revisa el pH, que tiende a bajar con el agua de lluvia.</p>
              </div>
            </div>

            {/* Warning box */}
            <div className={styles.warningBoxV2}>
              <div className={styles.warningHeader}>
                <span aria-hidden="true">⚠️</span>
                <span>Errores de seguridad graves en el tratamiento de piscinas</span>
              </div>
              <ul className={styles.warningList}>
                <li><strong><span aria-hidden="true">❌</span> Nunca mezcles cloro y alguicida directamente:</strong> La reacción puede generar gases tóxicos y reducir drásticamente la eficacia de ambos. Añádelos siempre por separado con al menos 4 horas de diferencia.</li>
                <li><strong><span aria-hidden="true">❌</span> No añadas cloro con bañistas en el agua:</strong> El cloro granulado o líquido debe diluirse y actuar antes del baño. Espera al menos 30 minutos después de añadir la dosis de mantenimiento y 12–24 h tras un choque.</li>
                <li><strong><span aria-hidden="true">❌</span> Nunca viertas agua sobre el hipoclorito, sino al revés:</strong> Al disolver cloro granulado, añade el producto al agua, no el agua al producto. El error inverso puede provocar salpicaduras cáusticas o reacciones violentas.</li>
                <li><strong><span aria-hidden="true">❌</span> No guardes productos químicos mezclados ni en envases sin etiquetar:</strong> El cloro y el reductor de pH son incompatibles. Guardarlos juntos o en el mismo espacio puede provocar incendios o gases tóxicos.</li>
                <li><strong><span aria-hidden="true">❌</span> No uses la piscina con cloro libre por encima de 5 ppm:</strong> Niveles altos irritan piel, ojos y vías respiratorias, especialmente en niños. Si el cloro sube por accidente, filtra con la cubierta abierta y espera a que baje de 3 ppm.</li>
              </ul>
            </div>

            {/* FAQ */}
            <h3><span aria-hidden="true">❓</span> Preguntas frecuentes</h3>
            <div className={styles.faqList}>
              <div className={styles.faqItem}>
                <strong>¿Por qué el agua está turbia si tengo cloro suficiente?</strong>
                <p>El agua turbia con cloro presente suele deberse a: pH fuera de rango (el cloro no actúa), filtrado insuficiente (menos de 8 h/día en verano), alcalinidad total (TAC) demasiado alta, o partículas muy finas que el filtro no retiene (solución: floculante). Revisa primero el pH y las horas de filtración antes de añadir más cloro.</p>
                <p className={styles.faqTip}><span aria-hidden="true">💡</span> <strong>Consejo:</strong> Si el agua está turbia pero el pH está bien, añade floculante líquido, activa la filtración 24 h y aspira el fondo al día siguiente con el filtro en posición &quot;vaciar&quot;.</p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Cada cuánto debo cambiar el agua de la piscina?</strong>
                <p>No es necesario vaciar completamente la piscina cada año. El agua puede usarse varios años si se gestiona bien. Lo que sí hay que controlar es la concentración de cianúrico (CYA), que se acumula con las pastillas de tricloroisocianúrico. Si supera los 75 ppm, el cloro pierde eficacia y hay que renovar parcialmente el agua (20–30%).</p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Es mejor la electrólisis salina que el cloro tradicional?</strong>
                <p>La electrólisis salina genera cloro a partir de sal mediante corriente eléctrica. El agua resulta más suave al tacto y hay menos manipulación de productos. El coste inicial es alto (1.200–3.000 €), pero el coste operativo es menor. Es especialmente recomendable para piscinas de más de 30 m³ con uso frecuente. Para piscinas pequeñas o de uso esporádico, el cloro tradicional sigue siendo más económico.</p>
                <p className={styles.faqTip}><span aria-hidden="true">💡</span> <strong>Consejo:</strong> Con electrólisis salina también necesitas controlar pH, TAC y niveles de sal. No es un sistema sin mantenimiento.</p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Qué hago si el agua se vuelve verde en pocas horas?</strong>
                <p>El verdor rápido indica algas ya presentes o esporas activas. Necesitas un tratamiento de choque agresivo: unos 30 g/m³ de cloro granulado al 65 % (el doble del choque normal, es decir 20 ppm) + 100 mL/10 m³ de alguicida de choque al día siguiente. Filtra sin parar 48 h y aspira el fondo. Si persiste, repite el ciclo.</p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿Cómo mantengo la piscina en invierno si no la vacío?</strong>
                <p>Reduce el filtrado a 2–4 horas diarias. Añade alguicida de invierno (de larga duración, &gt;30 días de efecto) cada 4–6 semanas a dosis doble de la preventiva. Mide pH y cloro mensualmente. Cubre la piscina con una cubierta de burbujas o seguridad: reduce el consumo de productos un 70% y evita la proliferación de algas con la luz reducida.</p>
                <p className={styles.faqTip}><span aria-hidden="true">💡</span> <strong>Consejo:</strong> En zonas con riesgo de heladas, vacía el agua de tuberías y equipos. Un anti-hielo para la tubería es mucho más barato que reparar una tubería rota.</p>
              </div>
              <div className={styles.faqItem}>
                <strong>¿El pH de la piscina puede afectar a la salud?</strong>
                <p>Sí. Con pH por debajo de 7,0, el agua es corrosiva: irrita ojos y mucosas, corroe las partes metálicas de la bomba y puede dañar el revestimiento. Con pH por encima de 7,8, el cloro apenas actúa y pueden formarse incrustaciones calcáreas en el skimmer. El rango 7,2–7,6 garantiza tanto la eficacia del cloro como el confort de los bañistas.</p>
              </div>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('calculadora-piscinas')} />
        <ShareCard appName="calculadora-piscinas" />
        <Footer appName="calculadora-piscinas" />
    </div>
  );
}
