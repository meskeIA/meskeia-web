'use client';

import { useState } from 'react';
import styles from './SeguimientoCicloMenstrual.module.css';
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

// ===== TIPOS =====
interface CicloPrediccion {
  numero: number;
  inicioPeriodo: Date;
  finPeriodo: Date;
  inicioVentanaFertil: Date;
  finVentanaFertil: Date;
  ovulacion: Date;
}

interface FaseActual {
  nombre: string;
  icon: string;
  descripcion: string;
  diaDelCiclo: number;
}

// ===== HELPERS =====
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatFecha(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatFechaCorta(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

function calcularCiclos(
  ultimoPeriodo: Date,
  duracionCiclo: number,
  duracionPeriodo: number,
  numeroCiclos: number
): CicloPrediccion[] {
  const ciclos: CicloPrediccion[] = [];

  for (let i = 1; i <= numeroCiclos; i++) {
    const inicioPeriodo = addDays(ultimoPeriodo, duracionCiclo * i);
    const finPeriodo = addDays(inicioPeriodo, duracionPeriodo - 1);
    // Ovulación: ~14 días antes del siguiente período
    const ovulacion = addDays(inicioPeriodo, duracionCiclo - 14);
    // Ventana fértil: 5 días antes de la ovulación + día de ovulación
    const inicioVentanaFertil = addDays(ovulacion, -5);
    const finVentanaFertil = addDays(ovulacion, 1);

    ciclos.push({
      numero: i,
      inicioPeriodo,
      finPeriodo,
      inicioVentanaFertil,
      finVentanaFertil,
      ovulacion,
    });
  }

  return ciclos;
}

function getFaseActual(ultimoPeriodo: Date, duracionCiclo: number, duracionPeriodo: number): FaseActual | null {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const inicio = new Date(ultimoPeriodo);
  inicio.setHours(0, 0, 0, 0);

  const diffMs = hoy.getTime() - inicio.getTime();
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Si es antes del período o más de 2 ciclos después, no mostramos
  if (diffDias < 0 || diffDias > duracionCiclo * 2) return null;

  const diaEnCiclo = (diffDias % duracionCiclo) + 1;

  // Ovulación aprox día (duracionCiclo - 14)
  const diaOvulacion = duracionCiclo - 14;

  if (diaEnCiclo <= duracionPeriodo) {
    return {
      nombre: 'Fase menstrual',
      icon: '🔴',
      descripcion: 'Estás en tu período. El útero elimina el endometrio. Es normal sentir calambres y cansancio.',
      diaDelCiclo: diaEnCiclo,
    };
  } else if (diaEnCiclo <= diaOvulacion - 5) {
    return {
      nombre: 'Fase folicular',
      icon: '🌱',
      descripcion: 'Los folículos crecen y el cuerpo se prepara para ovular. Los niveles de estrógeno aumentan y sueles sentirte con más energía.',
      diaDelCiclo: diaEnCiclo,
    };
  } else if (diaEnCiclo <= diaOvulacion + 1) {
    return {
      nombre: 'Ventana fértil / Ovulación',
      icon: '✨',
      descripcion: 'Estás en tu período más fértil. El óvulo es liberado y puede ser fecundado durante las próximas 24-48 horas. Los espermatozoides pueden sobrevivir hasta 5 días.',
      diaDelCiclo: diaEnCiclo,
    };
  } else {
    return {
      nombre: 'Fase lútea',
      icon: '🌙',
      descripcion: 'El cuerpo lúteo produce progesterona. Si no hay fecundación, el endometrio se prepara para desprenderse en la próxima menstruación. Puedes experimentar síntomas SPM.',
      diaDelCiclo: diaEnCiclo,
    };
  }
}

export default function SeguimientoCicloMenstrualPage() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [ultimoPeriodo, setUltimoPeriodo] = useState<string>(todayStr);
  const [duracionCiclo, setDuracionCiclo] = useState<number>(28);
  const [duracionPeriodo, setDuracionPeriodo] = useState<number>(5);
  const [ciclos, setCiclos] = useState<CicloPrediccion[]>([]);
  const [faseActual, setFaseActual] = useState<FaseActual | null>(null);
  const [calculado, setCalculado] = useState(false);

  const calcular = () => {
    const fechaBase = new Date(ultimoPeriodo + 'T00:00:00');
    const predicciones = calcularCiclos(fechaBase, duracionCiclo, duracionPeriodo, 4);
    const fase = getFaseActual(fechaBase, duracionCiclo, duracionPeriodo);
    setCiclos(predicciones);
    setFaseActual(fase);
    setCalculado(true);
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* HERO */}
      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>🌸 Seguimiento Ciclo Menstrual</h1>
        <p className={styles.heroSubtitle}>
          Calcula tu ventana fértil, predicción de ovulación y próximas fechas. Cálculo 100% local: ningún dato sale de tu navegador.
        </p>
      </header>

      <LegalNotice />

      {/* AVISO DE PRIVACIDAD */}
      <div className={styles.privacyNotice} role="note">
        <span className={styles.privacyIcon} aria-hidden="true">🔒</span>
        <span>
          <strong>Privacidad garantizada:</strong> Esta herramienta funciona completamente en tu navegador.
          No enviamos ni almacenamos ningún dato de salud en nuestros servidores.
        </span>
      </div>

      {/* FORMULARIO */}
      <section className={styles.formSection} aria-labelledby="sec-datos">
        <h2 className={styles.sectionTitle} id="sec-datos">
          <span aria-hidden="true">📅</span> Datos de tu ciclo
        </h2>
        <div className={styles.inputGrid}>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="ultimoPeriodo">
              Primer día de tu último período
            </label>
            <input
              id="ultimoPeriodo"
              type="date"
              value={ultimoPeriodo}
              onChange={e => setUltimoPeriodo(e.target.value)}
              max={todayStr}
              className={styles.dateInput}
              aria-label="Primer día del último período menstrual"
            />
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="duracion-ciclo">
              Duración del ciclo: <strong style={{ color: 'var(--primary)' }}>{duracionCiclo} días</strong>
            </label>
            <div className={styles.rangeContainer}>
              <input
                id="duracion-ciclo"
                type="range"
                min={21}
                max={35}
                step={1}
                value={duracionCiclo}
                onChange={e => setDuracionCiclo(parseInt(e.target.value))}
                className={styles.rangeInput}
                aria-label={`Duración del ciclo: ${duracionCiclo} días`}
              />
              <span className={styles.rangeValue}>{duracionCiclo}d</span>
            </div>
            <span className={styles.rangeHint}>Media: 28 días (rango normal: 21-35)</span>
          </div>
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="duracion-periodo">
              Duración del período: <strong style={{ color: 'var(--primary)' }}>{duracionPeriodo} días</strong>
            </label>
            <div className={styles.rangeContainer}>
              <input
                id="duracion-periodo"
                type="range"
                min={2}
                max={8}
                step={1}
                value={duracionPeriodo}
                onChange={e => setDuracionPeriodo(parseInt(e.target.value))}
                className={styles.rangeInput}
                aria-label={`Duración del período: ${duracionPeriodo} días`}
              />
              <span className={styles.rangeValue}>{duracionPeriodo}d</span>
            </div>
            <span className={styles.rangeHint}>Media: 5 días (rango normal: 2-8)</span>
          </div>
        </div>
      </section>

      <div className={styles.btnWrapper}>
        <button onClick={calcular} className={styles.btnCalcular} aria-label="Calcular ciclo y ventana fértil">
          Calcular ciclo y fertilidad
        </button>
      </div>

      {/* RESULTADOS */}
      {calculado && (
        <section aria-live="polite" aria-label="Resultados del ciclo menstrual">

          {/* FASE ACTUAL */}
          {faseActual && (
            <div className={styles.faseActual} role="status">
              <span className={styles.faseIcon} aria-hidden="true">{faseActual.icon}</span>
              <div className={styles.faseInfo}>
                <p className={styles.faseTitulo}>{faseActual.nombre}</p>
                <p className={styles.faseDes}>{faseActual.descripcion}</p>
              </div>
              <div>
                <div className={styles.faseDia}>{faseActual.diaDelCiclo}</div>
                <div className={styles.faseDiaLabel}>día del ciclo</div>
              </div>
            </div>
          )}

          {/* LEYENDA FASES */}
          <div className={styles.leyenda} role="list" aria-label="Fases del ciclo menstrual">
            <div className={styles.leyendaItem} role="listitem">
              <span className={styles.leyendaIcon} aria-hidden="true">🔴</span>
              <div className={styles.leyendaNombre}>Menstrual</div>
              <div className={styles.leyendaDias}>Días 1-{duracionPeriodo}</div>
            </div>
            <div className={styles.leyendaItem} role="listitem">
              <span className={styles.leyendaIcon} aria-hidden="true">🌱</span>
              <div className={styles.leyendaNombre}>Folicular</div>
              <div className={styles.leyendaDias}>Días {duracionPeriodo + 1}-{duracionCiclo - 19}</div>
            </div>
            <div className={styles.leyendaItem} role="listitem">
              <span className={styles.leyendaIcon} aria-hidden="true">✨</span>
              <div className={styles.leyendaNombre}>Ovulación</div>
              <div className={styles.leyendaDias}>~Día {duracionCiclo - 14}</div>
            </div>
            <div className={styles.leyendaItem} role="listitem">
              <span className={styles.leyendaIcon} aria-hidden="true">🌙</span>
              <div className={styles.leyendaNombre}>Lútea</div>
              <div className={styles.leyendaDias}>Días {duracionCiclo - 13}-{duracionCiclo}</div>
            </div>
          </div>

          {/* PRÓXIMOS CICLOS */}
          <div className={styles.ciclosCard}>
            <h3 className={styles.ciclosTitle}>📅 Próximas predicciones (4 ciclos)</h3>
            <div role="list" aria-label="Próximos ciclos menstruales">
              {ciclos.map(ciclo => (
                <div key={ciclo.numero} className={styles.cicloRow} role="listitem">
                  <div className={styles.cicloNum} aria-label={`Ciclo ${ciclo.numero}`}>{ciclo.numero}</div>
                  <div className={styles.cicloFechas}>
                    <div className={styles.cicloFechaPeriodo}>
                      🔴 Período: {formatFecha(ciclo.inicioPeriodo)} – {formatFechaCorta(ciclo.finPeriodo)}
                    </div>
                    <div className={styles.cicloFechaOvulacion}>
                      ✨ Ovulación probable: {formatFecha(ciclo.ovulacion)}
                    </div>
                  </div>
                  <div className={styles.cicloFertil} aria-label={`Ventana fértil: ${formatFechaCorta(ciclo.inicioVentanaFertil)} al ${formatFechaCorta(ciclo.finVentanaFertil)}`}>
                    💚 {formatFechaCorta(ciclo.inicioVentanaFertil)} – {formatFechaCorta(ciclo.finVentanaFertil)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* DISCLAIMER SALUD */}
      <DisclaimerCard
        variant="medical"
        severity="high"
        context="seguimiento-ciclo-menstrual"
        collapsible={false}
      />

      {/* CONTENIDO EDUCATIVO */}
      <EducationalSection
        title="📚 Cómo funciona el ciclo menstrual"
        subtitle="Guía completa de las 4 fases"
      >
        <section>
          <h2>Las 4 fases del ciclo menstrual</h2>

          <h3>🔴 Fase menstrual (días 1-5 aprox.)</h3>
          <p>
            Es el inicio del ciclo. El revestimiento uterino (endometrio) se desprende y es expulsado en forma de flujo menstrual. Dura entre 2 y 8 días. Los niveles de estrógeno y progesterona están en su punto más bajo.
          </p>

          <h3>🌱 Fase folicular (días 1-13 aprox.)</h3>
          <p>
            Comienza el primer día de la menstruación y termina con la ovulación. La hipófisis libera FSH (hormona folículo estimulante), que estimula el desarrollo de folículos en los ovarios. El estrógeno aumenta, haciendo que el endometrio se engrose. Es la fase en que muchas mujeres se sienten con más energía.
          </p>

          <h3>✨ Ovulación (alrededor del día 14 en un ciclo de 28 días)</h3>
          <p>
            El folículo maduro libera un óvulo que viaja por la trompa de Falopio. El óvulo puede ser fecundado durante las siguientes <strong>12-24 horas</strong>. Sin embargo, la <strong>ventana fértil</strong> real es de unos 6 días (5 días antes de la ovulación + el día del ovulo), porque los espermatozoides pueden vivir hasta 5 días en el aparato reproductor femenino.
          </p>
          <p>
            La ovulación no ocurre siempre en el día 14. En ciclos más largos o cortos, se ajusta: ocurre aproximadamente <strong>14 días antes del próximo período</strong>.
          </p>

          <h3>🌙 Fase lútea (días 15-28 aprox.)</h3>
          <p>
            El folículo vacío se convierte en el cuerpo lúteo y produce progesterona. Si el óvulo no es fecundado, el cuerpo lúteo se degenera, la progesterona cae y comienza la menstruación. En esta fase pueden aparecer síntomas del síndrome premenstrual (SPM): sensibilidad en el pecho, cambios de humor, retención de líquidos.
          </p>

          <h2>¿Qué es un ciclo "normal"?</h2>
          <p>
            Un ciclo menstrual normal dura entre <strong>21 y 35 días</strong>. La duración del período varía entre <strong>2 y 8 días</strong>. Pequeñas variaciones de un mes a otro son completamente normales: el estrés, el ejercicio intenso, los cambios de peso o la enfermedad pueden alterar el ciclo.
          </p>

          <h2>Factores que pueden alterar el ciclo</h2>
          <ul>
            <li><strong>Estrés</strong>: el cortisol puede retrasar o suprimir la ovulación</li>
            <li><strong>Cambios de peso bruscos</strong>: la pérdida o ganancia rápida de peso afecta las hormonas</li>
            <li><strong>Ejercicio excesivo</strong>: el entrenamiento muy intenso puede causar amenorrea</li>
            <li><strong>Enfermedad o medicamentos</strong>: los antibióticos, por ejemplo, pueden interferir con la píldora</li>
            <li><strong>Síndrome de ovario poliquístico (SOP)</strong>: causa ciclos irregulares y períodos largos</li>
          </ul>

          <h2>Métodos anticonceptivos y fertilidad</h2>
          <p>
            <strong>Importante:</strong> esta calculadora usa el método del calendario, que NO es un método anticonceptivo fiable. Los ciclos pueden variar mes a mes. Para contracepción, consulta con tu ginecólogo o médico de cabecera.
          </p>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('seguimiento-ciclo-menstrual')} />

      <ShareCard appName="seguimiento-ciclo-menstrual" />
      <Footer appName="seguimiento-ciclo-menstrual" />
    </div>
  );
}
