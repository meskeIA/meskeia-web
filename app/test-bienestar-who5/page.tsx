'use client';

import { useState } from 'react';
import styles from './TestBienestarWho5.module.css';
import {
  MeskeiaLogo, Footer, LegalNotice, EducationalSection, RelatedApps,
  ShareCard, DisclaimerCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─── WHO-5 Well-Being Index ───────────────────────────────────────────────────
// Fuente: Psychiatric Research Unit, WHO Collaborating Centre, Hillerød (Dinamarca)
// Versión validada en español. Uso libre sin licencia.
// Referencia: Topp CW et al. (2015). The WHO-5 Well-Being Index: A Systematic Review

const PREGUNTAS_WHO5 = [
  'Me he sentido alegre y de buen ánimo',
  'Me he sentido tranquilo/a y relajado/a',
  'Me he sentido activo/a y con energía',
  'Me he despertado sintiéndome fresco/a y descansado/a',
  'Mi vida diaria ha estado llena de cosas que me interesan',
];

const OPCIONES = [
  { valor: 5, texto: 'Todo el tiempo' },
  { valor: 4, texto: 'La mayor parte del tiempo' },
  { valor: 3, texto: 'Más de la mitad del tiempo' },
  { valor: 2, texto: 'Menos de la mitad del tiempo' },
  { valor: 1, texto: 'En algún momento' },
  { valor: 0, texto: 'En ningún momento' },
];

interface Resultado {
  puntuacionBruta: number;    // 0-25
  porcentaje: number;         // 0-100 (bruta × 4)
  nivel: 'alto' | 'moderado' | 'bajo' | 'muy_bajo';
  descripcion: string;
  recomendaciones: string[];
}

function evaluar(respuestas: number[]): Resultado {
  const bruta = respuestas.reduce((sum, v) => sum + v, 0);
  const porcentaje = bruta * 4; // WHO-5 se multiplica por 4 para obtener escala 0-100

  if (porcentaje >= 72) {
    return {
      puntuacionBruta: bruta,
      porcentaje,
      nivel: 'alto',
      descripcion: 'Tu bienestar subjetivo es alto. Te sientes generalmente bien en tu día a día.',
      recomendaciones: [
        'Sigue manteniendo los hábitos que te hacen sentir bien',
        'Comparte tu bienestar: ayudar a otros también mejora el propio',
        'Repite el test dentro de unas semanas para hacer seguimiento',
      ],
    };
  }
  if (porcentaje >= 52) {
    return {
      puntuacionBruta: bruta,
      porcentaje,
      nivel: 'moderado',
      descripcion: 'Tu bienestar es moderado. Hay aspectos que funcionan bien, pero otros podrían mejorar.',
      recomendaciones: [
        'Identifica qué áreas de tu vida te generan más satisfacción y cuáles menos',
        'Pequeños cambios en rutina, sueño o actividad física pueden marcar diferencia',
        'Si la tendencia es a la baja, considera hablar con un profesional',
      ],
    };
  }
  if (porcentaje >= 28) {
    return {
      puntuacionBruta: bruta,
      porcentaje,
      nivel: 'bajo',
      descripcion: 'Tu bienestar es bajo. Merece la pena prestarle atención y buscar formas de mejorarlo.',
      recomendaciones: [
        'Hablar con alguien de confianza (amigo, familiar, profesional) puede ayudar mucho',
        'El ejercicio físico regular, incluso caminar 20 minutos, tiene efecto demostrado sobre el ánimo',
        'Considera consultar con tu médico de cabecera — puede orientarte hacia recursos de ayuda',
        'Recuerda: pedir ayuda es un acto de valentía, no de debilidad',
      ],
    };
  }
  return {
    puntuacionBruta: bruta,
    porcentaje,
    nivel: 'muy_bajo',
    descripcion: 'Tu bienestar es muy bajo. Es importante que busques apoyo profesional.',
    recomendaciones: [
      'Te recomendamos hablar con un profesional de salud mental (psicólogo o médico de cabecera)',
      'Puedes llamar al 024 (Línea de Atención a la Conducta Suicida) o al 717 003 717 (Teléfono de la Esperanza)',
      'No estás solo/a — hay personas formadas para ayudarte en este momento',
      'Un resultado bajo no es un diagnóstico: un profesional puede evaluar tu situación completa',
    ],
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function TestBienestarWho5Page() {
  const [respuestas, setRespuestas] = useState<(number | null)[]>(new Array(5).fill(null));
  const [resultado, setResultado] = useState<Resultado | null>(null);

  const todasRespondidas = respuestas.every(r => r !== null);

  const handleRespuesta = (preguntaIdx: number, valor: number) => {
    const nuevas = [...respuestas];
    nuevas[preguntaIdx] = valor;
    setRespuestas(nuevas);
  };

  const handleEvaluar = () => {
    if (!todasRespondidas) return;
    setResultado(evaluar(respuestas as number[]));
  };

  const reiniciar = () => {
    setRespuestas(new Array(5).fill(null));
    setResultado(null);
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">🌱</span>
          <h1 className={styles.title}>Test de Bienestar WHO-5</h1>
          <p className={styles.subtitle}>
            Escala de bienestar subjetivo de la OMS — 5 preguntas sobre cómo te has sentido en las últimas 2 semanas
          </p>
        </header>

        <LegalNotice />
        <DisclaimerCard variant="medical" severity="high" context="test-bienestar-who5" />

        {/* ── Recurso de ayuda siempre visible ── */}
        <div className={styles.recursoAyuda} role="alert">
          <span aria-hidden="true">📞</span>
          <p>
            Si estás pasando por un momento difícil: <strong>024</strong> (Línea de Atención a la Conducta Suicida)
            o <strong>717 003 717</strong> (Teléfono de la Esperanza). Gratuitos, confidenciales y 24h.
          </p>
        </div>

        {!resultado ? (
          <div className={styles.testSection}>
            <div className={styles.instrucciones}>
              <p>Indica con qué frecuencia te has sentido así <strong>durante las últimas 2 semanas</strong>:</p>
            </div>

            {PREGUNTAS_WHO5.map((pregunta, idx) => (
              <div key={idx} className={styles.preguntaCard}>
                <p className={styles.preguntaTexto}>
                  <span className={styles.preguntaNum}>{idx + 1}.</span> {pregunta}
                </p>
                <div className={styles.opcionesGrid}>
                  {OPCIONES.map(op => (
                    <button
                      key={op.valor}
                      type="button"
                      className={`${styles.opcionBtn} ${respuestas[idx] === op.valor ? styles.opcionActiva : ''}`}
                      onClick={() => handleRespuesta(idx, op.valor)}
                      aria-pressed={respuestas[idx] === op.valor}
                    >
                      <span className={styles.opcionValor}>{op.valor}</span>
                      <span className={styles.opcionTexto}>{op.texto}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <button
              type="button"
              className={styles.btn}
              onClick={handleEvaluar}
              disabled={!todasRespondidas}
            >
              Ver resultado
            </button>
          </div>
        ) : (
          <div className={styles.resultadoSection}>
            <div className={styles.resultadoHero} data-nivel={resultado.nivel}>
              <div className={styles.resultadoPorcentaje}>{resultado.porcentaje}%</div>
              <div className={styles.resultadoEscala}>de bienestar (escala 0-100)</div>
              <p className={styles.resultadoDesc}>{resultado.descripcion}</p>
            </div>

            {/* Barra visual */}
            <div className={styles.barraCard}>
              <div className={styles.barraContainer}>
                <div className={styles.barra}>
                  <div className={styles.barraFill} data-nivel={resultado.nivel} style={{ width: `${resultado.porcentaje}%` }} />
                </div>
                <div className={styles.barraEtiquetas}>
                  <span>0</span>
                  <span>28</span>
                  <span>52</span>
                  <span>72</span>
                  <span>100</span>
                </div>
                <div className={styles.barraNiveles}>
                  <span className={styles.nivelMuyBajo}>Muy bajo</span>
                  <span className={styles.nivelBajo}>Bajo</span>
                  <span className={styles.nivelModerado}>Moderado</span>
                  <span className={styles.nivelAlto}>Alto</span>
                </div>
              </div>
            </div>

            {/* Recomendaciones */}
            <div className={styles.recomendacionesCard}>
              <h3 className={styles.recomendacionesTitulo}>Recomendaciones</h3>
              <ul className={styles.recomendacionesList}>
                {resultado.recomendaciones.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>

            {/* Aviso claro */}
            <div className={styles.avisoCard}>
              <span aria-hidden="true">⚠️</span>
              <div>
                <strong>Este test NO es un diagnóstico</strong>
                <p>El WHO-5 mide bienestar subjetivo, no diagnostica ningún trastorno. Solo un profesional
                de salud mental puede evaluar tu situación de forma completa. Si te preocupa tu
                resultado, habla con tu médico de cabecera.</p>
              </div>
            </div>

            <button type="button" className={styles.btnSecundario} onClick={reiniciar}>
              Repetir test
            </button>
          </div>
        )}

        <EducationalSection
          title="📚 Sobre el WHO-5 y el bienestar"
          subtitle="Qué mide esta escala y cómo mejorar tu bienestar"
        >
          <section className={styles.guideSection}>
            <h2>¿Qué es el WHO-5?</h2>
            <p>
              El <strong>WHO-5 Well-Being Index</strong> fue desarrollado por la OMS en 1998 y es una de las
              escalas de bienestar más utilizadas del mundo. Ha sido validada en más de 30 idiomas y
              se usa tanto en investigación como en atención primaria. Mide bienestar <strong>positivo</strong>
              (no patología), lo que la hace segura y accesible.
            </p>

            <div className={styles.pilaresGrid}>
              <div className={styles.pilarCard}>
                <span aria-hidden="true">😊</span>
                <strong>Ánimo positivo</strong>
                <p>Sensación general de alegría y buen humor</p>
              </div>
              <div className={styles.pilarCard}>
                <span aria-hidden="true">🧘</span>
                <strong>Calma</strong>
                <p>Sentirse tranquilo/a y relajado/a en el día a día</p>
              </div>
              <div className={styles.pilarCard}>
                <span aria-hidden="true">⚡</span>
                <strong>Vitalidad</strong>
                <p>Energía, actividad y ganas de hacer cosas</p>
              </div>
              <div className={styles.pilarCard}>
                <span aria-hidden="true">😴</span>
                <strong>Descanso</strong>
                <p>Despertarse sintiéndose fresco/a y descansado/a</p>
              </div>
              <div className={styles.pilarCard}>
                <span aria-hidden="true">🎯</span>
                <strong>Interés</strong>
                <p>Vida cotidiana llena de actividades que interesan</p>
              </div>
            </div>

            <div className={styles.faqList}>
              <details className={styles.faqItem}>
                <summary>¿Con qué frecuencia debería hacer este test?</summary>
                <p>El WHO-5 está diseñado para evaluar las últimas 2 semanas. Puedes repetirlo cada 2-4 semanas para ver tendencias. No tiene sentido hacerlo todos los días.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Un resultado bajo significa que tengo depresión?</summary>
                <p>No. Un resultado bajo indica bienestar subjetivo reducido, lo que puede deberse a muchas causas (estrés temporal, cansancio, problemas puntuales). Solo un profesional puede evaluar si hay un problema clínico.</p>
              </details>
              <details className={styles.faqItem}>
                <summary>¿Qué puedo hacer para mejorar mi bienestar?</summary>
                <p>La evidencia científica apoya: ejercicio regular, sueño de calidad, conexión social, actividades con propósito, tiempo en la naturaleza y, si es necesario, ayuda profesional.</p>
              </details>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
                <strong>Importante</strong>
              </div>
              <ul className={styles.warningList}>
                <li>El WHO-5 es una herramienta de cribado, no un diagnóstico clínico</li>
                <li>Si tu puntuación es baja de forma persistente, consulta con un profesional de salud</li>
                <li>Línea 024 (conducta suicida) y 717 003 717 (Teléfono de la Esperanza): gratuitos, 24h</li>
                <li>Pedir ayuda es un acto de responsabilidad contigo mismo/a</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('test-bienestar-who5')} />
        <ShareCard appName="test-bienestar-who5" />
        <Footer appName="test-bienestar-who5" />
      </div>
    </>
  );
}
