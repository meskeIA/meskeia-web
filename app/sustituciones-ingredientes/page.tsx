'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './SustitucionesIngredientes.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import {
  INGREDIENTES_SUSTITUIBLES,
  INGREDIENTE_SUSTITUIBLE_POR_ID,
  ETIQUETAS_DIETA,
  sustitucionesDe,
  type EtiquetaDieta,
} from '@/lib/calculadoras/sustitucionesCocina';

const FILTROS_DIETA: { id: EtiquetaDieta | null; etiqueta: string }[] = [
  { id: null, etiqueta: 'Todas' },
  { id: 'vegano', etiqueta: 'Vegano' },
  { id: 'sin-gluten', etiqueta: 'Sin gluten' },
  { id: 'sin-lactosa', etiqueta: 'Sin lactosa' },
];

export default function SustitucionesIngredientesPage() {
  const [ingredienteId, setIngredienteId] = useState('huevo');
  const [dieta, setDieta] = useState<EtiquetaDieta | null>(null);

  const ingrediente = INGREDIENTE_SUSTITUIBLE_POR_ID[ingredienteId];
  const sustituciones = useMemo(
    () => sustitucionesDe(ingredienteId, dieta),
    [ingredienteId, dieta],
  );

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Sustituciones de ingredientes</h1>
        <p className={styles.subtitle}>
          Se te acabó algo o adaptas la receta a vegana, sin gluten o sin lactosa: con qué
          cambiar cada ingrediente y en qué proporción
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        <section className={styles.panel} aria-label="Selección de ingrediente">
          <h2 className={styles.seccionTitulo}>¿Qué ingrediente te falta?</h2>
          <div className={styles.ingredientesGrid} role="group" aria-label="Ingrediente a sustituir">
            {INGREDIENTES_SUSTITUIBLES.map((ing) => (
              <button
                key={ing.id}
                type="button"
                aria-pressed={ingredienteId === ing.id}
                className={`${styles.ingBtn} ${ingredienteId === ing.id ? styles.ingBtnActivo : ''}`}
                onClick={() => setIngredienteId(ing.id)}
              >
                <span className={styles.ingEmoji} aria-hidden="true">{ing.emoji}</span>
                <span className={styles.ingNombre}>{ing.nombre}</span>
              </button>
            ))}
          </div>

          <div className={styles.filtroFila}>
            <span className={styles.filtroLabel}>Filtrar por dieta:</span>
            <div className={styles.filtroBtns} role="group" aria-label="Filtro por dieta">
              {FILTROS_DIETA.map((f) => (
                <button
                  key={f.etiqueta}
                  type="button"
                  aria-pressed={dieta === f.id}
                  className={`${styles.filtroBtn} ${dieta === f.id ? styles.filtroBtnActivo : ''}`}
                  onClick={() => setDieta(f.id)}
                >
                  {f.etiqueta}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Resultado */}
        <section className={styles.resultado} aria-live="polite">
          <div className={styles.resultadoHead}>
            <span className={styles.resultadoEmoji} aria-hidden="true">{ingrediente.emoji}</span>
            <div>
              <h2 className={styles.resultadoTitulo}>Sustituir {ingrediente.nombre.toLowerCase()}</h2>
              <p className={styles.resultadoContexto}>{ingrediente.contexto}</p>
            </div>
          </div>

          {sustituciones.length > 0 ? (
            <div className={styles.sustGrid}>
              {sustituciones.map((s) => (
                <article key={s.reemplazo} className={styles.sustCard}>
                  <h3 className={styles.sustReemplazo}>{s.reemplazo}</h3>
                  <p className={styles.sustProporcion}>{s.proporcion}</p>
                  <p className={styles.sustNotas}>{s.notas}</p>
                  {s.apto.length > 0 && (
                    <div className={styles.tags}>
                      {s.apto.map((a) => (
                        <span key={a} className={styles.tag}>{ETIQUETAS_DIETA[a]}</span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <p className={styles.sinResultados}>
              No hay un sustituto de {ingrediente.nombre.toLowerCase()} apto para esa dieta entre
              los recogidos. Prueba con el filtro «Todas» para ver todas las opciones.
            </p>
          )}
        </section>

        <p className={styles.fuenteNota}>
          Proporciones orientativas basadas en guías de repostería. Las sustituciones cambian algo
          la textura, el sabor o el dorado: úsalas como punto de partida y ajusta al gusto.
        </p>

        {/* Contenido educativo v2.0 */}
        <EducationalSection
          title="Cómo sustituir sin estropear la receta"
          subtitle="Qué función cumple cada ingrediente y cómo elegir el reemplazo adecuado"
        >
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Cada ingrediente hace varias cosas a la vez</h2>
              <p>
                Sustituir bien no es solo «cambiar A por B»: hay que entender qué papel cumple el
                ingrediente en la receta. El huevo, por ejemplo, liga, da humedad y ayuda a subir;
                según cuál de esas funciones sea la importante, el mejor sustituto cambia. La grasa
                aporta sabor, ternura y, a veces, estructura. El azúcar endulza pero también da
                humedad y dorado. Por eso una sustitución casi siempre altera algo del resultado, y
                conviene elegir el reemplazo pensando en qué función no puedes perder.
              </p>
            </div>

            <div className={styles.conceptoSection}>
              <h2>Las funciones más habituales</h2>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th scope="col">Ingrediente</th>
                    <th scope="col">Qué aporta</th>
                    <th scope="col">Qué vigilar al sustituir</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>Huevo</td><td>Ligar, humedad, subida</td><td>Que el sustituto ligue lo suficiente</td></tr>
                  <tr><td>Mantequilla</td><td>Grasa, sabor, estructura</td><td>Sólido vs. líquido (hojaldre necesita sólido)</td></tr>
                  <tr><td>Azúcar</td><td>Dulzor, humedad, dorado</td><td>Si es líquido, ajustar el resto de líquidos</td></tr>
                  <tr><td>Harina</td><td>Estructura (gluten)</td><td>Sin gluten necesita goma o mezcla 1:1</td></tr>
                  <tr><td>Leche</td><td>Líquido y algo de grasa</td><td>Bebida vegetal neutra para repostería</td></tr>
                </tbody>
              </table>
            </div>

            <div className={styles.conceptoSection}>
              <h2>Situaciones típicas</h2>
              <div className={styles.escenariosGrid}>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🌱</span>
                    <strong>Hacer una receta vegana</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    Cambia huevo por linaza o aquafaba, mantequilla por aceite o margarina vegetal y
                    leche por bebida de soja o avena. Activa el filtro «Vegano» para ver solo esas
                    opciones.
                  </p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🌾</span>
                    <strong>Cocinar sin gluten</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    La harina es lo difícil: usa una mezcla 1:1 con goma xantana. Para espesar, la
                    maicena va perfecta. Comprueba que la levadura y el resto sean sin gluten.
                  </p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🛒</span>
                    <strong>Se acabó a media receta</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    No hay suero de leche, polvo de hornear ni nata. Casi todo se improvisa con
                    despensa: leche con limón, bicarbonato con un ácido, leche evaporada fría.
                  </p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🥛</span>
                    <strong>Intolerancia a la lactosa</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    Sustituye leche y nata por sus versiones sin lactosa o vegetales. El filtro «Sin
                    lactosa» te deja solo las opciones compatibles.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Errores frecuentes al sustituir</strong>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Sustituir todo el huevo o toda la grasa.</strong> En recetas con 3 o más
                  huevos, reemplazarlos todos suele fallar; los sustitutos rinden mejor en pequeñas
                  cantidades.
                </li>
                <li>
                  <strong>No ajustar los líquidos.</strong> Cambiar azúcar por miel o sirope añade
                  líquido: hay que reducir el resto para que la masa no quede aguada.
                </li>
                <li>
                  <strong>Esperar gluten donde no lo hay.</strong> Las harinas sin gluten necesitan
                  goma xantana o una mezcla preparada; sin ella, la masa se desmiga.
                </li>
                <li>
                  <strong>Usar aceite donde hace falta grasa sólida.</strong> El hojaldre, las
                  galletas con forma o los cremados necesitan mantequilla o margarina sólida.
                </li>
                <li>
                  <strong>No probar antes de servir.</strong> Toda sustitución cambia algo; haz una
                  tanda pequeña la primera vez y ajusta a partir de ahí.
                </li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('sustituciones-ingredientes')} />
      <ShareCard appName="sustituciones-ingredientes" />
      <Footer appName="sustituciones-ingredientes" />
    </div>
  );
}
