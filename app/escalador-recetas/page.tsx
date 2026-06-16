'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './EscaladorRecetas.module.css';
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
  escalarReceta,
  type CategoriaIngrediente,
  type IngredienteEscalado,
} from '@/lib/calculadoras/cocina';

// ─── Tipos locales ────────────────────────────────────────────────────────────

interface FilaIngrediente {
  id: number;
  nombre: string;
  cantidad: string;
  unidad: string;
  categoria: CategoriaIngrediente;
}

const CATEGORIAS_INFO: Record<CategoriaIngrediente, { etiqueta: string; descripcion: string }> = {
  normal:           { etiqueta: 'Normal',           descripcion: 'Escala linealmente' },
  levadura:         { etiqueta: 'Levadura',          descripcion: 'Ajuste no lineal' },
  impulsores:       { etiqueta: 'Polvo / impulsor',  descripcion: 'Ajuste no lineal' },
  sal:              { etiqueta: 'Sal',               descripcion: 'Ajuste suave en grandes lotes' },
  especias:         { etiqueta: 'Especias',          descripcion: 'Ajuste al gusto en grandes lotes' },
  tiempo_no_escalar:{ etiqueta: 'No escala',         descripcion: 'Tiempo de horno, temperatura' },
};

const CATEGORIAS_NO_LINEALES: CategoriaIngrediente[] = ['levadura', 'impulsores', 'sal', 'especias'];

let nextId = 5;

const INGREDIENTES_INICIALES: FilaIngrediente[] = [
  { id: 1, nombre: 'Harina',   cantidad: '250', unidad: 'g',  categoria: 'normal'   },
  { id: 2, nombre: 'Agua',     cantidad: '150', unidad: 'ml', categoria: 'normal'   },
  { id: 3, nombre: 'Levadura', cantidad: '5',   unidad: 'g',  categoria: 'levadura' },
  { id: 4, nombre: 'Sal',      cantidad: '5',   unidad: 'g',  categoria: 'sal'      },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function EscaladorRecetasPage() {
  const [racionesOriginal, setRacionesOriginal] = useState('4');
  const [racionesNueva, setRacionesNueva] = useState('8');
  const [filas, setFilas] = useState<FilaIngrediente[]>(INGREDIENTES_INICIALES);
  const [resultado, setResultado] = useState<ReturnType<typeof escalarReceta> | null>(null);

  const rO = parseFloat(racionesOriginal) || 0;
  const rN = parseFloat(racionesNueva) || 0;
  const factorEscala = rO > 0 && rN > 0 ? rN / rO : null;

  const handleAnadirFila = () => {
    const id = nextId++;
    setFilas(prev => [...prev, { id, nombre: '', cantidad: '', unidad: 'g', categoria: 'normal' }]);
    setResultado(null);
  };

  const handleEliminarFila = (id: number) => {
    setFilas(prev => prev.filter(f => f.id !== id));
    setResultado(null);
  };

  const handleCambioFila = (id: number, campo: keyof FilaIngrediente, valor: string) => {
    setFilas(prev =>
      prev.map(f => f.id === id ? { ...f, [campo]: valor } : f)
    );
    setResultado(null);
  };

  const handleCalcular = () => {
    if (!rO || !rN || rO <= 0 || rN <= 0) return;

    const ings = filas
      .filter(f => f.nombre.trim() && f.cantidad.trim())
      .map(f => ({
        nombre:    f.nombre.trim(),
        cantidad:  parseFloat(f.cantidad) || 0,
        unidad:    f.unidad.trim() || 'g',
        categoria: f.categoria,
      }));

    if (ings.length === 0) return;

    const res = escalarReceta(rO, rN, ings);
    setResultado(res);
  };

  const handleReset = () => {
    setFilas(INGREDIENTES_INICIALES);
    setRacionesOriginal('4');
    setRacionesNueva('8');
    setResultado(null);
  };

  const esNoLineal = (cat: CategoriaIngrediente) => CATEGORIAS_NO_LINEALES.includes(cat);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Escalador de Recetas</h1>
        <p className={styles.subtitle}>
          Ajusta las cantidades para más o menos raciones con correcciones inteligentes
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>

        {/* Raciones */}
        <section className={styles.racionesSection}>
          <div className={styles.racionesGrid}>
            <div className={styles.racionCard}>
              <label htmlFor="racionesOriginal" className={styles.racionLabel}>
                Raciones originales
              </label>
              <input
                type="number"
                id="racionesOriginal"
                value={racionesOriginal}
                onChange={e => { setRacionesOriginal(e.target.value); setResultado(null); }}
                min={1}
                step={1}
                className={styles.racionInput}
                aria-label="Número de raciones de la receta original"
              />
            </div>

            <div className={styles.factorIndicador}>
              {factorEscala !== null && rO > 0 && rN > 0 ? (
                <>
                  <span className={styles.factorFlecha} aria-hidden="true">→</span>
                  <span className={styles.factorValor}>
                    {factorEscala === 1 ? '1× (sin cambio)' : `${Math.round(factorEscala * 100) / 100}×`}
                  </span>
                </>
              ) : (
                <span className={styles.factorFlecha} aria-hidden="true">→</span>
              )}
            </div>

            <div className={styles.racionCard}>
              <label htmlFor="racionesNueva" className={styles.racionLabel}>
                Raciones deseadas
              </label>
              <input
                type="number"
                id="racionesNueva"
                value={racionesNueva}
                onChange={e => { setRacionesNueva(e.target.value); setResultado(null); }}
                min={1}
                step={1}
                className={styles.racionInput}
                aria-label="Número de raciones que se desean preparar"
              />
            </div>
          </div>
        </section>

        {/* Tabla de ingredientes */}
        <section className={styles.ingredientesSection}>
          <h2 className={styles.seccionTitulo}>Ingredientes</h2>

          <div className={styles.leyendaCategorias}>
            {CATEGORIAS_NO_LINEALES.map(cat => (
              <span key={cat} className={styles.leyendaBadge}>
                <span className={styles.badgeNoLineal} aria-hidden="true">~</span>
                {CATEGORIAS_INFO[cat].etiqueta}: {CATEGORIAS_INFO[cat].descripcion}
              </span>
            ))}
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.tablaIngredientes}>
              <thead>
                <tr>
                  <th scope="col">Ingrediente</th>
                  <th scope="col">Cantidad</th>
                  <th scope="col">Unidad</th>
                  <th scope="col">Categoría</th>
                  <th scope="col">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila) => (
                  <tr key={fila.id} className={esNoLineal(fila.categoria) ? styles.filaNoLineal : ''}>
                    <td>
                      <input
                        type="text"
                        value={fila.nombre}
                        onChange={e => handleCambioFila(fila.id, 'nombre', e.target.value)}
                        placeholder="ej: Harina"
                        className={styles.inputTabla}
                        aria-label={`Nombre del ingrediente ${fila.id}`}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={fila.cantidad}
                        onChange={e => handleCambioFila(fila.id, 'cantidad', e.target.value)}
                        placeholder="ej: 250"
                        min={0}
                        step="any"
                        className={`${styles.inputTabla} ${styles.inputCantidad}`}
                        aria-label={`Cantidad de ${fila.nombre || 'ingrediente'}`}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={fila.unidad}
                        onChange={e => handleCambioFila(fila.id, 'unidad', e.target.value)}
                        placeholder="g, ml…"
                        className={`${styles.inputTabla} ${styles.inputUnidad}`}
                        aria-label={`Unidad de ${fila.nombre || 'ingrediente'}`}
                      />
                    </td>
                    <td>
                      <select
                        value={fila.categoria}
                        onChange={e => handleCambioFila(fila.id, 'categoria', e.target.value as CategoriaIngrediente)}
                        className={styles.selectCategoria}
                        aria-label={`Categoría de ${fila.nombre || 'ingrediente'}`}
                      >
                        {(Object.keys(CATEGORIAS_INFO) as CategoriaIngrediente[]).map(cat => (
                          <option key={cat} value={cat}>
                            {CATEGORIAS_INFO[cat].etiqueta}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleEliminarFila(fila.id)}
                        className={styles.btnEliminar}
                        aria-label={`Eliminar ingrediente ${fila.nombre || ''}`}
                        disabled={filas.length <= 1}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button type="button" onClick={handleAnadirFila} className={styles.btnAnadir}>
            + Añadir ingrediente
          </button>
        </section>

        {/* Botones de acción */}
        <div className={styles.botonesAccion}>
          <button
            type="button"
            onClick={handleCalcular}
            className={styles.btnCalcular}
            disabled={!rO || !rN || rO <= 0 || rN <= 0}
          >
            Escalar receta
          </button>
          <button type="button" onClick={handleReset} className={styles.btnReset}>
            Restablecer ejemplo
          </button>
        </div>

        {/* Resultado */}
        {resultado && (
          <section
            className={styles.resultadoSection}
            role="region"
            aria-label="Resultado del escalado"
          >
            <h2 className={styles.resultadoTitulo}>
              Receta escalada: {resultado.raciones_original} → {resultado.raciones_nueva} raciones
              <span className={styles.factorBadge}>×{resultado.factor_escala}</span>
            </h2>

            {resultado.advertencias.length > 0 && (
              <div className={styles.advertenciasBox} role="alert" aria-live="polite">
                {resultado.advertencias.map((adv, i) => (
                  <p key={i} className={styles.advertencia}>
                    <span aria-hidden="true">⚠️</span> {adv}
                  </p>
                ))}
              </div>
            )}

            <div className={styles.tableWrapper}>
              <table className={styles.tablaResultado}>
                <thead>
                  <tr>
                    <th scope="col">Ingrediente</th>
                    <th scope="col">Cantidad original</th>
                    <th scope="col">Cantidad nueva</th>
                    <th scope="col">Categoría</th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.ingredientes.map((ing: IngredienteEscalado, i: number) => (
                    <tr
                      key={i}
                      className={esNoLineal(ing.categoria) ? styles.filaNoLinealResultado : ''}
                    >
                      <td className={styles.celNombre}>{ing.nombre}</td>
                      <td>{ing.cantidad_original} {ing.unidad}</td>
                      <td className={styles.celNueva}>
                        <strong>{ing.cantidad_redondeada}</strong>
                        {esNoLineal(ing.categoria) && (
                          <span className={styles.badgeAjustado} aria-label="ajustado">~</span>
                        )}
                      </td>
                      <td>
                        <span className={`${styles.categoriaBadge} ${esNoLineal(ing.categoria) ? styles.categoriaBadgeNoLineal : ''}`}>
                          {CATEGORIAS_INFO[ing.categoria].etiqueta}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {resultado.ingredientes.some(i => i.nota) && (
              <div className={styles.notasBox}>
                <strong>Notas de ajuste:</strong>
                <ul className={styles.notasList}>
                  {resultado.ingredientes
                    .filter(i => i.nota)
                    .map((i, idx) => (
                      <li key={idx}>
                        <strong>{i.nombre}:</strong> {i.nota}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <div className={styles.notaHornoBox}>
              <span aria-hidden="true">🔥</span>
              <div>
                <strong>Sobre el horno:</strong>
                <p>{resultado.nota_horno}</p>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Sección educativa */}
      <EducationalSection
        title="Cómo escalar recetas correctamente"
        subtitle="Fundamentos del escalado culinario"
        icon="📐"
      >
        <div className={styles.educationalContent}>

          <section className={styles.conceptoSection}>
            <h2>Por qué la levadura y los impulsores no escalan linealmente</h2>
            <p>
              La fermentación de la levadura es una reacción bioquímica exponencial, no proporcional
              a la masa. En grandes volúmenes de masa, la levadura tiene más sustrato disponible y
              la fermentación se acelera sin necesidad de aumentar la cantidad proporcionalmente.
              Si doblas la receta y doblas también la levadura, corres el riesgo de fermentación
              excesiva, sabor amargo y textura irregular.
            </p>
            <p style={{ marginTop: '12px' }}>
              Lo mismo ocurre con los impulsores (polvo de hornear, bicarbonato): en grandes
              cantidades producen más CO₂ del que la estructura de la masa puede retener, lo que
              puede hacer que el bizcocho se desinfle o quede con sabor metálico. La regla práctica
              es aplicar la raíz cuadrada del factor de escala para estos ingredientes.
            </p>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🔬</span>
                <h4>Levadura (×2)</h4>
                <p>
                  Si doblas la receta, multiplica la levadura por ×1,9 en lugar de ×2.
                  Para ×3, usa ×2,5. El ajuste es menor cuando el factor es pequeño.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🧪</span>
                <h4>Polvo de hornear (×4)</h4>
                <p>
                  Para un factor ×4, la calculadora aplica √4 = 2 en lugar de ×4. Esto
                  evita el exceso de CO₂ y el sabor metálico que dan los fosfatos de los
                  impulsores en exceso.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🧂</span>
                <h4>Sal en grandes lotes</h4>
                <p>
                  La percepción de la sal es logarítmica: duplicar la sal no duplica el
                  sabor salado. En lotes grandes (&gt;3×), la calculadora reduce la sal al
                  85% del factor lineal. Ajustar al gusto.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🌶️</span>
                <h4>Especias en grandes cantidades</h4>
                <p>
                  Las especias son aromáticas volátiles: en grandes cantidades pueden
                  resultar dominantes. En factores &gt;2×, la calculadora aplica el 80%
                  del factor lineal. Verificar al gusto antes de finalizar.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.conceptoSection}>
            <h2>Tabla de conversiones prácticas de unidades</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Medida</th>
                    <th>Equivalencia</th>
                    <th>En gramos (aprox.)</th>
                    <th>Notas</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>1 taza (cup)</strong></td>
                    <td>240 ml</td>
                    <td>120–130 g harina / 200 g azúcar</td>
                    <td>Varía según ingrediente</td>
                  </tr>
                  <tr>
                    <td><strong>1 cucharada (tbsp)</strong></td>
                    <td>15 ml</td>
                    <td>10 g harina / 15 g azúcar / 14 g aceite</td>
                    <td>Siempre rasa</td>
                  </tr>
                  <tr>
                    <td><strong>1 cucharadita (tsp)</strong></td>
                    <td>5 ml</td>
                    <td>3–5 g según densidad</td>
                    <td>Siempre rasa</td>
                  </tr>
                  <tr>
                    <td><strong>1 onza (oz)</strong></td>
                    <td>28,35 g</td>
                    <td>28,35 g</td>
                    <td>Unidad de peso</td>
                  </tr>
                  <tr>
                    <td><strong>1 libra (lb)</strong></td>
                    <td>16 oz = 453,6 g</td>
                    <td>453,6 g</td>
                    <td>Unidad de peso</td>
                  </tr>
                  <tr>
                    <td><strong>1 pinta US</strong></td>
                    <td>473 ml</td>
                    <td>473 g (agua)</td>
                    <td>Distinto de pinta UK (568 ml)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.conceptoSection}>
            <h2>Regla del horno al escalar</h2>
            <p>
              La temperatura del horno no se escala nunca. El calor necesario para
              cocer un bizcocho depende de la composición de la masa y los procesos físico-químicos
              (gelatinización del almidón, coagulación de proteínas, caramelización), no del
              volumen total.
            </p>
            <p style={{ marginTop: '12px' }}>
              El tiempo sí puede variar ligeramente en función de la geometría del molde:
            </p>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">⏫</span>
                <h4>Lote más grande en molde más profundo</h4>
                <p>
                  Si doblas la cantidad pero usas el mismo molde (más profundo), el calor
                  tarda más en llegar al centro. Añade un 10–15% de tiempo y verifica con
                  el test del palillo o termómetro de sonda (bizcocho: 95–98°C en el centro).
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">⏬</span>
                <h4>Lote más pequeño o piezas más finas</h4>
                <p>
                  Al dividir la receta o usar moldes más estrechos, el calor llega antes
                  al centro. Reduce el tiempo un 5–10% y vigila el color de la corteza para
                  no secar en exceso.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
                <h4>Usa el test del palillo o sonda</h4>
                <p>
                  El tiempo en las recetas es siempre orientativo. El indicador fiable es la
                  temperatura interna o el test del palillo (sale limpio). Los hornos domésticos
                  varían hasta ±20°C respecto al marcador.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.conceptoSection}>
            <h2>Las 5 categorías de ingredientes y su comportamiento al escalar</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Categoría</th>
                    <th>Ejemplos</th>
                    <th>Comportamiento</th>
                    <th>Recomendación</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Normal</strong></td>
                    <td>Harina, agua, aceite, azúcar, huevos, nata, mantequilla</td>
                    <td>Escala lineal exacta</td>
                    <td>Multiplicar directamente por el factor</td>
                  </tr>
                  <tr>
                    <td><strong>Levadura</strong></td>
                    <td>Levadura fresca, levadura seca, masa madre</td>
                    <td>Sublineal — reacción bioquímica</td>
                    <td>Reducir un 5–25% según el factor; ajustar por tiempo de fermentación</td>
                  </tr>
                  <tr>
                    <td><strong>Impulsores</strong></td>
                    <td>Polvo de hornear, bicarbonato, cremor tártaro</td>
                    <td>Sublineal — producción de CO₂</td>
                    <td>Aplicar √factor para lotes &gt;2×; evitar exceso para no saturar la masa</td>
                  </tr>
                  <tr>
                    <td><strong>Sal</strong></td>
                    <td>Sal fina, sal gruesa, sal de mar</td>
                    <td>Percepción logarítmica</td>
                    <td>Reducir al 85% del lineal en lotes &gt;3×; ajustar al gusto final</td>
                  </tr>
                  <tr>
                    <td><strong>Especias</strong></td>
                    <td>Canela, nuez moscada, pimienta, cardamomo, vainilla</td>
                    <td>Aromáticos volátiles</td>
                    <td>Reducir al 80% en lotes &gt;2×; siempre verificar al gusto</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.conceptoSection}>
            <h2>Consejos prácticos para escalar con éxito</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🎂</span>
                  <strong>Doblar una receta de bizcocho</strong>
                </div>
                <p className={styles.escenarioExample}>
                  Factor ×2. Harina, azúcar, huevos y mantequilla: ×2 exacto. Polvo de hornear:
                  ×1,9 (ajuste sublineal). Sal: ×2. Vainilla: ×1,6 (80% del lineal).
                </p>
                <p className={styles.escenarioTip}>
                  Usa dos moldes del mismo tamaño en lugar de uno más grande para mantener el tiempo de horneado.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🍞</span>
                  <strong>Hacer pan para 12 en lugar de 4</strong>
                </div>
                <p className={styles.escenarioExample}>
                  Factor ×3. Harina y agua: ×3. Levadura seca: ×2,5 (ajuste √3 × 0,9).
                  Sal: ×2,55 (85% del lineal). El tiempo de fermentación puede reducirse
                  ligeramente por la mayor masa de levadura.
                </p>
                <p className={styles.escenarioTip}>
                  Vigila la temperatura de la masa durante la fermentación, especialmente en grandes lotes.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🍪</span>
                  <strong>Reducir una receta de galletas a la mitad</strong>
                </div>
                <p className={styles.escenarioExample}>
                  Factor ×0,5. Todos los ingredientes a la mitad. Los impulsores también ÷2
                  (en factores pequeños, el ajuste sublineal es mínimo). El tiempo de horneado
                  puede reducirse 2–3 minutos.
                </p>
                <p className={styles.escenarioTip}>
                  Con un huevo entero que no se puede dividir, usa ½ huevo batido medido en cucharadas.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🍲</span>
                  <strong>Multiplicar por 8 para catering</strong>
                </div>
                <p className={styles.escenarioExample}>
                  Factor ×8. La levadura se ajusta a √8 × 0,9 ≈ ×2,5 en lugar de ×8.
                  Las especias se reducen al 80%. Considera preparar en dos o tres tandas
                  separadas para mayor control de calidad.
                </p>
                <p className={styles.escenarioTip}>
                  En factores extremos, la primera hornada es siempre una prueba. Verifica la fermentación visualmente.
                </p>
              </div>
            </div>
          </section>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>Errores frecuentes al escalar recetas</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>Escalar la levadura linealmente en lotes grandes.</strong> Triplicar la levadura
                cuando se triplica la receta puede resultar en fermentación excesiva, sabor amargo y
                pérdida de estructura. Usa la calculadora para el ajuste correcto.
              </li>
              <li>
                <strong>Cambiar la temperatura del horno al escalar.</strong> La temperatura es
                constante. Solo el tiempo puede variar ligeramente según la geometría del molde.
                Subir la temperatura para "compensar" mayor cantidad quemará el exterior sin cocer el interior.
              </li>
              <li>
                <strong>No verificar la sal y las especias al gusto.</strong> Las cantidades calculadas
                son un punto de partida. La percepción sensorial es individual y varía también con
                la combinación de sabores de cada receta. Siempre prueba antes de servir.
              </li>
              <li>
                <strong>Dividir huevos sin medirlos.</strong> ½ huevo no significa simplemente
                cascar uno y usarlo, ya que cada huevo varía entre 45–60 g. En factores que
                requieran fracciones de huevo, bate el huevo entero y mide el volumen necesario
                con una cuchara o báscula.
              </li>
              <li>
                <strong>No considerar el tamaño del molde al escalar.</strong> Doblar la masa
                no significa doblar el tamaño del molde: la geometría cambia y con ella el
                tiempo de cocción. Lo más sencillo es usar más moldes del mismo tamaño original.
              </li>
            </ul>
          </div>

        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('escalador-recetas')} />
      <ShareCard appName="escalador-recetas" />
      <Footer appName="escalador-recetas" />
    </div>
  );
}
