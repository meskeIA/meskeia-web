'use client';
// @disclaimer: exempt

import { useState, useCallback } from 'react';
import styles from './QuizConceptosFinancieros.module.css';
import {
  MeskeiaLogo, Footer, LegalNotice, EducationalSection, RelatedApps,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// ─── Preguntas ────────────────────────────────────────────────────────────────

interface Pregunta {
  pregunta: string;
  opciones: string[];
  correcta: number;
  explicacion: string;
  categoria: string;
}

const PREGUNTAS: Pregunta[] = [
  { pregunta: '¿Qué es la inflación?', opciones: ['Que suben los sueldos', 'Que sube el precio general de las cosas', 'Que bajan los impuestos', 'Que sube el valor del dinero'], correcta: 1, explicacion: 'La inflación es el aumento generalizado y sostenido de los precios. Con un 3% anual, algo que hoy cuesta 100 € costará 103 € dentro de un año.', categoria: 'Economía básica' },
  { pregunta: '¿Qué significa "interés compuesto"?', opciones: ['Pagar intereses por un préstamo', 'Intereses que se calculan sobre el capital + los intereses anteriores', 'Un tipo de cuenta bancaria', 'Interés fijo que nunca cambia'], correcta: 1, explicacion: 'El interés compuesto genera "intereses sobre intereses". Es la base del crecimiento de las inversiones a largo plazo. Einstein lo llamó "la octava maravilla del mundo".', categoria: 'Ahorro e inversión' },
  { pregunta: 'Tienes 1.000 € en el banco al 5% anual. ¿Cuánto tendrás en 1 año?', opciones: ['1.005 €', '1.050 €', '1.500 €', '1.100 €'], correcta: 1, explicacion: '5% de 1.000 € = 50 €. Total: 1.050 €. Así funciona el interés simple. Con interés compuesto y más años, la diferencia se multiplica.', categoria: 'Ahorro e inversión' },
  { pregunta: '¿Qué es un presupuesto?', opciones: ['Una lista de deseos', 'Un plan que organiza ingresos y gastos', 'Lo que te sobra a fin de mes', 'El saldo de tu cuenta bancaria'], correcta: 1, explicacion: 'Un presupuesto es un plan financiero que te ayuda a controlar a dónde va tu dinero: cuánto entra, cuánto sale y cuánto puedes ahorrar.', categoria: 'Presupuesto' },
  { pregunta: '¿Cuál es la regla del 50/30/20?', opciones: ['50% ahorro, 30% gastos, 20% inversión', '50% necesidades, 30% deseos, 20% ahorro', '50% alquiler, 30% comida, 20% ocio', '50% impuestos, 30% gastos, 20% libre'], correcta: 1, explicacion: 'La regla 50/30/20 sugiere destinar el 50% de tus ingresos a necesidades (alquiler, comida), 30% a deseos (ocio, ropa) y 20% a ahorro e inversión.', categoria: 'Presupuesto' },
  { pregunta: '¿Qué es un fondo de emergencia?', opciones: ['Dinero para vacaciones', 'Ahorro reservado para imprevistos', 'Un tipo de inversión arriesgada', 'Dinero que te presta el banco'], correcta: 1, explicacion: 'Es un colchón de seguridad (3-6 meses de gastos) para cubrir imprevistos: reparaciones, pérdida de empleo, gastos médicos. Se guarda en cuenta accesible, no invertido.', categoria: 'Ahorro' },
  { pregunta: '¿Qué pasa si solo pagas el mínimo de tu tarjeta de crédito?', opciones: ['No pasa nada, es lo normal', 'Pagas muchos más intereses a largo plazo', 'Te devuelven dinero', 'Te bajan el límite'], correcta: 1, explicacion: 'Pagar solo el mínimo es una trampa: los intereses (20-25% TAE) se acumulan sobre el resto. Una deuda de 1.000 € puede acabar costando el doble si solo pagas el mínimo.', categoria: 'Deuda' },
  { pregunta: '¿Qué es la TAE?', opciones: ['Tasa Anual Equivalente — el coste real de un préstamo', 'Tipo de Ahorro Especial', 'Tarifa de Apertura Estándar', 'Total Acumulado en Euros'], correcta: 0, explicacion: 'La TAE (Tasa Anual Equivalente) refleja el coste total de un producto financiero incluyendo intereses, comisiones y plazos. Es la cifra que hay que comparar entre ofertas.', categoria: 'Banca' },
  { pregunta: '¿Qué es diversificar las inversiones?', opciones: ['Invertir todo en lo que más sube', 'Repartir el dinero en diferentes tipos de inversión', 'Cambiar de inversión cada mes', 'Invertir solo en tu país'], correcta: 1, explicacion: '"No pongas todos los huevos en la misma cesta". Diversificar reduce el riesgo: si una inversión baja, otras pueden compensar.', categoria: 'Inversión' },
  { pregunta: '¿Qué es el IRPF?', opciones: ['Un impuesto sobre las compras', 'El impuesto sobre la renta de las personas físicas', 'Un plan de pensiones', 'Una cuenta de ahorro'], correcta: 1, explicacion: 'El IRPF es el impuesto principal que pagas por tus ingresos (trabajo, alquiler, inversiones). Es progresivo: cuanto más ganas, mayor porcentaje pagas.', categoria: 'Impuestos' },
  { pregunta: 'Si la inflación es del 3% y tu cuenta da un 1%, ¿qué pasa con tu dinero?', opciones: ['Ganas un 1%', 'Pierdes poder adquisitivo (tu dinero vale menos)', 'No pasa nada', 'Ganas un 4%'], correcta: 1, explicacion: 'Si la inflación (3%) supera el rendimiento de tu ahorro (1%), pierdes un 2% de poder adquisitivo real. Tu dinero crece en cifras, pero compra menos cosas.', categoria: 'Economía básica' },
  { pregunta: '¿Qué es un aval?', opciones: ['Un seguro de vida', 'Una persona o bien que garantiza el pago de una deuda', 'Un tipo de inversión', 'Un descuento bancario'], correcta: 1, explicacion: 'Un aval es una garantía: si tú no pagas, el avalista (otra persona) o el bien avalado (una casa, por ejemplo) responde por la deuda. Es un compromiso muy serio.', categoria: 'Deuda' },
  { pregunta: '¿Cuál de estas deudas suele tener el interés más alto?', opciones: ['Hipoteca', 'Préstamo de coche', 'Tarjeta de crédito', 'Préstamo estudiantil'], correcta: 2, explicacion: 'Las tarjetas de crédito suelen tener TAE del 20-25%, muy superior a hipotecas (2-4%) o préstamos personales (6-12%). Siempre intenta pagar el total cada mes.', categoria: 'Deuda' },
  { pregunta: '¿Qué es mejor: ahorrar 100 € al mes durante 10 años, o 200 € al mes durante 5 años?', opciones: ['Da igual, es la misma cantidad', 'Ahorrar 100 €/mes durante 10 años (si se invierte)', '200 €/mes durante 5 años siempre', 'Depende del día de la semana'], correcta: 1, explicacion: 'Ambos suman 12.000 €, pero si inviertes, el dinero ahorrado antes tiene más tiempo para crecer (interés compuesto). Tiempo > cantidad.', categoria: 'Inversión' },
  { pregunta: '¿Qué es el IPC?', opciones: ['Índice de Precios de Consumo — mide la inflación', 'Impuesto de Propiedad Comercial', 'Indicador de Productividad del Capital', 'Interés Personal de Crédito'], correcta: 0, explicacion: 'El IPC mide cómo varían los precios de una cesta de productos y servicios típicos. Si el IPC sube un 3%, la vida se ha encarecido un 3% de media.', categoria: 'Economía básica' },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function QuizConceptosFinancierosPage() {
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestas, setRespuestas] = useState<(number | null)[]>(new Array(PREGUNTAS.length).fill(null));
  const [mostrarExplicacion, setMostrarExplicacion] = useState(false);
  const [quizTerminado, setQuizTerminado] = useState(false);

  const responder = useCallback((opcionIdx: number) => {
    if (mostrarExplicacion) return;
    const nuevas = [...respuestas];
    nuevas[preguntaActual] = opcionIdx;
    setRespuestas(nuevas);
    setMostrarExplicacion(true);
  }, [preguntaActual, mostrarExplicacion, respuestas]);

  const siguiente = () => {
    setMostrarExplicacion(false);
    if (preguntaActual < PREGUNTAS.length - 1) {
      setPreguntaActual(preguntaActual + 1);
    } else {
      setQuizTerminado(true);
    }
  };

  const reiniciar = () => {
    setPreguntaActual(0);
    setRespuestas(new Array(PREGUNTAS.length).fill(null));
    setMostrarExplicacion(false);
    setQuizTerminado(false);
  };

  const aciertos = respuestas.filter((r, i) => r === PREGUNTAS[i].correcta).length;
  const porcentaje = (aciertos / PREGUNTAS.length) * 100;

  const getNivel = () => {
    if (porcentaje >= 90) return { emoji: '🏆', titulo: '¡Experto financiero!', texto: 'Dominas los conceptos básicos de finanzas. ¡Sigue aprendiendo!' };
    if (porcentaje >= 70) return { emoji: '🌟', titulo: 'Muy bien', texto: 'Tienes buena base. Repasa los conceptos que fallaste.' };
    if (porcentaje >= 50) return { emoji: '📚', titulo: 'En camino', texto: 'Conoces lo esencial pero hay margen de mejora.' };
    return { emoji: '💪', titulo: 'A seguir aprendiendo', texto: 'No te preocupes: cada error es una oportunidad de aprender.' };
  };

  return (
    <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">🧠</span>
          <h1 className={styles.title}>Quiz de Conceptos Financieros</h1>
          <p className={styles.subtitle}>
            15 preguntas para descubrir cuánto sabes sobre dinero, ahorro, inversión e impuestos
          </p>
        </header>

        <LegalNotice />

        {!quizTerminado ? (
          <div className={styles.quizSection}>
            {/* Progreso */}
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${((preguntaActual + (mostrarExplicacion ? 1 : 0)) / PREGUNTAS.length) * 100}%` }} />
            </div>
            <div className={styles.progressInfo}>
              <span>Pregunta {preguntaActual + 1} de {PREGUNTAS.length}</span>
              <span className={styles.progressCategoria}>{PREGUNTAS[preguntaActual].categoria}</span>
            </div>

            {/* Pregunta */}
            <div className={styles.preguntaCard}>
              <h2 className={styles.preguntaTexto}>{PREGUNTAS[preguntaActual].pregunta}</h2>
              <div className={styles.opcionesGrid}>
                {PREGUNTAS[preguntaActual].opciones.map((op, i) => {
                  let estado = '';
                  if (mostrarExplicacion) {
                    if (i === PREGUNTAS[preguntaActual].correcta) estado = styles.correcta;
                    else if (i === respuestas[preguntaActual]) estado = styles.incorrecta;
                  }
                  return (
                    <button
                      key={i}
                      type="button"
                      className={`${styles.opcionBtn} ${estado} ${!mostrarExplicacion && respuestas[preguntaActual] === i ? styles.seleccionada : ''}`}
                      onClick={() => responder(i)}
                      disabled={mostrarExplicacion}
                    >
                      <span className={styles.opcionLetra}>{String.fromCharCode(65 + i)}</span>
                      {op}
                    </button>
                  );
                })}
              </div>

              {mostrarExplicacion && (
                <div className={styles.explicacionCard} data-acierto={respuestas[preguntaActual] === PREGUNTAS[preguntaActual].correcta}>
                  <span aria-hidden="true">
                    {respuestas[preguntaActual] === PREGUNTAS[preguntaActual].correcta ? '✅' : '❌'}
                  </span>
                  <div>
                    <strong>
                      {respuestas[preguntaActual] === PREGUNTAS[preguntaActual].correcta ? '¡Correcto!' : 'Incorrecto'}
                    </strong>
                    <p>{PREGUNTAS[preguntaActual].explicacion}</p>
                  </div>
                </div>
              )}

              {mostrarExplicacion && (
                <button type="button" className={styles.btn} onClick={siguiente}>
                  {preguntaActual < PREGUNTAS.length - 1 ? 'Siguiente pregunta' : 'Ver resultado'}
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.resultadoSection}>
            {(() => {
              const nivel = getNivel();
              return (
                <div className={styles.resultadoHero}>
                  <span className={styles.resultadoEmoji} aria-hidden="true">{nivel.emoji}</span>
                  <h2>{nivel.titulo}</h2>
                  <div className={styles.resultadoPuntuacion}>
                    {aciertos} / {PREGUNTAS.length}
                  </div>
                  <p>{nivel.texto}</p>
                </div>
              );
            })()}

            {/* Resumen por categoría */}
            <div className={styles.resumenCard}>
              <h3 className={styles.resumenTitle}>Resumen por tema</h3>
              {Array.from(new Set(PREGUNTAS.map(p => p.categoria))).map(cat => {
                const pregsCategoria = PREGUNTAS.map((p, i) => ({ ...p, idx: i })).filter(p => p.categoria === cat);
                const aciertosCategoria = pregsCategoria.filter(p => respuestas[p.idx] === p.correcta).length;
                return (
                  <div key={cat} className={styles.categoriaItem}>
                    <span className={styles.categoriaNombre}>{cat}</span>
                    <div className={styles.categoriaBarra}>
                      <div className={styles.categoriaFill} style={{ width: `${(aciertosCategoria / pregsCategoria.length) * 100}%` }} />
                    </div>
                    <span className={styles.categoriaScore}>{aciertosCategoria}/{pregsCategoria.length}</span>
                  </div>
                );
              })}
            </div>

            <button type="button" className={styles.btn} onClick={reiniciar}>
              Repetir quiz
            </button>
          </div>
        )}

        <EducationalSection
          title="📚 Glosario financiero básico"
          subtitle="Los conceptos clave que todo joven debería conocer"
        >
          <section className={styles.guideSection}>
            <h2>Términos esenciales</h2>
            <div className={styles.glosarioGrid}>
              <div className={styles.glosarioItem}><strong>Activo</strong><p>Algo que posees y tiene valor: dinero, inversiones, propiedades</p></div>
              <div className={styles.glosarioItem}><strong>Pasivo</strong><p>Lo que debes: préstamos, hipoteca, deuda de tarjeta</p></div>
              <div className={styles.glosarioItem}><strong>Liquidez</strong><p>Lo fácil que es convertir algo en dinero disponible</p></div>
              <div className={styles.glosarioItem}><strong>Rentabilidad</strong><p>Lo que ganas con una inversión, expresado en porcentaje</p></div>
              <div className={styles.glosarioItem}><strong>Riesgo</strong><p>La posibilidad de perder dinero en una inversión</p></div>
              <div className={styles.glosarioItem}><strong>Patrimonio neto</strong><p>Activos menos pasivos = lo que realmente tienes</p></div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">🎓</span>
                <strong>Nunca dejes de aprender</strong>
              </div>
              <ul className={styles.warningList}>
                <li>La educación financiera no se enseña en el colegio, pero es esencial para la vida</li>
                <li>Empieza con lo básico: presupuesto, ahorro y entender los intereses</li>
                <li>Desconfía de quien te prometa dinero fácil — si suena demasiado bien, probablemente lo sea</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('quiz-conceptos-financieros')} />
        <ShareCard appName="quiz-conceptos-financieros" />
        <Footer appName="quiz-conceptos-financieros" />
    </div>
  );
}
