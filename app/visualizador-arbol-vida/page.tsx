'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './ArbolVida.module.css';
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

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'arbol' | 'caracteristicas' | 'numeros' | 'historia';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'arbol', titulo: 'El Árbol', icono: '🌳', subtitulo: 'Ramas principales del reino animal' },
  { id: 'caracteristicas', titulo: 'Características', icono: '🔬', subtitulo: 'Hitos evolutivos por grupo' },
  { id: 'numeros', titulo: 'Números', icono: '📊', subtitulo: 'Cuántas especies hay' },
  { id: 'historia', titulo: 'Historia', icono: '⏳', subtitulo: '540 millones de años' },
];

// ─────────────────────────────────────────────
// Datos: Grupos animales
// ─────────────────────────────────────────────

interface GrupoAnimal {
  id: string;
  nombre: string;
  nombreCientifico: string;
  icono: string;
  ejemplo: string;
  rama: 'invertebrados' | 'vertebrados';
  especies: number;
  caracteristica: string;
  curioso: string;
}

const GRUPOS: GrupoAnimal[] = [
  // Invertebrados
  { id: 'esponjas', nombre: 'Esponjas', nombreCientifico: 'Poríferos', icono: '🧽', ejemplo: 'Esponja de mar', rama: 'invertebrados', especies: 9000, caracteristica: 'Los animales más simples: sin tejidos ni órganos', curioso: 'Pueden reconstruirse si las deshaces pasándolas por un colador' },
  { id: 'cnidarios', nombre: 'Cnidarios', nombreCientifico: 'Medusas, corales', icono: '🪸', ejemplo: 'Medusa luna', rama: 'invertebrados', especies: 11000, caracteristica: 'Células urticantes (cnidocitos) para cazar y defenderse', curioso: 'La medusa inmortal (Turritopsis dohrnii) puede revertir su edad y volver a ser joven' },
  { id: 'gusanos', nombre: 'Gusanos', nombreCientifico: 'Platelmintos, anélidos, nematodos', icono: '🪱', ejemplo: 'Lombriz de tierra', rama: 'invertebrados', especies: 50000, caracteristica: 'Tres tipos: planos, anillados (segmentados) y redondos', curioso: 'Las lombrices de tierra procesan 36 toneladas de suelo por hectárea al año' },
  { id: 'moluscos', nombre: 'Moluscos', nombreCientifico: 'Gastropoda, Cephalopoda, Bivalvia', icono: '🐙', ejemplo: 'Pulpo, caracol, mejillón', rama: 'invertebrados', especies: 85000, caracteristica: 'Cuerpo blando, muchos con concha protectora', curioso: 'El pulpo tiene 3 corazones, sangre azul y 500 millones de neuronas (como un perro)' },
  { id: 'artropodos', nombre: 'Artrópodos', nombreCientifico: 'Insectos, arácnidos, crustáceos', icono: '🦋', ejemplo: 'Mariposa, araña, cangrejo', rama: 'invertebrados', especies: 1200000, caracteristica: 'Exoesqueleto, patas articuladas: el grupo más diverso del planeta', curioso: 'Por cada humano hay 1.400 millones de insectos. Su biomasa total supera la de todos los mamíferos' },
  { id: 'equinodermos', nombre: 'Equinodermos', nombreCientifico: 'Asteroidea, Echinoidea', icono: '⭐', ejemplo: 'Estrella de mar, erizo', rama: 'invertebrados', especies: 7000, caracteristica: 'Simetría radial (5 brazos), esqueleto interno calcáreo', curioso: 'La estrella de mar puede regenerar un brazo completo, y el brazo a veces regenera el cuerpo' },
  // Vertebrados
  { id: 'peces', nombre: 'Peces', nombreCientifico: 'Condrictios y Osteíctios', icono: '🐟', ejemplo: 'Tiburón, atún, salmón', rama: 'vertebrados', especies: 35000, caracteristica: 'Branquias para respirar bajo el agua, aletas para moverse', curioso: 'El tiburón no tiene huesos: su esqueleto es 100% cartílago, como tu oreja' },
  { id: 'anfibios', nombre: 'Anfibios', nombreCientifico: 'Amphibia', icono: '🐸', ejemplo: 'Rana, salamandra', rama: 'vertebrados', especies: 8000, caracteristica: 'Doble vida: acuática de joven, terrestre de adulto. Piel permeable', curioso: 'La rana dorada panameña es tan venenosa que podría matar a 10 personas con un solo gramo' },
  { id: 'reptiles', nombre: 'Reptiles', nombreCientifico: 'Reptilia', icono: '🦎', ejemplo: 'Lagarto, tortuga, cocodrilo', rama: 'vertebrados', especies: 11000, caracteristica: 'Huevo amniótico: primera independencia total del agua', curioso: 'Los cocodrilos han sobrevivido 200 millones de años prácticamente sin cambiar de diseño' },
  { id: 'aves', nombre: 'Aves', nombreCientifico: 'Aves (Dinosauria)', icono: '🦅', ejemplo: 'Águila, colibrí, pingüino', rama: 'vertebrados', especies: 10000, caracteristica: 'Plumas, huesos huecos, sangre caliente. Descendientes de dinosaurios', curioso: 'El colibrí abeja pesa 1,8 g y late 1.200 veces por minuto. Es el ave más pequeña del mundo' },
  { id: 'mamiferos', nombre: 'Mamíferos', nombreCientifico: 'Mammalia', icono: '🐘', ejemplo: 'Elefante, delfín, murciélago', rama: 'vertebrados', especies: 6400, caracteristica: 'Pelo, glándulas mamarias, sangre caliente, neocórtex desarrollado', curioso: 'Los murciélagos son los únicos mamíferos que vuelan de verdad, y representan el 20% de todas las especies de mamíferos' },
];

// ─────────────────────────────────────────────
// Datos: Características evolutivas
// ─────────────────────────────────────────────

interface Caracteristica {
  id: string;
  nombre: string;
  icono: string;
  explicacion: string;
  ejemplo: string;
  // Valores por grupo (orden: esponjas, cnidarios, gusanos, moluscos, artrópodos, equinodermos | peces, anfibios, reptiles, aves, mamíferos)
  valores: string[];
}

const GRUPOS_TABLA = ['Esponjas', 'Cnidarios', 'Gusanos', 'Moluscos', 'Artrópodos', 'Equinod.'];
const GRUPOS_TABLA_2 = ['Peces', 'Anfibios', 'Reptiles', 'Aves', 'Mamíferos', '—'];

const CARACTERISTICAS: Caracteristica[] = [
  { id: 'simetria', nombre: 'Simetría', icono: '🔄', explicacion: 'Radial: se puede dividir en mitades iguales desde el centro (como una pizza). Bilateral: solo un plano divide en dos mitades simétricas (como tú).', ejemplo: 'Las medusas tienen simetría radial; los humanos, bilateral.', valores: ['Ninguna', 'Radial', 'Bilateral', 'Bilateral', 'Bilateral', 'Radial'] },
  { id: 'columna', nombre: 'Columna vertebral', icono: '🦴', explicacion: 'La columna vertebral es la estructura ósea que protege la médula espinal. Solo los vertebrados la tienen, lo que les permite mayor tamaño y complejidad.', ejemplo: 'Un insecto tiene exoesqueleto; un perro tiene columna vertebral.', valores: ['No', 'No', 'No', 'No', 'No', 'No'] },
  { id: 'esqueleto', nombre: 'Tipo de esqueleto', icono: '💀', explicacion: 'Exoesqueleto: armadura externa (artrópodos). Endoesqueleto: estructura interna (vertebrados). Algunos no tienen ninguno.', ejemplo: 'El cangrejo tiene exoesqueleto de quitina; tú tienes endoesqueleto de hueso.', valores: ['Ninguno', 'Ninguno', 'Ninguno', 'Concha', 'Exo', 'Endo'] },
  { id: 'respiracion', nombre: 'Respiración', icono: '🫁', explicacion: 'Branquias: captan oxígeno del agua. Pulmones: del aire. Tráqueas: tubos internos (insectos). Piel: difusión directa.', ejemplo: 'Los peces respiran por branquias; los insectos por tráqueas microscópicas.', valores: ['Difusión', 'Difusión', 'Piel', 'Branquias', 'Tráqueas', 'Branquias'] },
  { id: 'sangre', nombre: 'Sangre fría/caliente', icono: '🌡️', explicacion: 'Ectotermos (sangre fría): su temperatura depende del ambiente. Endotermos (sangre caliente): regulan su temperatura internamente, gastando mucha energía.', ejemplo: 'Un lagarto necesita tomar el sol para calentarse; un ratón genera su propio calor.', valores: ['—', 'Fría', 'Fría', 'Fría', 'Fría', 'Fría'] },
  { id: 'reproduccion', nombre: 'Reproducción', icono: '🥚', explicacion: 'Asexual: un solo individuo se reproduce (gemación, fragmentación). Sexual con huevos: fecundación externa o interna. Vivíparos: cría se desarrolla dentro de la madre.', ejemplo: 'Las esponjas pueden reproducirse por gemación; los mamíferos son en su mayoría vivíparos.', valores: ['Asexual', 'Ambas', 'Sexual', 'Sexual', 'Sexual', 'Sexual'] },
];

// Valores para la segunda fila (vertebrados)
const CARACT_VERTEBRADOS: Record<string, string[]> = {
  simetria: ['Bilateral', 'Bilateral', 'Bilateral', 'Bilateral', 'Bilateral', '—'],
  columna: ['Sí', 'Sí', 'Sí', 'Sí', 'Sí', '—'],
  esqueleto: ['Endo', 'Endo', 'Endo', 'Endo', 'Endo', '—'],
  respiracion: ['Branquias', 'Piel+Pulm', 'Pulmones', 'Pulmones', 'Pulmones', '—'],
  sangre: ['Fría', 'Fría', 'Fría', 'Caliente', 'Caliente', '—'],
  reproduccion: ['Huevos', 'Huevos', 'Huevos', 'Huevos', 'Vivíparos', '—'],
};

// ─────────────────────────────────────────────
// Datos: Números de especies
// ─────────────────────────────────────────────

interface EspeciesBarra {
  nombre: string;
  icono: string;
  cantidad: number;
  color: string;
}

const ESPECIES_DATA: EspeciesBarra[] = [
  { nombre: 'Insectos', icono: '🦋', cantidad: 1000000, color: '#E91E63' },
  { nombre: 'Arácnidos', icono: '🕷️', cantidad: 102000, color: '#9C27B0' },
  { nombre: 'Moluscos', icono: '🐙', cantidad: 85000, color: '#3F51B5' },
  { nombre: 'Gusanos', icono: '🪱', cantidad: 50000, color: '#795548' },
  { nombre: 'Peces', icono: '🐟', cantidad: 35000, color: '#2196F3' },
  { nombre: 'Reptiles', icono: '🦎', cantidad: 11000, color: '#4CAF50' },
  { nombre: 'Aves', icono: '🦅', cantidad: 10000, color: '#FF9800' },
  { nombre: 'Esponjas', icono: '🧽', cantidad: 9000, color: '#00BCD4' },
  { nombre: 'Anfibios', icono: '🐸', cantidad: 8000, color: '#8BC34A' },
  { nombre: 'Mamíferos', icono: '🐘', cantidad: 6400, color: '#F44336' },
];

// ─────────────────────────────────────────────
// Datos: Historia evolutiva
// ─────────────────────────────────────────────

interface EventoEvolutivo {
  id: string;
  fecha: string;
  fechaNum: number;
  titulo: string;
  descripcion: string;
  curioso: string;
}

const TIMELINE: EventoEvolutivo[] = [
  { id: 'cambrica', fecha: '540 Ma', fechaNum: 540, titulo: 'Explosión Cámbrica', descripcion: 'En apenas 20 millones de años aparecen casi todos los grandes grupos animales que existen hoy.', curioso: 'Antes de este evento, la vida llevaba 3.000 millones de años siendo microscópica.' },
  { id: 'vertebrados', fecha: '500 Ma', fechaNum: 500, titulo: 'Primeros vertebrados', descripcion: 'Peces sin mandíbula (agnatos) como las lampreas actuales. Primera columna vertebral.', curioso: 'La mandíbula no apareció hasta 100 millones de años después, transformada a partir de arcos branquiales.' },
  { id: 'anfibios', fecha: '370 Ma', fechaNum: 370, titulo: 'La conquista de la tierra', descripcion: 'Los primeros anfibios salen del agua. Tiktaalik: medio pez, medio anfibio, con "muñecas".', curioso: 'Tus manos son una versión modificada de las aletas de un pez que vivió hace 375 millones de años.' },
  { id: 'reptiles', fecha: '320 Ma', fechaNum: 320, titulo: 'El huevo amniótico', descripcion: 'Los reptiles inventan el huevo con cáscara: ya no necesitan agua para reproducirse.', curioso: 'Este "invento" fue tan exitoso que las aves aún lo usan 320 millones de años después.' },
  { id: 'dinosaurios', fecha: '230 Ma', fechaNum: 230, titulo: 'Dinosaurios y mamíferos', descripcion: 'Ambos grupos aparecen casi al mismo tiempo en el Triásico. Los dinosaurios dominaron; los mamíferos esperaron.', curioso: 'Los primeros mamíferos eran del tamaño de una musaraña y vivían de noche para evitar a los dinosaurios.' },
  { id: 'archaeopteryx', fecha: '150 Ma', fechaNum: 150, titulo: 'Archaeopteryx', descripcion: 'Fósil de transición entre dinosaurios y aves: tenía plumas pero también dientes y cola ósea.', curioso: 'Las aves no "descienden de los dinosaurios": SON dinosaurios. Un gorrión es un dinosaurio vivo.' },
  { id: 'extincion', fecha: '66 Ma', fechaNum: 66, titulo: 'La gran extinción', descripcion: 'Un asteroide de 12 km acaba con los dinosaurios no aviares. Los mamíferos ocupan los nichos vacíos.', curioso: 'Los mamíferos llevaban 165 millones de años siendo pequeños. Tardaron solo 10 millones en dominar tras la extinción.' },
  { id: 'hominidos', fecha: '7 Ma', fechaNum: 7, titulo: 'Primeros homínidos', descripcion: 'Se separa la línea evolutiva humana de la de los chimpancés en África.', curioso: 'Compartimos el 98,7% de nuestro ADN con los chimpancés. La diferencia está en qué genes se activan.' },
  { id: 'sapiens', fecha: '300.000 años', fechaNum: 0.3, titulo: 'Homo sapiens', descripcion: 'Nuestra especie aparece en África. Somos una rama muy reciente del árbol de la vida.', curioso: 'Si la historia de la vida fuera un día de 24 horas, los humanos apareceríamos en los últimos 4 segundos.' },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorArbolVidaPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('arbol');
  const [grupoSeleccionado, setGrupoSeleccionado] = useState<string | null>(null);
  const [caractSeleccionada, setCaractSeleccionada] = useState<string | null>(null);
  const [eventoSeleccionado, setEventoSeleccionado] = useState<string | null>(null);
  const [tablaVista, setTablaVista] = useState<'invertebrados' | 'vertebrados'>('invertebrados');

  const grupoActivo = GRUPOS.find(g => g.id === grupoSeleccionado);
  const caractActiva = CARACTERISTICAS.find(c => c.id === caractSeleccionada);
  const eventoActivo = TIMELINE.find(e => e.id === eventoSeleccionado);

  const maxEspecies = ESPECIES_DATA[0].cantidad;

  const invertebrados = GRUPOS.filter(g => g.rama === 'invertebrados');
  const vertebrados = GRUPOS.filter(g => g.rama === 'vertebrados');

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>🌳 El Árbol de la Vida Animal</h1>
          <p className={styles.subtitle}>De las esponjas a los mamíferos: 540 millones de años de evolución</p>
        </header>

        <LegalNotice />

        {/* Navegación de secciones */}
        <nav className={styles.navSecciones} aria-label="Secciones del visualizador">
          {SECCIONES.map(sec => (
            <button
              key={sec.id}
              className={`${styles.navBtn} ${seccionActiva === sec.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(sec.id)}
              aria-pressed={seccionActiva === sec.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{sec.icono}</span>
              <span className={styles.navTexto}>{sec.titulo}</span>
            </button>
          ))}
        </nav>

        <div className={styles.seccionHeader}>
          <h2 className={styles.seccionTitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.titulo}</h2>
          <p className={styles.seccionSubtitulo}>{SECCIONES.find(s => s.id === seccionActiva)?.subtitulo}</p>
        </div>

        {/* ═══════ SECCIÓN 1: EL ÁRBOL ═══════ */}
        {seccionActiva === 'arbol' && (
          <div className={styles.seccionContent}>
            <div className={styles.arbolContainer}>
              <div className={styles.raiz}>
                <span className={styles.raizLabel}>🧬 Ancestro común eucariota</span>
              </div>

              <div className={styles.ramasPrincipales}>
                {/* Invertebrados */}
                <div className={styles.rama}>
                  <div className={`${styles.ramaTitulo} ${styles.ramaInvertebrados}`}>
                    <span aria-hidden="true">🦑</span> Invertebrados (~97%)
                  </div>
                  <div className={styles.gruposList}>
                    {invertebrados.map(grupo => (
                      <button
                        key={grupo.id}
                        className={`${styles.grupoCard} ${grupoSeleccionado === grupo.id ? styles.grupoActivo : ''}`}
                        onClick={() => setGrupoSeleccionado(grupoSeleccionado === grupo.id ? null : grupo.id)}
                        aria-pressed={grupoSeleccionado === grupo.id}
                      >
                        <span className={styles.grupoIcono} aria-hidden="true">{grupo.icono}</span>
                        <div className={styles.grupoInfo}>
                          <div className={styles.grupoNombre}>{grupo.nombre}</div>
                          <div className={styles.grupoEjemplo}>{grupo.ejemplo}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vertebrados */}
                <div className={styles.rama}>
                  <div className={`${styles.ramaTitulo} ${styles.ramaVertebrados}`}>
                    <span aria-hidden="true">🦴</span> Vertebrados (~3%)
                  </div>
                  <div className={styles.gruposList}>
                    {vertebrados.map(grupo => (
                      <button
                        key={grupo.id}
                        className={`${styles.grupoCard} ${grupoSeleccionado === grupo.id ? styles.grupoActivo : ''}`}
                        onClick={() => setGrupoSeleccionado(grupoSeleccionado === grupo.id ? null : grupo.id)}
                        aria-pressed={grupoSeleccionado === grupo.id}
                      >
                        <span className={styles.grupoIcono} aria-hidden="true">{grupo.icono}</span>
                        <div className={styles.grupoInfo}>
                          <div className={styles.grupoNombre}>{grupo.nombre}</div>
                          <div className={styles.grupoEjemplo}>{grupo.ejemplo}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Panel detalle del grupo seleccionado */}
              {grupoActivo && (
                <div className={styles.panelDetalle}>
                  <div className={styles.panelHeader}>
                    <span className={styles.panelIcono} aria-hidden="true">{grupoActivo.icono}</span>
                    <div>
                      <div className={styles.panelNombre}>{grupoActivo.nombre}</div>
                      <div className={styles.panelSubgrupo}>{grupoActivo.nombreCientifico}</div>
                    </div>
                  </div>
                  <div className={styles.panelGrid}>
                    <div className={styles.panelStat}>
                      <div className={styles.panelStatLabel}>Especies estimadas</div>
                      <div className={styles.panelStatValor}>~{formatNumber(grupoActivo.especies, 0)}</div>
                    </div>
                    <div className={styles.panelStat}>
                      <div className={styles.panelStatLabel}>Ejemplo</div>
                      <div className={styles.panelStatValor}>{grupoActivo.ejemplo}</div>
                    </div>
                    <div className={styles.panelStat} style={{ gridColumn: '1 / -1' }}>
                      <div className={styles.panelStatLabel}>Característica clave</div>
                      <div className={styles.panelStatValor} style={{ fontSize: '0.88rem' }}>{grupoActivo.caracteristica}</div>
                    </div>
                  </div>
                  <div className={styles.panelCurioso}>
                    <span className={styles.panelCuriosoLabel}>💡 Dato curioso: </span>
                    {grupoActivo.curioso}
                  </div>
                </div>
              )}
            </div>

            <div className={styles.insight}>
              <p><strong>💡 Perspectiva:</strong> Los vertebrados —peces, aves, mamíferos, reptiles, anfibios— representan solo el 3% de las especies animales. El 97% restante son invertebrados, dominados por los artrópodos.</p>
            </div>
          </div>
        )}

        {/* ═══════ SECCIÓN 2: CARACTERÍSTICAS ═══════ */}
        {seccionActiva === 'caracteristicas' && (
          <div className={styles.seccionContent}>
            {/* Toggle invertebrados/vertebrados */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
              <button
                className={`${styles.navBtn} ${tablaVista === 'invertebrados' ? styles.navActivo : ''}`}
                onClick={() => setTablaVista('invertebrados')}
                aria-pressed={tablaVista === 'invertebrados'}
                style={{ flexDirection: 'row', gap: '0.4rem', padding: '0.5rem 1rem' }}
              >
                <span aria-hidden="true">🦑</span> Invertebrados
              </button>
              <button
                className={`${styles.navBtn} ${tablaVista === 'vertebrados' ? styles.navActivo : ''}`}
                onClick={() => setTablaVista('vertebrados')}
                aria-pressed={tablaVista === 'vertebrados'}
                style={{ flexDirection: 'row', gap: '0.4rem', padding: '0.5rem 1rem' }}
              >
                <span aria-hidden="true">🦴</span> Vertebrados
              </button>
            </div>

            <div className={styles.tablaCaracteristicas}>
              <div className={styles.tablaWrap}>
                <div className={styles.tablaHeader}>
                  <div className={styles.tablaHeaderCell}>Característica</div>
                  {(tablaVista === 'invertebrados' ? GRUPOS_TABLA : GRUPOS_TABLA_2).map(g => (
                    <div key={g} className={styles.tablaHeaderCell}>{g}</div>
                  ))}
                </div>

                {CARACTERISTICAS.map(caract => {
                  const valores = tablaVista === 'invertebrados' ? caract.valores : CARACT_VERTEBRADOS[caract.id];
                  return (
                    <div
                      key={caract.id}
                      className={`${styles.tablaFila} ${caractSeleccionada === caract.id ? styles.tablaFilaActiva : ''}`}
                      onClick={() => setCaractSeleccionada(caractSeleccionada === caract.id ? null : caract.id)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setCaractSeleccionada(caractSeleccionada === caract.id ? null : caract.id); }}}
                      role="button"
                      tabIndex={0}
                      aria-pressed={caractSeleccionada === caract.id}
                    >
                      <div className={styles.tablaLabel}>
                        <span className={styles.tablaLabelIcono} aria-hidden="true">{caract.icono}</span>
                        {caract.nombre}
                      </div>
                      {valores.map((val, i) => (
                        <div key={i} className={`${styles.tablaCell} ${val === 'Sí' || val === 'Caliente' ? styles.checkSi : ''} ${val === 'No' || val === '—' ? styles.checkNo : ''}`}>
                          {val}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Explicación de la característica seleccionada */}
            {caractActiva && (
              <div className={styles.explicacionCard}>
                <div className={styles.explicacionTitulo}>{caractActiva.icono} {caractActiva.nombre}</div>
                <p className={styles.explicacionTexto}>{caractActiva.explicacion}</p>
                <p className={styles.explicacionTexto} style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>
                  <strong>Ejemplo:</strong> {caractActiva.ejemplo}
                </p>
              </div>
            )}

            <div className={styles.insight} style={{ marginTop: '1.5rem' }}>
              <p><strong>💡 Clave:</strong> Solo las aves y los mamíferos son de sangre caliente (endotermos). Mantener la temperatura corporal cuesta mucha energía, pero permite actividad en cualquier clima.</p>
            </div>
          </div>
        )}

        {/* ═══════ SECCIÓN 3: NÚMEROS ═══════ */}
        {seccionActiva === 'numeros' && (
          <div className={styles.seccionContent}>
            <div className={styles.datoDestacado}>
              <div className={styles.datoNumero}>8,7M</div>
              <div className={styles.datoTexto}>
                Se estiman <strong>8,7 millones</strong> de especies animales en la Tierra, pero solo <strong>1,5 millones</strong> han sido descritas. Se descubren unas <strong>15.000 nuevas</strong> cada año.
              </div>
            </div>

            <div className={styles.barrasContainer}>
              {ESPECIES_DATA.map(esp => {
                const pctLog = (Math.log10(esp.cantidad) / Math.log10(maxEspecies)) * 100;
                return (
                  <div key={esp.nombre} className={styles.barraItem}>
                    <div className={styles.barraLabel}>
                      <span className={styles.barraIcono} aria-hidden="true">{esp.icono}</span>
                      <span className={styles.barraNombre}>{esp.nombre}</span>
                    </div>
                    <div className={styles.barraTrack}>
                      <div
                        className={styles.barraFill}
                        style={{ width: `${pctLog}%`, background: esp.color }}
                      >
                        <span className={styles.barraValor}>
                          {esp.cantidad >= 1000000 ? '1M' : formatNumber(esp.cantidad, 0)}
                        </span>
                      </div>
                    </div>
                    <span className={styles.barraValorExt}>{formatNumber(esp.cantidad, 0)} especies</span>
                  </div>
                );
              })}
            </div>

            <div className={styles.insight}>
              <p><strong>💡 Si los animales votaran:</strong> los insectos ganarían siempre. Con más de 1 millón de especies conocidas, representan el 80% de todos los animales. Los mamíferos —incluidos nosotros— apenas somos el 0,5%.</p>
            </div>

            <div className={styles.datoDestacado}>
              <div className={styles.datoNumero}>80%</div>
              <div className={styles.datoTexto}>
                De todas las especies animales conocidas son <strong>insectos</strong>. Los artrópodos en general (insectos + arácnidos + crustáceos) representan más del 85%.
              </div>
            </div>
          </div>
        )}

        {/* ═══════ SECCIÓN 4: HISTORIA EVOLUTIVA ═══════ */}
        {seccionActiva === 'historia' && (
          <div className={styles.seccionContent}>
            <div className={styles.timeline}>
              {TIMELINE.map(evento => (
                <div
                  key={evento.id}
                  className={`${styles.timelineEvento} ${eventoSeleccionado === evento.id ? styles.timelineActivo : ''}`}
                  onClick={() => setEventoSeleccionado(eventoSeleccionado === evento.id ? null : evento.id)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setEventoSeleccionado(eventoSeleccionado === evento.id ? null : evento.id); }}}
                  role="button"
                  tabIndex={0}
                  aria-pressed={eventoSeleccionado === evento.id}
                >
                  <div className={styles.timelineFecha}>{evento.fecha}</div>
                  <div className={styles.timelineTitulo}>{evento.titulo}</div>
                  <p className={styles.timelineDesc}>{evento.descripcion}</p>
                  {eventoSeleccionado === evento.id && (
                    <div className={styles.timelineCurioso}>
                      <span className={styles.timelineCuriosoLabel}>💡 Dato curioso: </span>
                      {evento.curioso}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.insight}>
              <p><strong>💡 Perspectiva:</strong> Los mamíferos y los dinosaurios aparecieron al mismo tiempo (hace 230 millones de años), pero los mamíferos esperaron 165 millones de años —pequeños y nocturnos— hasta que un asteroide les dio su oportunidad.</p>
            </div>
          </div>
        )}

        {/* Contenido educativo colapsable */}
        <EducationalSection
          title="📚 ¿Quieres aprender más?"
          subtitle="Conceptos clave sobre clasificación animal"
        >
          <section>
            <h2>¿Qué es la filogenia?</h2>
            <p>
              La filogenia es la ciencia que estudia las relaciones evolutivas entre las especies.
              El árbol filogenético es un diagrama que representa estas relaciones como ramas que
              divergen desde un ancestro común. No es una escalera de &quot;más simple a más complejo&quot;:
              cada especie actual está igualmente evolucionada, solo que adaptada a su nicho.
            </p>

            <h2>¿Cómo se clasifica a los animales?</h2>
            <p>
              La clasificación moderna combina la anatomía tradicional con el análisis de ADN.
              Los animales se organizan en filos (phyla), clases, órdenes, familias, géneros y
              especies. Los grandes grupos de este visualizador corresponden aproximadamente a
              filos y clases.
            </p>

            <h2>Vertebrados vs. invertebrados</h2>
            <p>
              La división más conocida es entre vertebrados (con columna vertebral) e invertebrados
              (sin ella). Pero esta distinción es engañosa: &quot;invertebrado&quot; no es un grupo natural,
              sino una categoría que agrupa a todos los que no son vertebrados, es decir, al 97%
              de los animales. Sería como dividir la música en &quot;rock&quot; y &quot;todo lo demás&quot;.
            </p>

            <h2>¿Por qué los insectos dominan?</h2>
            <p>
              Con más de 1 millón de especies descritas, los insectos son el grupo animal más diverso.
              Su éxito se debe a: tamaño pequeño (menos recursos), exoesqueleto protector, capacidad
              de volar (fueron los primeros animales en hacerlo, hace 350 millones de años), ciclos
              reproductivos rápidos y capacidad de adaptación a casi cualquier entorno terrestre.
            </p>

            <div className={styles.warningBox}>
              <strong>⚠️ Nota:</strong> Los números de especies son estimaciones basadas en la literatura
              científica actual. Las cifras reales pueden variar según la fuente consultada, y se
              descubren miles de especies nuevas cada año. Este visualizador tiene fines educativos
              y no sustituye a la bibliografía especializada.
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-arbol-vida')} />
        <ShareCard appName="visualizador-arbol-vida" />
        <Footer appName="visualizador-arbol-vida" />
    </div>
  );
}
