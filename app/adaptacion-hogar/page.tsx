'use client';

import { useMemo, useState } from 'react';
import styles from './AdaptacionHogar.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, ShareCard, DisclaimerCard } from '@/components';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─── Datos ────────────────────────────────────────────────────────────────────

interface ItemAdaptacion {
  id: string;
  nombre: string;
  costeMin: number;
  costeMax: number;
  prioridad: 'alta' | 'media' | 'baja';
  ayuda: boolean;
}

interface Categoria {
  id: string;
  nombre: string;
  items: ItemAdaptacion[];
}

const CATEGORIAS: Categoria[] = [
  {
    id: 'bano',
    nombre: '🚿 Baño',
    items: [
      { id: 'barras_apoyo', nombre: 'Barras de apoyo en ducha y WC', costeMin: 80, costeMax: 300, prioridad: 'alta', ayuda: true },
      { id: 'silla_ducha', nombre: 'Silla o asiento de ducha', costeMin: 50, costeMax: 200, prioridad: 'alta', ayuda: false },
      { id: 'suelo_bano', nombre: 'Suelo antideslizante en baño', costeMin: 30, costeMax: 150, prioridad: 'alta', ayuda: false },
      { id: 'elevador_wc', nombre: 'Elevador de WC con brazos', costeMin: 40, costeMax: 200, prioridad: 'media', ayuda: false },
      { id: 'ducha_accesible', nombre: 'Ducha accesible sin barreras', costeMin: 800, costeMax: 3000, prioridad: 'alta', ayuda: true },
      { id: 'grifo_monomando', nombre: 'Grifo monomando ergonómico', costeMin: 60, costeMax: 200, prioridad: 'baja', ayuda: false },
    ],
  },
  {
    id: 'dormitorio',
    nombre: '🛏️ Dormitorio',
    items: [
      { id: 'cama_articulada', nombre: 'Cama articulada o ajustable', costeMin: 400, costeMax: 2500, prioridad: 'media', ayuda: true },
      { id: 'barra_cama', nombre: 'Barra lateral de apoyo (cama)', costeMin: 80, costeMax: 300, prioridad: 'media', ayuda: false },
      { id: 'iluminacion_nocturna', nombre: 'Iluminación nocturna automática', costeMin: 30, costeMax: 100, prioridad: 'alta', ayuda: false },
      { id: 'eliminar_alfombras', nombre: 'Eliminar o fijar alfombras', costeMin: 0, costeMax: 50, prioridad: 'alta', ayuda: false },
    ],
  },
  {
    id: 'cocina',
    nombre: '🍳 Cocina',
    items: [
      { id: 'induccion', nombre: 'Cocina de inducción (mayor seguridad)', costeMin: 250, costeMax: 800, prioridad: 'media', ayuda: false },
      { id: 'tiradores_cocina', nombre: 'Tiradores y cajones ergonómicos', costeMin: 100, costeMax: 400, prioridad: 'baja', ayuda: false },
      { id: 'encimera_adaptada', nombre: 'Encimera a altura accesible', costeMin: 500, costeMax: 2000, prioridad: 'media', ayuda: true },
    ],
  },
  {
    id: 'accesos',
    nombre: '🚪 Accesos y pasillos',
    items: [
      { id: 'rampa_entrada', nombre: 'Rampa de acceso exterior', costeMin: 100, costeMax: 1500, prioridad: 'alta', ayuda: true },
      { id: 'pasamanos_pasillos', nombre: 'Pasamanos en pasillos', costeMin: 150, costeMax: 600, prioridad: 'alta', ayuda: true },
      { id: 'ampliar_puertas', nombre: 'Ampliar puertas (≥ 80 cm)', costeMin: 300, costeMax: 1500, prioridad: 'media', ayuda: true },
      { id: 'tiradores_palanca', nombre: 'Tiradores de palanca en puertas', costeMin: 100, costeMax: 400, prioridad: 'baja', ayuda: false },
    ],
  },
  {
    id: 'escaleras',
    nombre: '⬆️ Escaleras',
    items: [
      { id: 'doble_pasamanos', nombre: 'Doble pasamanos en escalera', costeMin: 200, costeMax: 800, prioridad: 'alta', ayuda: true },
      { id: 'silla_salvaescaleras', nombre: 'Silla salvaescaleras', costeMin: 2500, costeMax: 6000, prioridad: 'alta', ayuda: true },
      { id: 'plataforma_elevadora', nombre: 'Plataforma elevadora vertical', costeMin: 4000, costeMax: 12000, prioridad: 'alta', ayuda: true },
    ],
  },
  {
    id: 'seguridad',
    nombre: '🔔 Seguridad general',
    items: [
      { id: 'telealarma', nombre: 'Telealarma / detector de caídas', costeMin: 30, costeMax: 300, prioridad: 'alta', ayuda: true },
      { id: 'suelos_generales', nombre: 'Suelos antideslizantes (toda la casa)', costeMin: 100, costeMax: 1000, prioridad: 'alta', ayuda: false },
      { id: 'interruptores', nombre: 'Interruptores a altura accesible', costeMin: 150, costeMax: 500, prioridad: 'baja', ayuda: false },
    ],
  },
];

const TODOS_LOS_ITEMS = CATEGORIAS.flatMap(c => c.items);

const LABELS_PRIORIDAD: Record<string, string> = {
  alta: 'Prioritario',
  media: 'Recomendado',
  baja: 'Opcional',
};

// ─── Componente ───────────────────────────────────────────────────────────────

export default function AdaptacionHogar() {
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

  function toggleItem(id: string) {
    setSeleccionados(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const resumen = useMemo(() => {
    const items = TODOS_LOS_ITEMS.filter(i => seleccionados.has(i.id));
    return {
      total: items.length,
      totalMin: items.reduce((s, i) => s + i.costeMin, 0),
      totalMax: items.reduce((s, i) => s + i.costeMax, 0),
      conAyuda: items.filter(i => i.ayuda).length,
      prioridadAlta: items.filter(i => i.prioridad === 'alta').length,
      items,
    };
  }, [seleccionados]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">🏠</span>
        <h1 className={styles.title}>Adaptación del Hogar</h1>
        <p className={styles.subtitle}>Checklist de accesibilidad para mayores · Costes orientativos y ayudas públicas</p>
      </header>

      <DisclaimerCard variant="general">
        <span>
          Los costes son <strong>estimaciones orientativas</strong> nacionales (2025). Los precios reales varían por zona geográfica, calidades y mano de obra.
          <br />Las ayudas públicas dependen de la comunidad autónoma, municipio y situación personal. Consulta en tu ayuntamiento o servicios sociales.
          <br /><em>meskeIA no se responsabiliza de decisiones basadas en estas estimaciones.</em>
        </span>
      </DisclaimerCard>

      <div className={styles.mainContent}>
        {/* Checklist */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Selecciona las adaptaciones que necesitas</h2>
          {CATEGORIAS.map(cat => (
            <div key={cat.id} className={styles.categoriaSection}>
              <div className={styles.categoriaHeader}>{cat.nombre}</div>
              {cat.items.map(item => (
                <div
                  key={item.id}
                  className={styles.checkItem}
                  onClick={() => toggleItem(item.id)}
                >
                  <input
                    type="checkbox"
                    className={styles.checkboxInput}
                    checked={seleccionados.has(item.id)}
                    onChange={() => toggleItem(item.id)}
                    aria-label={item.nombre}
                  />
                  <label className={styles.checklistLabel}>
                    <div className={styles.itemNombre}>{item.nombre}</div>
                    <div className={styles.itemBadges}>
                      <span className={styles.itemCoste}>
                        {item.costeMin === 0 ? 'Sin coste' : `${formatCurrency(item.costeMin)} – ${formatCurrency(item.costeMax)}`}
                      </span>
                      <span className={`${styles.badge} ${styles[`prioridad${item.prioridad.charAt(0).toUpperCase() + item.prioridad.slice(1)}`]}`}>
                        {LABELS_PRIORIDAD[item.prioridad]}
                      </span>
                      {item.ayuda && (
                        <span className={`${styles.badge} ${styles.badgeAyuda}`}>✓ Con ayudas</span>
                      )}
                    </div>
                  </label>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Resumen en tiempo real */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Resumen de tu plan</h2>

          {resumen.total === 0 ? (
            <p className={styles.sinSeleccion}>
              Marca las adaptaciones que necesitas en la lista de la izquierda.<br />El resumen se actualiza en tiempo real.
            </p>
          ) : (
            <div className={styles.resumenGrid}>
              <div className={styles.costoBox}>
                <div className={styles.costoLabel}>Coste total orientativo</div>
                <div className={styles.costoValor}>
                  {formatCurrency(resumen.totalMin)} – {formatCurrency(resumen.totalMax)}
                </div>
              </div>

              <div className={styles.statsGrid}>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>{resumen.total}</div>
                  <div className={styles.statLabel}>Adaptaciones seleccionadas</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumberDanger}>{resumen.prioridadAlta}</div>
                  <div className={styles.statLabel}>Prioritarias</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumberSuccess}>{resumen.conAyuda}</div>
                  <div className={styles.statLabel}>Con ayudas posibles</div>
                </div>
                <div className={styles.statItem}>
                  <div className={styles.statNumber}>{resumen.total - resumen.conAyuda}</div>
                  <div className={styles.statLabel}>Sin ayudas específicas</div>
                </div>
              </div>

              {resumen.conAyuda > 0 && (
                <div className={styles.ayudasCard}>
                  <div className={styles.ayudasCardTitulo}>ℹ Posibles ayudas públicas</div>
                  {resumen.conAyuda} de tus adaptaciones pueden ser elegibles para ayudas del IMSERSO, Plan Estatal de Vivienda o programas autonómicos. Consulta en tu ayuntamiento o servicios sociales municipales.
                </div>
              )}

              <div>
                <div className={styles.cardTitle} style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                  Detalle de adaptaciones ({resumen.total})
                </div>
                <div className={styles.itemsSeleccionados}>
                  {resumen.items.map(item => (
                    <div key={item.id} className={styles.itemSelRow}>
                      <span className={styles.itemSelNombre}>{item.nombre}</span>
                      <span className={styles.itemSelCoste}>
                        {item.costeMin === 0 ? 'Sin coste' : `${formatCurrency(item.costeMin)}–${formatCurrency(item.costeMax)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <EducationalSection title="¿Qué ayudas existen para adaptar el hogar?" subtitle="IMSERSO, Plan de Vivienda y programas autonómicos">
        <p>Existen varias vías de financiación pública para adaptar el hogar a las necesidades de personas mayores o con discapacidad:</p>
        <h3>Plan Estatal de Vivienda</h3>
        <p>Contempla ayudas para la accesibilidad universal de viviendas y edificios. Las subvenciones pueden llegar al 40-80% del coste según el tipo de adaptación y la renta del solicitante.</p>
        <h3>Servicios Sociales municipales</h3>
        <p>Muchos ayuntamientos tienen programas propios de adaptación del hogar para mayores. Es el primer lugar donde consultar, ya que gestionan los recursos locales y autonómicos.</p>
        <h3>Prestaciones por dependencia</h3>
        <p>Si la persona tiene reconocido un Grado de Dependencia (I, II o III), puede acceder a la prestación vinculada al servicio de adaptación del entorno. Gestionar el reconocimiento de dependencia desbloquea múltiples ayudas.</p>
        <h3>IMSERSO</h3>
        <p>El IMSERSO y sus equivalentes autonómicos financian adaptaciones específicas (telealarma, ayudas técnicas, eliminación de barreras) para personas en situación de dependencia o vulnerabilidad.</p>
        <h3>Deducción IRPF</h3>
        <p>Las obras de accesibilidad en la vivienda habitual pueden generar deducciones autonómicas en la declaración de la renta. Consúltalo con la administración tributaria de tu comunidad.</p>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('adaptacion-hogar')} />
      <ShareCard appName="adaptacion-hogar" />
      <Footer appName="adaptacion-hogar" />
    </div>
  );
}
