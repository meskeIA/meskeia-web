'use client';
// @disclaimer: exempt

import { useState, type ChangeEvent } from 'react';
import styles from './CalculadoraGanache.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  EducationalSection,
  ShareCard,
} from '@/components';
import {
  calcularGanache,
  type TipoChocolate,
  type TexturaGanache,
} from '@/lib/calculadoras/cocina';
import { formatNumber, parseSpanishNumber } from '@/lib/formatters';
import { PREGUNTAS_FRECUENTES } from './metadata';

// Rango que admite la app: el que declara el campo («mínimo 50 g», max 5000).
const MIN_G = 50;
const MAX_G = 5000;

/** Gramos con decimal solo si lo tienen: 250,5 g, 138 g. */
function gramos(n: number): string {
  return formatNumber(n, Number.isInteger(n) ? 0 : 1);
}

/**
 * Lee la cantidad tecleada (hallazgos 4597 y 4598). Antes se borraba todo lo que no era cifra
 * («250,5» → 2505 g, «-100» → 100 g, «1e3» → 13 g) y `|| 200` convertía el 0 en 200 g; el
 * rango declarado no se aplicaba. Ahora formato español y, fuera de rango, aviso sin cifras.
 */
function leerCantidad(texto: string): { valor: number | null; aviso: string | null } {
  const n = parseSpanishNumber(texto);
  if (!Number.isFinite(n) || n <= 0) {
    return { valor: null, aviso: 'Escribe una cantidad válida en gramos, por ejemplo 200 o 250,5.' };
  }
  if (n < MIN_G || n > MAX_G) {
    return { valor: null, aviso: `La cantidad tiene que estar entre ${MIN_G} y ${MAX_G} g.` };
  }
  return { valor: n, aviso: null };
}

// ─── Datos descriptivos para la UI ───────────────────────────────────────────

interface InfoTipoChocolate {
  id: TipoChocolate;
  nombre: string;
  rango: string;
  descripcion: string;
  emoji: string;
}

const TIPOS_CHOCOLATE: InfoTipoChocolate[] = [
  {
    id: 'negro_extra',
    nombre: 'Negro Extra',
    rango: '70–99 % cacao',
    descripcion: 'Intenso y amargo. Mayor contenido en manteca de cacao.',
    emoji: '🍫',
  },
  {
    id: 'negro',
    nombre: 'Negro',
    rango: '55–69 % cacao',
    descripcion: 'El más versátil para repostería. Equilibrio sabor-dulzor.',
    emoji: '🟫',
  },
  {
    id: 'semi_fondant',
    nombre: 'Semi-fondant',
    rango: '40–54 % cacao',
    descripcion: 'Intermedio. Buena cobertura y sabor más suave.',
    emoji: '🟤',
  },
  {
    id: 'con_leche',
    nombre: 'Con Leche',
    rango: '28–39 % cacao',
    descripcion: 'Dulce y cremoso. Requiere más chocolate para la misma firmeza.',
    emoji: '🥛',
  },
  {
    id: 'blanco',
    nombre: 'Blanco',
    // RD 1055/2003 (BOE-A-2003-15599), anexo 1.9: al menos un 20 % de manteca de cacao (hallazgo 4603)
    rango: 'sin pasta de cacao · ≥ 20 % de manteca',
    descripcion: 'Sin pasta de cacao, solo su manteca. Muy dulce y delicado.',
    emoji: '⬜',
  },
];

interface InfoTextura {
  id: TexturaGanache;
  nombre: string;
  descripcion: string;
  emoji: string;
}

const TEXTURAS: InfoTextura[] = [
  {
    id: 'glaseado',
    nombre: 'Glaseado',
    descripcion: 'Fluido a temperatura ambiente. Ideal para coberturas y drip cake.',
    emoji: '🍰',
  },
  {
    id: 'trufa',
    nombre: 'Trufa',
    descripcion: 'Cremoso tras refrigerar. Para rellenar bombones y macarons.',
    emoji: '🍫',
  },
  {
    id: 'firme',
    nombre: 'Firme',
    descripcion: 'Muy denso. Para modelar, bañar en capa fina y pralinés.',
    emoji: '💎',
  },
];

// ─── Componente principal ─────────────────────────────────────────────────────

export default function CalculadoraGanachePage() {
  const [tipoChocolate, setTipoChocolate] = useState<TipoChocolate>('negro');
  const [textura, setTextura] = useState<TexturaGanache>('trufa');
  const [totalGStr, setTotalGStr] = useState('200');
  const [calculado, setCalculado] = useState(false);

  const lectura = leerCantidad(totalGStr);
  const resultado = lectura.valor !== null ? calcularGanache(tipoChocolate, textura, lectura.valor) : null;
  const avisoVisible = calculado && lectura.aviso !== null;

  const handleCalcular = () => {
    setCalculado(true);
  };

  const handleTotalChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTotalGStr(e.target.value);
    setCalculado(false);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Ganache</h1>
        <p className={styles.subtitle}>
          Proporciones exactas de chocolate y nata según tipo y textura
        </p>
      </header>

      <LegalNotice />

      <main className={styles.mainContent}>

        {/* Paso 1: Tipo de chocolate */}
        <section className={styles.paso}>
          <h2 className={styles.pasoTitulo}>
            <span className={styles.pasoBadge}>1</span>
            Tipo de chocolate
          </h2>
          <div className={styles.chocolateGrid}>
            {TIPOS_CHOCOLATE.map((tipo) => (
              <button
                type="button"
                key={tipo.id}
                className={`${styles.chocolateCard} ${tipoChocolate === tipo.id ? styles.chocolateCardActiva : ''}`}
                onClick={() => { setTipoChocolate(tipo.id); setCalculado(false); }}
                aria-pressed={tipoChocolate === tipo.id}
              >
                <span className={styles.chocolateEmoji} aria-hidden="true">{tipo.emoji}</span>
                <strong className={styles.chocolateNombre}>{tipo.nombre}</strong>
                <span className={styles.chocolateRango}>{tipo.rango}</span>
                <span className={styles.chocolateDesc}>{tipo.descripcion}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Paso 2: Textura */}
        <section className={styles.paso}>
          <h2 className={styles.pasoTitulo}>
            <span className={styles.pasoBadge}>2</span>
            Textura deseada
          </h2>
          <div className={styles.texturaGrid}>
            {TEXTURAS.map((tex) => (
              <button
                type="button"
                key={tex.id}
                className={`${styles.texturaCard} ${textura === tex.id ? styles.texturaCardActiva : ''}`}
                onClick={() => { setTextura(tex.id); setCalculado(false); }}
                aria-pressed={textura === tex.id}
              >
                <span className={styles.texturaEmoji} aria-hidden="true">{tex.emoji}</span>
                <strong className={styles.texturaNombre}>{tex.nombre}</strong>
                <span className={styles.texturaDesc}>{tex.descripcion}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Paso 3: Total de ganache */}
        <section className={styles.paso}>
          <h2 className={styles.pasoTitulo}>
            <span className={styles.pasoBadge}>3</span>
            Cantidad total de ganache
          </h2>
          <div className={styles.cantidadRow}>
            <div className={styles.inputWrapper}>
              <input
                type="text"
                inputMode="decimal"
                id="totalGanache"
                value={totalGStr}
                onChange={handleTotalChange}
                className={styles.inputCantidad}
                aria-label="Gramos totales de ganache a preparar"
                aria-describedby="totalGanacheHint"
                aria-invalid={avisoVisible || undefined}
              />
              <span className={styles.inputUnidad}>g</span>
            </div>
            <p className={styles.cantidadHint} id="totalGanacheHint">
              Gramos totales de ganache a preparar (de {MIN_G} a {MAX_G} g)
            </p>
          </div>
        </section>

        {/* Botón calcular */}
        <button type="button" className={styles.btnCalcular} onClick={handleCalcular}>
          Calcular proporciones
        </button>

        {/* Resultado: la región viva está montada desde el principio y solo cambia su
            contenido (hallazgo 4605: nacía ya llena y el lector no la anunciaba). */}
        <div role="region" aria-label="Resultado del cálculo" aria-live="polite">
        {avisoVisible && (
          <p className={styles.avisoCantidad}>{lectura.aviso}</p>
        )}
        {calculado && resultado && (
          <section className={styles.resultadoSection}>
            <h2 className={styles.resultadoTitulo}>Proporciones para {gramos(resultado.total_g)} g de ganache</h2>

            <div className={styles.propGrid}>
              <div className={styles.propCard}>
                <span className={styles.propLabel}>Chocolate</span>
                <span className={styles.propValor}>{gramos(resultado.chocolate_g)} g</span>
                <span className={styles.propSub}>{resultado.porcentaje_cacao}</span>
              </div>
              <div className={styles.propSeparador} aria-hidden="true">+</div>
              <div className={styles.propCard}>
                <span className={styles.propLabel}>Nata (35&nbsp;% m.g.)</span>
                <span className={styles.propValor}>{gramos(resultado.nata_g)} g</span>
                <span className={styles.propSub}>Nata para montar</span>
              </div>
              <div className={styles.propSeparador} aria-hidden="true">=</div>
              <div className={`${styles.propCard} ${styles.propCardTotal}`}>
                <span className={styles.propLabel}>Total</span>
                <span className={styles.propValor}>{gramos(resultado.total_g)} g</span>
                <span className={styles.propSub}>Ganache</span>
              </div>
            </div>

            <div className={styles.ratioBox}>
              <strong>Ratio:</strong> {resultado.ratio_texto}
            </div>

            <div className={styles.temperaturaBox}>
              <span className={styles.temperaturaIcon} aria-hidden="true">🌡️</span>
              <div>
                <strong>Temperatura de trabajo:</strong>
                <p>{resultado.temperatura_trabajo_c}</p>
              </div>
            </div>

            <div className={styles.usosSection}>
              <strong>Usos típicos para este ganache:</strong>
              <ul className={styles.usosList}>
                {resultado.usos.map((uso, i) => (
                  <li key={i} className={styles.usoItem}>{uso}</li>
                ))}
              </ul>
            </div>

          </section>
        )}
        </div>

        {/* Tabla de referencia rápida de ratios */}
        <section className={styles.tablaReferencia}>
          <h2 className={styles.tablaRefTitulo}>Tabla de ratios (chocolate : nata)</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.tablaRatios}>
              <thead>
                <tr>
                  <th>Tipo de chocolate</th>
                  <th>Glaseado</th>
                  <th>Trufa</th>
                  <th>Firme</th>
                </tr>
              </thead>
              <tbody>
                {TIPOS_CHOCOLATE.map((tipo) => (
                  <tr
                    key={tipo.id}
                    className={tipoChocolate === tipo.id ? styles.filaActiva : ''}
                  >
                    <td>
                      <span aria-hidden="true">{tipo.emoji}</span> {tipo.nombre}
                      <span className={styles.celdaRango}>{tipo.rango}</span>
                    </td>
                    {(['glaseado', 'trufa', 'firme'] as const).map((tex) => {
                      const celda = calcularGanache(tipo.id, tex, 200);
                      return (
                        <td key={tex} className={textura === tex ? styles.celdaActiva : ''}>
                          {celda.chocolate_g}&nbsp;g / {celda.nata_g}&nbsp;g
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className={styles.tablaNota}>
                    Cantidades para 200 g de ganache total. El formato es chocolate&nbsp;/&nbsp;nata.
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

      </main>

      {/* Sección educativa */}
      <EducationalSection
        title="Todo sobre el ganache"
        subtitle="Fundamentos técnicos y aplicaciones"
        icon="🍫"
      >
        <div className={styles.educationalContent}>

          <section className={styles.conceptoSection}>
            <h2>¿Qué es el ganache y sus tres texturas?</h2>
            <p>
              El ganache es una emulsión de chocolate y nata (o un líquido graso) que forma una mezcla
              homogénea. Su textura depende principalmente del ratio chocolate:nata y de la temperatura
              a la que se usa. Los ratios de estas tarjetas son los del chocolate negro; el de
              leche y el blanco necesitan más chocolate para la misma textura (tabla completa más abajo):
            </p>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🍰</span>
                <h4>Glaseado (ratio bajo)</h4>
                <p>
                  Con chocolate negro, ratio 1:1 a 1,5:1 según el cacao (con leche 2:1, blanco 3:1).
                  Fluido y brillante a temperatura ambiente o ligeramente tibio.
                  Ideal para cubrir tartas, hacer drip cakes o glasear eclairs. Se cristaliza con
                  una capa brillante.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🍫</span>
                <h4>Trufa (ratio medio)</h4>
                <p>
                  Con chocolate negro, ratio 2:1 a 2,5:1 (con leche 3:1, blanco 4:1). Cremoso tras
                  2–4 horas en nevera. Permite bolearlo a mano
                  para hacer trufas, o usarlo como relleno de bombones y macarons. La base clásica
                  de los chocolates artesanos.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">💎</span>
                <h4>Firme (ratio alto)</h4>
                <p>
                  Con chocolate negro, ratio 3:1 a 3,5:1 (con leche 4:1, blanco 5:1). Muy denso
                  incluso a temperatura ambiente. Permite
                  modelar formas, recubrir pralinés con capa muy delgada o usarlo como base
                  de bombones con cáscara ultrafina.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.conceptoSection}>
            <h2>Por qué el % de cacao cambia el ratio</h2>
            <p>
              El chocolate negro extra (70–99&nbsp;%) tiene alta proporción de manteca de cacao y sólidos de cacao,
              que son los que aportan estructura. Al mezclar con nata, la manteca de cacao forma una red
              cristalina estable con relativa poca cantidad de chocolate.
            </p>
            <p style={{ marginTop: '12px' }}>
              El chocolate con leche (28–39&nbsp;%) y el blanco tienen muchos más sólidos de leche, azúcar y menos
              manteca de cacao. Esto los hace menos estables y requieren más chocolate por cada parte
              de nata para conseguir la misma firmeza. Es por eso que el ratio para chocolate blanco
              en ganache firme llega a ser 5:1.
            </p>
            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>El chocolate blanco no es idéntico al negro</strong>
              </div>
              <p>
                El chocolate blanco no lleva pasta de cacao (los sólidos magros, donde están la
                teobromina y los polifenoles): solo manteca de cacao —al menos un 20&nbsp;%, según el
                Real Decreto 1055/2003—, azúcar y leche. Su comportamiento térmico y su punto de
                fusión son distintos. Los ganaches de chocolate blanco son más delicados y
                propensos a separarse; se recomienda añadir la nata caliente en tres tandas y
                emulsionar bien con una espátula o túrmix de inmersión.
              </p>
            </div>
          </section>

          <section className={styles.conceptoSection}>
            <h2>Cómo preparar un ganache correctamente: la emulsión</h2>
            <ol className={styles.stepGuide}>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">1</span>
                <div className={styles.stepContent}>
                  <strong>Trocea el chocolate finamente</strong>
                  <p>
                    Cuanto más pequeños sean los trozos, más rápido se derretirá y más homogénea
                    quedará la emulsión. Para chocolate con más del 60&nbsp;% de cacao, usar un cuchillo
                    de sierra es más eficiente.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">2</span>
                <div className={styles.stepContent}>
                  <strong>Calienta la nata hasta casi hervir (85–90&nbsp;°C)</strong>
                  <p>
                    No hace falta que hierva. Con 85–90&nbsp;°C es suficiente para fundir el chocolate
                    y pasteurizar la nata. Si la nata hierve puede perder parte de su grasa y
                    el ganache quedará menos brillante.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">3</span>
                <div className={styles.stepContent}>
                  <strong>Vierte la nata sobre el chocolate en tres tandas</strong>
                  <p>
                    Vierte un tercio de la nata y mezcla desde el centro hacia afuera con una
                    espátula de silicona formando círculos pequeños (técnica del núcleo). Añade
                    el segundo tercio y repite. Con el último tercio emulsiona hasta obtener
                    una textura lisa y brillante.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">4</span>
                <div className={styles.stepContent}>
                  <strong>Termina con túrmix si es necesario</strong>
                  <p>
                    Para un ganache muy liso (bombones, glaseados de presentación), usar un
                    túrmix de inmersión a baja velocidad, evitando incorporar aire. Inclina
                    el vaso y mantén la cabeza del túrmix sumergida.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">5</span>
                <div className={styles.stepContent}>
                  <strong>Respeta los tiempos de reposo</strong>
                  <p>
                    Para glaseado: usar a 30–32&nbsp;°C inmediatamente o dejar cristalizar 1–2&nbsp;h a
                    temperatura ambiente. Para trufa: refrigerar 2–4&nbsp;h antes de bolearlo.
                    Para ganache firme: refrigerar 4–6&nbsp;h.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          <section className={styles.conceptoSection}>
            <h2>Tabla completa de ratios por tipo y textura</h2>
            <div className={styles.tableWrapper}>
              <table className={styles.comparativaTable}>
                <thead>
                  <tr>
                    <th>Tipo de chocolate</th>
                    <th>% Cacao</th>
                    <th>Glaseado</th>
                    <th>Trufa</th>
                    <th>Firme</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Negro Extra</strong></td>
                    <td>70–99&nbsp;%</td>
                    <td>1:1</td>
                    <td>2:1</td>
                    <td>3:1</td>
                  </tr>
                  <tr>
                    <td><strong>Negro</strong></td>
                    <td>55–69&nbsp;%</td>
                    <td>1,2:1</td>
                    <td>2,2:1</td>
                    <td>3:1</td>
                  </tr>
                  <tr>
                    <td><strong>Semi-fondant</strong></td>
                    <td>40–54&nbsp;%</td>
                    <td>1,5:1</td>
                    <td>2,5:1</td>
                    <td>3,5:1</td>
                  </tr>
                  <tr>
                    <td><strong>Con Leche</strong></td>
                    <td>28–39&nbsp;%</td>
                    <td>2:1</td>
                    <td>3:1</td>
                    <td>4:1</td>
                  </tr>
                  <tr>
                    <td><strong>Blanco</strong></td>
                    <td>Sin pasta; ≥&nbsp;20&nbsp;% de manteca</td>
                    <td>3:1</td>
                    <td>4:1</td>
                    <td>5:1</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className={styles.tablaNota}>
              El ratio indica partes de chocolate por cada parte de nata en peso.
              Un ratio 2:1 significa el doble de chocolate que de nata.
            </p>
          </section>

          <section className={styles.conceptoSection}>
            <h2>Aplicaciones clásicas del ganache</h2>
            <div className={styles.escenariosGrid}>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🍫</span>
                  <strong>Trufas de chocolate</strong>
                </div>
                <p className={styles.escenarioExample}>
                  Ganache textura trufa con chocolate negro o negro extra, refrigerado 2–4 horas.
                  Se bolea a mano y se reboza en cacao en polvo, fideos de chocolate o frutos secos.
                </p>
                <p className={styles.escenarioTip}>
                  Para 600&nbsp;g de ganache: con negro, 2,2:1 (413&nbsp;g de chocolate y 187&nbsp;g
                  de nata); con negro extra, 2:1 (400&nbsp;g y 200&nbsp;g).
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🎂</span>
                  <strong>Tarta de chocolate</strong>
                </div>
                <p className={styles.escenarioExample}>
                  Ganache glaseado para cubrir la tarta una vez atemperado a 30–32&nbsp;°C. Se vierte
                  por el centro y se extiende con espátula o dejando caer por los laterales
                  (drip cake).
                </p>
                <p className={styles.escenarioTip}>
                  Para una tarta de 20&nbsp;cm: unos 300–400&nbsp;g de ganache total.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🍪</span>
                  <strong>Relleno de macarons</strong>
                </div>
                <p className={styles.escenarioExample}>
                  Ganache textura trufa con chocolate negro o con leche. Tras refrigerar,
                  se pone en manga pastelera y se aplica sobre la concha del macaron. Reposar
                  en nevera 24h para mejorar la textura (maduración).
                </p>
                <p className={styles.escenarioTip}>
                  Para 20 macarons: unos 150–200&nbsp;g de ganache son suficientes.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🍬</span>
                  <strong>Relleno de bombones</strong>
                </div>
                <p className={styles.escenarioExample}>
                  Ganache firme o textura trufa para rellenar cáscaras de bombón. El ganache
                  firme permite crear una capa delgada de cobertura sin molde (bombón de
                  una pieza), mientras que el de trufa es el relleno clásico del bombón
                  con cáscara atemperada.
                </p>
                <p className={styles.escenarioTip}>
                  Como la ganache lleva nata fresca, los bombones se guardan en nevera y bien
                  tapados. Cuánto duran depende de la proporción, del azúcar y de la higiene al
                  prepararlos: no hay una cifra que valga para todas las recetas.
                </p>
              </div>
            </div>
          </section>

          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <strong>Problemas frecuentes al hacer ganache</strong>
            </div>
            <ul className={styles.warningList}>
              <li>
                <strong>El ganache se separa (se &quot;corta&quot;).</strong> Ocurre cuando la nata está demasiado
                caliente, cuando hay demasiado líquido, o cuando el chocolate tiene mucha manteca.
                Solución: añade una pequeña cantidad de nata tibia y emulsiona de nuevo con túrmix.
              </li>
              <li>
                <strong>El ganache queda granuloso.</strong> El chocolate se ha recristalizado por un
                choque térmico. Asegúrate de que la nata esté a 85–90&nbsp;°C y vierte en tres tandas.
                Si ya está granuloso, caliéntalo suavemente al baño maría.
              </li>
              <li>
                <strong>El ganache no solidifica.</strong> Probablemente el ratio tiene más nata
                de la cuenta o usaste nata de bajo contenido graso. Usa siempre nata con
                mínimo 35&nbsp;% de materia grasa. Para corregirlo, derrite más chocolate y
                mézclalo con el ganache flojo.
              </li>
              <li>
                <strong>El ganache queda demasiado duro.</strong> El ratio tiene demasiado chocolate.
                Puedes rescatarlo calentando al baño maría y añadiendo nata caliente poco a poco
                hasta conseguir la consistencia deseada.
              </li>
              <li>
                <strong>El ganache de chocolate blanco se separa fácilmente.</strong> Es el más
                delicado por su alto contenido en azúcar y proteínas de leche. Trabaja siempre
                a temperaturas moderadas y nunca calientes en exceso. Si se separa, el túrmix
                de inmersión suele recuperarlo.
              </li>
            </ul>
          </div>

          {/* FAQ visible: del MISMO array que el FAQPage JSON-LD (metadata.ts, hallazgo 4599). */}
          <section className={styles.conceptoSection}>
            <h2>Preguntas frecuentes</h2>
            {PREGUNTAS_FRECUENTES.map((f) => (
              <div key={f.question}>
                <h3>{f.question}</h3>
                <p>{f.answer}</p>
              </div>
            ))}
          </section>

        </div>
      </EducationalSection>

      <RelatedApps />
      <ShareCard appName="calculadora-ganache" />
      <Footer appName="calculadora-ganache" />
    </div>
  );
}
