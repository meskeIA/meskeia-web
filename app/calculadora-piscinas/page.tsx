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
import { jsonLd } from './metadata';

type FormaType = 'rectangular' | 'circular' | 'ovalada';

interface DosisPiscina {
  cloro: { mantenimiento: number; choque: number; unidad: string };
  cloro_liquido: { mantenimiento: number; choque: number };
  ph_elevador: number;
  ph_reductor: number;
  alguicida: { preventivo: number; choque: number };
  sal: number;
}

function parseNum(v: string): number {
  return parseSpanishNumber(v) || 0;
}

function calcularVolumen(forma: FormaType, largo: number, ancho: number, diametro: number, profMedia: number): number {
  if (forma === 'rectangular') return largo * ancho * profMedia;
  if (forma === 'circular') return Math.PI * Math.pow(diametro / 2, 2) * profMedia;
  if (forma === 'ovalada') return Math.PI * (largo / 2) * (ancho / 2) * profMedia;
  return 0;
}

function calcularDosis(volumen: number): DosisPiscina {
  const m3 = volumen;
  return {
    // Cloro granulado (hipoclorito cálcico 65%) - g/m³
    cloro: {
      mantenimiento: Math.ceil(m3 * 2),   // 2 g/m³/semana mantenimiento
      choque: Math.ceil(m3 * 10),          // 10 g/m³ choque
      unidad: 'g',
    },
    // Cloro líquido (hipoclorito sódico 13%) - mL/m³
    cloro_liquido: {
      mantenimiento: Math.ceil(m3 * 15),   // 15 mL/m³/semana
      choque: Math.ceil(m3 * 60),          // 60 mL/m³ choque
    },
    // pH elevador (carbonato sódico) - g/m³ para subir ~0,2 unidades
    ph_elevador: Math.ceil(m3 * 15),
    // pH reductor (bisulfato sódico) - g/m³ para bajar ~0,2 unidades
    ph_reductor: Math.ceil(m3 * 12),
    // Alguicida - mL/m³
    alguicida: {
      preventivo: Math.ceil(m3 * 20),      // 20 mL/m³/semana
      choque: Math.ceil(m3 * 100),         // 100 mL/m³ alga activa
    },
    // Sal (piscinas electrólisis) - kg totales para 5-7 g/L
    sal: Math.ceil(m3 * 6),               // 6 kg/m³ para 6 g/L
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

  const calcular = useCallback(() => {
    const l = parseNum(largo);
    const a = parseNum(ancho);
    const d = parseNum(diametro);
    const p = parseNum(profMedia);
    if (!p) return;
    if (forma === 'rectangular' && (!l || !a)) return;
    if (forma === 'circular' && !d) return;
    if (forma === 'ovalada' && (!l || !a)) return;

    const vol = calcularVolumen(forma, l, a, d, p);
    if (vol <= 0) return;
    setVolumen(vol);
    setDosis(calcularDosis(vol));
  }, [forma, largo, ancho, diametro, profMedia]);

  const cambiarForma = (f: FormaType) => {
    setForma(f);
    setVolumen(null);
    setDosis(null);
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🏊 Calculadora de Piscinas</h1>
          <p className={styles.subtitle}>
            Volumen y dosis de cloro, pH, alguicida y sal — todo en un clic
          </p>
        </header>

        <LegalNotice />

        {/* Advertencia de seguridad */}
        <div className={styles.warningBox} role="alert">
          <strong>⚠️ Importante:</strong> Los productos químicos para piscinas son sustancias reactivas.
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

          <button onClick={calcular} className={styles.btnPrimary}>
            Calcular volumen y dosis de productos
          </button>

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
              💧 Dosis calculadas para <strong>{formatNumber(volumen, 1)} m³</strong> ({formatNumber(volumen * 1000, 0)} litros).
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
                  Solo para sistemas de electrólisis salina. Nivel objetivo: 5 – 7 g/L.
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

        <DisclaimerCard
          variant="general"
          severity="medium"
          context="calculadora-piscinas"
          collapsible={true}
        />

        <EducationalSection
          title="📚 Guía de mantenimiento de piscinas"
          subtitle="Todo lo que necesitas saber para mantener el agua en perfectas condiciones todo el año"
        >
          <section className={styles.guideSection}>
            <h2>Los parámetros clave del agua de piscina</h2>
            <table className={styles.tipTable}>
              <thead>
                <tr><th>Parámetro</th><th>Rango óptimo</th><th>Efecto fuera de rango</th></tr>
              </thead>
              <tbody>
                <tr><td>pH</td><td>7,2 – 7,6</td><td>Irritación piel/ojos, menor eficacia del cloro</td></tr>
                <tr><td>Cloro libre</td><td>1 – 3 ppm (mg/L)</td><td>Riesgo bacteriológico o irritación</td></tr>
                <tr><td>Alcalinidad total (TAC)</td><td>80 – 150 ppm</td><td>Fluctuaciones bruscas de pH</td></tr>
                <tr><td>Dureza cálcica (TH)</td><td>200 – 400 ppm</td><td>Corrosión o incrustaciones calcáreas</td></tr>
                <tr><td>Sal (piscinas salinas)</td><td>5 – 7 g/L</td><td>Clorador no genera suficiente cloro</td></tr>
              </tbody>
            </table>

            <h3>Rutina de mantenimiento semanal</h3>
            <ul>
              <li>Mide pH y cloro con un kit de test o tiras reactivas</li>
              <li>Ajusta el pH si está fuera de rango (primero el pH, luego el cloro)</li>
              <li>Añade la dosis semanal de cloro granulado o líquido</li>
              <li>Añade alguicida preventivo</li>
              <li>Limpia el skimmer y el prefiltro de la bomba</li>
              <li>Aspira el fondo si hay suciedad visible</li>
            </ul>

            <h3>Mantenimiento en invierno (piscina sin uso)</h3>
            <p>
              Si la piscina queda llena durante el otoño e invierno, no basta con taparla.
              Es necesario:
            </p>
            <ul>
              <li>Añadir un tratamiento de invierno (alguicida de larga duración + floculante)</li>
              <li>Reducir el filtrado a 2-4 h/día</li>
              <li>Revisar el pH y el cloro cada 4-6 semanas</li>
              <li>En zonas con heladas: vaciar parcialmente y purgar tuberías</li>
            </ul>

            <h3>¿Por qué el pH es tan importante?</h3>
            <p>
              El pH afecta directamente a la eficacia del cloro. A pH 7,0, el cloro actúa al 73% de su capacidad;
              a pH 8,0, solo al 3%. Mantener el pH entre 7,2 y 7,6 es fundamental para que la desinfección
              sea efectiva con menos producto químico.
            </p>

            <h3>Tratamiento de choque: cuándo y por qué</h3>
            <p>
              El choque de cloro es necesario cuando:
            </p>
            <ul>
              <li>Se abre la piscina al inicio de la temporada</li>
              <li>Hay presencia de algas (agua verde o turbia)</li>
              <li>Tras un uso intensivo (fiesta, muchos bañistas)</li>
              <li>Tras lluvias abundantes que diluyan los productos</li>
              <li>El cloro libre cae por debajo de 0,5 ppm</li>
            </ul>
            <p>
              Realiza el choque por la tarde-noche para que el cloro no se degrade por la luz solar.
              No bañarse hasta que el cloro libre baje por debajo de 3 ppm.
            </p>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('calculadora-piscinas')} />
        <ShareCard appName="calculadora-piscinas" />
        <Footer appName="calculadora-piscinas" />
      </div>
    </>
  );
}
