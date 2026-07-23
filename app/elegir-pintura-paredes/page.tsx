'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './ElegirPinturaParedes.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ── Tipos del motor de decisión ──────────────────────────────────────────
type Superficie = 'interior-seco' | 'humedo' | 'techo' | 'fachada';
type Estado = 'nuevo' | 'repintar' | 'manchas';
type Acabado = 'mate' | 'satinado';

interface Opcion<T> {
  valor: T;
  icono: string;
  titulo: string;
  desc: string;
}

interface Recomendacion {
  pintura: string;
  porque: string;
  imprimacion: string;
  rodillo: string;
  manos: string;
  rendimiento: string;
  avisos: string[];
}

// ── Opciones de cada pregunta ────────────────────────────────────────────
const SUPERFICIES: Opcion<Superficie>[] = [
  { valor: 'interior-seco', icono: '🧱', titulo: 'Pared interior', desc: 'Salón, dormitorio, pasillo' },
  { valor: 'humedo', icono: '🚿', titulo: 'Cocina o baño', desc: 'Zonas con humedad y grasa' },
  { valor: 'techo', icono: '☁️', titulo: 'Techo', desc: 'De cualquier estancia' },
  { valor: 'fachada', icono: '🏠', titulo: 'Fachada exterior', desc: 'Muro a la intemperie' },
];

const ESTADOS: Opcion<Estado>[] = [
  { valor: 'nuevo', icono: '🆕', titulo: 'Nuevo sin pintar', desc: 'Yeso o pladur nuevo' },
  { valor: 'repintar', icono: '🔄', titulo: 'Repintar', desc: 'Sobre pintura vieja en buen estado' },
  { valor: 'manchas', icono: '🟤', titulo: 'Con manchas', desc: 'Humedad, moho, nicotina o cercos' },
];

const ACABADOS: Opcion<Acabado>[] = [
  { valor: 'mate', icono: '🌫️', titulo: 'Mate', desc: 'Disimula las imperfecciones' },
  { valor: 'satinado', icono: '✨', titulo: 'Satinado', desc: 'Más lavable y resistente al roce' },
];

// ── Lógica de recomendación ──────────────────────────────────────────────
function calcularRecomendacion(sup: Superficie, est: Estado, aca: Acabado): Recomendacion {
  let pintura = '';
  let porque = '';
  let rendimiento = '';
  let rodillo = '';
  const avisos: string[] = [];

  switch (sup) {
    case 'interior-seco':
      if (aca === 'mate') {
        pintura =
          'Pintura plástica al agua mate. Si es un pasillo, escalera o cuarto infantil con roce, elige la variante «mate lavable».';
        porque =
          'El mate disimula las imperfecciones de la pared y da un acabado sobrio; la versión lavable aguanta limpiezas puntuales sin que se marque el frote.';
      } else {
        pintura = 'Pintura plástica al agua satinada.';
        porque =
          'El satinado resiste mejor la limpieza y el roce y aporta un ligero brillo; a cambio, marca más los defectos cuando la luz incide de lado.';
      }
      rendimiento = 'Rinde unos 10-12 m² por litro y mano en pared lisa.';
      rodillo =
        'Rodillo de pelo corto-medio (10-14 mm) en pared lisa, o de pelo largo (18-22 mm) si tienes gotelé o textura. Paletina o brocha para cortar esquinas, marcos y rincones.';
      break;

    case 'humedo':
      pintura =
        'Pintura plástica al agua específica para cocinas y baños (antihumedad y antimoho), en acabado satinado.';
      porque =
        'Estas pinturas llevan fungicidas contra el moho y resisten la condensación y la limpieza de grasa; el mate normal aquí se ensucia y se mancha de humedad.';
      rendimiento = 'Rinde unos 10-12 m² por litro y mano.';
      rodillo =
        'Rodillo de pelo corto-medio (10-14 mm) y paletina para los rincones (detrás de sanitarios, esquinas de azulejo y muebles).';
      if (aca === 'mate') {
        avisos.push(
          'Has elegido acabado mate, pero en cocinas y baños el satinado rinde mucho mejor frente a la humedad y la grasa. Merece la pena valorarlo.',
        );
      }
      break;

    case 'techo':
      pintura =
        'Pintura plástica mate para techos (blanca y mate; hay versiones «antigoteo» que salpican menos). En techos de baño, usa una antimoho.';
      porque =
        'En el techo la luz incide de forma rasante y el mate es el único acabado que no delata cada imperfección; el satinado resaltaría todos los defectos.';
      rendimiento = 'Rinde unos 10-12 m² por litro y mano.';
      rodillo =
        'Rodillo antigoteo de pelo medio montado en pértiga, y brocha para el perímetro. Protege bien el suelo y los muebles antes de empezar.';
      if (aca === 'satinado') {
        avisos.push(
          'En techos se recomienda acabado mate: el satinado resalta cualquier irregularidad con la luz.',
        );
      }
      break;

    case 'fachada':
      pintura =
        'Pintura para exterior: acrílica o elastomérica (o al silicato sobre soportes minerales), con resistencia a los rayos UV, impermeable a la lluvia pero transpirable.';
      porque =
        'El exterior sufre lluvia, sol y cambios de temperatura: necesita resinas resistentes a los UV, flexibles para no cuartearse y transpirables para dejar salir la humedad del muro.';
      rendimiento = 'Rinde unos 6-8 m² por litro y mano (los soportes rugosos absorben más).';
      rodillo =
        'Rodillo de pelo largo (18-22 mm) para fachada rugosa y brocha para juntas y encuentros. En grandes superficies, valora la pistola.';
      avisos.push(
        'No pintes con lluvia inminente, sol directo fuerte ni con menos de unos 10 °C o más de 30 °C: el secado se estropea.',
      );
      break;
  }

  let imprimacion = '';
  switch (est) {
    case 'nuevo':
      imprimacion =
        sup === 'fachada'
          ? 'Aplica una imprimación fijadora para exterior sobre el soporte nuevo o muy absorbente, y repara las fisuras antes de pintar.'
          : 'Sella primero con una imprimación fijadora (selladora), diluida según el envase: el yeso o el pladur nuevo es muy absorbente y, sin sellar, «chupa» la pintura de forma desigual.';
      break;
    case 'repintar':
      imprimacion =
        'No necesitas imprimación si la pintura vieja está bien adherida: quita el polvo, lija los brillos, masilla agujeros y grietas y da una mano de fijador solo sobre las zonas reparadas.';
      break;
    case 'manchas':
      imprimacion =
        'Trata primero la causa (si es humedad, localiza y corta la filtración) y aplica una imprimación anti-manchas: sella cercos de agua, moho, nicotina o rotulador para que no reaparezcan. Sin ella, la mancha «sangra» y vuelve a salir a través de la pintura nueva.';
      break;
  }

  const manos =
    '2 manos como norma general. Deja secar entre 4 y 6 horas entre manos (o lo que indique el envase). Si cubres un color oscuro con uno claro, cuenta con una tercera mano.';

  return { pintura, porque, imprimacion, rodillo, manos, rendimiento, avisos };
}

// ── Consejos de color (módulo secundario) ────────────────────────────────
const CONSEJOS_COLOR: string[] = [
  'Los colores claros amplían la estancia y aportan luz; los oscuros la recogen y dan calidez, pero la empequeñecen.',
  'Ten en cuenta la orientación: con luz del norte (fría) los colores se ven más apagados; con luz del sur (cálida), más vivos.',
  'Pinta el techo en un tono más claro que las paredes para «subirlo»; usar el mismo color en techo y pared difumina los límites y agranda.',
  'Prueba el color en un trozo de pared y míralo a distintas horas del día antes de comprar todos los botes.',
  'Hoy casi nadie mezcla el color en casa: pídelo tintado en el punto de venta con su código (RAL, NCS o la carta del fabricante). Así repites el tono exacto si necesitas otro bote y evitas dos tiradas que no casan.',
];

export default function ElegirPinturaParedesPage() {
  const [superficie, setSuperficie] = useState<Superficie | null>(null);
  const [estado, setEstado] = useState<Estado | null>(null);
  const [acabado, setAcabado] = useState<Acabado | null>(null);

  const recomendacion =
    superficie && estado && acabado ? calcularRecomendacion(superficie, estado, acabado) : null;

  const reiniciar = () => {
    setSuperficie(null);
    setEstado(null);
    setAcabado(null);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <h1 className={styles.title}>
          <span aria-hidden="true">🖌️</span> Qué pintura elegir para paredes y techos
        </h1>
        <p className={styles.subtitle}>
          Dinos qué vas a pintar y responde dos preguntas: te decimos el tipo de pintura, la
          imprimación, el rodillo y las manos que necesitas.
        </p>
      </header>

      {/* Enlaces legales RGPD */}
      <LegalNotice />

      {/* Motor de decisión */}
      <div className={styles.mainContent}>
        {/* Pregunta 1 */}
        <div className={styles.selectorGroup}>
          <p className={styles.groupLabel}>
            <span className={styles.groupNum} aria-hidden="true">1</span> ¿Qué vas a pintar?
          </p>
          <div className={styles.optionsGrid}>
            {SUPERFICIES.map((op) => (
              <button
                key={op.valor}
                type="button"
                className={`${styles.optionCard} ${superficie === op.valor ? styles.optionCardActive : ''}`}
                aria-pressed={superficie === op.valor}
                onClick={() => setSuperficie(op.valor)}
              >
                <span className={styles.optionIcon} aria-hidden="true">{op.icono}</span>
                <span className={styles.optionTitle}>{op.titulo}</span>
                <span className={styles.optionDesc}>{op.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pregunta 2 */}
        <div className={styles.selectorGroup}>
          <p className={styles.groupLabel}>
            <span className={styles.groupNum} aria-hidden="true">2</span> ¿En qué estado está la superficie?
          </p>
          <div className={styles.optionsGrid}>
            {ESTADOS.map((op) => (
              <button
                key={op.valor}
                type="button"
                className={`${styles.optionCard} ${estado === op.valor ? styles.optionCardActive : ''}`}
                aria-pressed={estado === op.valor}
                onClick={() => setEstado(op.valor)}
              >
                <span className={styles.optionIcon} aria-hidden="true">{op.icono}</span>
                <span className={styles.optionTitle}>{op.titulo}</span>
                <span className={styles.optionDesc}>{op.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pregunta 3 */}
        <div className={styles.selectorGroup}>
          <p className={styles.groupLabel}>
            <span className={styles.groupNum} aria-hidden="true">3</span> ¿Qué acabado quieres?
          </p>
          <div className={styles.optionsGrid}>
            {ACABADOS.map((op) => (
              <button
                key={op.valor}
                type="button"
                className={`${styles.optionCard} ${acabado === op.valor ? styles.optionCardActive : ''}`}
                aria-pressed={acabado === op.valor}
                onClick={() => setAcabado(op.valor)}
              >
                <span className={styles.optionIcon} aria-hidden="true">{op.icono}</span>
                <span className={styles.optionTitle}>{op.titulo}</span>
                <span className={styles.optionDesc}>{op.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Ficha de recomendación */}
      {recomendacion && (
        <section className={styles.ficha} aria-live="polite">
          <div className={styles.fichaHeader}>
            <h2 className={styles.fichaTitle}>
              <span aria-hidden="true">✅</span> Tu ficha de pintado
            </h2>
            <button type="button" className={styles.resetBtn} onClick={reiniciar}>
              <span aria-hidden="true">🔄</span> Empezar de nuevo
            </button>
          </div>

          {recomendacion.avisos.length > 0 && (
            <div className={styles.avisos} role="note">
              {recomendacion.avisos.map((aviso, i) => (
                <p key={i} className={styles.aviso}>
                  <span aria-hidden="true">⚠️</span> {aviso}
                </p>
              ))}
            </div>
          )}

          <dl className={styles.fichaGrid}>
            <div className={styles.fichaRow}>
              <dt className={styles.fichaLabel}><span aria-hidden="true">🎨</span> Pintura recomendada</dt>
              <dd className={styles.fichaValue}>{recomendacion.pintura}</dd>
            </div>
            <div className={styles.fichaRow}>
              <dt className={styles.fichaLabel}><span aria-hidden="true">💡</span> Por qué</dt>
              <dd className={styles.fichaValue}>{recomendacion.porque}</dd>
            </div>
            <div className={styles.fichaRow}>
              <dt className={styles.fichaLabel}><span aria-hidden="true">🧴</span> Preparación e imprimación</dt>
              <dd className={styles.fichaValue}>{recomendacion.imprimacion}</dd>
            </div>
            <div className={styles.fichaRow}>
              <dt className={styles.fichaLabel}><span aria-hidden="true">🧑‍🎨</span> Rodillo y herramienta</dt>
              <dd className={styles.fichaValue}>{recomendacion.rodillo}</dd>
            </div>
            <div className={styles.fichaRow}>
              <dt className={styles.fichaLabel}><span aria-hidden="true">🖌️</span> Manos y secado</dt>
              <dd className={styles.fichaValue}>{recomendacion.manos}</dd>
            </div>
            <div className={styles.fichaRow}>
              <dt className={styles.fichaLabel}><span aria-hidden="true">📐</span> Rendimiento orientativo</dt>
              <dd className={styles.fichaValue}>{recomendacion.rendimiento}</dd>
            </div>
          </dl>

          <div className={styles.ctaWrapper}>
            <Link href="/calculadora-pintura/" className={styles.ctaBtn}>
              <span aria-hidden="true">🧮</span> Calcular cuántos litros necesito
            </Link>
          </div>
        </section>
      )}

      {/* Módulo secundario: elegir el color */}
      <section className={styles.colorPanel}>
        <h2 className={styles.colorTitle}>
          <span aria-hidden="true">🌈</span> Elegir el color acertado
        </h2>
        <ul className={styles.colorList}>
          {CONSEJOS_COLOR.map((consejo, i) => (
            <li key={i}>{consejo}</li>
          ))}
        </ul>
      </section>

      {/* Disclaimer (orientación general de bricolaje doméstico) */}
      <DisclaimerCard
        variant="general"
        severity="medium"
        collapsible
        context="elegir-pintura-paredes"
        title="Orientación general de pintado"
      >
        <p>
          Esta herramienta ofrece una <strong>orientación general</strong> para elegir la pintura y
          el método adecuados en un pintado doméstico. Los productos varían mucho entre fabricantes:
          sigue siempre las <strong>instrucciones de la etiqueta</strong> (diluciones, tiempos de
          secado y número de manos).
        </p>
        <p>
          Trabaja con buena <strong>ventilación</strong> y usa mascarilla y protección al lijar,
          decapar o aplicar productos con disolvente. Ante posible presencia de plomo (pinturas muy
          antiguas), amianto o problemas estructurales de humedad, consulta a un profesional.
        </p>
      </DisclaimerCard>

      {/* Contenido educativo (patrón v2.0) */}
      <EducationalSection
        icon="🎨"
        title="Guía para elegir la pintura de tu casa"
        subtitle="Tipos de pintura, acabados, imprimación, rodillos y errores frecuentes"
      >
        {/* 1. Tabla comparativa */}
        <section className={styles.guideSection}>
          <h2>Tipos de pintura y cuándo usar cada una</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Acabado</th>
                  <th>Dónde va bien</th>
                  <th>Lavabilidad</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Plástica al agua mate</td>
                  <td>Mate</td>
                  <td>Salón, dormitorios, techos</td>
                  <td>Baja-media</td>
                </tr>
                <tr>
                  <td>Plástica mate lavable</td>
                  <td>Mate</td>
                  <td>Pasillos, cuartos infantiles</td>
                  <td>Media-alta</td>
                </tr>
                <tr>
                  <td>Plástica satinada</td>
                  <td>Satinado</td>
                  <td>Zonas de roce y limpieza</td>
                  <td>Alta</td>
                </tr>
                <tr>
                  <td>Antihumedad cocina/baño</td>
                  <td>Satinado</td>
                  <td>Cocinas y baños</td>
                  <td>Alta (antimoho)</td>
                </tr>
                <tr>
                  <td>Pintura de techos</td>
                  <td>Mate</td>
                  <td>Techos (versión antigoteo)</td>
                  <td>Baja</td>
                </tr>
                <tr>
                  <td>Exterior acrílica/silicato</td>
                  <td>Mate/satinado</td>
                  <td>Fachadas y muros exteriores</td>
                  <td>Alta (a la intemperie)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Casos de uso */}
        <section className={styles.guideSection}>
          <h2>Casos habituales</h2>
          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <h3>Refrescar un dormitorio</h3>
              <p>
                Plástica al agua mate, 2 manos. Sobre pintura sana basta con limpiar el polvo, lijar
                brillos y tapar agujeros; no hace falta imprimación.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h3>Baño con manchas de moho</h3>
              <p>
                Trata el moho, seca bien, imprimación anti-manchas y pintura antihumedad satinada.
                Ventila el baño para reducir la condensación que lo provoca.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h3>Pasillo que se ensucia</h3>
              <p>
                Zona de roce: elige mate lavable o satinado, que resisten el frote y las manos sin
                que se marque el desgaste.
              </p>
            </div>
            <div className={styles.escenarioCard}>
              <h3>Pared de pladur nueva</h3>
              <p>
                El pladur nuevo es muy absorbente: sella con una imprimación fijadora antes de la
                primera mano de color para un acabado uniforme.
              </p>
            </div>
          </div>
        </section>

        {/* 3. FAQ */}
        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h3>¿Mate o satinado?</h3>
              <p>
                El mate disimula las imperfecciones y queda elegante, pero se limpia peor. El
                satinado aguanta la limpieza y el roce, aunque marca los defectos con la luz. En
                techos, siempre mate.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Qué pintura para cocina y baño?</h3>
              <p>
                Una específica antihumedad y antimoho en acabado satinado: resiste la condensación,
                el moho y la limpieza de grasa.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cuándo hace falta imprimación?</h3>
              <p>
                En soportes nuevos y muy absorbentes (yeso, pladur) y sobre manchas de agua, moho o
                nicotina, con una imprimación anti-manchas para que no reaparezcan.
              </p>
              <p className={styles.faqTip}>
                Truco: si dudas de si la mancha volverá a salir, sella siempre. Repintar por segunda
                vez cuesta más que dar la imprimación a la primera.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Cuántas manos doy?</h3>
              <p>
                Lo normal son 2 manos. Si pasas de un color oscuro a uno claro, prepárate para una
                tercera. Respeta el tiempo de secado entre manos que indica el envase.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h3>¿Puedo mezclar el color yo mismo?</h3>
              <p>
                Es arriesgado: no reproducirás el tono exacto en un segundo bote. Pídelo tintado en
                tienda con su código y guarda la referencia para repeticiones.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo pintar una pared, paso a paso</h2>
          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <h3>Protege y vacía</h3>
                <p>Retira o cubre muebles, protege suelo y zócalos con plástico y cinta de carrocero.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <h3>Prepara la superficie</h3>
                <p>Limpia el polvo y la grasa, masilla agujeros y grietas y lija cuando seque.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <h3>Imprima si hace falta</h3>
                <p>Sella soportes nuevos o manchas con la imprimación adecuada y deja secar.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <h3>Corta los bordes</h3>
                <p>Con la brocha, perfila esquinas, rodapiés y marcos antes de pasar el rodillo.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <h3>Pasa el rodillo</h3>
                <p>Trabaja en franjas en forma de «W» y sin cargar de más para no dejar goterones.</p>
              </div>
            </div>
            <div className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <h3>Segunda mano</h3>
                <p>Respeta el secado y da la segunda mano; añade una tercera si el color no cubre.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Mejores prácticas */}
        <section className={styles.guideSection}>
          <h2>Consejos que marcan la diferencia</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🌡️</span>
              <p>Pinta entre 10 y 30 °C y sin corrientes fuertes: el secado brusco cuartea la pintura.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">💧</span>
              <p>La primera mano en soporte nuevo se diluye un poco (según el envase) para que agarre mejor.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🪟</span>
              <p>Mantén siempre un «borde húmedo»: no dejes secar media pared o se verán las juntas.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧻</span>
              <p>Retira la cinta de carrocero cuando la pintura esté aún fresca para un corte limpio.</p>
            </div>
          </div>
        </section>

        {/* 6. Errores frecuentes */}
        <section className={styles.guideSection}>
          <div className={styles.warningBox}>
            <div className={styles.warningHeader}>
              <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
              <h2>Errores frecuentes al pintar</h2>
            </div>
            <ul className={styles.warningList}>
              <li>Pintar sobre manchas de humedad sin imprimación anti-manchas: reaparecen a los pocos días.</li>
              <li>Usar mate en cocina o baño: se ensucia, no se limpia bien y coge moho.</li>
              <li>Poner satinado en el techo: la luz rasante saca todas las imperfecciones.</li>
              <li>No sellar el pladur o el yeso nuevo: la pintura se absorbe desigual y queda a manchas.</li>
              <li>Dar la segunda mano antes de que seque la primera: se arruga y arrastra la pintura.</li>
            </ul>
          </div>
        </section>
      </EducationalSection>

      {/* Apps relacionadas */}
      <RelatedApps apps={getRelatedApps('elegir-pintura-paredes')} />

      {/* Tarjeta de compartir */}
      <ShareCard appName="elegir-pintura-paredes" />

      {/* Footer */}
      <Footer appName="elegir-pintura-paredes" />
    </div>
  );
}
