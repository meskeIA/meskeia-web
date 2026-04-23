'use client';
// @disclaimer: exempt

import { useState } from 'react';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import LegalNotice from '@/components/LegalNotice';
import RelatedApps from '@/components/RelatedApps';
import ShareCard from '@/components/ShareCard';
import EducationalSection from '@/components/EducationalSection';
import { getRelatedApps } from '@/data/app-relations';
import styles from './VisualizadorAdnPolimerasa.module.css';

const PASOS_HORQUILLA = [
  {
    titulo: 'ADN de doble hebra',
    descripcion: 'El ADN existe como una doble hélice: dos cadenas complementarias unidas por puentes de hidrógeno entre los pares de bases (A-T y G-C). Antes de la replicación, las dos hebras están firmemente unidas.',
    visual: 'doble-hebra',
  },
  {
    titulo: 'La helicasa abre la horquilla',
    descripcion: 'La helicasa rompe los puentes de hidrógeno entre los pares de bases, abriendo la doble hélice. Las dos hebras se separan formando una estructura en "Y" llamada horquilla de replicación.',
    visual: 'helicasa',
  },
  {
    titulo: 'ADN polimerasa en la hebra líder',
    descripcion: 'La hebra líder se sintetiza de forma continua en la misma dirección que avanza la horquilla. La ADN polimerasa añade nucleótidos en dirección 5\'→3\', usando la hebra molde como guía.',
    visual: 'hebra-lider',
  },
  {
    titulo: 'Hebra retrasada: fragmentos de Okazaki',
    descripcion: 'La hebra retrasada debe sintetizarse hacia atrás. La ADN pol trabaja en segmentos discontinuos de ~100-200 nucleótidos llamados fragmentos de Okazaki, que luego se unirán.',
    visual: 'okazaki',
  },
  {
    titulo: 'Ligasa cierra los fragmentos',
    descripcion: 'La ADN ligasa une los fragmentos de Okazaki con enlaces covalentes fosfodiéster, completando la hebra retrasada. El resultado: dos moléculas de ADN idénticas a la original.',
    visual: 'ligasa',
  },
];

const DATOS_FIDELIDAD = [
  {
    icono: '⚡',
    titulo: 'Velocidad',
    valor: '~1.000 nt/s',
    descripcion: 'Nucleótidos por segundo (bacterias). El genoma humano (~3.000 millones de pares de bases) tarda ~8 horas en replicarse con múltiples horquillas activas simultáneamente.',
    color: '#2E86AB',
  },
  {
    icono: '🎯',
    titulo: 'Fidelidad base',
    valor: '1 error / 10⁵',
    descripcion: 'Sin sistemas de corrección, la ADN polimerasa comete ~1 error por cada 100.000 bases incorporadas.',
    color: '#e67e22',
  },
  {
    icono: '🔍',
    titulo: 'Con proofreading',
    valor: '1 error / 10⁷',
    descripcion: 'La actividad exonucleasa 3\'→5\' detecta y elimina nucleótidos mal insertados. Reduce el error 100 veces.',
    color: '#48A9A6',
  },
  {
    icono: '🛡️',
    titulo: 'Con reparación post-rep.',
    valor: '1 error / 10⁹',
    descripcion: 'Sistemas adicionales de reparación del ADN llevan la tasa de error final a ~1 por cada 1.000 millones de bases. En una célula humana: ~1-2 errores por replicación completa.',
    color: '#27ae60',
  },
];

const POLIMERASAS_EUCARIOTAS = [
  { nombre: 'Pol α', localizacion: 'Núcleo', funcion: 'Inicia la replicación (junto con primasa)', detalle: 'Sintetiza el cebador de ARN inicial' },
  { nombre: 'Pol δ', localizacion: 'Núcleo', funcion: 'Replicación de la hebra retrasada', detalle: 'Alta fidelidad, actividad proofreading' },
  { nombre: 'Pol ε', localizacion: 'Núcleo', funcion: 'Replicación de la hebra líder', detalle: 'Alta procesividad y fidelidad' },
  { nombre: 'Pol γ', localizacion: 'Mitocondria', funcion: 'Replica el ADN mitocondrial', detalle: 'Herencia de endosimbiosis bacteriana' },
  { nombre: 'Pol β', localizacion: 'Núcleo', funcion: 'Reparación del ADN (BER)', detalle: 'Reparación por escisión de bases' },
];

function SvgDobleHebra() {
  const peldanos = Array.from({ length: 12 }, (_, i) => i);
  const pares = ['AT', 'GC', 'AT', 'GC', 'GC', 'AT', 'GC', 'AT', 'AT', 'GC', 'AT', 'GC'];
  return (
    <svg viewBox="0 0 320 120" className={styles.svgHorquilla} aria-label="ADN de doble hebra">
      <line x1="20" y1="30" x2="300" y2="30" stroke="#2E86AB" strokeWidth="4" strokeLinecap="round" />
      <line x1="20" y1="90" x2="300" y2="90" stroke="#48A9A6" strokeWidth="4" strokeLinecap="round" />
      {peldanos.map((i) => {
        const x = 30 + i * 22;
        const par = pares[i];
        const color1 = par === 'AT' ? '#e74c3c' : '#27ae60';
        const color2 = par === 'AT' ? '#3498db' : '#f39c12';
        return (
          <g key={i}>
            <rect x={x - 5} y="34" width="5" height="22" fill={color1} rx="2" />
            <rect x={x - 5} y="64" width="5" height="22" fill={color2} rx="2" />
            <text x={x - 2} y="62" fontSize="7" textAnchor="middle" fill="#fff" fontWeight="bold">
              {par[0]}
            </text>
            <text x={x - 2} y="72" fontSize="7" textAnchor="middle" fill="#fff" fontWeight="bold">
              {par[1]}
            </text>
          </g>
        );
      })}
      <text x="20" y="22" fontSize="9" fill="#2E86AB" fontWeight="bold">5&#39;</text>
      <text x="295" y="22" fontSize="9" fill="#2E86AB" fontWeight="bold">3&#39;</text>
      <text x="20" y="107" fontSize="9" fill="#48A9A6" fontWeight="bold">3&#39;</text>
      <text x="295" y="107" fontSize="9" fill="#48A9A6" fontWeight="bold">5&#39;</text>
    </svg>
  );
}

function SvgHelicasa() {
  return (
    <svg viewBox="0 0 320 140" className={styles.svgHorquilla} aria-label="Helicasa abriendo la horquilla">
      <line x1="20" y1="30" x2="160" y2="30" stroke="#2E86AB" strokeWidth="4" strokeLinecap="round" />
      <line x1="160" y1="30" x2="260" y2="10" stroke="#2E86AB" strokeWidth="4" strokeLinecap="round" />
      <line x1="20" y1="90" x2="160" y2="90" stroke="#48A9A6" strokeWidth="4" strokeLinecap="round" />
      <line x1="160" y1="90" x2="260" y2="120" stroke="#48A9A6" strokeWidth="4" strokeLinecap="round" />
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const x = 25 + i * 22;
        return <line key={i} x1={x} y1="34" x2={x} y2="86" stroke="#95a5a6" strokeWidth="2" strokeDasharray="3,2" />;
      })}
      <circle cx="165" cy="60" r="18" fill="#95a5a6" opacity="0.9" />
      <text x="165" y="55" fontSize="7" textAnchor="middle" fill="white" fontWeight="bold">Heli</text>
      <text x="165" y="65" fontSize="7" textAnchor="middle" fill="white" fontWeight="bold">casa</text>
      <text x="280" y="14" fontSize="9" fill="#2E86AB" fontWeight="bold">5&#39;→</text>
      <text x="280" y="124" fontSize="9" fill="#48A9A6" fontWeight="bold">←3&#39;</text>
    </svg>
  );
}

function SvgHebraLider() {
  const nucleotidoColors = ['#e74c3c', '#3498db', '#27ae60', '#f39c12', '#9b59b6'];
  return (
    <svg viewBox="0 0 320 160" className={styles.svgHorquilla} aria-label="ADN polimerasa en la hebra líder">
      <line x1="20" y1="30" x2="160" y2="30" stroke="#2E86AB" strokeWidth="4" strokeLinecap="round" />
      <line x1="160" y1="30" x2="260" y2="10" stroke="#2E86AB" strokeWidth="4" strokeLinecap="round" />
      <line x1="20" y1="90" x2="160" y2="90" stroke="#48A9A6" strokeWidth="4" strokeLinecap="round" />
      <line x1="160" y1="90" x2="260" y2="120" stroke="#48A9A6" strokeWidth="4" strokeLinecap="round" />
      <line x1="20" y1="50" x2="130" y2="50" stroke="#7FB3D3" strokeWidth="3" strokeLinecap="round" />
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={25 + i * 22} cy="50" r="5" fill={nucleotidoColors[i]} />
      ))}
      <circle cx="155" cy="42" r="18" fill="#2E86AB" opacity="0.9" />
      <text x="155" y="38" fontSize="6" textAnchor="middle" fill="white" fontWeight="bold">ADN</text>
      <text x="155" y="47" fontSize="6" textAnchor="middle" fill="white" fontWeight="bold">pol III</text>
      <circle cx="175" cy="60" r="18" fill="#95a5a6" opacity="0.9" />
      <text x="175" y="55" fontSize="6" textAnchor="middle" fill="white" fontWeight="bold">Heli</text>
      <text x="175" y="65" fontSize="6" textAnchor="middle" fill="white" fontWeight="bold">casa</text>
      <text x="25" y="145" fontSize="8" fill="#7FB3D3" fontWeight="bold">← Hebra líder (continua 5&#39;→3&#39;)</text>
    </svg>
  );
}

function SvgOkazaki() {
  return (
    <svg viewBox="0 0 320 170" className={styles.svgHorquilla} aria-label="Fragmentos de Okazaki en la hebra retrasada">
      <line x1="20" y1="30" x2="160" y2="30" stroke="#2E86AB" strokeWidth="4" strokeLinecap="round" />
      <line x1="160" y1="30" x2="260" y2="10" stroke="#2E86AB" strokeWidth="4" strokeLinecap="round" />
      <line x1="20" y1="90" x2="160" y2="90" stroke="#48A9A6" strokeWidth="4" strokeLinecap="round" />
      <line x1="160" y1="90" x2="260" y2="120" stroke="#48A9A6" strokeWidth="4" strokeLinecap="round" />
      <line x1="20" y1="50" x2="130" y2="50" stroke="#7FB3D3" strokeWidth="3" strokeLinecap="round" />
      <line x1="20" y1="110" x2="60" y2="110" stroke="#e67e22" strokeWidth="3" strokeLinecap="round" />
      <line x1="70" y1="110" x2="110" y2="110" stroke="#e67e22" strokeWidth="3" strokeLinecap="round" />
      <line x1="120" y1="110" x2="155" y2="110" stroke="#e67e22" strokeWidth="3" strokeLinecap="round" />
      <circle cx="75" cy="100" r="14" fill="#2E86AB" opacity="0.8" />
      <text x="75" y="96" fontSize="5.5" textAnchor="middle" fill="white" fontWeight="bold">ADN</text>
      <text x="75" y="104" fontSize="5.5" textAnchor="middle" fill="white" fontWeight="bold">pol</text>
      <circle cx="115" cy="100" r="14" fill="#2E86AB" opacity="0.8" />
      <text x="115" y="96" fontSize="5.5" textAnchor="middle" fill="white" fontWeight="bold">ADN</text>
      <text x="115" y="104" fontSize="5.5" textAnchor="middle" fill="white" fontWeight="bold">pol</text>
      <text x="10" y="130" fontSize="7" fill="#e67e22" fontWeight="bold">F1</text>
      <text x="50" y="130" fontSize="7" fill="#e67e22" fontWeight="bold">F2</text>
      <text x="90" y="130" fontSize="7" fill="#e67e22" fontWeight="bold">F3</text>
      <text x="10" y="155" fontSize="7.5" fill="#e67e22">← Fragmentos de Okazaki (síntesis discontinua)</text>
    </svg>
  );
}

function SvgLigasa() {
  return (
    <svg viewBox="0 0 320 170" className={styles.svgHorquilla} aria-label="ADN ligasa uniendo los fragmentos">
      <line x1="20" y1="30" x2="300" y2="30" stroke="#2E86AB" strokeWidth="4" strokeLinecap="round" />
      <line x1="20" y1="90" x2="300" y2="90" stroke="#48A9A6" strokeWidth="4" strokeLinecap="round" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
        <line key={i} x1={25 + i * 22} y1="34" x2={25 + i * 22} y2="86" stroke="#95a5a6" strokeWidth="2" strokeDasharray="3,2" />
      ))}
      <line x1="20" y1="50" x2="300" y2="50" stroke="#7FB3D3" strokeWidth="3" strokeLinecap="round" />
      <line x1="20" y1="110" x2="300" y2="110" stroke="#e67e22" strokeWidth="3" strokeLinecap="round" />
      <circle cx="80" cy="78" r="14" fill="#e67e22" opacity="0.9" />
      <text x="80" y="74" fontSize="5.5" textAnchor="middle" fill="white" fontWeight="bold">Lig</text>
      <text x="80" y="83" fontSize="5.5" textAnchor="middle" fill="white" fontWeight="bold">asa</text>
      <circle cx="160" cy="78" r="14" fill="#e67e22" opacity="0.9" />
      <text x="160" y="74" fontSize="5.5" textAnchor="middle" fill="white" fontWeight="bold">Lig</text>
      <text x="160" y="83" fontSize="5.5" textAnchor="middle" fill="white" fontWeight="bold">asa</text>
      <text x="10" y="155" fontSize="8" fill="#27ae60" fontWeight="bold">✓ Dos moléculas de ADN idénticas</text>
    </svg>
  );
}

function renderizarVisual(visual: string) {
  switch (visual) {
    case 'doble-hebra': return <SvgDobleHebra />;
    case 'helicasa': return <SvgHelicasa />;
    case 'hebra-lider': return <SvgHebraLider />;
    case 'okazaki': return <SvgOkazaki />;
    case 'ligasa': return <SvgLigasa />;
    default: return null;
  }
}

export default function VisualizadorAdnPolimerasa() {
  const [pasoActual, setPasoActual] = useState(0);

  const irAtras = () => setPasoActual((p) => Math.max(0, p - 1));
  const irAdelante = () => setPasoActual((p) => Math.min(PASOS_HORQUILLA.length - 1, p + 1));

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <div className={styles.heroIcono} aria-hidden="true">🧬</div>
        <h1>ADN Polimerasa</h1>
        <p>La enzima que copia el genoma: 1.000 nucleótidos por segundo con un error cada 10⁹ bases</p>
      </header>

      <LegalNotice />

      {/* Bloque 1: Horquilla de replicación */}
      <section className={styles.section} aria-labelledby="titulo-horquilla">
        <h2 id="titulo-horquilla" className={styles.tituloSeccion}>
          La Horquilla de Replicación
        </h2>
        <p className={styles.subtituloSeccion}>
          Navega por los 5 pasos del proceso de replicación
        </p>

        <div className={styles.horquillaContainer}>
          <div className={styles.indicadorPasos} aria-label={`Paso ${pasoActual + 1} de ${PASOS_HORQUILLA.length}`}>
            {PASOS_HORQUILLA.map((_, i) => (
              <button
                key={i}
                className={`${styles.indicadorPunto} ${i === pasoActual ? styles.indicadorPuntoActivo : ''}`}
                onClick={() => setPasoActual(i)}
                aria-label={`Ir al paso ${i + 1}: ${PASOS_HORQUILLA[i].titulo}`}
                aria-current={i === pasoActual ? 'step' : undefined}
              />
            ))}
          </div>

          <div className={styles.pasoContenido}>
            <div className={styles.svgWrapper}>
              {renderizarVisual(PASOS_HORQUILLA[pasoActual].visual)}
            </div>
            <div className={styles.pasoTexto}>
              <h3 className={styles.pasoTitulo}>
                <span className={styles.pasoNumero}>{pasoActual + 1}</span>
                {PASOS_HORQUILLA[pasoActual].titulo}
              </h3>
              <p className={styles.pasoDescripcion}>{PASOS_HORQUILLA[pasoActual].descripcion}</p>
            </div>
          </div>

          <div className={styles.stepControls}>
            <button
              className={styles.btnPaso}
              onClick={irAtras}
              disabled={pasoActual === 0}
              aria-label="Paso anterior"
            >
              ← Anterior
            </button>
            <span className={styles.contadorPasos} aria-live="polite">
              {pasoActual + 1} / {PASOS_HORQUILLA.length}
            </span>
            <button
              className={styles.btnPaso}
              onClick={irAdelante}
              disabled={pasoActual === PASOS_HORQUILLA.length - 1}
              aria-label="Paso siguiente"
            >
              Siguiente →
            </button>
          </div>
        </div>
      </section>

      {/* Bloque 2: Velocidad y Fidelidad */}
      <section className={styles.section} aria-labelledby="titulo-fidelidad">
        <h2 id="titulo-fidelidad" className={styles.tituloSeccion}>
          Velocidad y Fidelidad: Los Números Impresionantes
        </h2>
        <p className={styles.subtituloSeccion}>
          La ADN polimerasa combina velocidad extrema con una precisión extraordinaria
        </p>

        <div className={styles.gridTarjetas}>
          {DATOS_FIDELIDAD.map((dato) => (
            <div
              key={dato.titulo}
              className={styles.tarjetaDato}
              style={{ borderTopColor: dato.color }}
            >
              <span className={styles.tarjetaIcono} aria-hidden="true">{dato.icono}</span>
              <h3 className={styles.tarjetaTitulo}>{dato.titulo}</h3>
              <p className={styles.tarjetaValor} style={{ color: dato.color }}>{dato.valor}</p>
              <p className={styles.tarjetaDescripcion}>{dato.descripcion}</p>
            </div>
          ))}
        </div>

        <div className={styles.barraFidelidadContainer} aria-label="Comparativa de tasas de error">
          <h3 className={styles.barraFidelidadTitulo}>Reducción de errores: tres capas de protección</h3>
          <div className={styles.barraFidelidad}>
            <div className={styles.barraEtapa}>
              <div className={styles.barraBloque} style={{ width: '100%', backgroundColor: '#e67e22' }}>
                <span>Sin corrección</span>
              </div>
              <span className={styles.barraEtiqueta}>1 / 10⁵</span>
            </div>
            <div className={styles.barraEtapa}>
              <div className={styles.barraBloque} style={{ width: '60%', backgroundColor: '#48A9A6' }}>
                <span>+ Proofreading</span>
              </div>
              <span className={styles.barraEtiqueta}>1 / 10⁷</span>
            </div>
            <div className={styles.barraEtapa}>
              <div className={styles.barraBloque} style={{ width: '25%', backgroundColor: '#27ae60' }}>
                <span>+ Reparación</span>
              </div>
              <span className={styles.barraEtiqueta}>1 / 10⁹</span>
            </div>
          </div>
          <p className={styles.barraLeyenda}>Cuanto menor la barra, menor la tasa de error</p>
        </div>
      </section>

      {/* Bloque 3: Taq Polimerasa y PCR */}
      <section className={styles.section} aria-labelledby="titulo-pcr">
        <h2 id="titulo-pcr" className={styles.tituloSeccion}>
          La Taq Polimerasa y el PCR
        </h2>
        <p className={styles.subtituloSeccion}>
          Una enzima de géiseres de Yellowstone que revolucionó la biología molecular
        </p>

        <div className={styles.tarjetaIntro}>
          <span className={styles.tarjetaIntroIcono} aria-hidden="true">🌋</span>
          <div>
            <strong>Thermus aquaticus</strong> — una bacteria descubierta en los géiseres de Yellowstone (90°C). Su ADN polimerasa (Taq pol) es <strong>termoestable</strong>: funciona a 95°C sin desnaturalizarse. Esto hizo posible el PCR automatizado y cambió la biología molecular para siempre.
          </div>
        </div>

        <div className={styles.cicloPCR} aria-label="Ciclo de PCR en 3 pasos">
          <div className={styles.cicloPaso}>
            <div className={styles.temperaturaTag} style={{ backgroundColor: '#e74c3c' }}>
              <span aria-hidden="true">🌡️</span> 95°C
            </div>
            <h3 className={styles.cicloPasoTitulo}>Desnaturalización</h3>
            <p className={styles.cicloPasoDesc}>
              El calor separa las dos hebras del ADN objetivo. Los puentes de hidrógeno se rompen y las hebras quedan disponibles como moldes.
            </p>
          </div>

          <div className={styles.cicloFlecha} aria-hidden="true">→</div>

          <div className={styles.cicloPaso}>
            <div className={styles.temperaturaTag} style={{ backgroundColor: '#3498db' }}>
              <span aria-hidden="true">❄️</span> 55–65°C
            </div>
            <h3 className={styles.cicloPasoTitulo}>Anillamiento</h3>
            <p className={styles.cicloPasoDesc}>
              Los cebadores (primers) — fragmentos cortos de ADN — se unen a sus secuencias complementarias en las hebras molde, marcando el punto de inicio.
            </p>
          </div>

          <div className={styles.cicloFlecha} aria-hidden="true">→</div>

          <div className={styles.cicloPaso}>
            <div className={styles.temperaturaTag} style={{ backgroundColor: '#e67e22' }}>
              <span aria-hidden="true">🔥</span> 72°C
            </div>
            <h3 className={styles.cicloPasoTitulo}>Extensión</h3>
            <p className={styles.cicloPasoDesc}>
              La Taq polimerasa sintetiza la nueva hebra desde cada cebador, copiando fielmente la secuencia molde en dirección 5'→3'.
            </p>
          </div>
        </div>

        <div className={styles.resultadoPCR}>
          <div className={styles.resultadoPCRNumero}>
            <span className={styles.resultadoPCRGrande}>2³⁰</span>
            <span className={styles.resultadoPCREqual}>=</span>
            <span className={styles.resultadoPCRCopias}>~1.000 millones</span>
          </div>
          <p className={styles.resultadoPCRDesc}>
            copias a partir de una sola molécula tras 30 ciclos
          </p>
        </div>

        <div className={styles.tarjetaCovid} role="note">
          <span className={styles.tarjetaCovidIcono} aria-hidden="true">🦠</span>
          <div>
            <strong>Conexión COVID-19:</strong> Los tests PCR de la pandemia usaron esta misma enzima para detectar y amplificar fragmentos del ARN viral (convertido primero a ADN complementario con retrotranscriptasa — técnica RT-PCR).
          </div>
        </div>
      </section>

      {/* Bloque 4: Tipos de ADN Polimerasa */}
      <section className={styles.section} aria-labelledby="titulo-tipos">
        <h2 id="titulo-tipos" className={styles.tituloSeccion}>
          Tipos de ADN Polimerasa en Eucariotas
        </h2>
        <p className={styles.subtituloSeccion}>
          Los humanos no tienen una sola ADN polimerasa, sino varias especializadas
        </p>

        <div className={styles.tablaWrapper} role="region" aria-label="Tabla comparativa de ADN polimerasas eucariotas" tabIndex={0}>
          <table className={styles.tablaPolimerasa}>
            <thead>
              <tr>
                <th scope="col">Polimerasa</th>
                <th scope="col">Localización</th>
                <th scope="col">Función principal</th>
                <th scope="col">Detalle</th>
              </tr>
            </thead>
            <tbody>
              {POLIMERASAS_EUCARIOTAS.map((pol, i) => (
                <tr key={pol.nombre} className={i % 2 === 0 ? styles.filaImpar : styles.filaPar}>
                  <td className={styles.celdaNombre}>{pol.nombre}</td>
                  <td>
                    <span className={`${styles.badgeUbicacion} ${pol.localizacion === 'Mitocondria' ? styles.badgeMito : styles.badgeNucleo}`}>
                      {pol.localizacion}
                    </span>
                  </td>
                  <td>{pol.funcion}</td>
                  <td className={styles.celdaDetalle}>{pol.detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.tarjetaCuriosidad} role="note">
          <span className={styles.tarjetaCuriosidadIcono} aria-hidden="true">💡</span>
          <div>
            <strong>Dato curioso:</strong> El ADN mitocondrial tiene su propia polimerasa exclusiva (Pol γ). Esto es una herencia directa de cuando la mitocondria era una bacteria independiente que fue incorporada por endosimbiosis hace ~1.500 millones de años.
          </div>
        </div>
      </section>

      <EducationalSection
        title="Profundiza en la ADN polimerasa"
        subtitle="Replicación, fidelidad y aplicaciones del PCR"
      >
        <div className={styles.educationalContent}>
          <div className={styles.educationalItem}>
            <h4>La regla de la direccionalidad: ¿por qué siempre 5'→3'?</h4>
            <p>
              La ADN polimerasa solo puede añadir nucleótidos al extremo 3'-OH libre de una cadena en crecimiento. Esto se debe a la química del enlace fosfodiéster: el grupo fosfato del nuevo nucleótido se une al extremo 3'-OH, liberando pirofosfato. No es posible añadir al extremo 5', lo que explica por qué la hebra retrasada necesita fragmentos de Okazaki.
            </p>
          </div>

          <div className={styles.educationalItem}>
            <h4>Los cebadores (primers): por qué la ADN pol no puede empezar de cero</h4>
            <p>
              A diferencia de la ARN polimerasa, la ADN polimerasa no puede iniciar una cadena nueva: necesita un extremo 3'-OH preexistente para añadir nucleótidos. Por eso, una enzima especializada llamada primasa sintetiza primero un cebador corto de ARN (~10 nucleótidos) que proporciona ese punto de inicio. Este cebador se elimina después y se reemplaza con ADN.
            </p>
          </div>

          <div className={styles.educationalItem}>
            <h4>ARN polimerasa vs ADN polimerasa: diferencias clave</h4>
            <p>
              La ARN polimerasa transcribe ADN en ARN mensajero, no necesita cebador y puede iniciar cadenas de cero, pero comete más errores (sin proofreading). La ADN polimerasa replica el ADN con altísima fidelidad gracias a su actividad correctora. Ambas leen la hebra molde en dirección 3'→5' y sintetizan en dirección 5'→3'.
            </p>
          </div>

          <div className={styles.educationalItem}>
            <h4>Retrotranscriptasa (VIH): la enzima que convierte ARN en ADN</h4>
            <p>
              El VIH usa una enzima llamada retrotranscriptasa para convertir su genoma de ARN en ADN complementario (ADNc), que luego se integra en el genoma humano. Esta enzima es el objetivo principal de los antivirales como la zidovudina (AZT). La retrotranscriptasa también se usa en laboratorio para el RT-PCR (como en los tests COVID).
            </p>
          </div>

          <div className={styles.educationalItem}>
            <h4>Mutaciones y cáncer: qué ocurre cuando fallan los sistemas de corrección</h4>
            <p>
              Cuando los sistemas de reparación del ADN fallan (por mutaciones en genes como BRCA1/2, MLH1, MSH2), la tasa de mutación se dispara. Las células acumulan mutaciones en genes supresores de tumores y proto-oncogenes, lo que puede desencadenar cáncer. Por eso muchos fármacos antitumorales inhiben selectivamente la ADN polimerasa de células que se dividen rápidamente.
            </p>
          </div>

          <div className={styles.warningBox} role="note">
            <strong>Nota:</strong> Contenido educativo de biología molecular. La PCR es una técnica de laboratorio — esta app explica el principio bioquímico, no procedimientos de uso.
          </div>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('visualizador-adn-polimerasa')} />
      <ShareCard appName="visualizador-adn-polimerasa" />
      <Footer appName="visualizador-adn-polimerasa" />
    </div>
  );
}
