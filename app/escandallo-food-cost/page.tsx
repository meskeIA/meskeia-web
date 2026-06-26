'use client';

import { useMemo, useState } from 'react';
import styles from './EscandalloFoodCost.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import DisclaimerCard from '@/components/DisclaimerCard';
import { getRelatedApps } from '@/data/app-relations';
import {
  calcularEscandallo,
  costeIngrediente,
  REFERENCIAS_FOOD_COST,
  type IngredienteEscandallo,
  type ModoIngrediente,
} from '@/lib/calculadoras/escandalloFoodCost';
import { formatCurrency, formatNumber } from '@/lib/formatters';

let nextId = 4;

const INICIALES: IngredienteEscandallo[] = [
  { id: 1, nombre: 'Harina', modo: 'peso', cantidad: 500, precio: 1.2 },
  { id: 2, nombre: 'Huevo', modo: 'unidad', cantidad: 4, precio: 0.25 },
  { id: 3, nombre: 'Mantequilla', modo: 'peso', cantidad: 200, precio: 9 },
];

export default function EscandalloFoodCostPage() {
  const [ingredientes, setIngredientes] = useState<IngredienteEscandallo[]>(INICIALES);
  const [raciones, setRaciones] = useState('8');
  const [foodCost, setFoodCost] = useState('30');

  const num = (v: string) => parseFloat(v.replace(',', '.')) || 0;

  const resultado = useMemo(
    () => calcularEscandallo(ingredientes, num(raciones), num(foodCost)),
    [ingredientes, raciones, foodCost],
  );

  const actualizar = (id: number, campo: keyof IngredienteEscandallo, valor: string) => {
    setIngredientes((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        if (campo === 'nombre') return { ...i, nombre: valor };
        if (campo === 'modo') return { ...i, modo: valor as ModoIngrediente };
        return { ...i, [campo]: num(valor) };
      }),
    );
  };

  const anadir = () => {
    setIngredientes((prev) => [
      ...prev,
      { id: nextId++, nombre: '', modo: 'peso', cantidad: 0, precio: 0 },
    ]);
  };

  const eliminar = (id: number) => {
    setIngredientes((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Escandallo y food cost</h1>
        <p className={styles.subtitle}>
          Calcula el coste de tus recetas, el coste por ración y el precio de venta según el food
          cost que quieras. Para hostelería, catering y obradores
        </p>
      </header>

      <LegalNotice />

      <DisclaimerCard variant="financial" severity="medium" />

      <main className={styles.mainContent}>
        {/* Ingredientes */}
        <section className={styles.panel} aria-label="Ingredientes">
          <h2 className={styles.seccionTitulo}>Ingredientes de la receta</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.tablaEdicion}>
              <thead>
                <tr>
                  <th scope="col">Ingrediente</th>
                  <th scope="col">Modo</th>
                  <th scope="col">Cantidad</th>
                  <th scope="col">Precio (€)</th>
                  <th scope="col">Coste</th>
                  <th scope="col"><span className="sr-only">Eliminar</span></th>
                </tr>
              </thead>
              <tbody>
                {ingredientes.map((ing) => (
                  <tr key={ing.id}>
                    <td>
                      <input className={styles.inputTabla} type="text" value={ing.nombre}
                        placeholder="Nombre" aria-label="Nombre del ingrediente"
                        onChange={(e) => actualizar(ing.id, 'nombre', e.target.value)} />
                    </td>
                    <td>
                      <select className={styles.selectTabla} value={ing.modo}
                        aria-label="Modo de cálculo"
                        onChange={(e) => actualizar(ing.id, 'modo', e.target.value)}>
                        <option value="peso">Por peso</option>
                        <option value="unidad">Por unidad</option>
                      </select>
                    </td>
                    <td>
                      <input className={`${styles.inputTabla} ${styles.inputNum}`} type="text"
                        inputMode="decimal" value={ing.cantidad || ''}
                        aria-label={ing.modo === 'peso' ? 'Gramos' : 'Unidades'}
                        onChange={(e) => actualizar(ing.id, 'cantidad', e.target.value)} />
                      <span className={styles.unidadSufijo}>{ing.modo === 'peso' ? 'g' : 'ud'}</span>
                    </td>
                    <td>
                      <input className={`${styles.inputTabla} ${styles.inputNum}`} type="text"
                        inputMode="decimal" value={ing.precio || ''}
                        aria-label={ing.modo === 'peso' ? 'Euros por kilo' : 'Euros por unidad'}
                        onChange={(e) => actualizar(ing.id, 'precio', e.target.value)} />
                      <span className={styles.unidadSufijo}>{ing.modo === 'peso' ? '/kg' : '/ud'}</span>
                    </td>
                    <td className={styles.celCoste}>{formatCurrency(costeIngrediente(ing))}</td>
                    <td>
                      <button type="button" className={styles.btnEliminar} aria-label="Eliminar ingrediente"
                        onClick={() => eliminar(ing.id)} disabled={ingredientes.length <= 1}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className={styles.btnAnadir} onClick={anadir}>
            <span aria-hidden="true">+</span> Añadir ingrediente
          </button>

          <div className={styles.paramsFila}>
            <div className={styles.campo}>
              <label htmlFor="raciones" className={styles.label}>Raciones que salen</label>
              <input id="raciones" type="text" inputMode="numeric" className={styles.input}
                value={raciones} onChange={(e) => setRaciones(e.target.value)} />
            </div>
            <div className={styles.campo}>
              <label htmlFor="foodCost" className={styles.label}>Food cost objetivo (%)</label>
              <input id="foodCost" type="text" inputMode="decimal" className={styles.input}
                value={foodCost} onChange={(e) => setFoodCost(e.target.value)} />
            </div>
          </div>
        </section>

        {/* Resultado */}
        {resultado ? (
          <section className={styles.resultadoGrid} aria-live="polite">
            <div className={styles.resCard}>
              <span className={styles.resValor}>{formatCurrency(resultado.costeTotal)}</span>
              <span className={styles.resLabel}>coste total de la receta</span>
            </div>
            <div className={styles.resCard}>
              <span className={styles.resValor}>{formatCurrency(resultado.costePorRacion)}</span>
              <span className={styles.resLabel}>coste por ración</span>
            </div>
            <div className={`${styles.resCard} ${styles.resCardDestacado}`}>
              <span className={styles.resValor}>{formatCurrency(resultado.pvpSinImpuestos)}</span>
              <span className={styles.resLabel}>precio de venta sugerido (sin impuestos)</span>
            </div>
            <div className={styles.resCard}>
              <span className={styles.resValor}>{formatCurrency(resultado.margenBruto)}</span>
              <span className={styles.resLabel}>margen bruto por ración ({formatNumber(resultado.margenPct, 1)}%)</span>
            </div>
          </section>
        ) : (
          <p className={styles.placeholder}>Indica las raciones para calcular el escandallo.</p>
        )}

        {/* Referencias */}
        <section className={styles.refSection} aria-labelledby="ref-titulo">
          <h2 id="ref-titulo" className={styles.seccionTitulo}>
            <span aria-hidden="true">📊</span> Food cost orientativo por negocio
          </h2>
          <div className={styles.refGrid}>
            {REFERENCIAS_FOOD_COST.map((r) => (
              <div key={r.tipo} className={styles.refCard}>
                <span className={styles.refRango}>{r.rango}</span>
                <span className={styles.refTipo}>{r.tipo}</span>
                <span className={styles.refNota}>{r.nota}</span>
              </div>
            ))}
          </div>
        </section>

        <p className={styles.fuenteNota}>
          Importes sin impuestos. El food cost solo cubre la materia prima: el margen debe cubrir
          además personal, energía, alquiler y otros gastos. Añade el IVA según tu país.
        </p>

        {/* Contenido educativo v2.0 */}
        <EducationalSection
          title="Escandallo y food cost, explicados"
          subtitle="Cómo costear un plato, fijar el precio y controlar la rentabilidad"
        >
          <div className={styles.educationalContent}>
            <div className={styles.conceptoSection}>
              <h2>Del coste de los ingredientes al precio de la carta</h2>
              <p>
                Fijar el precio de un plato «a ojo» o copiando al de al lado es la forma más rápida
                de perder dinero sin enterarse. El escandallo pone números: cuánto cuesta de verdad
                cada ración sumando lo que vale cada ingrediente. A partir de ese coste, el food
                cost —el porcentaje que el coste representa sobre el precio de venta— te dice si el
                plato deja margen suficiente. Si el coste por ración es 3 € y quieres un food cost
                del 30%, el precio de venta sin impuestos sale de dividir 3 entre 0,30: 10 €.
              </p>
            </div>

            <div className={styles.conceptoSection}>
              <h2>El food cost no es el beneficio</h2>
              <p>
                Un error común es pensar que si el food cost es del 30%, el 70% restante es
                beneficio. No: ese 70% tiene que cubrir el personal, el alquiler, la energía, los
                seguros, las mermas, los impuestos y mil cosas más. El beneficio real es lo que
                queda después de todo eso. Por eso un food cost ajustado es importante, pero también
                lo es controlar el resto de costes. Y por eso este cálculo trabaja sin impuestos: el
                IVA se añade aparte y varía según el país.
              </p>
            </div>

            <div className={styles.conceptoSection}>
              <h2>Buenas prácticas de escandallo</h2>
              <div className={styles.tipsGrid}>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">⚖️</span>
                  <h4>Cuenta la merma</h4>
                  <p>El precio de compra no es el coste real: lo que se pela, deshuesa o pierde al cocinar encarece el producto útil. Aplica el factor de corrección.</p>
                </div>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">🔄</span>
                  <h4>Actualiza los precios</h4>
                  <p>Los costes de materia prima suben; un escandallo de hace un año puede estar dejándote sin margen. Revísalo con regularidad.</p>
                </div>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">🍽️</span>
                  <h4>Piensa en el menú completo</h4>
                  <p>No todos los platos tienen el mismo food cost: unos compensan a otros. Lo importante es el food cost medio de la carta.</p>
                </div>
                <div className={styles.tipCard}>
                  <span className={styles.tipIcon} aria-hidden="true">🧂</span>
                  <h4>No olvides lo pequeño</h4>
                  <p>Aceite, sal, especias, guarnición y hasta el pan suman. Incluir solo los ingredientes «grandes» infravalora el coste real.</p>
                </div>
              </div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Errores frecuentes al escandallar</strong>
              </div>
              <ul className={styles.warningList}>
                <li><strong>Usar el precio de compra sin merma.</strong> Un pescado que pierde la mitad al limpiarlo cuesta el doble por kilo útil de lo que pagaste.</li>
                <li><strong>Olvidar ingredientes menores.</strong> Aceite, sal y guarniciones parecen poco, pero sumados cambian el coste por ración.</li>
                <li><strong>Confundir food cost con beneficio.</strong> El margen del plato aún tiene que pagar personal, local y gastos generales.</li>
                <li><strong>No repartir bien las raciones.</strong> Si una receta da 8 raciones y sirves 6 más grandes, el coste por ración real sube.</li>
                <li><strong>No revisar precios.</strong> Con la materia prima subiendo, un escandallo desactualizado erosiona el margen sin que lo notes.</li>
              </ul>
            </div>
          </div>
        </EducationalSection>
      </main>

      <RelatedApps apps={getRelatedApps('escandallo-food-cost')} />
      <ShareCard appName="escandallo-food-cost" />
      <Footer appName="escandallo-food-cost" />
    </div>
  );
}
