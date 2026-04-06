'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './VisualizadorEscalasTiempo.module.css';
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

// ─────────────────────────────────────────────
// Datos
// ─────────────────────────────────────────────

type Categoria = 'instante' | 'humano' | 'naturaleza' | 'geologico' | 'cosmico';

interface Fenomeno {
  nombre: string;
  icono: string;
  segundos: number;
  categoria: Categoria;
  explicacion: string;
}

const FENOMENOS: Fenomeno[] = [
  // Instantes
  { nombre: 'Un parpadeo', icono: '👁️', segundos: 0.3, categoria: 'instante', explicacion: 'Tus párpados se cierran y abren en 300 milisegundos. Parpadeas ~15.000 veces al día sin darte cuenta.' },
  { nombre: 'Un latido del corazón', icono: '❤️', segundos: 0.8, categoria: 'instante', explicacion: 'Un ciclo cardíaco completo: llenado, contracción y expulsión de sangre. ~100.000 veces al día.' },
  { nombre: 'La luz del sol llega a la Tierra', icono: '☀️', segundos: 499, categoria: 'instante', explicacion: '8 minutos y 19 segundos. Si el Sol se apagara ahora, no lo sabrías hasta dentro de 8 minutos.' },

  // Escala humana
  { nombre: 'Hervir agua para un café', icono: '☕', segundos: 180, categoria: 'humano', explicacion: '~3 minutos en hervidor eléctrico. Tiempo suficiente para que tu cerebro cambie de tarea 2-3 veces.' },
  { nombre: 'Un partido de fútbol', icono: '⚽', segundos: 5400, categoria: 'humano', explicacion: '90 minutos de juego. Pero con descanso, tiempo añadido y parones, estás frente a la tele ~2 horas.' },
  { nombre: 'Un vuelo Madrid–Nueva York', icono: '✈️', segundos: 30600, categoria: 'humano', explicacion: '~8,5 horas. En ese tiempo, la Tierra ha rotado 127° y la ISS ha dado 5,5 vueltas al planeta.' },
  { nombre: 'Una gestación humana', icono: '🤰', segundos: 23328000, categoria: 'humano', explicacion: '~270 días (9 meses). De una célula a un ser humano completo con 37 billones de células.' },
  { nombre: 'Amortizar una hipoteca a 25 años', icono: '🏠', segundos: 788400000, categoria: 'humano', explicacion: '25 años = 9.125 días = 300 cuotas mensuales. Cuando la termines, habrás pagado ~1,5 veces el precio de la casa en total.' },
  { nombre: 'Una vida humana media (España)', icono: '👤', segundos: 2587000000, categoria: 'humano', explicacion: '82 años. ~30.000 días. ~700.000 horas. En ese tiempo tu corazón habrá latido ~3.000 millones de veces.' },

  // Naturaleza
  { nombre: 'Un árbol crece hasta adulto', icono: '🌳', segundos: 946080000, categoria: 'naturaleza', explicacion: '~30 años para un roble o pino. Talarlo lleva 30 minutos. La asimetría temporal más brutal de la naturaleza cotidiana.' },
  { nombre: 'Degradación de una bolsa de plástico', icono: '🛍️', segundos: 6307200000, categoria: 'naturaleza', explicacion: '~200 años. Una bolsa que usas 15 minutos tarda 200 años en descomponerse. 100 millones de años de proporción.' },
  { nombre: 'Degradación de una botella de vidrio', icono: '🍾', segundos: 31536000000, categoria: 'naturaleza', explicacion: '~1.000 años. El vidrio es casi eterno en la naturaleza. Por eso reciclarlo es tan importante.' },
  { nombre: 'Degradación de una botella de plástico', icono: '🧴', segundos: 14200000000, categoria: 'naturaleza', explicacion: '~450 años. Cada botella de plástico que has usado en tu vida seguirá existiendo siglos después de tu muerte.' },

  // Geológico
  { nombre: 'Última glaciación', icono: '🧊', segundos: 315360000000, categoria: 'geologico', explicacion: 'Hace ~10.000 años. España estaba cubierta de hielo hasta el centro peninsular. Toda la civilización humana cabe en este periodo.' },
  { nombre: 'Extinción de los dinosaurios', icono: '🦕', segundos: 2082240000000000, categoria: 'geologico', explicacion: 'Hace 66 millones de años. Si la historia de la Tierra fuera un día de 24h, los dinosaurios se extinguieron a las 23:39.' },
  { nombre: 'Edad de la Tierra', icono: '🌍', segundos: 143000000000000000, categoria: 'geologico', explicacion: '4.540 millones de años. Los primeros 1.000 millones fueron roca fundida. La vida apareció hace ~3.800 millones de años.' },

  // Cósmico
  { nombre: 'Edad del universo', icono: '🌌', segundos: 435000000000000000, categoria: 'cosmico', explicacion: '13.800 millones de años desde el Big Bang. La humanidad existe desde hace ~0,001% de ese tiempo. Somos recién llegados.' },
];

const CATEGORIAS: { id: Categoria; nombre: string; color: string }[] = [
  { id: 'instante', nombre: 'Instantes', color: '#e74c3c' },
  { id: 'humano', nombre: 'Escala humana', color: '#2E86AB' },
  { id: 'naturaleza', nombre: 'Naturaleza', color: '#27ae60' },
  { id: 'geologico', nombre: 'Geológico', color: '#e67e22' },
  { id: 'cosmico', nombre: 'Cósmico', color: '#9b59b6' },
];

function formatTiempo(segundos: number): string {
  if (segundos < 1) return `${(segundos * 1000).toFixed(0)} ms`;
  if (segundos < 60) return `${segundos.toFixed(1)} segundos`;
  if (segundos < 3600) return `${(segundos / 60).toFixed(0)} minutos`;
  if (segundos < 86400) return `${(segundos / 3600).toFixed(1)} horas`;
  if (segundos < 31536000) return `${(segundos / 86400).toFixed(0)} días`;
  const anios = segundos / 31536000;
  if (anios < 1000) return `${formatNumber(anios, 0)} años`;
  if (anios < 1000000) return `${formatNumber(anios / 1000, 0)} mil años`;
  if (anios < 1000000000) return `${formatNumber(anios / 1000000, 0)} millones de años`;
  return `${formatNumber(anios / 1000000000, 1)} mil millones de años`;
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorEscalasTiempoPage() {
  const [categoriaActiva, setCategoriaActiva] = useState<Categoria | 'todas'>('todas');
  const [fenomenoActivo, setFenomenoActivo] = useState<string | null>(null);

  const fenomenosFiltrados = categoriaActiva === 'todas'
    ? FENOMENOS
    : FENOMENOS.filter(f => f.categoria === categoriaActiva);

  // Escala logarítmica para las barras
  const maxLog = Math.log10(FENOMENOS[FENOMENOS.length - 1].segundos);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>Cuánto Tarda el Mundo</h1>
          <p className={styles.subtitle}>De un parpadeo a la edad del universo — escalas de tiempo que desafían la intuición</p>
        </header>

        <LegalNotice />

        {/* Filtro por categoría */}
        <div className={styles.catNav}>
          <button
            type="button"
            className={`${styles.catBtn} ${categoriaActiva === 'todas' ? styles.catActiva : ''}`}
            onClick={() => setCategoriaActiva('todas')}
            aria-pressed={categoriaActiva === 'todas'}
          >
            Todas
          </button>
          {CATEGORIAS.map(c => (
            <button
              key={c.id}
              type="button"
              className={`${styles.catBtn} ${categoriaActiva === c.id ? styles.catActiva : ''}`}
              onClick={() => setCategoriaActiva(c.id)}
              style={{ borderColor: categoriaActiva === c.id ? c.color : undefined }}
              aria-pressed={categoriaActiva === c.id}
            >
              {c.nombre}
            </button>
          ))}
        </div>

        {/* Lista de fenómenos */}
        <div className={styles.fenomenosLista}>
          {fenomenosFiltrados.map(f => {
            const logVal = Math.log10(Math.max(f.segundos, 0.001));
            const pctBarra = Math.max(2, (logVal / maxLog) * 100);
            const catColor = CATEGORIAS.find(c => c.id === f.categoria)?.color ?? '#999';
            return (
              <div key={f.nombre} className={styles.fenomenoWrapper}>
                <button
                  type="button"
                  className={`${styles.fenomenoBtn} ${fenomenoActivo === f.nombre ? styles.fenomenoActivo : ''}`}
                  onClick={() => setFenomenoActivo(prev => prev === f.nombre ? null : f.nombre)}
                  aria-expanded={fenomenoActivo === f.nombre}
                >
                  <span className={styles.fenomenoIcono} aria-hidden="true">{f.icono}</span>
                  <div className={styles.fenomenoInfo}>
                    <span className={styles.fenomenoNombre}>{f.nombre}</span>
                    <div className={styles.fenomenoBarraFondo}>
                      <div
                        className={styles.fenomenoBarra}
                        style={{ width: `${pctBarra}%`, backgroundColor: catColor }}
                      />
                    </div>
                  </div>
                  <span className={styles.fenomenoTiempo} style={{ color: catColor }}>
                    {formatTiempo(f.segundos)}
                  </span>
                </button>
                {fenomenoActivo === f.nombre && (
                  <div className={styles.explicacion} style={{ borderLeftColor: catColor }}>
                    <p>{f.explicacion}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className={styles.comparaciones}>
          <h3 className={styles.compTitulo}>Comparaciones que cambian la perspectiva</h3>
          <div className={styles.compGrid}>
            <div className={styles.compCard}>
              <p className={styles.compTexto}>
                Una bolsa de plástico se usa <strong>15 minutos</strong> y tarda <strong>200 años</strong> en degradarse. Proporción: 1 a 7 millones.
              </p>
            </div>
            <div className={styles.compCard}>
              <p className={styles.compTexto}>
                Toda la historia humana escrita (5.000 años) es el <strong>0,00004%</strong> de la edad de la Tierra.
              </p>
            </div>
            <div className={styles.compCard}>
              <p className={styles.compTexto}>
                Tu corazón late <strong>100.000 veces al día</strong>. En 82 años: 3.000 millones de latidos sin descanso.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.insight}>
          <p>
            Las escalas temporales son contraintuitivas porque nuestro cerebro evolucionó para manejar
            minutos a décadas — no milisegundos ni millones de años. <strong>Visualizarlas es la única
            forma de comprenderlas realmente</strong>, porque los números solos no generan la misma intuición.
          </p>
        </div>

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Más perspectiva → <a href="/visualizador-mapa-tiempo/">El Mapa de tu Tiempo</a> · <a href="/visualizador-envejecimiento-cuerpo/">Cómo Envejece tu Cuerpo</a>
        </div>

        <EducationalSection
          title="El tiempo que no vemos"
          subtitle="Lo que las escalas temporales revelan"
          defaultOpen={false}
        >
          <h3>El plástico: nuestra herencia más duradera</h3>
          <p>
            Desde que se inventó el plástico (~1950), se han producido ~8.300 millones de toneladas.
            De ellas, el 60% sigue existiendo en vertederos o el medio ambiente. Una civilización
            futura que excavara nuestros restos encontraría una capa geológica de plástico — lo
            llaman el &quot;Plasticeno&quot;.
          </p>

          <h3>El calendario cósmico de Carl Sagan</h3>
          <p>
            Si comprimimos la edad del universo (13.800 millones de años) en un año: la Tierra se
            forma el 14 de septiembre, los dinosaurios se extinguen el 30 de diciembre, y toda la
            historia humana escrita ocurre en los <strong>últimos 14 segundos</strong> del 31 de diciembre.
          </p>

          <h3>¿Por qué el tiempo parece acelerarse con la edad?</h3>
          <p>
            A los 10 años, un año es el 10% de tu vida. A los 50, es el 2%. El cerebro mide el
            tiempo relativo a la experiencia acumulada: cada año nuevo es proporcionalmente menor.
            Además, con la edad procesamos menos información nueva, y el cerebro &quot;comprime&quot;
            las rutinas, haciendo que parezcan más cortas en retrospectiva.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los tiempos son aproximaciones divulgativas basadas en fuentes
            científicas generales. Los tiempos de degradación varían según condiciones ambientales,
            y las edades geológicas/cósmicas tienen márgenes de incertidumbre.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-escalas-tiempo')} />
        <ShareCard appName="visualizador-escalas-tiempo" />
        <Footer appName="visualizador-escalas-tiempo" />
      </div>
    </>
  );
}
