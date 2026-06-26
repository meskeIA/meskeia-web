'use client';
// @disclaimer: exempt

import { useMemo, useState } from 'react';
import styles from './ConversorTazasGramos.module.css';
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
  INGREDIENTES,
  CATEGORIAS_INGREDIENTE,
  MEDIDAS,
  convertirAGramos,
  convertirAMedidas,
  CONVERSION_GASTRO_META,
  type CategoriaIngrediente,
} from '@/lib/calculadoras/conversionGastronomica';
import { formatNumber } from '@/lib/formatters';

type Modo = 'a-gramos' | 'a-medidas';

// Ingredientes agrupados por categoría para el <select> con <optgroup>.
const INGREDIENTES_POR_CATEGORIA = (Object.keys(CATEGORIAS_INGREDIENTE) as CategoriaIngrediente[]).map(
  (cat) => ({
    categoria: cat,
    etiqueta: CATEGORIAS_INGREDIENTE[cat],
    items: INGREDIENTES.filter((i) => i.categoria === cat),
  }),
);

// Ingredientes destacados para la tabla de referencia visible.
const REFERENCIA_DESTACADA = [
  'harina-trigo',
  'azucar-blanco',
  'azucar-moreno',
  'azucar-glas',
  'mantequilla',
  'agua',
  'leche',
  'miel',
  'cacao',
  'arroz-crudo',
];

export default function ConversorTazasGramosPage() {
  const [modo, setModo] = useState<Modo>('a-gramos');
  const [ingredienteId, setIngredienteId] = useState('harina-trigo');
  const [medidaId, setMedidaId] = useState('taza');
  const [cantidad, setCantidad] = useState('1');
  const [gramos, setGramos] = useState('250');

  const resultadoGramos = useMemo(
    () => convertirAGramos(ingredienteId, medidaId, parseFloat(cantidad.replace(',', '.'))),
    [ingredienteId, medidaId, cantidad],
  );

  const resultadoMedidas = useMemo(
    () => convertirAMedidas(ingredienteId, parseFloat(gramos.replace(',', '.'))),
    [ingredienteId, gramos],
  );

  const tablaReferencia = REFERENCIA_DESTACADA.map(
    (id) => INGREDIENTES.find((i) => i.id === id)!,
  ).filter(Boolean);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Conversor de tazas a gramos</h1>
        <p className={styles.subtitle}>
          Cada ingrediente pesa lo suyo: convierte tazas y cucharadas a gramos con el peso real
          de la harina, el azúcar, los líquidos y más
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>
        {/* Selector de modo */}
        <div className={styles.modoTabs} role="tablist" aria-label="Dirección de la conversión">
          <button
            type="button"
            role="tab"
            aria-selected={modo === 'a-gramos'}
            className={`${styles.modoTab} ${modo === 'a-gramos' ? styles.modoTabActivo : ''}`}
            onClick={() => setModo('a-gramos')}
          >
            <span aria-hidden="true">🥄→⚖️</span> Tazas a gramos
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={modo === 'a-medidas'}
            className={`${styles.modoTab} ${modo === 'a-medidas' ? styles.modoTabActivo : ''}`}
            onClick={() => setModo('a-medidas')}
          >
            <span aria-hidden="true">⚖️→🥄</span> Gramos a tazas
          </button>
        </div>

        <section className={styles.panel} aria-label="Conversor">
          <div className={styles.campo}>
            <label htmlFor="ingrediente" className={styles.label}>
              Ingrediente
            </label>
            <select
              id="ingrediente"
              className={styles.select}
              value={ingredienteId}
              onChange={(e) => setIngredienteId(e.target.value)}
            >
              {INGREDIENTES_POR_CATEGORIA.map((grupo) => (
                <optgroup key={grupo.categoria} label={grupo.etiqueta}>
                  {grupo.items.map((ing) => (
                    <option key={ing.id} value={ing.id}>
                      {ing.emoji} {ing.nombre}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {modo === 'a-gramos' ? (
            <div className={styles.filaEntrada}>
              <div className={styles.campo}>
                <label htmlFor="cantidad" className={styles.label}>
                  Cantidad
                </label>
                <input
                  id="cantidad"
                  type="text"
                  inputMode="decimal"
                  className={styles.input}
                  value={cantidad}
                  onChange={(e) => setCantidad(e.target.value)}
                  placeholder="1"
                />
              </div>
              <div className={styles.campo}>
                <label htmlFor="medida" className={styles.label}>
                  Medida
                </label>
                <select
                  id="medida"
                  className={styles.select}
                  value={medidaId}
                  onChange={(e) => setMedidaId(e.target.value)}
                >
                  {MEDIDAS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nombre} ({formatNumber(m.ml, 0)} ml)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div className={styles.campo}>
              <label htmlFor="gramos" className={styles.label}>
                Gramos
              </label>
              <input
                id="gramos"
                type="text"
                inputMode="decimal"
                className={styles.input}
                value={gramos}
                onChange={(e) => setGramos(e.target.value)}
                placeholder="250"
              />
            </div>
          )}

          {/* Resultado */}
          <div className={styles.resultado} role="status" aria-live="polite">
            {modo === 'a-gramos' && resultadoGramos ? (
              <>
                <span className={styles.resultadoValor}>
                  {formatNumber(resultadoGramos.gramos, resultadoGramos.gramos % 1 === 0 ? 0 : 1)} g
                </span>
                <span className={styles.resultadoDetalle}>
                  {resultadoGramos.detalle} · {formatNumber(resultadoGramos.ml, 0)} ml
                </span>
              </>
            ) : modo === 'a-medidas' && resultadoMedidas ? (
              <>
                <span className={styles.resultadoValor}>{resultadoMedidas.desglose}</span>
                <span className={styles.resultadoDetalle}>
                  {formatNumber(parseFloat(gramos.replace(',', '.')) || 0, 0)} g de{' '}
                  {resultadoMedidas.ingrediente.nombre.toLowerCase()} ·{' '}
                  {formatNumber(resultadoMedidas.tazas, 2)} tazas
                </span>
              </>
            ) : (
              <span className={styles.resultadoPlaceholder}>
                Introduce una cantidad para ver la conversión
              </span>
            )}
          </div>

          <p className={styles.fuenteNota}>
            Pesos por taza de 240 ml. Fuente: {CONVERSION_GASTRO_META.fuente}. Verificado{' '}
            {CONVERSION_GASTRO_META.verificado}.
          </p>
        </section>

        {/* Tabla de referencia */}
        <section className={styles.referenciaSection} aria-labelledby="ref-titulo">
          <h2 id="ref-titulo" className={styles.seccionTitulo}>
            <span aria-hidden="true">📋</span> Gramos por taza de un vistazo
          </h2>
          <div className={styles.tableWrapper}>
            <table className={styles.tablaReferencia}>
              <thead>
                <tr>
                  <th scope="col">Ingrediente</th>
                  <th scope="col">1 taza</th>
                  <th scope="col">½ taza</th>
                  <th scope="col">1 cucharada</th>
                </tr>
              </thead>
              <tbody>
                {tablaReferencia.map((ing) => (
                  <tr key={ing.id}>
                    <td className={styles.celNombre}>
                      <span aria-hidden="true">{ing.emoji}</span> {ing.nombre}
                    </td>
                    <td>{formatNumber(ing.gramosPorTaza, 0)} g</td>
                    <td>{formatNumber(ing.gramosPorTaza / 2, 0)} g</td>
                    <td>{formatNumber(ing.gramosPorTaza / 16, 0)} g</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Contenido educativo v2.0 */}
        <EducationalSection
          title="Guía de medidas en la cocina"
          subtitle="Por qué una taza no es un peso, cuánto pesa cada ingrediente y cómo medir mejor"
        >
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Por qué una taza no es una medida de peso</h2>
              <p>
                Las recetas que vienen de Estados Unidos y de buena parte de Latinoamérica miden
                en tazas y cucharadas, es decir, por <strong>volumen</strong>. El problema es que
                el volumen no dice cuánto pesa: una taza de harina y una taza de azúcar ocupan lo
                mismo, pero la de azúcar pesa casi el doble. En repostería y panadería, donde las
                proporciones importan, esa diferencia arruina una masa. Por eso la cocina
                profesional pesa en gramos, y este conversor traduce de un sistema al otro
                respetando el peso real de cada ingrediente.
              </p>
            </div>

            <div className={styles.conceptoSection}>
              <h2>Cuánto pesa una taza según el ingrediente</h2>
              <p>
                Estos son algunos pesos de referencia para una taza estándar de 240 ml. Fíjate en
                la diferencia entre la harina y el azúcar, o lo mucho que pesa la miel:
              </p>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th scope="col">Ingrediente</th>
                    <th scope="col">1 taza</th>
                    <th scope="col">Por qué</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Harina de trigo</td>
                    <td>120 g</td>
                    <td>Polvo ligero que atrapa aire</td>
                  </tr>
                  <tr>
                    <td>Azúcar blanco</td>
                    <td>200 g</td>
                    <td>Cristales densos que se asientan</td>
                  </tr>
                  <tr>
                    <td>Azúcar moreno</td>
                    <td>213 g</td>
                    <td>Se mide compactado en la taza</td>
                  </tr>
                  <tr>
                    <td>Mantequilla</td>
                    <td>227 g</td>
                    <td>Grasa sólida sin huecos de aire</td>
                  </tr>
                  <tr>
                    <td>Agua</td>
                    <td>237 g</td>
                    <td>Densidad cercana a 1 g/ml</td>
                  </tr>
                  <tr>
                    <td>Miel</td>
                    <td>340 g</td>
                    <td>Líquido muy denso, casi 1,4 g/ml</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.conceptoSection}>
              <h2>Cuándo usar este conversor</h2>
              <div className={styles.escenariosGrid}>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🇲🇽</span>
                    <strong>Receta latinoamericana en tazas</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    El bizcocho lleva «2 tazas de harina y 1 taza de azúcar». Conviértelo a 240 g
                    de harina y 200 g de azúcar para pesarlo con báscula y que salga igual cada vez.
                  </p>
                  <p className={styles.escenarioTip}>Más reproducible que rellenar tazas a ojo.</p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">⚖️</span>
                    <strong>No tienes báscula</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    La receta da 250 g de harina pero solo tienes tazas medidoras. En modo «gramos
                    a tazas» verás que son unas 2 tazas más 1 cucharada.
                  </p>
                  <p className={styles.escenarioTip}>El desglose evita cuentas mentales.</p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🍯</span>
                    <strong>Ingredientes pegajosos</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    La miel y el sirope son los que más se prestan a error: una taza pesa 340 g,
                    muy lejos de los 237 g del agua. Conviértelos siempre por su densidad real.
                  </p>
                  <p className={styles.escenarioTip}>Engrasa la taza y se despega mejor.</p>
                </div>
                <div className={styles.escenarioCard}>
                  <div className={styles.escenarioHeader}>
                    <span className={styles.escenarioIcon} aria-hidden="true">🧂</span>
                    <strong>Sal y leudantes</strong>
                  </div>
                  <p className={styles.escenarioExample}>
                    Se usan en cucharaditas: una de sal fina pesa unos 6 g y una de levadura
                    química unos 4 g. Elige la cucharadita como medida para estos ingredientes.
                  </p>
                  <p className={styles.escenarioTip}>Pequeñas cantidades, gran impacto.</p>
                </div>
              </div>
            </div>

            <div className={styles.conceptoSection}>
              <h2>Trucos para medir mejor</h2>
              <div className={styles.tipsGrid}>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">🥄</span>
                  <h4>Cuchara y nivela la harina</h4>
                  <p>
                    No metas la taza directamente en el bote: airea la harina, cuchárala dentro de
                    la taza y nivela con el canto de un cuchillo. Compactarla añade hasta un 20% más.
                  </p>
                </div>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">🟤</span>
                  <h4>El azúcar moreno va apretado</h4>
                  <p>
                    Es la excepción: se mide compactándolo en la taza hasta que mantenga la forma al
                    voltearlo. Por eso pesa más que el azúcar blanco.
                  </p>
                </div>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">📏</span>
                  <h4>Taza de 240 frente a 250 ml</h4>
                  <p>
                    Aquí se usa la taza de 240 ml. La taza métrica de 250 ml apenas cambia el peso
                    de harinas y azúcares; para líquidos la diferencia es de unos pocos mililitros.
                  </p>
                </div>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
                  <h4>Si puedes, pesa</h4>
                  <p>
                    Una báscula barata elimina toda esta variabilidad. Convierte la receta a gramos
                    una vez y guárdala así para futuras tandas.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Errores frecuentes al convertir tazas</strong>
              </div>
              <ul className={styles.warningList}>
                <li>
                  <strong>Usar un peso único para «una taza».</strong> Muchas tablas dicen «1 taza =
                  240 g» sin más. Eso solo vale para el agua: para la harina te pasarías el doble.
                </li>
                <li>
                  <strong>Compactar la harina en la taza.</strong> Es el error más común y siempre
                  hacia arriba: una taza compactada puede llevar 150 g en vez de 120, y la masa
                  queda seca.
                </li>
                <li>
                  <strong>Confundir cucharada con cucharadita.</strong> La cucharada (15 ml) es el
                  triple que la cucharadita (5 ml). En sal o levadura, triplicar la dosis se nota.
                </li>
                <li>
                  <strong>Medir líquidos densos como si fueran agua.</strong> La miel, el sirope o la
                  leche condensada pesan mucho más que el agua por el mismo volumen.
                </li>
                <li>
                  <strong>Olvidar que el ingrediente importa.</strong> Cambiar de harina de trigo a
                  harina de almendra cambia el peso por taza casi un 20%. Selecciona siempre el
                  ingrediente correcto.
                </li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('conversor-tazas-gramos')} />
      <ShareCard appName="conversor-tazas-gramos" />
      <Footer appName="conversor-tazas-gramos" />
    </div>
  );
}
