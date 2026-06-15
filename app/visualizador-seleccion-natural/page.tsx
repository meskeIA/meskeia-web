'use client';
// @disclaimer: exempt

import { useState, useMemo, useCallback } from 'react';
import styles from './SeleccionNatural.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─────────────────────────────────────────────
// Tipos y constantes
// ─────────────────────────────────────────────

type Seccion = 'mecanismo' | 'ejemplos' | 'darwin-lamarck' | 'datos';

interface SeccionInfo {
  id: Seccion;
  titulo: string;
  icono: string;
  subtitulo: string;
}

const SECCIONES: SeccionInfo[] = [
  { id: 'mecanismo', titulo: 'El Mecanismo', icono: '⚙️', subtitulo: 'Los 4 pilares de Darwin' },
  { id: 'ejemplos', titulo: 'Ejemplos Clásicos', icono: '🦋', subtitulo: 'La evolución en acción' },
  { id: 'darwin-lamarck', titulo: 'Darwin vs Lamarck', icono: '🦒', subtitulo: 'Dos explicaciones, una correcta' },
  { id: 'datos', titulo: 'Datos Fascinantes', icono: '🧬', subtitulo: 'Curiosidades evolutivas' },
];

// ─── Pilares de la selección natural ───

interface Pilar {
  nombre: string;
  icono: string;
  descripcion: string;
  ejemplo: string;
}

const PILARES: Pilar[] = [
  { nombre: 'Variación', icono: '🎨', descripcion: 'Los individuos de una población son diferentes entre sí: color, tamaño, velocidad, resistencia...', ejemplo: 'En un grupo de escarabajos, algunos son verdes claros y otros verdes oscuros' },
  { nombre: 'Herencia', icono: '🧬', descripcion: 'Esas diferencias se transmiten de padres a hijos a través de los genes', ejemplo: 'Los escarabajos oscuros tienen crías oscuras; los claros, crías claras' },
  { nombre: 'Sobreproducción', icono: '📈', descripcion: 'Nacen más individuos de los que pueden sobrevivir con los recursos disponibles', ejemplo: 'Una pareja de escarabajos puede poner cientos de huevos, pero el entorno no los sostiene a todos' },
  { nombre: 'Selección', icono: '🏆', descripcion: 'Los mejor adaptados al entorno sobreviven más y se reproducen más', ejemplo: 'Si el suelo es oscuro, los escarabajos oscuros se camuflan y los pájaros se comen a los claros' },
];

// ─── Simulación de población ───

// Colores de individuos: verde (camuflado), rojo (visible), azul (visible)
const COLORES_INDIVIDUO = ['#4CAF50', '#E53935', '#1E88E5'];
const NOMBRES_COLOR = ['Verde (camuflado)', 'Rojo (visible)', 'Azul (visible)'];
const FONDO_HABITAT = '#2E7D32';

// Proporción por generación: [verde%, rojo%, azul%]
const GENERACIONES: number[][] = [
  [33, 34, 33],   // Gen 1: distribución uniforme
  [50, 28, 22],   // Gen 2: verdes empiezan a dominar
  [68, 18, 14],   // Gen 3: verdes dominan claramente
  [82, 10, 8],    // Gen 4: casi solo verdes
  [92, 5, 3],     // Gen 5: verdes dominan totalmente
];

function generarPoblacion(generacion: number): string[] {
  const proporciones = GENERACIONES[generacion];
  const poblacion: string[] = [];
  const total = 40;
  for (let i = 0; i < 3; i++) {
    const cantidad = Math.round((proporciones[i] / 100) * total);
    for (let j = 0; j < cantidad; j++) {
      poblacion.push(COLORES_INDIVIDUO[i]);
    }
  }
  // Ajustar al total exacto
  while (poblacion.length < total) poblacion.push(COLORES_INDIVIDUO[0]);
  while (poblacion.length > total) poblacion.pop();
  // Mezclar
  for (let i = poblacion.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [poblacion[i], poblacion[j]] = [poblacion[j], poblacion[i]];
  }
  return poblacion;
}

// ─── Ejemplos clásicos ───

interface EjemploClasico {
  id: string;
  titulo: string;
  icono: string;
  antes: string;
  presion: string;
  despues: string;
  explicacion: string;
  colorAntes: string;
  colorDespues: string;
}

const EJEMPLOS: EjemploClasico[] = [
  {
    id: 'polilla',
    titulo: 'Polilla del abedul',
    icono: '🦋',
    antes: 'Mayoría de polillas claras sobre troncos claros de abedul',
    presion: 'Revolución Industrial → hollín oscurece los troncos',
    despues: 'Las polillas oscuras se camuflan mejor → aumentan. Post-limpieza → vuelven las claras',
    explicacion: 'Biston betularia: el ejemplo más famoso de selección natural observada en tiempo real. El color del entorno cambió y con él la ventaja de cada variante.',
    colorAntes: '#E8E0D4',
    colorDespues: '#3E3E3E',
  },
  {
    id: 'pinzones',
    titulo: 'Pico de los pinzones',
    icono: '🐦',
    antes: 'Ancestro común llega a las Islas Galápagos',
    presion: 'Cada isla tiene diferente comida disponible',
    despues: 'Semillas duras → pico grueso. Insectos → pico fino y largo. Cactus → pico curvo',
    explicacion: 'Darwin observó que cada isla tenía pinzones con picos diferentes. La forma del pico se adaptó a la comida disponible en cada isla, un ejemplo de radiación adaptativa.',
    colorAntes: '#8D6E63',
    colorDespues: '#5D4037',
  },
  {
    id: 'antibioticos',
    titulo: 'Resistencia a antibióticos',
    icono: '🦠',
    antes: 'Población de bacterias sensibles al antibiótico',
    presion: 'Se aplica antibiótico → mueren casi todas... excepto una mutante resistente',
    despues: 'La resistente se reproduce sin competencia → toda la nueva población es resistente',
    explicacion: 'Por eso es crucial completar todo el tratamiento antibiótico. Si lo dejas a medias, las bacterias supervivientes (las más resistentes) se multiplican.',
    colorAntes: '#66BB6A',
    colorDespues: '#C62828',
  },
  {
    id: 'carrera',
    titulo: 'Guepardo vs gacela',
    icono: '🐆',
    antes: 'Depredador moderadamente rápido, presa moderadamente rápida',
    presion: 'Los guepardos más rápidos cazan más → se reproducen más. Las gacelas más rápidas escapan → se reproducen más',
    despues: 'Ambas especies evolucionan hacia mayor velocidad: carrera armamentística evolutiva',
    explicacion: 'La coevolución entre depredador y presa crea una "carrera armamentística" donde cada mejora en uno selecciona mejoras en el otro. Ninguno "gana" — ambos evolucionan.',
    colorAntes: '#FFA726',
    colorDespues: '#FF7043',
  },
];

// ─── Datos fascinantes ───

interface DatoFascinante {
  icono: string;
  titulo: string;
  dato: string;
  detalle: string;
}

const DATOS: DatoFascinante[] = [
  { icono: '🐛', titulo: '20 años de miedo', dato: 'Darwin tardó 20 años en publicar "El Origen de las Especies" (1859)', detalle: 'Temía la controversia religiosa y social. Solo publicó cuando Alfred Wallace llegó a conclusiones similares.' },
  { icono: '🦠', titulo: 'Evolución exprés', dato: 'Las bacterias pueden evolucionar resistencia a un antibiótico en días', detalle: 'Con generaciones de 20 minutos, millones de divisiones ocurren en horas. Una sola mutación resistente basta.' },
  { icono: '🐕', titulo: 'Del lobo al chihuahua', dato: 'Todos los perros domésticos descienden del lobo gris — selección ARTIFICIAL en 15.000 años', detalle: 'Los humanos seleccionaron rasgos deseados (tamaño, temperamento, habilidades) creando una diversidad enorme.' },
  { icono: '🌺', titulo: 'Flores y polinizadores', dato: 'Muchas flores evolucionaron colores y formas para atraer polinizadores específicos', detalle: 'Las flores rojas atraen colibríes, las nocturnas y blancas atraen polillas. Es coevolución mutualista.' },
  { icono: '🦤', titulo: 'Sin miedo = extinción', dato: 'En islas sin depredadores, algunos animales pierden el miedo', detalle: 'El dodo de Mauricio no temía a los humanos. Cuando llegaron los colonizadores, fue cazado hasta la extinción en menos de 100 años.' },
  { icono: '🧬', titulo: 'Seguimos evolucionando', dato: 'La evolución humana sigue: tolerancia a la lactosa (~10.000 años), resistencia a malaria', detalle: 'La mayoría de mamíferos adultos no digieren lactosa. Los europeos la toleran por selección en poblaciones ganaderas.' },
  { icono: '🐙', titulo: 'Ojos independientes', dato: 'El ojo del pulpo evolucionó independientemente del ojo humano', detalle: 'Convergencia evolutiva: el mismo "problema" (ver) produce soluciones similares en linajes muy distintos. El ojo del pulpo incluso carece de punto ciego.' },
];

// ─── Tipos de selección ───

interface TipoSeleccion {
  nombre: string;
  icono: string;
  definicion: string;
  ejemplo: string;
}

const TIPOS_SELECCION: TipoSeleccion[] = [
  { nombre: 'Selección natural', icono: '🌿', definicion: 'El entorno determina qué individuos sobreviven y se reproducen más', ejemplo: 'Polillas que se camuflan mejor en su entorno' },
  { nombre: 'Selección artificial', icono: '🧑‍🌾', definicion: 'Los humanos eligen qué individuos se reproducen según rasgos deseados', ejemplo: 'Criadores que cruzan los perros más grandes para obtener razas gigantes' },
  { nombre: 'Selección sexual', icono: '💃', definicion: 'Los individuos eligen pareja según rasgos atractivos, aunque no mejoren la supervivencia', ejemplo: 'La cola del pavo real: es un estorbo para sobrevivir, pero atrae hembras' },
];

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function SeleccionNaturalPage() {
  const [seccionActiva, setSeccionActiva] = useState<Seccion>('mecanismo');
  const [generacion, setGeneracion] = useState(0);
  const [ejemploActivo, setEjemploActivo] = useState<string | null>(null);
  const [datoActivo, setDatoActivo] = useState<string | null>(null);
  const [pilarActivo, setPilarActivo] = useState<string | null>(null);

  const poblacion = useMemo(() => generarPoblacion(generacion), [generacion]);
  const proporciones = GENERACIONES[generacion];

  const avanzarGeneracion = useCallback(() => {
    setGeneracion(g => Math.min(g + 1, GENERACIONES.length - 1));
  }, []);

  const retrocederGeneracion = useCallback(() => {
    setGeneracion(g => Math.max(g - 1, 0));
  }, []);

  const reiniciarSimulacion = useCallback(() => {
    setGeneracion(0);
  }, []);

  // ─── Sección 1: El Mecanismo ───

  const renderMecanismo = () => (
    <div className={styles.seccionContent}>
      <div className={styles.seccionHeader}>
        <h2 className={styles.seccionTitulo}>Los 4 pilares de la selección natural</h2>
        <p className={styles.seccionSubtitulo}>El mecanismo que Darwin descubrió para explicar la evolución</p>
      </div>

      <div className={styles.pilaresGrid}>
        {PILARES.map((pilar, i) => (
          <button
            key={pilar.nombre}
            className={`${styles.pilarCard} ${pilarActivo === pilar.nombre ? styles.pilarActivo : ''}`}
            onClick={() => setPilarActivo(pilarActivo === pilar.nombre ? null : pilar.nombre)}
            aria-pressed={pilarActivo === pilar.nombre}
          >
            <div className={styles.pilarNumero}>{i + 1}</div>
            <div className={styles.pilarIcono} aria-hidden="true">{pilar.icono}</div>
            <div className={styles.pilarNombre}>{pilar.nombre}</div>
            <div className={styles.pilarDesc}>{pilar.descripcion}</div>
            {pilarActivo === pilar.nombre && (
              <div className={styles.pilarEjemplo}>
                <strong>Ejemplo:</strong> {pilar.ejemplo}
              </div>
            )}
          </button>
        ))}
      </div>

      <div className={styles.insight}>
        <p><strong>Clave:</strong> La selección natural no tiene plan — no hay &quot;progreso&quot;, solo adaptación al entorno actual. Si el entorno cambia, lo que antes era ventaja puede volverse desventaja.</p>
      </div>

      {/* Simulación de población */}
      <div className={styles.simulacionZona}>
        <h3 className={styles.simulacionTitulo}>Simulación: camuflaje en acción</h3>
        <p className={styles.simulacionDesc}>
          Imagina una población de bichos de tres colores en un fondo verde. Los verdes se camuflan, los rojos y azules son devorados.
        </p>

        <div className={styles.habitatContenedor}>
          <div className={styles.habitatLabel}>
            <span aria-hidden="true">🌿</span> Hábitat (fondo verde) — Generación {generacion + 1} de {GENERACIONES.length}
          </div>
          <div className={styles.poblacionGrid} style={{ backgroundColor: FONDO_HABITAT }}>
            {poblacion.map((color, i) => (
              <div
                key={`${generacion}-${i}`}
                className={styles.individuo}
                style={{ backgroundColor: color }}
                aria-label={`Individuo color ${color === COLORES_INDIVIDUO[0] ? 'verde' : color === COLORES_INDIVIDUO[1] ? 'rojo' : 'azul'}`}
              />
            ))}
          </div>
        </div>

        <div className={styles.proporcionesGrid}>
          {NOMBRES_COLOR.map((nombre, i) => (
            <div key={nombre} className={styles.proporcionCard}>
              <div className={styles.proporcionColor} style={{ backgroundColor: COLORES_INDIVIDUO[i] }} />
              <div className={styles.proporcionNombre}>{nombre}</div>
              <div className={styles.proporcionValor}>{proporciones[i]}%</div>
            </div>
          ))}
        </div>

        <div className={styles.simulacionBotones}>
          <button
            onClick={retrocederGeneracion}
            disabled={generacion === 0}
            className={styles.btnSecundario}
            aria-label="Retroceder generación"
          >
            ← Anterior
          </button>
          <button
            onClick={reiniciarSimulacion}
            className={styles.btnSecundario}
            aria-label="Reiniciar simulación"
          >
            Reiniciar
          </button>
          <button
            onClick={avanzarGeneracion}
            disabled={generacion === GENERACIONES.length - 1}
            className={styles.btnPrimario}
            aria-label="Avanzar generación"
          >
            Siguiente generación →
          </button>
        </div>
      </div>
    </div>
  );

  // ─── Sección 2: Ejemplos Clásicos ───

  const renderEjemplos = () => (
    <div className={styles.seccionContent}>
      <div className={styles.seccionHeader}>
        <h2 className={styles.seccionTitulo}>Ejemplos clásicos de selección natural</h2>
        <p className={styles.seccionSubtitulo}>Casos reales que demuestran la evolución en acción</p>
      </div>

      <div className={styles.ejemplosGrid}>
        {EJEMPLOS.map(ej => (
          <button
            key={ej.id}
            className={`${styles.ejemploCard} ${ejemploActivo === ej.id ? styles.ejemploActivo : ''}`}
            onClick={() => setEjemploActivo(ejemploActivo === ej.id ? null : ej.id)}
            aria-pressed={ejemploActivo === ej.id}
          >
            <div className={styles.ejemploHeader}>
              <span className={styles.ejemploIcono} aria-hidden="true">{ej.icono}</span>
              <h3 className={styles.ejemploTitulo}>{ej.titulo}</h3>
            </div>

            <div className={styles.flujoEvolutivo}>
              <div className={styles.flujoEtapa}>
                <div className={styles.flujoCirculo} style={{ backgroundColor: ej.colorAntes }} />
                <div className={styles.flujoLabel}>Antes</div>
                <div className={styles.flujoTexto}>{ej.antes}</div>
              </div>
              <div className={styles.flujoFlecha} aria-hidden="true">→</div>
              <div className={styles.flujoEtapa}>
                <div className={styles.flujoCirculoPresion}>⚡</div>
                <div className={styles.flujoLabel}>Presión selectiva</div>
                <div className={styles.flujoTexto}>{ej.presion}</div>
              </div>
              <div className={styles.flujoFlecha} aria-hidden="true">→</div>
              <div className={styles.flujoEtapa}>
                <div className={styles.flujoCirculo} style={{ backgroundColor: ej.colorDespues }} />
                <div className={styles.flujoLabel}>Después</div>
                <div className={styles.flujoTexto}>{ej.despues}</div>
              </div>
            </div>

            {ejemploActivo === ej.id && (
              <div className={styles.ejemploDetalle}>
                <p>{ej.explicacion}</p>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  // ─── Sección 3: Darwin vs Lamarck ───

  const renderDarwinLamarck = () => (
    <div className={styles.seccionContent}>
      <div className={styles.seccionHeader}>
        <h2 className={styles.seccionTitulo}>Darwin vs Lamarck: la jirafa</h2>
        <p className={styles.seccionSubtitulo}>Dos explicaciones para el mismo fenómeno — solo una es correcta</p>
      </div>

      <div className={styles.comparativaGrid}>
        {/* Lamarck */}
        <div className={`${styles.comparativaCard} ${styles.comparativaIncorrecto}`}>
          <div className={styles.comparativaEtiqueta}>❌ INCORRECTO</div>
          <h3 className={styles.comparativaNombre}>Lamarck (1809)</h3>
          <div className={styles.comparativaSubtitulo}>Herencia de caracteres adquiridos</div>

          <div className={styles.comparativaPasos}>
            <div className={styles.paso}>
              <div className={styles.pasoNumero}>1</div>
              <div className={styles.pasoTexto}>Las jirafas estiraban el cuello para alcanzar las hojas altas</div>
            </div>
            <div className={styles.paso}>
              <div className={styles.pasoNumero}>2</div>
              <div className={styles.pasoTexto}>De tanto estirar, el cuello se alargó durante su vida</div>
            </div>
            <div className={styles.paso}>
              <div className={styles.pasoNumero}>3</div>
              <div className={styles.pasoTexto}>Ese cuello más largo se transmitió a las crías</div>
            </div>
          </div>

          <div className={styles.comparativaVeredicto}>
            <strong>Problema:</strong> Los rasgos adquiridos durante la vida NO se heredan. Si te cortas un dedo, tu hijo no nace sin ese dedo.
          </div>
        </div>

        {/* Darwin */}
        <div className={`${styles.comparativaCard} ${styles.comparativaCorrecto}`}>
          <div className={styles.comparativaEtiqueta}>✅ CORRECTO</div>
          <h3 className={styles.comparativaNombre}>Darwin (1859)</h3>
          <div className={styles.comparativaSubtitulo}>Selección natural</div>

          <div className={styles.comparativaPasos}>
            <div className={styles.paso}>
              <div className={styles.pasoNumero}>1</div>
              <div className={styles.pasoTexto}>Había jirafas con cuellos de distintas longitudes (variación natural)</div>
            </div>
            <div className={styles.paso}>
              <div className={styles.pasoNumero}>2</div>
              <div className={styles.pasoTexto}>Las de cuello más largo alcanzaban más comida → sobrevivían más</div>
            </div>
            <div className={styles.paso}>
              <div className={styles.pasoNumero}>3</div>
              <div className={styles.pasoTexto}>Transmitían sus genes de cuello largo → la población cambió</div>
            </div>
          </div>

          <div className={styles.comparativaVeredicto}>
            <strong>Clave:</strong> La variación ya existe ANTES de la necesidad. La selección natural solo &quot;filtra&quot; lo que ya hay.
          </div>
        </div>
      </div>

      <div className={styles.insight}>
        <p><strong>Error común:</strong> &quot;Evolución = mejora&quot;. No. Un parásito intestinal ciego está tan &quot;evolucionado&quot; como un águila — simplemente está adaptado a un entorno diferente. La evolución no tiene dirección ni meta.</p>
      </div>

      <div className={styles.contexto}>
        <strong>Otro error frecuente:</strong> &quot;Los animales evolucionan PARA sobrevivir&quot;. La evolución no tiene intención. Las mutaciones ocurren al azar — la selección natural solo retiene las que resultan útiles en ese entorno concreto.
      </div>
    </div>
  );

  // ─── Sección 4: Datos Fascinantes ───

  const renderDatos = () => (
    <div className={styles.seccionContent}>
      <div className={styles.seccionHeader}>
        <h2 className={styles.seccionTitulo}>Datos fascinantes sobre evolución</h2>
        <p className={styles.seccionSubtitulo}>Curiosidades que cambian la forma de ver la vida</p>
      </div>

      <div className={styles.datosGrid}>
        {DATOS.map(d => (
          <button
            key={d.titulo}
            className={`${styles.datoCard} ${datoActivo === d.titulo ? styles.datoActivo : ''}`}
            onClick={() => setDatoActivo(datoActivo === d.titulo ? null : d.titulo)}
            aria-pressed={datoActivo === d.titulo}
          >
            <div className={styles.datoHeader}>
              <span className={styles.datoIcono} aria-hidden="true">{d.icono}</span>
              <h3 className={styles.datoTitulo}>{d.titulo}</h3>
            </div>
            <p className={styles.datoTexto}>{d.dato}</p>
            {datoActivo === d.titulo && (
              <p className={styles.datoDetalle}>{d.detalle}</p>
            )}
          </button>
        ))}
      </div>

      {/* Tipos de selección */}
      <h3 className={styles.seccionTitulo} style={{ marginTop: '2rem', marginBottom: '1rem' }}>
        Tres tipos de selección
      </h3>

      <div className={styles.tiposGrid}>
        {TIPOS_SELECCION.map(tipo => (
          <div key={tipo.nombre} className={styles.tipoCard}>
            <div className={styles.tipoIcono} aria-hidden="true">{tipo.icono}</div>
            <div className={styles.tipoNombre}>{tipo.nombre}</div>
            <div className={styles.tipoDefinicion}>{tipo.definicion}</div>
            <div className={styles.tipoEjemplo}><strong>Ejemplo:</strong> {tipo.ejemplo}</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ─── Render de sección activa ───

  const renderSeccion = () => {
    switch (seccionActiva) {
      case 'mecanismo': return renderMecanismo();
      case 'ejemplos': return renderEjemplos();
      case 'darwin-lamarck': return renderDarwinLamarck();
      case 'datos': return renderDatos();
    }
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}><span aria-hidden="true">🧬</span> Selección Natural</h1>
          <p className={styles.subtitle}>El motor de la evolución: cómo la naturaleza &quot;elige&quot; sin elegir</p>
        </header>

        <LegalNotice />

        {/* Navegación por secciones */}
        <nav className={styles.navSecciones} aria-label="Secciones del explicador">
          {SECCIONES.map(s => (
            <button
              key={s.id}
              className={`${styles.navBtn} ${seccionActiva === s.id ? styles.navActivo : ''}`}
              onClick={() => setSeccionActiva(s.id)}
              aria-pressed={seccionActiva === s.id}
            >
              <span className={styles.navIcono} aria-hidden="true">{s.icono}</span>
              <span className={styles.navTexto}>{s.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Contenido de la sección activa */}
        {renderSeccion()}

        {/* Contenido educativo colapsable */}
        <EducationalSection
          title="📚 ¿Quieres profundizar más?"
          subtitle="Conceptos clave sobre evolución y selección natural"
        >
          <section className={styles.guideSection}>
            <h2>¿Qué es la selección natural?</h2>
            <p>
              La selección natural es el mecanismo principal de la evolución biológica, descrito por
              Charles Darwin en 1859. No es una fuerza ni una entidad — es simplemente el resultado
              de que los individuos mejor adaptados a su entorno sobreviven y se reproducen más que
              los menos adaptados.
            </p>

            <h2>¿Evolución significa &quot;mejora&quot;?</h2>
            <p>
              No. La evolución por selección natural solo significa adaptación a un entorno concreto.
              Si el entorno cambia, lo que antes era una ventaja puede convertirse en desventaja.
              Los parásitos que han perdido ojos y sistema digestivo están perfectamente adaptados
              a su nicho — no son &quot;peores&quot; que sus ancestros de vida libre.
            </p>

            <h2>¿Los humanos seguimos evolucionando?</h2>
            <p>
              Sí. La tolerancia a la lactosa en adultos (común en europeos) surgió hace unos 10.000 años
              con la domesticación del ganado. La resistencia a la malaria (rasgo de células falciformes)
              es más común en zonas endémicas. La evolución cultural es mucho más rápida que la biológica,
              pero la selección natural sigue actuando.
            </p>

            <div className={styles.warningBox}>
              <strong>Importante:</strong> La selección natural explica la diversidad de la vida, pero no tiene
              propósito ni dirección. &quot;Supervivencia del más apto&quot; no significa &quot;del más fuerte&quot; —
              significa del más adecuado para ese entorno específico en ese momento concreto.
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-seleccion-natural')} />
        <ShareCard appName="visualizador-seleccion-natural" />
        <Footer appName="visualizador-seleccion-natural" />
    </div>
  );
}
