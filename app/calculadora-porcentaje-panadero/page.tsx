'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './CalculadoraPorcentajePanadero.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import {
  calcularBakersPercentage,
  type ResultadoBakersPercentage,
} from '@/lib/calculadoras/cocina';

interface OtroIngrediente {
  id: number;
  nombre: string;
  gramos: string;
}

const ingredientesIniciales: OtroIngrediente[] = [
  { id: 1, nombre: 'Agua', gramos: '650' },
  { id: 2, nombre: 'Sal', gramos: '20' },
  { id: 3, nombre: 'Levadura', gramos: '3' },
];

export default function CalculadoraPorcentajePanaderoPage() {
  const [harinaStr, setHarinaStr] = useState('1000');
  const [otros, setOtros] = useState<OtroIngrediente[]>(ingredientesIniciales);
  const [porcioStr, setPorcioStr] = useState('');
  const [resultado, setResultado] = useState<ResultadoBakersPercentage | null>(null);
  const [error, setError] = useState('');
  const [nextId, setNextId] = useState(10);

  const agregarIngrediente = useCallback(() => {
    setOtros(prev => [...prev, { id: nextId, nombre: '', gramos: '' }]);
    setNextId(n => n + 1);
  }, [nextId]);

  const quitarIngrediente = useCallback((id: number) => {
    setOtros(prev => prev.filter(i => i.id !== id));
  }, []);

  const actualizarIngrediente = useCallback(
    (id: number, campo: 'nombre' | 'gramos', valor: string) => {
      setOtros(prev =>
        prev.map(i => (i.id === id ? { ...i, [campo]: valor } : i)),
      );
    },
    [],
  );

  const calcular = useCallback(() => {
    setError('');
    const harina_g = parseSpanishNumber(harinaStr);
    if (!harina_g || harina_g <= 0) {
      setError('Introduce un peso de harina válido (mayor que 0).');
      return;
    }

    const otrosValidos = otros
      .filter(i => i.nombre.trim() !== '' && i.gramos.trim() !== '')
      .map(i => {
        const gramos = parseSpanishNumber(i.gramos);
        return { nombre: i.nombre.trim(), gramos: gramos > 0 ? gramos : 0 };
      });

    if (otrosValidos.length === 0) {
      setError('Añade al menos un ingrediente además de la harina.');
      return;
    }

    const porcion = porcioStr.trim() ? parseSpanishNumber(porcioStr) : undefined;
    const res = calcularBakersPercentage(harina_g, otrosValidos, porcion && porcion > 0 ? porcion : undefined);
    setResultado(res);
  }, [harinaStr, otros, porcioStr]);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}><span aria-hidden="true">🍞</span> Porcentaje del Panadero</h1>
        <p className={styles.subtitle}>
          Calcula el baker&apos;s percentage de tu receta: cada ingrediente como porcentaje del peso de la harina
        </p>
      </header>

      <LegalNotice />

      {/* Herramienta principal */}
      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Ingredientes de la receta</h2>

          {/* Harina (siempre 100%) */}
          <div className={styles.harinaRow}>
            <div className={styles.harinaLabel}>
              <span className={styles.harinaBadge}>100%</span>
              <label htmlFor="harina" className={styles.fieldLabel}>
                Harina (base)
              </label>
            </div>
            <div className={styles.inputGroup}>
              <input
                id="harina"
                type="text"
                inputMode="decimal"
                className={styles.inputField}
                value={harinaStr}
                onChange={e => setHarinaStr(e.target.value)}
                placeholder="1000"
                aria-label="Peso de la harina en gramos"
              />
              <span className={styles.unidad}>g</span>
            </div>
          </div>

          {/* Otros ingredientes */}
          <div className={styles.ingredientesList} role="list" aria-label="Lista de ingredientes">
            {otros.map(ing => (
              <div key={ing.id} className={styles.ingredienteRow} role="listitem">
                <input
                  type="text"
                  className={styles.inputNombre}
                  value={ing.nombre}
                  onChange={e => actualizarIngrediente(ing.id, 'nombre', e.target.value)}
                  placeholder="Ingrediente"
                  aria-label="Nombre del ingrediente"
                />
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    inputMode="decimal"
                    className={styles.inputField}
                    value={ing.gramos}
                    onChange={e => actualizarIngrediente(ing.id, 'gramos', e.target.value)}
                    placeholder="0"
                    aria-label={`Gramos de ${ing.nombre || 'ingrediente'}`}
                  />
                  <span className={styles.unidad}>g</span>
                </div>
                <button
                  type="button"
                  onClick={() => quitarIngrediente(ing.id)}
                  className={styles.btnQuitar}
                  aria-label={`Eliminar ${ing.nombre || 'ingrediente'}`}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <button type="button" onClick={agregarIngrediente} className={styles.btnAgregar}>
            + Añadir ingrediente
          </button>

          {/* Porción opcional */}
          <div className={styles.porcionRow}>
            <label htmlFor="porcion" className={styles.fieldLabel}>
              Peso por porción (opcional)
            </label>
            <div className={styles.inputGroup}>
              <input
                id="porcion"
                type="text"
                inputMode="decimal"
                className={styles.inputField}
                value={porcioStr}
                onChange={e => setPorcioStr(e.target.value)}
                placeholder="—"
                aria-label="Peso por porción en gramos"
              />
              <span className={styles.unidad}>g</span>
            </div>
          </div>

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>
              {error}
            </div>
          )}

          <button type="button" onClick={calcular} className={styles.btnPrimary}>
            Calcular porcentajes
          </button>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.panelTitle}>Resultados</h2>

          {!resultado && (
            <p className={styles.emptyState}>
              Introduce los ingredientes y pulsa <strong>Calcular</strong> para ver los porcentajes del panadero.
            </p>
          )}

          {resultado && (
            <>
              {/* Resumen rápido */}
              <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                  <span className={styles.summaryLabel}>Peso total de la masa</span>
                  <span className={styles.summaryValue}>{formatNumber(resultado.pesoMasa_g, 0)} g</span>
                </div>
                <div className={`${styles.summaryCard} ${styles.summaryHidratacion}`}>
                  <span className={styles.summaryLabel}>Hidratación</span>
                  <span className={styles.summaryValue}>
                    {resultado.hidratacion_pct > 0
                      ? `${formatNumber(resultado.hidratacion_pct, 1)} %`
                      : '—'}
                  </span>
                </div>
                {resultado.rendimiento_porciones !== undefined && (
                  <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Porciones</span>
                    <span className={styles.summaryValue}>{resultado.rendimiento_porciones}</span>
                  </div>
                )}
              </div>

              {/* Tabla de porcentajes */}
              <div className={styles.tableWrapper} role="region" aria-label="Tabla de porcentajes del panadero">
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Ingrediente</th>
                      <th>Gramos</th>
                      <th>% Panadero</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Harina siempre primero */}
                    <tr className={styles.rowHarina}>
                      <td><span aria-hidden="true">🌾</span> Harina</td>
                      <td>{formatNumber(resultado.harina_g, 0)} g</td>
                      <td className={styles.pct}>100,0 %</td>
                    </tr>
                    {resultado.ingredientes.map((ing, idx) => {
                      const esAgua = /agua/i.test(ing.nombre);
                      return (
                        <tr
                          key={idx}
                          className={esAgua ? styles.rowAgua : styles.rowNormal}
                        >
                          <td><span aria-hidden="true">{esAgua ? '💧' : '•'}</span> {ing.nombre}</td>
                          <td>{formatNumber(ing.gramos, 0)} g</td>
                          <td className={styles.pct}>{formatNumber(ing.porcentajePanadero, 1)} %</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {resultado.hidratacion_pct > 0 && (
                <div className={styles.hidratacionNote} role="note">
                  <span aria-hidden="true">💧</span> La hidratación de esta masa es <strong>{formatNumber(resultado.hidratacion_pct, 1)} %</strong>
                  {resultado.hidratacion_pct < 60 && ' — masa seca, fácil de moldear'}
                  {resultado.hidratacion_pct >= 60 && resultado.hidratacion_pct < 70 && ' — hidratación estándar, equilibrada'}
                  {resultado.hidratacion_pct >= 70 && resultado.hidratacion_pct < 80 && ' — hidratación alta, miga abierta'}
                  {resultado.hidratacion_pct >= 80 && ' — hidratación muy alta, técnica avanzada'}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sección educativa */}
      <EducationalSection
        title="📚 ¿Qué es el porcentaje del panadero?"
        subtitle="El sistema que usan los profesionales para formular recetas con precisión"
      >
        <section className={styles.guideSection}>
          <h2>¿Por qué la harina siempre es 100%?</h2>
          <p>
            En el sistema de porcentaje del panadero, la harina es la referencia fija (100%) y
            <strong> cada ingrediente se expresa como porcentaje del peso de la harina</strong>, no
            del peso total de la masa. Esto parece contraintuitivo al principio: el agua puede ser
            el 65%, la sal el 2% y la levadura el 0,3%, y la suma de todos los porcentajes supera
            el 100%. Eso es normal y correcto.
          </p>
          <p>
            La razón de este sistema es simple: la harina determina la estructura de la masa y es
            el ingrediente central en cualquier pan. Usando la harina como referencia, puedes
            escalar una receta de forma inmediata: si multiplicas la harina por 3, multiplicas
            todos los ingredientes por 3 y los porcentajes no cambian.
          </p>

          <h2>Diferencia con los porcentajes normales</h2>
          <p>
            En cocina cotidiana, los porcentajes suelen calcularse sobre el total. Por ejemplo, si
            tienes 1000 g de masa (650 g de agua + 350 g de harina), el agua sería el 65% del total.
          </p>
          <p>
            En panadería profesional, ese mismo 650 g de agua sobre 1000 g de harina se llama
            <strong> hidratación al 65%</strong>. Nótese que los gramos de la receta no han cambiado,
            pero el denominador es la harina, no el total. Esto es lo que confunde a los principiantes
            cuando ven recetas con porcentajes que suman más de 100%.
          </p>

          <h2>Hidrataciones típicas según el tipo de pan</h2>
          <div className={styles.tablaComparativa}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Pan</th>
                  <th>Hidratación</th>
                  <th>Característica</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Bagel / Pretzel</td>
                  <td>50–55 %</td>
                  <td>Masa muy firme, moldeable</td>
                </tr>
                <tr>
                  <td>Pan de molde clásico</td>
                  <td>60–65 %</td>
                  <td>Suave, fácil de trabajar</td>
                </tr>
                <tr>
                  <td>Baguette clásica</td>
                  <td>65–68 %</td>
                  <td>Corteza crujiente, miga semiabierta</td>
                </tr>
                <tr>
                  <td>Chapata / Pan de campo</td>
                  <td>70–75 %</td>
                  <td>Miga abierta, algo pegajosa al amasar</td>
                </tr>
                <tr>
                  <td>Ciabatta</td>
                  <td>75–80 %</td>
                  <td>Muy pegajosa, requiere plegados</td>
                </tr>
                <tr>
                  <td>Focaccia / Pan de cristal</td>
                  <td>80–100 %</td>
                  <td>Casi líquida, se vierte en molde</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h2>Preguntas frecuentes</h2>

          <div className={styles.faqItem}>
            <h3>¿Es lo mismo que el porcentaje en peso?</h3>
            <p>
              No. El porcentaje en peso divide cada ingrediente entre el peso total de la mezcla.
              El porcentaje del panadero divide cada ingrediente entre el peso de la harina.
              Ambos sistemas son coherentes, pero no intercambiables. Los profesionales usan el
              del panadero porque hace el escalado trivial.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Por qué la levadura es un porcentaje tan pequeño (0,3%)?</h3>
            <p>
              Porque su función no es volumétrica sino catalítica: una pequeña cantidad de
              levadura fermenta toda la masa. En levadura fresca, 1–2% es una cantidad alta
              (fermentación rápida); 0,1–0,3% es fermentación lenta o masa madre reducida.
              Trabajar con porcentajes del panadero hace estos decimales comparables entre recetas.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Puedo usar esta calculadora con harina compuesta (varios tipos)?</h3>
            <p>
              Sí. En ese caso, introduce el peso total de harinas en el campo &quot;Harina (base)&quot;.
              Si quieres desglosar (p. ej. 800 g de harina de trigo + 200 g de centeno), suma
              ambas y añade el centeno como ingrediente aparte con su porcentaje real.
              Es habitual en panes de mezcla: el centeno aparecerá como &quot;Centeno — 20%&quot;.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Cómo sé cuántas porciones salen de mi receta?</h3>
            <p>
              Introduce el peso por porción en el campo opcional. La calculadora divide el peso
              total de la masa entre ese valor. Recuerda que el pan pierde entre el 10% y el 20%
              de su peso durante el horneado (evaporación de agua), así que los pesos de las
              porciones de masa serán ligeramente superiores al peso del pan cocido.
            </p>
          </div>

          <div className={styles.faqItem}>
            <h3>¿Para qué sirve conocer el porcentaje de sal?</h3>
            <p>
              La sal tiene un rango funcional estrecho: por debajo del 1,5% el pan sabe soso y
              la masa es más débil (la sal refuerza la red de gluten); por encima del 3% puede
              inhibir la fermentación. El rango estándar es 1,8–2,2% de sal respecto a la harina.
              Con el porcentaje del panadero puedes verificar esto de un vistazo en cualquier receta.
            </p>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-porcentaje-panadero')} />
      <ShareCard appName="calculadora-porcentaje-panadero" />
      <Footer appName="calculadora-porcentaje-panadero" />
    </div>
  );
}
