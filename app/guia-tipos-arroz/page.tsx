'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  arroces,
  normalizarTexto,
  NIVELES_ALMIDON,
  REGIONES,
  TIPOS_GRANO,
  TOTAL_VARIEDADES,
  USOS,
  type NivelAlmidon,
  type RegionArroz,
  type TipoGrano,
  type UsoCulinario,
} from './arroces';
import styles from './GuiaTiposArroz.module.css';

// ============= Componente principal =============

export default function GuiaTiposArrozPage() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroGrano, setFiltroGrano] = useState<TipoGrano | ''>('');
  const [filtroAlmidon, setFiltroAlmidon] = useState<NivelAlmidon | ''>('');
  const [filtroRegion, setFiltroRegion] = useState<RegionArroz | ''>('');
  const [filtroUso, setFiltroUso] = useState<UsoCulinario | ''>('');

  const arrocesFiltrados = useMemo(() => {
    // Se normalizan los DOS lados: quien teclea «jazmin» busca lo mismo que quien teclea «jazmín».
    const q = normalizarTexto(busqueda.trim());

    return arroces.filter((arroz) => {
      if (filtroGrano && arroz.tipoGrano !== filtroGrano) return false;
      if (filtroAlmidon && arroz.almidon !== filtroAlmidon) return false;
      if (filtroRegion && arroz.region !== filtroRegion) return false;
      if (filtroUso && !arroz.usosIdeales.includes(filtroUso)) return false;

      if (q) {
        const buscable = normalizarTexto(
          [
            arroz.nombre,
            arroz.nombreOriginal,
            arroz.origen,
            arroz.descripcion,
            ...arroz.platosTipicos,
            ...arroz.caracteristicas,
          ].join(' '),
        );

        if (!buscable.includes(q)) return false;
      }

      return true;
    });
  }, [busqueda, filtroGrano, filtroAlmidon, filtroRegion, filtroUso]);

  const resetearFiltros = () => {
    setBusqueda('');
    setFiltroGrano('');
    setFiltroAlmidon('');
    setFiltroRegion('');
    setFiltroUso('');
  };

  const hayFiltrosActivos =
    busqueda !== '' ||
    filtroGrano !== '' ||
    filtroAlmidon !== '' ||
    filtroRegion !== '' ||
    filtroUso !== '';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">
          🍚
        </span>
        <h1>Guía de Tipos de Arroz del Mundo</h1>
        <p>
          {TOTAL_VARIEDADES} variedades de arroz: tipo de grano, origen, tiempo de
          cocción, proporción de agua y uso culinario ideal. Aprende a elegir el arroz
          perfecto para cada plato.
        </p>
      </header>

      <LegalNotice />

      {/* De dónde salen la proporción y el tiempo: la promesa del h1 no puede ir sin esto. */}
      <p className={styles.notaMetodo}>
        <strong>Cómo leer la proporción de agua:</strong> cada ficha indica el método de
        cocción al que corresponde su proporción, porque no es lo mismo una absorción en
        olla tapada que una paella (recipiente ancho, mucha evaporación), un risotto con
        caldo añadido en cazos o una cocción al vapor. Las cifras son puntos de partida
        orientativos tomados de la práctica culinaria habitual de cada variedad, no de una
        fuente normativa ni de un análisis de laboratorio: varían con el recipiente, el
        ajuste de la tapa y la potencia del fuego, así que conviene probar y ajustar.
      </p>

      {/* ============= Controles ============= */}
      <section className={styles.controlsWrapper} aria-label="Filtros de arroces">
        <div className={styles.searchBox}>
          <span className={styles.searchIcon} aria-hidden="true">
            🔍
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar por nombre, origen o plato típico..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar arroz"
          />
        </div>

        <div className={styles.filtersGrid}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="filtro-grano">
              Tipo de grano
            </label>
            <select
              id="filtro-grano"
              className={styles.filterSelect}
              value={filtroGrano}
              onChange={(e) => setFiltroGrano(e.target.value as TipoGrano | '')}
            >
              <option value="">Todos</option>
              {TIPOS_GRANO.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="filtro-almidon">
              Nivel de almidón
            </label>
            <select
              id="filtro-almidon"
              className={styles.filterSelect}
              value={filtroAlmidon}
              onChange={(e) => setFiltroAlmidon(e.target.value as NivelAlmidon | '')}
            >
              <option value="">Todos</option>
              {NIVELES_ALMIDON.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="filtro-region">
              Región
            </label>
            <select
              id="filtro-region"
              className={styles.filterSelect}
              value={filtroRegion}
              onChange={(e) => setFiltroRegion(e.target.value as RegionArroz | '')}
            >
              <option value="">Todas</option>
              {REGIONES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel} htmlFor="filtro-uso">
              Uso culinario
            </label>
            <select
              id="filtro-uso"
              className={styles.filterSelect}
              value={filtroUso}
              onChange={(e) => setFiltroUso(e.target.value as UsoCulinario | '')}
            >
              <option value="">Todos</option>
              {USOS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {hayFiltrosActivos && (
          <button
            type="button"
            onClick={resetearFiltros}
            className={styles.resetBtn}
            aria-label="Limpiar todos los filtros"
          >
            Limpiar filtros
          </button>
        )}

        {/* Región viva: quien usa lector de pantalla tiene que enterarse de que el listado
            acaba de pasar de 27 fichas a 9, o a ninguna. */}
        <p className={styles.counter} role="status" aria-live="polite">
          Mostrando{' '}
          <span className={styles.counterStrong}>{arrocesFiltrados.length}</span> de{' '}
          <span className={styles.counterStrong}>{TOTAL_VARIEDADES}</span> variedades de
          arroz
        </p>
      </section>

      {/* ============= Grid de tarjetas ============= */}
      {arrocesFiltrados.length > 0 ? (
        <section className={styles.cardsGrid} aria-label="Listado de variedades de arroz">
          {arrocesFiltrados.map((arroz) => (
            <article key={arroz.nombre} className={styles.card}>
              <header className={styles.cardHeader}>
                <h2 className={styles.cardName}>{arroz.nombre}</h2>
                <p className={styles.cardOriginal}>{arroz.nombreOriginal}</p>
              </header>

              <div className={styles.badgesRow}>
                <span className={`${styles.badge} ${styles.badgeGrano}`}>
                  Grano {arroz.tipoGrano.toLowerCase()}
                </span>
                <span className={`${styles.badge} ${styles.badgeRegion}`}>
                  {arroz.region}
                </span>
                <span className={`${styles.badge} ${styles.badgeAlmidon}`}>
                  Almidón: {arroz.almidon}
                </span>
              </div>

              <div className={styles.cookingInfo}>
                <div className={styles.cookingItem}>
                  <span className={styles.cookingLabel}>Tiempo cocción</span>
                  <span className={styles.cookingValue}>{arroz.tiempoCoccion}</span>
                </div>
                <div className={styles.cookingItem}>
                  <span className={styles.cookingLabel}>Proporción agua</span>
                  <span className={styles.cookingValue}>{arroz.proporcionAgua}</span>
                </div>
                <div className={styles.cookingItem}>
                  <span className={styles.cookingLabel}>Método de cocción</span>
                  <span className={styles.cookingValue}>{arroz.metodoCoccion}</span>
                </div>
                <div className={styles.cookingItem}>
                  <span className={styles.cookingLabel}>Origen</span>
                  <span className={styles.cookingValue}>{arroz.origen}</span>
                </div>
              </div>

              <div className={styles.section}>
                <p className={styles.sectionTitle}>Usos ideales</p>
                <div className={styles.usosRow}>
                  {arroz.usosIdeales.map((uso) => (
                    <span key={uso} className={styles.usoPill}>
                      {uso}
                    </span>
                  ))}
                </div>
              </div>

              <div className={styles.section}>
                <p className={styles.sectionTitle}>Platos típicos</p>
                <ul className={styles.platosList}>
                  {arroz.platosTipicos.map((plato) => (
                    <li key={plato}>{plato}</li>
                  ))}
                </ul>
              </div>

              <div className={styles.section}>
                <p className={styles.sectionTitle}>Características</p>
                <ul className={styles.caractList}>
                  {arroz.caracteristicas.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>

              <p className={styles.descripcion}>{arroz.descripcion}</p>

              <p className={styles.curiosidad}>
                <span className={styles.curiosidadLabel}>Curiosidad:</span>
                {arroz.curiosidad}
              </p>
            </article>
          ))}
        </section>
      ) : (
        <div className={styles.emptyState} role="status">
          <span className={styles.emptyIcon} aria-hidden="true">
            🔎
          </span>
          <p className={styles.emptyTitle}>No se encontraron arroces</p>
          <p className={styles.emptyText}>
            Prueba a cambiar los filtros o limpia la búsqueda para ver todas las
            variedades.
          </p>
        </div>
      )}

      {/* ============= Sección educativa ============= */}
      <EducationalSection
        title="Guía de Tipos de Arroz"
        subtitle={`Aprende a elegir el arroz correcto para cada plato: ${TOTAL_VARIEDADES} variedades del mundo, su origen, características y uso ideal`}
      >
        <p className={styles.eduIntro}>
          El arroz es el cereal más consumido del mundo y existen miles de variedades.
          Elegir el correcto marca la diferencia entre una paella perfecta, un risotto
          cremoso o un sushi que se mantiene en su forma. La clave está en el
          <strong> tipo de grano</strong> (largo, medio, corto, glutinoso) y en el{' '}
          <strong>nivel de almidón</strong>: a más almidón, más cremosidad y
          pegajosidad.
        </p>

        <h3 className={styles.eduSubtitle}>Tabla comparativa de variedades clave</h3>
        <p className={styles.eduNota}>
          La proporción de agua solo significa algo junto al método: la columna de la
          derecha dice a qué forma de cocer corresponde cada cifra.
        </p>
        <div className={styles.tablaWrapper}>
          <table className={styles.tabla}>
            <thead>
              <tr>
                <th>Variedad</th>
                <th>Grano</th>
                <th>Almidón</th>
                <th>Mejor uso</th>
                <th>Proporción agua</th>
                <th>Método</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basmati</td>
                <td>Largo</td>
                <td>Bajo</td>
                <td>Curry, pilaf</td>
                <td>1:1.5</td>
                <td>Absorción en olla tapada</td>
              </tr>
              <tr>
                <td>Jazmín</td>
                <td>Largo</td>
                <td>Medio</td>
                <td>Cocina tailandesa</td>
                <td>1:1.5</td>
                <td>Absorción en olla tapada</td>
              </tr>
              <tr>
                <td>Bomba</td>
                <td>Corto</td>
                <td>Alto</td>
                <td>Paella valenciana</td>
                <td>1:2.5-3</td>
                <td>Paella: evaporación en recipiente ancho</td>
              </tr>
              <tr>
                <td>Carnaroli</td>
                <td>Corto</td>
                <td>Muy alto</td>
                <td>Risotto</td>
                <td>1:3 aprox., en cazos</td>
                <td>Risotto: caldo caliente añadido en cazos</td>
              </tr>
              <tr>
                <td>Arborio</td>
                <td>Corto</td>
                <td>Muy alto</td>
                <td>Risotto, arroz con leche</td>
                <td>1:3 aprox., en cazos</td>
                <td>Risotto: caldo caliente añadido en cazos</td>
              </tr>
              <tr>
                <td>Sushi (Koshihikari)</td>
                <td>Corto</td>
                <td>Alto</td>
                <td>Sushi, onigiri</td>
                <td>1:1.2</td>
                <td>Absorción en olla tapada, con reposo</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 className={styles.eduSubtitle}>Casos de uso por tipo de cocinero</h3>
        <div className={styles.casosGrid}>
          <div className={styles.casoCard}>
            <h4 className={styles.casoTitle}>Cocinero principiante</h4>
            <p className={styles.casoText}>
              Empieza con <strong>basmati</strong> (granos sueltos, indulgente con la
              cocción) y <strong>arroz blanco largo</strong> para acompañar guisos.
              Proporción 1:2 y olla con tapa: imposible fallar.
            </p>
          </div>
          <div className={styles.casoCard}>
            <h4 className={styles.casoTitle}>Aficionado a las paellas</h4>
            <p className={styles.casoText}>
              Para paella seca usa <strong>Bomba</strong> (más caro, no se pasa) o{' '}
              <strong>Senia</strong> (más económico, día a día). Para arroz caldoso
              prefiere <strong>Bahía</strong>: equilibrio perfecto.
            </p>
          </div>
          <div className={styles.casoCard}>
            <h4 className={styles.casoTitle}>Sushi casero</h4>
            <p className={styles.casoText}>
              Compra <strong>arroz de sushi japonés</strong> (Koshihikari o equivalente)
              o <strong>Calrose</strong>. Lava muy bien hasta que el agua salga clara.
              Aliñar con vinagre de arroz, azúcar y sal.
            </p>
          </div>
          <div className={styles.casoCard}>
            <h4 className={styles.casoTitle}>Postres y arroz con leche</h4>
            <p className={styles.casoText}>
              Usa <strong>Arborio</strong> o <strong>arroz redondo</strong>: su almidón
              da la cremosidad necesaria sin añadir nata. Para mango sticky rice usa{' '}
              <strong>arroz glutinoso</strong> y leche de coco.
            </p>
          </div>
        </div>

        <h3 className={styles.eduSubtitle}>Preguntas frecuentes</h3>
        <div className={styles.faqList}>
          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>
              ¿Por qué se pega el arroz al cocinarlo?
            </p>
            <p className={styles.faqAnswer}>
              El almidón superficial es el responsable. Si quieres granos sueltos
              (basmati, jazmín), lávalo 2-3 veces hasta que el agua salga clara. Si
              quieres pegajosidad (sushi, risotto), no lo laves o lávalo solo una vez.
            </p>
          </div>
          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>
              ¿Qué arroz puedo usar en lugar de Bomba para una paella?
            </p>
            <p className={styles.faqAnswer}>
              <strong>Senia</strong> y <strong>Bahía</strong> son las mejores
              alternativas. Si solo tienes arroz redondo común, reduce el caldo (proporción
              1:2 en vez de 1:2.5-3) y vigila para que no se pase.
            </p>
          </div>
          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>
              ¿El arroz integral es mejor que el blanco?
            </p>
            <p className={styles.faqAnswer}>
              Nutricionalmente aporta más: conserva el salvado y el germen, con más fibra,
              vitaminas del grupo B y minerales. Pero requiere más cocción (35-45 min) y
              agua (1:2.5). Para platos donde importa la textura (risotto, sushi, paella),
              el blanco es imprescindible.
            </p>
          </div>
          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>
              ¿Cuál es la diferencia entre Arborio y Carnaroli?
            </p>
            <p className={styles.faqAnswer}>
              Ambos son arroces para risotto del norte de Italia. <strong>Arborio</strong>{' '}
              es más común y económico, libera mucho almidón. <strong>Carnaroli</strong> es
              más caro pero mantiene mejor el dente al final, por eso lo prefieren muchas
              cocinas profesionales.
            </p>
          </div>
          <div className={styles.faqItem}>
            <p className={styles.faqQuestion}>
              ¿El arroz glutinoso contiene gluten?
            </p>
            <p className={styles.faqAnswer}>
              No. A pesar del nombre, el arroz glutinoso (sticky rice) no contiene gluten
              en el sentido estricto. Se llama así por su pegajosidad, debida a un tipo
              específico de almidón (amilopectina). Es apto para celíacos.
            </p>
          </div>
        </div>

        <h3 className={styles.eduSubtitle}>Cómo cocinar arroz perfecto: paso a paso</h3>
        <ol className={styles.pasosList}>
          <li>
            <strong>Mide el arroz y el agua según la variedad y el método.</strong>{' '}
            Basmati 1:1.5, blanco común 1:2, integral 1:2.5, todos por absorción en olla
            tapada. La proporción correcta es la diferencia entre el éxito y el fracaso.
          </li>
          <li>
            <strong>Lava el grano si quieres granos sueltos.</strong> Pasa el arroz por
            agua fría removiendo con la mano hasta que el agua salga casi clara (2-3
            veces). Este paso elimina el almidón superficial.
          </li>
          <li>
            <strong>Calienta el agua o caldo antes de añadir el arroz.</strong> Llevar
            el agua a ebullición primero acelera la cocción y permite controlar mejor
            el tiempo total.
          </li>
          <li>
            <strong>Cocina con la tapa puesta a fuego mínimo.</strong> Tras añadir el
            arroz, baja el fuego al mínimo, tapa y no levantes la tapa: el vapor es
            esencial. Cuece el tiempo indicado por la variedad.
          </li>
          <li>
            <strong>Reposa 5-10 minutos antes de servir.</strong> Al apagar el fuego,
            deja la olla tapada otros 5-10 minutos. Este reposo redistribuye la humedad
            y termina la cocción del centro del grano.
          </li>
        </ol>

        <h3 className={styles.eduSubtitle}>Tips de chef</h3>
        <ul className={styles.tipsList}>
          <li>
            <strong>Lavar antes, no después:</strong> el lavado solo tiene sentido antes
            de cocinar. Lavar el arroz cocido elimina los nutrientes y arruina la
            textura.
          </li>
          <li>
            <strong>El risotto NO se lava:</strong> el almidón superficial del Arborio o
            Carnaroli es lo que crea la cremosidad. Lavarlo arruinaría el plato.
          </li>
          <li>
            <strong>Remueve el risotto, NUNCA la paella:</strong> en risotto se remueve
            constantemente para liberar almidón. En paella, jamás se remueve después
            de añadir el arroz — se rompe el socarrat.
          </li>
          <li>
            <strong>Conserva el arroz cocido en frío rápido:</strong> el arroz cocido
            puede desarrollar Bacillus cereus a temperatura ambiente. Refrigéralo en
            menos de 1 hora y consúmelo en 24-48h.
          </li>
          <li>
            <strong>Añade un chorro de aceite o mantequilla:</strong> al final de la
            cocción del arroz blanco, una cucharada de aceite o mantequilla mejora el
            sabor y evita que se pegue al servir.
          </li>
        </ul>

        <div className={styles.warningBox}>
          <h4>Errores comunes a evitar</h4>
          <ul>
            <li>
              <strong>Agua insuficiente:</strong> el arroz queda crudo en el centro y se
              quema en el fondo. Usa siempre la proporción correcta de la variedad.
            </li>
            <li>
              <strong>Aplicar la proporción de otro método:</strong> el 1:2.5-3 del Bomba
              cuenta con la evaporación de una paellera ancha y descubierta. Esa misma
              cantidad de agua en una olla tapada deja el arroz sopa.
            </li>
            <li>
              <strong>Levantar la tapa durante la cocción:</strong> pierde el vapor
              acumulado, baja la temperatura y altera el tiempo total. Resiste la
              tentación.
            </li>
            <li>
              <strong>Usar el arroz incorrecto para el plato:</strong> hacer paella con
              arroz basmati o sushi con arroz largo da resultados decepcionantes. Cada
              variedad tiene su uso.
            </li>
            <li>
              <strong>No respetar el reposo final:</strong> servir el arroz inmediatamente
              después de apagar el fuego deja el centro del grano duro. Esos 5-10
              minutos finales son cruciales.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('guia-tipos-arroz')} />

      <ShareCard appName="guia-tipos-arroz" />

      <Footer appName="guia-tipos-arroz" />
    </div>
  );
}
