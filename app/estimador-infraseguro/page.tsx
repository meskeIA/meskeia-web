'use client';

import { useState, useMemo } from 'react';
import styles from './EstimadorInfraseguro.module.css';
import { MeskeiaLogo, Footer, NumberInput, ResultCard, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { formatCurrency, formatNumber, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

interface ResultadoCalculo {
  porcentajeCobertura: number;
  indemnizacionReal: number;
  perdidaPorInfraseguro: number;
  hayInfraseguro: boolean;
  recomendacion: string;
}

export default function CalculadoraInfraseguroPage() {
  const [valorReal, setValorReal] = useState('');
  const [capitalAsegurado, setCapitalAsegurado] = useState('');
  const [importeDano, setImporteDano] = useState('');

  const resultado = useMemo((): ResultadoCalculo | null => {
    const valorRealNum = parseSpanishNumber(valorReal);
    const capitalNum = parseSpanishNumber(capitalAsegurado);
    const danoNum = parseSpanishNumber(importeDano);

    if (!valorRealNum || !capitalNum || !danoNum || valorRealNum <= 0 || capitalNum <= 0 || danoNum <= 0) {
      return null;
    }

    // Si el daño es mayor que el capital asegurado, se limita al capital
    const danoAConsiderar = Math.min(danoNum, capitalNum);

    // Porcentaje de cobertura
    const porcentajeCobertura = Math.min((capitalNum / valorRealNum) * 100, 100);

    // Hay infraseguro si el capital es menor que el valor real
    const hayInfraseguro = capitalNum < valorRealNum;

    let indemnizacionReal: number;
    let perdidaPorInfraseguro: number;

    if (hayInfraseguro) {
      // Regla proporcional: Indemnización = (Capital / Valor Real) × Daño
      indemnizacionReal = (capitalNum / valorRealNum) * danoAConsiderar;
      perdidaPorInfraseguro = danoAConsiderar - indemnizacionReal;
    } else {
      // Sin infraseguro, se cobra el daño completo (hasta el límite del capital)
      indemnizacionReal = danoAConsiderar;
      perdidaPorInfraseguro = 0;
    }

    // Generar recomendación
    let recomendacion: string;
    if (!hayInfraseguro) {
      recomendacion = 'Tu seguro cubre adecuadamente el valor de tus bienes. En caso de siniestro, recibirás la indemnización completa.';
    } else if (porcentajeCobertura >= 80) {
      recomendacion = 'Tienes un infraseguro leve. Considera aumentar el capital asegurado en tu próxima renovación para evitar sorpresas.';
    } else if (porcentajeCobertura >= 50) {
      recomendacion = 'Tienes un infraseguro significativo. En caso de siniestro perderías un porcentaje importante. Te recomendamos ajustar el capital urgentemente.';
    } else {
      recomendacion = 'Tu infraseguro es muy grave. Estás pagando un seguro que apenas te protege. Debes actualizar el capital asegurado cuanto antes.';
    }

    return {
      porcentajeCobertura,
      indemnizacionReal,
      perdidaPorInfraseguro,
      hayInfraseguro,
      recomendacion,
    };
  }, [valorReal, capitalAsegurado, importeDano]);

  const limpiarFormulario = () => {
    setValorReal('');
    setCapitalAsegurado('');
    setImporteDano('');
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">⚖️</span>
        <h1 className={styles.title}>Estimador de Infraseguro</h1>
        <p className={styles.subtitle}>
          Descubre cuánto cobrarías realmente en caso de siniestro si tu seguro no cubre el valor total
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      <div className={styles.mainContent}>
        {/* Panel de entrada */}
        <div className={styles.inputPanel}>
          <h2 className={styles.sectionTitle}>Datos del seguro y siniestro</h2>

          <div className={styles.inputGroup}>
            <NumberInput
              value={valorReal}
              onChange={setValorReal}
              label="Valor real de los bienes asegurados"
              placeholder="150000"
              helperText="Lo que costaría reponer todo hoy (continente o contenido)"
            />
          </div>

          <div className={styles.inputGroup}>
            <NumberInput
              value={capitalAsegurado}
              onChange={setCapitalAsegurado}
              label="Capital asegurado en tu póliza"
              placeholder="100000"
              helperText="El importe que figura en tu seguro"
            />
          </div>

          <div className={styles.inputGroup}>
            <NumberInput
              value={importeDano}
              onChange={setImporteDano}
              label="Importe del daño sufrido"
              placeholder="30000"
              helperText="Coste de reparar o reponer lo dañado"
            />
          </div>

          <button type="button" onClick={limpiarFormulario} className={styles.btnSecondary}>
            <span aria-hidden="true">🔄</span> Limpiar
          </button>
        </div>

        {/* Panel de resultados */}
        <div className={styles.resultsPanel}>
          {resultado ? (
            <>
              <div className={styles.resultCards}>
                <ResultCard
                  title="Cobertura actual"
                  value={formatNumber(resultado.porcentajeCobertura, 1) + '%'}
                  variant={resultado.porcentajeCobertura >= 100 ? 'success' : resultado.porcentajeCobertura >= 80 ? 'warning' : 'warning'}
                  icon={resultado.porcentajeCobertura >= 100 ? '✅' : '⚠️'}
                  description={resultado.hayInfraseguro ? 'Tienes infraseguro' : 'Sin infraseguro'}
                />
                <ResultCard
                  title="Indemnización que recibirías"
                  value={formatCurrency(resultado.indemnizacionReal)}
                  variant="highlight"
                  icon="💰"
                  description="Aplicando la regla proporcional"
                />
                {resultado.hayInfraseguro && (
                  <ResultCard
                    title="Pérdida por infraseguro"
                    value={formatCurrency(resultado.perdidaPorInfraseguro)}
                    variant="warning"
                    icon="📉"
                    description="Dinero que NO cobrarías"
                  />
                )}
              </div>

              {/* Visualización de la fórmula */}
              <div className={styles.formulaBox}>
                <h3><span aria-hidden="true">📐</span> Cálculo aplicado (Regla Proporcional)</h3>
                <div className={styles.formula}>
                  <div className={styles.formulaFraccion}>
                    <span className={styles.formulaNumerador}>{formatCurrency(parseSpanishNumber(capitalAsegurado) || 0)}</span>
                    <span className={styles.formulaDivisor}></span>
                    <span className={styles.formulaDenominador}>{formatCurrency(parseSpanishNumber(valorReal) || 0)}</span>
                  </div>
                  <span className={styles.formulaOperador}>×</span>
                  <span className={styles.formulaValor}>{formatCurrency(Math.min(parseSpanishNumber(importeDano) || 0, parseSpanishNumber(capitalAsegurado) || 0))}</span>
                  <span className={styles.formulaOperador}>=</span>
                  <span className={styles.formulaResultado}>{formatCurrency(resultado.indemnizacionReal)}</span>
                </div>
                <p className={styles.formulaLeyenda}>
                  (Capital asegurado ÷ Valor real) × Daño = Indemnización
                </p>
              </div>

              {/* Recomendación */}
              <div className={`${styles.recomendacion} ${resultado.hayInfraseguro ? styles.recomendacionWarning : styles.recomendacionSuccess}`}>
                <h3><span aria-hidden="true">{resultado.hayInfraseguro ? '⚠️' : '✅'}</span> {resultado.hayInfraseguro ? 'Recomendación' : 'Buenas noticias'}</h3>
                <p>{resultado.recomendacion}</p>
              </div>

              {/* Ejemplo práctico */}
              {resultado.hayInfraseguro && (
                <div className={styles.ejemploBox}>
                  <h3>📋 Resumen de tu situación</h3>
                  <ul>
                    <li>
                      <strong>Has sufrido un daño de:</strong> {formatCurrency(parseSpanishNumber(importeDano) || 0)}
                    </li>
                    <li>
                      <strong>Pero solo cobrarías:</strong> {formatCurrency(resultado.indemnizacionReal)}
                    </li>
                    <li>
                      <strong>Tendrías que poner de tu bolsillo:</strong> {formatCurrency(resultado.perdidaPorInfraseguro)}
                    </li>
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>⚖️</span>
              <h3>Calcula tu indemnización</h3>
              <p>Introduce el valor real, capital asegurado y daño para ver cuánto cobrarías</p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer - SIEMPRE VISIBLE */}
      <DisclaimerCard
        variant="financial"
        severity="critical"
        context="estimador-infraseguro"
        collapsible={false}
      />


      {/* Contenido educativo */}
      <EducationalSection
        title="¿Qué es el infraseguro y cómo te afecta?"
        subtitle="Aprende sobre la regla proporcional y cómo evitar perder dinero en un siniestro"
        icon="📚"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es el infraseguro?</h2>
          <p className={styles.introParagraph}>
            El <strong>infraseguro</strong> ocurre cuando el capital asegurado en tu póliza es inferior al valor real
            de los bienes que proteges. Esto es más común de lo que parece: muchas personas contratan un seguro
            y no lo actualizan cuando reforman la casa, compran muebles nuevos o los precios suben por inflación.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">📜</span> Base legal</h4>
              <p>
                El artículo 30 de la Ley 50/1980 de Contrato de Seguro establece que si el valor del interés
                asegurado es superior a la suma asegurada, el asegurador indemnizará el daño causado en la
                misma proporción en que aquella cubre el interés asegurado.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4><span aria-hidden="true">⚖️</span> La regla proporcional</h4>
              <p>
                Si tienes asegurado el 70% del valor real, solo cobrarás el 70% de cualquier daño.
                Aunque el siniestro sea parcial y no supere el capital asegurado, se aplica igualmente
                esta proporción.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Ejemplo práctico</h2>
          <div className={styles.ejemploDetallado}>
            <div className={styles.ejemploItem}>
              <span className={styles.ejemploIcon}>🏠</span>
              <div>
                <strong>Situación:</strong>
                <p>Tu vivienda tiene un valor real de reposición de 200.000€, pero tu póliza solo cubre 120.000€ (60% de cobertura).</p>
              </div>
            </div>
            <div className={styles.ejemploItem}>
              <span className={styles.ejemploIcon}>🔥</span>
              <div>
                <strong>Siniestro:</strong>
                <p>Un incendio causa daños valorados en 50.000€ en la cocina y el salón.</p>
              </div>
            </div>
            <div className={styles.ejemploItem}>
              <span className={styles.ejemploIcon}>💸</span>
              <div>
                <strong>Indemnización:</strong>
                <p>Aplicando la regla proporcional: (120.000 ÷ 200.000) × 50.000 = <strong>30.000€</strong></p>
                <p>Tendrías que poner de tu bolsillo: <strong>20.000€</strong></p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>¿Cómo evitar el infraseguro?</h2>
          <div className={styles.consejosGrid}>
            <div className={styles.consejoCard}>
              <span className={styles.consejoIcon}>📝</span>
              <h4>Revisa tu póliza anualmente</h4>
              <p>Cada año comprueba que el capital asegurado refleja el valor real. Ten en cuenta inflación y nuevas adquisiciones.</p>
            </div>
            <div className={styles.consejoCard}>
              <span className={styles.consejoIcon}>🏗️</span>
              <h4>Actualiza tras reformas</h4>
              <p>Si haces obras, reformas la cocina o el baño, comunícalo a tu aseguradora para ajustar el capital.</p>
            </div>
            <div className={styles.consejoCard}>
              <span className={styles.consejoIcon}>📸</span>
              <h4>Haz inventario fotográfico</h4>
              <p>Fotografía tus pertenencias y guarda facturas. Te ayudará a calcular el valor real y a justificar siniestros.</p>
            </div>
            <div className={styles.consejoCard}>
              <span className={styles.consejoIcon}>🔄</span>
              <h4>Cláusula de actualización</h4>
              <p>Algunas pólizas incluyen actualización automática según IPC. Comprueba si la tuya la tiene.</p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas frecuentes</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h4>¿Se aplica siempre la regla proporcional?</h4>
              <p>
                En seguros de daños (hogar, comercio), sí. En seguros de personas (vida, accidentes)
                no existe infraseguro porque no hay un "valor real" de la persona, solo el capital pactado.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Y si tengo sobreseguro (capital mayor que valor real)?</h4>
              <p>
                El sobreseguro no te beneficia: nunca cobrarás más que el daño real sufrido.
                Solo estarías pagando primas más altas de lo necesario.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Qué diferencia hay entre continente y contenido?</h4>
              <p>
                Continente es la estructura (paredes, suelos, instalaciones fijas).
                Contenido son tus pertenencias (muebles, electrodomésticos, ropa).
                El infraseguro se calcula por separado para cada uno.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4>¿Puede la aseguradora negarse a pagar por infraseguro?</h4>
              <p>
                No puede negarse, pero sí aplicar la regla proporcional legalmente.
                Por eso es tan importante tener el capital bien ajustado.
              </p>
            </div>
          </div>
        </section>

        {/* Tabla comparativa */}
        <section className={styles.guideSection}>
          <h2>Comparativa: cobertura adecuada vs infraseguro</h2>
          <div className={styles.tableWrapper}>
            <table className={styles.tablaComparativa}>
              <thead>
                <tr>
                  <th>Situación</th>
                  <th>Valor real del bien</th>
                  <th>Capital asegurado</th>
                  <th>% cobertura</th>
                  <th>Siniestro de 30.000 €</th>
                  <th>Diferencia que pagas tú</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cobertura perfecta</td>
                  <td>200.000 €</td>
                  <td>200.000 €</td>
                  <td>100%</td>
                  <td>30.000 €</td>
                  <td>0 €</td>
                </tr>
                <tr>
                  <td>Infraseguro leve</td>
                  <td>200.000 €</td>
                  <td>160.000 €</td>
                  <td>80%</td>
                  <td>24.000 €</td>
                  <td>6.000 €</td>
                </tr>
                <tr>
                  <td>Infraseguro moderado</td>
                  <td>200.000 €</td>
                  <td>120.000 €</td>
                  <td>60%</td>
                  <td>18.000 €</td>
                  <td>12.000 €</td>
                </tr>
                <tr>
                  <td>Infraseguro grave</td>
                  <td>200.000 €</td>
                  <td>80.000 €</td>
                  <td>40%</td>
                  <td>12.000 €</td>
                  <td>18.000 €</td>
                </tr>
                <tr>
                  <td>Infraseguro crítico</td>
                  <td>200.000 €</td>
                  <td>40.000 €</td>
                  <td>20%</td>
                  <td>6.000 €</td>
                  <td>24.000 €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Casos de uso */}
        <section className={styles.guideSection}>
          <h2>Casos reales de infraseguro</h2>
          <div className={styles.casosGrid}>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>🔥</span>
                <span className={styles.casoTag}>Incendio en cocina reformada</span>
              </div>
              <p>María reformó su cocina por 18.000 € hace 3 años pero no actualizó la póliza. Cuando un incendio
              la destruyó completamente, solo recuperó el 65% del coste de reconstrucción. Tuvo que poner
              6.300 € de su bolsillo por no haber comunicado la reforma.</p>
              <div className={styles.casoResultado}>Lección: comunicar reformas inmediatamente a la aseguradora</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>💧</span>
                <span className={styles.casoTag}>Rotura de tubería en piso alquilado</span>
              </div>
              <p>Carlos aseguró el contenido de su piso de alquiler por 15.000 € cuando lo compró en 2015.
              En 2024, una rotura de tubería causó daños de 8.000 €. La perito calculó que el contenido real
              valía 35.000 €, aplicando la regla proporcional: solo cobró 3.428 €.</p>
              <div className={styles.casoResultado}>Lección: actualizar el capital asegurado con la inflación</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>🏢</span>
                <span className={styles.casoTag}>Local comercial sin actualización</span>
              </div>
              <p>Un negocio de hostelería contrató el seguro en 2018 con 80.000 € de cobertura. Para 2023,
              entre el mobiliario nuevo, la maquinaria y las obras, el valor real era 180.000 €.
              Un robo con daños de 40.000 € solo generó una indemnización de 17.778 €.</p>
              <div className={styles.casoResultado}>Lección: revisar el capital asegurado tras nuevas inversiones</div>
            </div>
            <div className={styles.casoCard}>
              <div className={styles.casoHeader}>
                <span className={styles.casoEmoji}>✅</span>
                <span className={styles.casoTag}>Cobertura correctamente actualizada</span>
              </div>
              <p>Laura revisó su póliza cada año y actualizó el capital tras comprar electrodomésticos nuevos
              y hacer una reforma de baño. Cuando un escape de agua causó 15.000 € en daños, cobró íntegramente
              porque su cobertura reflejaba el valor real del inmueble.</p>
              <div className={styles.casoResultado}>Resultado: indemnización completa sin sorpresas</div>
            </div>
          </div>
        </section>

        {/* Guía paso a paso */}
        <section className={styles.guideSection}>
          <h2>Cómo calcular y corregir el infraseguro: paso a paso</h2>
          <ol className={styles.stepGuide}>
            <li className={styles.step}>
              <span className={styles.stepNumber}>1</span>
              <div className={styles.stepContent}>
                <strong>Calcula el valor real del continente</strong>
                <p>El continente es la estructura: paredes, suelos, techos, instalaciones fijas. Usa el coste
                de reconstrucción (no el valor de mercado) por metro cuadrado según los precios actuales de construcción
                en tu zona. No es lo mismo que el precio de compra.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>2</span>
              <div className={styles.stepContent}>
                <strong>Haz un inventario del contenido</strong>
                <p>Recorre habitación por habitación y anota muebles, electrodomésticos, ropa, joyas, electrónica y
                objetos de valor. Fotografíalos y guarda las facturas. El total de reposición suele superar ampliamente
                la estimación inicial.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>3</span>
              <div className={styles.stepContent}>
                <strong>Compara con el capital asegurado actual</strong>
                <p>Usa esta calculadora para ver si existe infraseguro y cuánto porcentaje de los siniestros
                quedaría sin cubrir. El objetivo es que el capital asegurado iguale o supere el valor real calculado.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>4</span>
              <div className={styles.stepContent}>
                <strong>Contacta a tu aseguradora para actualizar</strong>
                <p>Solicita la modificación de la póliza indicando el nuevo capital asegurado. La variación en la prima
                suele ser pequeña comparada con la mejora de cobertura. Guarda el suplemento de póliza actualizado.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>5</span>
              <div className={styles.stepContent}>
                <strong>Comunica reformas y nuevas adquisiciones relevantes</strong>
                <p>Cada vez que hagas una reforma significativa o compres bienes de valor, notifica a la aseguradora.
                No es necesario para pequeñas compras, pero una reforma de cocina o baño puede suponer 10.000-30.000 €
                que quedan desprotegidos.</p>
              </div>
            </li>
            <li className={styles.step}>
              <span className={styles.stepNumber}>6</span>
              <div className={styles.stepContent}>
                <strong>Revisa anualmente en cada renovación</strong>
                <p>La inflación erosiona la cobertura cada año. Si la póliza no tiene cláusula de actualización automática
                por IPC, aumenta el capital manualmente cada 1-2 años. Una revisión de 15 minutos al año puede evitar
                miles de euros de pérdidas.</p>
              </div>
            </li>
          </ol>
        </section>

        {/* Mejores prácticas */}
        <section className={styles.guideSection}>
          <h2>Buenas prácticas para evitar el infraseguro</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📸</span>
              <strong>Inventario fotográfico del contenido</strong>
              <p>Fotografía habitación por habitación y guarda las fotos en la nube. Facilita la valoración del contenido
              y la reclamación de siniestros.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🗂️</span>
              <strong>Guarda facturas de bienes valiosos</strong>
              <p>Electrodomésticos, muebles, joyas y electrónica. Sin factura, la aseguradora puede aplicar
              depreciación agresiva en la valoración del siniestro.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>📅</span>
              <strong>Revisión anual en la renovación</strong>
              <p>Aprovecha la renovación para revisar el capital asegurado. Añade el coste de adquisiciones del año
              y un 3-5% por inflación general.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🏗️</span>
              <strong>Comunica reformas antes de iniciarlas</strong>
              <p>Avisa a la aseguradora antes de empezar obras. Algunas pólizas excluyen daños ocurridos durante
              las reformas si no se ha notificado previamente.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>🔄</span>
              <strong>Solicita cláusula de actualización automática</strong>
              <p>Muchas aseguradoras ofrecen actualización anual por IPC. Actívala para que el capital se ajuste
              automáticamente sin gestiones manuales.</p>
            </div>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon}>👨‍💼</span>
              <strong>Pide una valoración profesional</strong>
              <p>Para inmuebles de valor o contenido muy específico (joyas, obras de arte, instrumentos), solicita
              un peritaje profesional que justifique el capital asegurado.</p>
            </div>
          </div>
        </section>

        {/* Warning Box */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <strong>Errores comunes que generan infraseguro sin saberlo</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Usar el precio de compra como capital asegurado:</strong> El precio de compra incluye el valor del terreno (no asegurable) y puede estar desactualizado. Usa siempre el coste de reconstrucción actualizado.</li>
            <li><strong>No actualizar tras reformas importantes:</strong> Una reforma de cocina o baño puede añadir 15.000-30.000 € al valor real. No comunicarla deja ese importe sin cobertura.</li>
            <li><strong>Infravalorar el contenido:</strong> Muchas personas estiman el contenido en 10.000-20.000 € cuando la realidad supera los 40.000-60.000 €. Haz el inventario real antes de estimar.</li>
            <li><strong>Ignorar la inflación acumulada:</strong> Con una inflación del 3% anual, en 10 años el valor real crece un 34%. Una póliza sin actualización pierde cobertura progresivamente cada año.</li>
            <li><strong>Confundir valor de mercado con valor de reposición:</strong> Tu televisión de 2018 puede valer 80 € de segunda mano, pero reponerla por una equivalente actual cuesta 500 €. La cobertura debe ser por el coste de sustitución.</li>
            <li><strong>No asegurar objetos de especial valor por separado:</strong> Joyas, colecciones, instrumentos musicales o arte suelen tener límites por objeto en las pólizas estándar. Si superan ese límite, deben asegurarse en un anexo específico.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-infraseguro')} />
      <ShareCard appName="estimador-infraseguro" />
      <Footer appName="estimador-infraseguro" />
    </div>
  );
}
