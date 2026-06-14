'use client';
// @disclaimer: exempt

import { useState } from 'react';
import styles from './CalculadoraGanache.module.css';
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
  calcularGanache,
  type TipoChocolate,
  type TexturaGanache,
} from '@/lib/calculadoras/cocina';

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
    rango: '70–99% cacao',
    descripcion: 'Intenso y amargo. Mayor contenido en manteca de cacao.',
    emoji: '🍫',
  },
  {
    id: 'negro',
    nombre: 'Negro',
    rango: '55–70% cacao',
    descripcion: 'El más versátil para repostería. Equilibrio sabor-dulzor.',
    emoji: '🟫',
  },
  {
    id: 'semi_fondant',
    nombre: 'Semi-fondant',
    rango: '40–55% cacao',
    descripcion: 'Intermedio. Buena cobertura y sabor más suave.',
    emoji: '🟤',
  },
  {
    id: 'con_leche',
    nombre: 'Con Leche',
    rango: '28–40% cacao',
    descripcion: 'Dulce y cremoso. Requiere más chocolate para la misma firmeza.',
    emoji: '🥛',
  },
  {
    id: 'blanco',
    nombre: 'Blanco',
    rango: '0% cacao (manteca)',
    descripcion: 'Sin sólidos de cacao. Muy dulce y delicado.',
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

  const totalG = parseInt(totalGStr, 10) || 200;
  const resultado = calcularGanache(tipoChocolate, textura, totalG);

  const handleCalcular = () => {
    setCalculado(true);
  };

  const handleTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setTotalGStr(val);
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
                type="number"
                id="totalGanache"
                value={totalGStr}
                onChange={handleTotalChange}
                min={50}
                max={5000}
                step={50}
                className={styles.inputCantidad}
                aria-label="Gramos totales de ganache a preparar"
              />
              <span className={styles.inputUnidad}>g</span>
            </div>
            <p className={styles.cantidadHint}>
              Gramos totales de ganache a preparar (mínimo 50 g)
            </p>
          </div>
        </section>

        {/* Botón calcular */}
        <button className={styles.btnCalcular} onClick={handleCalcular}>
          Calcular proporciones
        </button>

        {/* Resultado */}
        {calculado && (
          <section className={styles.resultadoSection} role="region" aria-label="Resultado del cálculo" aria-live="polite">
            <h2 className={styles.resultadoTitulo}>Proporciones para {resultado.total_g} g de ganache</h2>

            <div className={styles.propGrid}>
              <div className={styles.propCard}>
                <span className={styles.propLabel}>Chocolate</span>
                <span className={styles.propValor}>{resultado.chocolate_g} g</span>
                <span className={styles.propSub}>{resultado.porcentaje_cacao}</span>
              </div>
              <div className={styles.propSeparador} aria-hidden="true">+</div>
              <div className={styles.propCard}>
                <span className={styles.propLabel}>Nata (35% m.g.)</span>
                <span className={styles.propValor}>{resultado.nata_g} g</span>
                <span className={styles.propSub}>Nata para montar</span>
              </div>
              <div className={styles.propSeparador} aria-hidden="true">=</div>
              <div className={`${styles.propCard} ${styles.propCardTotal}`}>
                <span className={styles.propLabel}>Total</span>
                <span className={styles.propValor}>{resultado.total_g} g</span>
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

            {resultado.nota && (
              <div className={styles.notaBox}>
                <span aria-hidden="true">💡</span>
                <span><strong>Marcas de referencia:</strong> {resultado.nota}</span>
              </div>
            )}
          </section>
        )}

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
                    <td className={textura === 'glaseado' ? styles.celdaActiva : ''}>
                      {calcularGanache(tipo.id, 'glaseado', 200).chocolate_g}g / {calcularGanache(tipo.id, 'glaseado', 200).nata_g}g
                    </td>
                    <td className={textura === 'trufa' ? styles.celdaActiva : ''}>
                      {calcularGanache(tipo.id, 'trufa', 200).chocolate_g}g / {calcularGanache(tipo.id, 'trufa', 200).nata_g}g
                    </td>
                    <td className={textura === 'firme' ? styles.celdaActiva : ''}>
                      {calcularGanache(tipo.id, 'firme', 200).chocolate_g}g / {calcularGanache(tipo.id, 'firme', 200).nata_g}g
                    </td>
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
              a la que se usa:
            </p>
            <div className={styles.tipsGrid}>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🍰</span>
                <h4>Glaseado (ratio bajo)</h4>
                <p>
                  Ratio 1:1 a 2:1. Fluido y brillante a temperatura ambiente o ligeramente tibio.
                  Ideal para cubrir tartas, hacer drip cakes o glasear eclairs. Se cristaliza con
                  una capa brillante.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">🍫</span>
                <h4>Trufa (ratio medio)</h4>
                <p>
                  Ratio 2:1 a 3:1. Cremoso tras 2–4 horas en nevera. Permite bolearlo a mano
                  para hacer trufas, o usarlo como relleno de bombones y macarons. La base clásica
                  de los chocolates artesanos.
                </p>
              </div>
              <div className={styles.tipCard}>
                <span className={styles.tipIcon} aria-hidden="true">💎</span>
                <h4>Firme (ratio alto)</h4>
                <p>
                  Ratio 3:1 o superior. Muy denso incluso a temperatura ambiente. Permite
                  modelar formas, recubrir pralinés con capa muy delgada o usarlo como base
                  de bombones con cáscara ultrafina.
                </p>
              </div>
            </div>
          </section>

          <section className={styles.conceptoSection}>
            <h2>Por qué el % de cacao cambia el ratio</h2>
            <p>
              El chocolate negro extra (70–99%) tiene alta proporción de manteca de cacao y sólidos de cacao,
              que son los que aportan estructura. Al mezclar con nata, la manteca de cacao forma una red
              cristalina estable con relativa poca cantidad de chocolate.
            </p>
            <p style={{ marginTop: '12px' }}>
              El chocolate con leche (28–40%) y el blanco tienen muchos más sólidos de leche, azúcar y menos
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
                El chocolate blanco no contiene sólidos de cacao (teobromina, polifenoles),
                solo manteca de cacao, azúcar y leche. Su comportamiento térmico y su punto de
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
                    quedará la emulsión. Para chocolate con más del 60% de cacao, usar un cuchillo
                    de sierra es más eficiente.
                  </p>
                </div>
              </li>
              <li className={styles.step}>
                <span className={styles.stepNumber} aria-hidden="true">2</span>
                <div className={styles.stepContent}>
                  <strong>Calienta la nata hasta casi hervir (85–90°C)</strong>
                  <p>
                    No hace falta que hierva. Con 85–90°C es suficiente para fundir el chocolate
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
                    Para glaseado: usar a 30–32°C inmediatamente o dejar cristalizar 1–2h a
                    temperatura ambiente. Para trufa: refrigerar 2–4h antes de bolearlo.
                    Para ganache firme: refrigerar 4–6h.
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
                    <td>70–99%</td>
                    <td>1:1</td>
                    <td>2:1</td>
                    <td>3:1</td>
                  </tr>
                  <tr>
                    <td><strong>Negro</strong></td>
                    <td>55–70%</td>
                    <td>1,2:1</td>
                    <td>2,2:1</td>
                    <td>3:1</td>
                  </tr>
                  <tr>
                    <td><strong>Semi-fondant</strong></td>
                    <td>40–55%</td>
                    <td>1,5:1</td>
                    <td>2,5:1</td>
                    <td>3,5:1</td>
                  </tr>
                  <tr>
                    <td><strong>Con Leche</strong></td>
                    <td>28–40%</td>
                    <td>2:1</td>
                    <td>3:1</td>
                    <td>4:1</td>
                  </tr>
                  <tr>
                    <td><strong>Blanco</strong></td>
                    <td>0% (manteca)</td>
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
                  Ratio recomendado: 2:1 (negro) — 400g chocolate / 200g nata para 20–25 trufas.
                </p>
              </div>
              <div className={styles.escenarioCard}>
                <div className={styles.escenarioHeader}>
                  <span className={styles.escenarioIcon} aria-hidden="true">🎂</span>
                  <strong>Tarta de chocolate</strong>
                </div>
                <p className={styles.escenarioExample}>
                  Ganache glaseado para cubrir la tarta una vez atemperado a 30–32°C. Se vierte
                  por el centro y se extiende con espátula o dejando caer por los laterales
                  (drip cake).
                </p>
                <p className={styles.escenarioTip}>
                  Para una tarta de 20 cm: unos 300–400g de ganache total.
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
                  Para 20 macarons: unos 150–200g de ganache son suficientes.
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
                  Los bombones con relleno de trufa duran 2–3 semanas en nevera bien tapados.
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
                choque térmico. Asegúrate de que la nata esté a 85–90°C y vierte en tres tandas.
                Si ya está granuloso, caliéntalo suavemente al baño maría.
              </li>
              <li>
                <strong>El ganache no solidifica.</strong> Probablemente el ratio tiene más nata
                de la cuenta o usaste nata de bajo contenido graso. Usa siempre nata con
                mínimo 35% de materia grasa. Para corregirlo, derrite más chocolate y
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

        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-ganache')} />
      <ShareCard appName="calculadora-ganache" />
      <Footer appName="calculadora-ganache" />
    </div>
  );
}
