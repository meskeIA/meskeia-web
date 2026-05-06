'use client';

import { useState, useMemo, useEffect } from 'react';
import styles from './CalculadoraNotas.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LegalNotice, ShareCard } from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { formatNumber } from '@/lib';

// Tipos
type TabType = 'media' | 'evau' | 'conversor';
type TipoMateria = 'troncal' | 'especifica';

interface Asignatura {
  id: string;
  nombre: string;
  nota: string;
  creditos: string;
}

interface AsignaturaEvau {
  id: string;
  nombre: string;
  nota: string;
  tipo: TipoMateria;
}

// Funciones de conversión multi-país (España + Latam + USA)
const convertirNota = (nota: number, desde: string) => {
  // Normalizar a escala 0-10 (referencia común)
  let nota10: number;

  switch (desde) {
    case 'espana':
    case 'mexico':
    case 'argentina':
      nota10 = nota;
      break;
    case 'gpa':
      nota10 = (nota / 4) * 10;
      break;
    case 'porcentaje':
      nota10 = nota / 10;
      break;
    case 'chile':
      // Chile: 1.0-7.0 → mapear a 0-10. (chile-1)/6 * 10
      nota10 = ((nota - 1) / 6) * 10;
      break;
    case 'colombia':
      // Colombia: 0-5 → 0-10
      nota10 = nota * 2;
      break;
    case 'peru':
    case 'venezuela':
      // Perú/Venezuela: 0-20 → 0-10
      nota10 = nota / 2;
      break;
    default:
      nota10 = nota;
  }

  // Limitar entre 0 y 10
  nota10 = Math.max(0, Math.min(10, nota10));

  // Convertir a todas las escalas numéricas
  const gpa = (nota10 / 10) * 4;
  const porcentaje = nota10 * 10;
  const chile = 1 + (nota10 / 10) * 6;
  const colombia = nota10 / 2;
  const peru = nota10 * 2;

  // Letra USA
  let letra: string;
  if (nota10 >= 9) letra = 'A';
  else if (nota10 >= 8) letra = 'B+';
  else if (nota10 >= 7) letra = 'B';
  else if (nota10 >= 6) letra = 'C+';
  else if (nota10 >= 5) letra = 'C';
  else if (nota10 >= 4) letra = 'D';
  else letra = 'F';

  // ECTS (Espacio Europeo)
  let ects: string;
  if (nota10 >= 9) ects = 'A (Excelente)';
  else if (nota10 >= 8) ects = 'B (Muy Bien)';
  else if (nota10 >= 7) ects = 'C (Bien)';
  else if (nota10 >= 6) ects = 'D (Satisfactorio)';
  else if (nota10 >= 5) ects = 'E (Suficiente)';
  else ects = 'F (Suspenso)';

  // Calificación cualitativa España (aprobado ≥5)
  let calificacionEs: string;
  if (nota10 >= 9) calificacionEs = 'Sobresaliente';
  else if (nota10 >= 7) calificacionEs = 'Notable';
  else if (nota10 >= 5) calificacionEs = 'Aprobado';
  else calificacionEs = 'Suspenso';

  // Calificación cualitativa México (aprobado ≥6)
  let calificacionMx: string;
  if (nota10 >= 9.5) calificacionMx = 'Excelente';
  else if (nota10 >= 8) calificacionMx = 'Muy bien';
  else if (nota10 >= 7) calificacionMx = 'Bien';
  else if (nota10 >= 6) calificacionMx = 'Suficiente';
  else calificacionMx = 'Reprobado';

  // Calificación cualitativa Chile (aprobado ≥4.0 sobre 7)
  let calificacionCl: string;
  if (chile >= 6.5) calificacionCl = 'Sobresaliente';
  else if (chile >= 5.5) calificacionCl = 'Muy bueno';
  else if (chile >= 5.0) calificacionCl = 'Bueno';
  else if (chile >= 4.0) calificacionCl = 'Suficiente';
  else calificacionCl = 'Reprobado';

  // Calificación cualitativa Colombia (aprobado ≥3.0 sobre 5)
  let calificacionCo: string;
  if (colombia >= 4.6) calificacionCo = 'Excelente';
  else if (colombia >= 4.0) calificacionCo = 'Sobresaliente';
  else if (colombia >= 3.5) calificacionCo = 'Bueno';
  else if (colombia >= 3.0) calificacionCo = 'Aceptable';
  else calificacionCo = 'Insuficiente';

  // Calificación cualitativa Perú/Venezuela (aprobado ≥11 sobre 20)
  let calificacionPe: string;
  if (peru >= 18) calificacionPe = 'Excelente';
  else if (peru >= 14) calificacionPe = 'Bueno';
  else if (peru >= 11) calificacionPe = 'Aprobado';
  else calificacionPe = 'Desaprobado';

  return {
    espana: nota10,
    mexico: nota10,
    argentina: nota10,
    gpa,
    porcentaje,
    chile,
    colombia,
    peru,
    letra,
    ects,
    calificacionEs,
    calificacionMx,
    calificacionCl,
    calificacionCo,
    calificacionPe,
    // Mantener el nombre antiguo por compatibilidad
    calificacion: calificacionEs,
  };
};

export default function CalculadoraNotasPage() {
  const [tabActivo, setTabActivo] = useState<TabType>('media');

  // Estado Media Ponderada
  const [asignaturas, setAsignaturas] = useState<Asignatura[]>([
    { id: '1', nombre: 'Asignatura 1', nota: '', creditos: '6' },
    { id: '2', nombre: 'Asignatura 2', nota: '', creditos: '6' },
  ]);

  // Estado EvAU
  const [notaBachillerato, setNotaBachillerato] = useState('');
  const [asignaturasEvau, setAsignaturasEvau] = useState<AsignaturaEvau[]>([
    { id: '1', nombre: 'Lengua Castellana', nota: '', tipo: 'troncal' },
    { id: '2', nombre: 'Historia de España', nota: '', tipo: 'troncal' },
    { id: '3', nombre: 'Idioma Extranjero', nota: '', tipo: 'troncal' },
    { id: '4', nombre: 'Materia Troncal de Modalidad', nota: '', tipo: 'troncal' },
  ]);
  const [asignaturasEspecificas, setAsignaturasEspecificas] = useState<AsignaturaEvau[]>([
    { id: 'e1', nombre: 'Específica 1', nota: '', tipo: 'especifica' },
    { id: 'e2', nombre: 'Específica 2', nota: '', tipo: 'especifica' },
  ]);

  // Estado Conversor
  const [notaConversor, setNotaConversor] = useState('');
  const [escalaOrigen, setEscalaOrigen] = useState('espana');

  // Estado Simulador "Qué nota necesito"
  const [notaActual, setNotaActual] = useState('');
  const [creditosActuales, setCreditosActuales] = useState('');
  const [notaObjetivo, setNotaObjetivo] = useState('');
  const [creditosRestantes, setCreditosRestantes] = useState('');

  // Cargar datos de localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('meskeia-calculadora-notas');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.asignaturas) setAsignaturas(data.asignaturas);
        if (data.notaBachillerato) setNotaBachillerato(data.notaBachillerato);
        if (data.asignaturasEvau) setAsignaturasEvau(data.asignaturasEvau);
        if (data.asignaturasEspecificas) setAsignaturasEspecificas(data.asignaturasEspecificas);
      } catch (e) {
        console.error('Error cargando datos:', e);
      }
    }
  }, []);

  // Guardar datos en localStorage
  useEffect(() => {
    const data = {
      asignaturas,
      notaBachillerato,
      asignaturasEvau,
      asignaturasEspecificas
    };
    localStorage.setItem('meskeia-calculadora-notas', JSON.stringify(data));
  }, [asignaturas, notaBachillerato, asignaturasEvau, asignaturasEspecificas]);

  // Calcular media ponderada
  const resultadoMedia = useMemo(() => {
    const asignaturasValidas = asignaturas.filter(a => {
      const nota = parseFloat(a.nota.replace(',', '.'));
      const creditos = parseFloat(a.creditos.replace(',', '.'));
      return !isNaN(nota) && !isNaN(creditos) && creditos > 0;
    });

    if (asignaturasValidas.length === 0) {
      return { media: 0, totalCreditos: 0, asignaturasContadas: 0, aprobadas: 0, suspensas: 0 };
    }

    let sumaPonderada = 0;
    let totalCreditos = 0;
    let aprobadas = 0;
    let suspensas = 0;

    asignaturasValidas.forEach(a => {
      const nota = parseFloat(a.nota.replace(',', '.'));
      const creditos = parseFloat(a.creditos.replace(',', '.'));
      sumaPonderada += nota * creditos;
      totalCreditos += creditos;
      if (nota >= 5) aprobadas++;
      else suspensas++;
    });

    return {
      media: sumaPonderada / totalCreditos,
      totalCreditos,
      asignaturasContadas: asignaturasValidas.length,
      aprobadas,
      suspensas
    };
  }, [asignaturas]);

  // Calcular nota EvAU
  const resultadoEvau = useMemo(() => {
    const bachiller = parseFloat(notaBachillerato.replace(',', '.'));

    // Notas fase general (troncales)
    const notasTroncales = asignaturasEvau
      .map(a => parseFloat(a.nota.replace(',', '.')))
      .filter(n => !isNaN(n));

    // Notas fase específica
    const notasEspecificas = asignaturasEspecificas
      .map(a => parseFloat(a.nota.replace(',', '.')))
      .filter(n => !isNaN(n))
      .sort((a, b) => b - a); // Ordenar de mayor a menor

    if (isNaN(bachiller) || notasTroncales.length === 0) {
      return { notaAcceso: 0, notaAdmision: 0, faseGeneral: 0, faseEspecifica: 0, valido: false };
    }

    // Media fase general
    const mediaFaseGeneral = notasTroncales.reduce((a, b) => a + b, 0) / notasTroncales.length;

    // Nota de acceso = 60% Bachillerato + 40% Fase General
    const notaAcceso = bachiller * 0.6 + mediaFaseGeneral * 0.4;

    // Fase específica: mejores 2 notas × 0.1 o 0.2 (simplificamos con 0.2)
    let bonificacionEspecifica = 0;
    if (notasEspecificas.length >= 1 && notasEspecificas[0] >= 5) {
      bonificacionEspecifica += (notasEspecificas[0] - 5) * 0.2;
    }
    if (notasEspecificas.length >= 2 && notasEspecificas[1] >= 5) {
      bonificacionEspecifica += (notasEspecificas[1] - 5) * 0.2;
    }

    // Nota de admisión = Nota acceso + bonificación (máx 14)
    const notaAdmision = Math.min(14, notaAcceso + bonificacionEspecifica);

    return {
      notaAcceso: Math.min(10, notaAcceso),
      notaAdmision,
      faseGeneral: mediaFaseGeneral,
      faseEspecifica: bonificacionEspecifica,
      valido: true
    };
  }, [notaBachillerato, asignaturasEvau, asignaturasEspecificas]);

  // Calcular conversión
  const resultadoConversor = useMemo(() => {
    const nota = parseFloat(notaConversor.replace(',', '.'));
    if (isNaN(nota)) return null;
    return convertirNota(nota, escalaOrigen);
  }, [notaConversor, escalaOrigen]);

  // Calcular "qué nota necesito"
  const resultadoSimulador = useMemo(() => {
    const actual = parseFloat(notaActual.replace(',', '.'));
    const credActuales = parseFloat(creditosActuales.replace(',', '.'));
    const objetivo = parseFloat(notaObjetivo.replace(',', '.'));
    const credRestantes = parseFloat(creditosRestantes.replace(',', '.'));

    if (isNaN(actual) || isNaN(credActuales) || isNaN(objetivo) || isNaN(credRestantes) || credRestantes <= 0) {
      return { notaNecesaria: 0, valido: false, estado: '' };
    }

    // (actual * credActuales + X * credRestantes) / (credActuales + credRestantes) = objetivo
    // X = (objetivo * (credActuales + credRestantes) - actual * credActuales) / credRestantes
    const notaNecesaria = (objetivo * (credActuales + credRestantes) - actual * credActuales) / credRestantes;

    let estado: string;
    if (notaNecesaria > 10) estado = 'imposible';
    else if (notaNecesaria > 8) estado = 'dificil';
    else if (notaNecesaria >= 0) estado = 'alcanzable';
    else estado = 'alcanzable'; // Si es negativa, cualquier nota sirve

    return {
      notaNecesaria: Math.max(0, notaNecesaria),
      valido: true,
      estado
    };
  }, [notaActual, creditosActuales, notaObjetivo, creditosRestantes]);

  // Funciones para gestionar asignaturas
  const agregarAsignatura = () => {
    const nuevaId = Date.now().toString();
    setAsignaturas([...asignaturas, {
      id: nuevaId,
      nombre: `Asignatura ${asignaturas.length + 1}`,
      nota: '',
      creditos: '6'
    }]);
  };

  const eliminarAsignatura = (id: string) => {
    if (asignaturas.length > 1) {
      setAsignaturas(asignaturas.filter(a => a.id !== id));
    }
  };

  const actualizarAsignatura = (id: string, campo: keyof Asignatura, valor: string) => {
    setAsignaturas(asignaturas.map(a =>
      a.id === id ? { ...a, [campo]: valor } : a
    ));
  };

  // Funciones para EvAU
  const actualizarAsignaturaEvau = (id: string, campo: keyof AsignaturaEvau, valor: string) => {
    setAsignaturasEvau(asignaturasEvau.map(a =>
      a.id === id ? { ...a, [campo]: valor } : a
    ));
  };

  const agregarEspecifica = () => {
    if (asignaturasEspecificas.length < 4) {
      const nuevaId = 'e' + Date.now().toString();
      setAsignaturasEspecificas([...asignaturasEspecificas, {
        id: nuevaId,
        nombre: `Específica ${asignaturasEspecificas.length + 1}`,
        nota: '',
        tipo: 'especifica'
      }]);
    }
  };

  const eliminarEspecifica = (id: string) => {
    if (asignaturasEspecificas.length > 0) {
      setAsignaturasEspecificas(asignaturasEspecificas.filter(a => a.id !== id));
    }
  };

  const actualizarEspecifica = (id: string, campo: keyof AsignaturaEvau, valor: string) => {
    setAsignaturasEspecificas(asignaturasEspecificas.map(a =>
      a.id === id ? { ...a, [campo]: valor } : a
    ));
  };

  // Obtener calificación textual
  const getCalificacion = (nota: number): string => {
    if (nota >= 9) return 'Sobresaliente';
    if (nota >= 7) return 'Notable';
    if (nota >= 5) return 'Aprobado';
    return 'Suspenso';
  };

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.title}>Calculadora de Notas Académicas</h1>
        <p className={styles.subtitle}>
          Media ponderada, simulador EvAU (España) y conversor de escalas entre España, México, Argentina, Chile, Colombia, Perú, Venezuela, GPA USA y porcentaje
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-02" />

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tab} ${tabActivo === 'media' ? styles.activo : ''}`}
          onClick={() => setTabActivo('media')}
        >
          <span>📊</span> Media Ponderada
        </button>
        <button
          className={`${styles.tab} ${tabActivo === 'evau' ? styles.activo : ''}`}
          onClick={() => setTabActivo('evau')}
        >
          <span>🎓</span> Simulador EvAU 🇪🇸
        </button>
        <button
          className={`${styles.tab} ${tabActivo === 'conversor' ? styles.activo : ''}`}
          onClick={() => setTabActivo('conversor')}
        >
          <span>🔄</span> Conversor Escalas
        </button>
      </div>

      {/* Tab Media Ponderada */}
      {tabActivo === 'media' && (
        <div className={styles.mainContent}>
          <div className={styles.panel}>
            <h2 className={styles.sectionTitle}>
              <span>📝</span> Tus Asignaturas
            </h2>

            <div className={styles.asignaturaLabels}>
              <span>Asignatura</span>
              <span>Nota</span>
              <span>ECTS</span>
              <span></span>
            </div>

            <div className={styles.asignaturasList}>
              {asignaturas.map((asig) => (
                <div key={asig.id} className={styles.asignaturaRow}>
                  <input
                    type="text"
                    className={styles.input}
                    value={asig.nombre}
                    onChange={(e) => actualizarAsignatura(asig.id, 'nombre', e.target.value)}
                    placeholder="Nombre asignatura"
                  />
                  <input
                    type="text"
                    className={styles.inputSmall}
                    value={asig.nota}
                    onChange={(e) => actualizarAsignatura(asig.id, 'nota', e.target.value)}
                    placeholder="0-10"
                  />
                  <input
                    type="text"
                    className={styles.inputSmall}
                    value={asig.creditos}
                    onChange={(e) => actualizarAsignatura(asig.id, 'creditos', e.target.value)}
                    placeholder="ECTS"
                  />
                  <button
                    className={styles.btnEliminar}
                    onClick={() => eliminarAsignatura(asig.id)}
                    disabled={asignaturas.length <= 1}
                    title="Eliminar asignatura"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <button className={styles.btnAnadir} onClick={agregarAsignatura}>
              <span>+</span> Añadir asignatura
            </button>

            {/* Simulador qué nota necesito */}
            <div className={styles.simuladorSection}>
              <h3 className={styles.sectionTitle}>
                <span>🎯</span> ¿Qué nota necesito?
              </h3>

              <div className={styles.simuladorGrid}>
                <div className={styles.simuladorInput}>
                  <label className={styles.simuladorLabel}>Media actual</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={notaActual}
                    onChange={(e) => setNotaActual(e.target.value)}
                    placeholder="6,5"
                  />
                </div>
                <div className={styles.simuladorInput}>
                  <label className={styles.simuladorLabel}>Créditos cursados</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={creditosActuales}
                    onChange={(e) => setCreditosActuales(e.target.value)}
                    placeholder="120"
                  />
                </div>
                <div className={styles.simuladorInput}>
                  <label className={styles.simuladorLabel}>Media objetivo</label>
                  <input
                    type="text"
                    className={styles.input}
                    value={notaObjetivo}
                    onChange={(e) => setNotaObjetivo(e.target.value)}
                    placeholder="7,0"
                  />
                </div>
              </div>

              <div className={styles.simuladorInput}>
                <label className={styles.simuladorLabel}>Créditos restantes</label>
                <input
                  type="text"
                  className={styles.input}
                  value={creditosRestantes}
                  onChange={(e) => setCreditosRestantes(e.target.value)}
                  placeholder="60"
                />
              </div>

              {resultadoSimulador.valido && (
                <div className={styles.simuladorResultado}>
                  <p className={styles.simuladorLabel}>Necesitas una media de:</p>
                  <p className={`${styles.simuladorResultadoValor} ${styles[resultadoSimulador.estado]}`}>
                    {resultadoSimulador.notaNecesaria > 10
                      ? 'Imposible'
                      : formatNumber(resultadoSimulador.notaNecesaria, 2)}
                  </p>
                  {resultadoSimulador.estado === 'imposible' && (
                    <p className={styles.simuladorLabel}>No es posible alcanzar el objetivo con los créditos restantes</p>
                  )}
                  {resultadoSimulador.estado === 'dificil' && (
                    <p className={styles.simuladorLabel}>Difícil pero posible</p>
                  )}
                  {resultadoSimulador.estado === 'alcanzable' && resultadoSimulador.notaNecesaria <= 10 && (
                    <p className={styles.simuladorLabel}>Objetivo alcanzable</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Panel de resultados */}
          <div className={styles.resultadoPanel}>
            <div className={styles.resultadoPrincipal}>
              <span className={styles.resultadoLabel}>Tu Media Ponderada</span>
              <span className={styles.resultadoValor}>
                {resultadoMedia.asignaturasContadas > 0
                  ? formatNumber(resultadoMedia.media, 2)
                  : '—'}
              </span>
              {resultadoMedia.asignaturasContadas > 0 && (
                <span className={styles.resultadoDescripcion}>
                  {getCalificacion(resultadoMedia.media)}
                </span>
              )}
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Asignaturas</span>
                <span className={styles.statValue}>{resultadoMedia.asignaturasContadas}</span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Créditos ECTS</span>
                <span className={styles.statValue}>{formatNumber(resultadoMedia.totalCreditos, 0)}</span>
              </div>
              <div className={`${styles.statCard} ${styles.success}`}>
                <span className={styles.statLabel}>Aprobadas</span>
                <span className={styles.statValue}>{resultadoMedia.aprobadas}</span>
              </div>
              <div className={`${styles.statCard} ${styles.warning}`}>
                <span className={styles.statLabel}>Suspensas</span>
                <span className={styles.statValue}>{resultadoMedia.suspensas}</span>
              </div>
            </div>

            {resultadoMedia.asignaturasContadas > 0 && resultadoMedia.media > 0 && (
              <>
                <h3 className={styles.sectionTitle}>
                  <span>🔄</span> Equivalencias
                </h3>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>GPA (USA)</span>
                    <span className={styles.statValue}>
                      {formatNumber((resultadoMedia.media / 10) * 4, 2)}
                    </span>
                  </div>
                  <div className={styles.statCard}>
                    <span className={styles.statLabel}>Porcentaje</span>
                    <span className={styles.statValue}>
                      {formatNumber(resultadoMedia.media * 10, 0)}%
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab EvAU */}
      {tabActivo === 'evau' && (
        <div className={styles.mainContent}>
          <div className={styles.panel}>
            {/* Nota Bachillerato */}
            <div className={styles.evauSection}>
              <h3 className={styles.evauSectionTitle}>
                <span>📚</span> Nota Media de Bachillerato
              </h3>
              <input
                type="text"
                className={styles.input}
                value={notaBachillerato}
                onChange={(e) => setNotaBachillerato(e.target.value)}
                placeholder="Ej: 7,5"
                style={{ fontSize: '1.2rem', textAlign: 'center' }}
              />
              <p className={styles.evauInfo}>
                La nota de Bachillerato supone el 60% de la nota de acceso
              </p>
            </div>

            {/* Fase General */}
            <div className={styles.evauSection}>
              <h3 className={styles.evauSectionTitle}>
                <span>📝</span> Fase General (Obligatoria)
              </h3>
              <p className={styles.evauInfo}>
                4 exámenes obligatorios que suponen el 40% de la nota de acceso
              </p>

              <div className={styles.asignaturaLabels}>
                <span>Materia</span>
                <span>Nota</span>
                <span></span>
                <span></span>
              </div>

              <div className={styles.asignaturasList}>
                {asignaturasEvau.map((asig) => (
                  <div key={asig.id} className={`${styles.asignaturaRow} ${styles.evau}`}>
                    <input
                      type="text"
                      className={styles.input}
                      value={asig.nombre}
                      onChange={(e) => actualizarAsignaturaEvau(asig.id, 'nombre', e.target.value)}
                      placeholder="Nombre materia"
                    />
                    <input
                      type="text"
                      className={styles.inputSmall}
                      value={asig.nota}
                      onChange={(e) => actualizarAsignaturaEvau(asig.id, 'nota', e.target.value)}
                      placeholder="0-10"
                    />
                    <span></span>
                    <span></span>
                  </div>
                ))}
              </div>
            </div>

            {/* Fase Específica */}
            <div className={styles.evauSection}>
              <h3 className={styles.evauSectionTitle}>
                <span>⭐</span> Fase Específica (Voluntaria)
              </h3>
              <p className={styles.evauInfo}>
                Hasta 4 exámenes para subir nota. Las 2 mejores notas (≥5) ponderan ×0.2
              </p>

              <div className={styles.asignaturasList}>
                {asignaturasEspecificas.map((asig) => (
                  <div key={asig.id} className={`${styles.asignaturaRow} ${styles.evau}`}>
                    <input
                      type="text"
                      className={styles.input}
                      value={asig.nombre}
                      onChange={(e) => actualizarEspecifica(asig.id, 'nombre', e.target.value)}
                      placeholder="Nombre materia"
                    />
                    <input
                      type="text"
                      className={styles.inputSmall}
                      value={asig.nota}
                      onChange={(e) => actualizarEspecifica(asig.id, 'nota', e.target.value)}
                      placeholder="0-10"
                    />
                    <span></span>
                    <button
                      className={styles.btnEliminar}
                      onClick={() => eliminarEspecifica(asig.id)}
                      title="Eliminar materia"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {asignaturasEspecificas.length < 4 && (
                <button className={styles.btnAnadir} onClick={agregarEspecifica}>
                  <span>+</span> Añadir materia específica
                </button>
              )}
            </div>
          </div>

          {/* Panel de resultados EvAU */}
          <div className={styles.resultadoPanel}>
            <div className={styles.resultadoPrincipal}>
              <span className={styles.resultadoLabel}>Nota de Admisión</span>
              <span className={styles.resultadoValor}>
                {resultadoEvau.valido
                  ? formatNumber(resultadoEvau.notaAdmision, 3)
                  : '—'}
              </span>
              <span className={styles.resultadoDescripcion}>
                Máximo posible: 14 puntos
              </span>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Nota de Acceso</span>
                <span className={styles.statValue}>
                  {resultadoEvau.valido ? formatNumber(resultadoEvau.notaAcceso, 3) : '—'}
                </span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>Media Fase General</span>
                <span className={styles.statValue}>
                  {resultadoEvau.valido ? formatNumber(resultadoEvau.faseGeneral, 2) : '—'}
                </span>
              </div>
              <div className={`${styles.statCard} ${styles.success}`}>
                <span className={styles.statLabel}>Bonificación Específica</span>
                <span className={styles.statValue}>
                  +{resultadoEvau.valido ? formatNumber(resultadoEvau.faseEspecifica, 2) : '0'}
                </span>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>60% Bachillerato</span>
                <span className={styles.statValue}>
                  {notaBachillerato ? formatNumber(parseFloat(notaBachillerato.replace(',', '.')) * 0.6, 2) : '—'}
                </span>
              </div>
            </div>

            <div style={{ marginTop: 'var(--spacing-lg)', padding: 'var(--spacing-md)', background: 'var(--hover)', borderRadius: 'var(--radius)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <strong>Fórmula:</strong><br/>
              Nota Acceso = 60% Bachillerato + 40% Fase General<br/>
              Nota Admisión = Nota Acceso + (M1-5)×0.2 + (M2-5)×0.2
            </div>
          </div>
        </div>
      )}

      {/* Tab Conversor */}
      {tabActivo === 'conversor' && (
        <div className={styles.mainContent}>
          <div className={styles.panel}>
            <h2 className={styles.sectionTitle}>
              <span>🔄</span> Conversor de Escalas
            </h2>

            <div className={styles.conversorGrid}>
              <div className={styles.conversorCard}>
                <label className={styles.conversorTitle}>
                  <span>📥</span> Escala de origen
                </label>
                <select
                  className={styles.select}
                  value={escalaOrigen}
                  onChange={(e) => setEscalaOrigen(e.target.value)}
                >
                  <optgroup label="🇪🇸 España y equivalentes">
                    <option value="espana">España (0-10)</option>
                    <option value="mexico">México (0-10)</option>
                    <option value="argentina">Argentina (0-10)</option>
                  </optgroup>
                  <optgroup label="🌎 Latam (otras escalas)">
                    <option value="chile">Chile (1-7)</option>
                    <option value="colombia">Colombia (0-5)</option>
                    <option value="peru">Perú (0-20)</option>
                    <option value="venezuela">Venezuela (0-20)</option>
                  </optgroup>
                  <optgroup label="🇺🇸 Internacionales">
                    <option value="gpa">GPA USA (0-4)</option>
                    <option value="porcentaje">Porcentaje (0-100)</option>
                  </optgroup>
                </select>
              </div>

              <div className={styles.conversorCard}>
                <label className={styles.conversorTitle}>
                  <span>🔢</span> Introduce tu nota
                </label>
                <input
                  type="text"
                  className={styles.conversorInput}
                  value={notaConversor}
                  onChange={(e) => setNotaConversor(e.target.value)}
                  placeholder={
                    escalaOrigen === 'chile' ? '5,8' :
                    escalaOrigen === 'colombia' ? '4,2' :
                    escalaOrigen === 'peru' || escalaOrigen === 'venezuela' ? '15' :
                    escalaOrigen === 'gpa' ? '3,0' :
                    escalaOrigen === 'porcentaje' ? '75' :
                    '7,5'
                  }
                />
              </div>
            </div>

            {resultadoConversor && (
              <div className={styles.conversorResultados}>
                <div className={styles.conversorResultado}>
                  <span className={styles.conversorEscala}>🇪🇸 España (0-10)</span>
                  <span className={styles.conversorValor}>{formatNumber(resultadoConversor.espana, 2)}</span>
                </div>
                <div className={styles.conversorResultado}>
                  <span className={styles.conversorEscala}>🇲🇽 México (0-10)</span>
                  <span className={styles.conversorValor}>{formatNumber(resultadoConversor.mexico, 2)}</span>
                </div>
                <div className={styles.conversorResultado}>
                  <span className={styles.conversorEscala}>🇦🇷 Argentina (0-10)</span>
                  <span className={styles.conversorValor}>{formatNumber(resultadoConversor.argentina, 2)}</span>
                </div>
                <div className={styles.conversorResultado}>
                  <span className={styles.conversorEscala}>🇨🇱 Chile (1-7)</span>
                  <span className={styles.conversorValor}>{formatNumber(resultadoConversor.chile, 2)}</span>
                </div>
                <div className={styles.conversorResultado}>
                  <span className={styles.conversorEscala}>🇨🇴 Colombia (0-5)</span>
                  <span className={styles.conversorValor}>{formatNumber(resultadoConversor.colombia, 2)}</span>
                </div>
                <div className={styles.conversorResultado}>
                  <span className={styles.conversorEscala}>🇵🇪 Perú / 🇻🇪 Venezuela (0-20)</span>
                  <span className={styles.conversorValor}>{formatNumber(resultadoConversor.peru, 2)}</span>
                </div>
                <div className={styles.conversorResultado}>
                  <span className={styles.conversorEscala}>🇺🇸 GPA USA (0-4)</span>
                  <span className={styles.conversorValor}>{formatNumber(resultadoConversor.gpa, 2)}</span>
                </div>
                <div className={styles.conversorResultado}>
                  <span className={styles.conversorEscala}>📊 Porcentaje</span>
                  <span className={styles.conversorValor}>{formatNumber(resultadoConversor.porcentaje, 0)}%</span>
                </div>
                <div className={styles.conversorResultado}>
                  <span className={styles.conversorEscala}>🇺🇸 Letra (USA)</span>
                  <span className={styles.conversorValor}>{resultadoConversor.letra}</span>
                </div>
                <div className={styles.conversorResultado}>
                  <span className={styles.conversorEscala}>🇪🇺 ECTS (Europa)</span>
                  <span className={styles.conversorValor}>{resultadoConversor.ects}</span>
                </div>
                <div className={styles.conversorResultado}>
                  <span className={styles.conversorEscala}>🇪🇸 Calificación España</span>
                  <span className={styles.conversorValor}>{resultadoConversor.calificacionEs}</span>
                </div>
                <div className={styles.conversorResultado}>
                  <span className={styles.conversorEscala}>🇲🇽 Calificación México</span>
                  <span className={styles.conversorValor}>{resultadoConversor.calificacionMx}</span>
                </div>
                <div className={styles.conversorResultado}>
                  <span className={styles.conversorEscala}>🇨🇱 Calificación Chile</span>
                  <span className={styles.conversorValor}>{resultadoConversor.calificacionCl}</span>
                </div>
                <div className={styles.conversorResultado}>
                  <span className={styles.conversorEscala}>🇨🇴 Calificación Colombia</span>
                  <span className={styles.conversorValor}>{resultadoConversor.calificacionCo}</span>
                </div>
                <div className={styles.conversorResultado}>
                  <span className={styles.conversorEscala}>🇵🇪 Calificación Perú/Venezuela</span>
                  <span className={styles.conversorValor}>{resultadoConversor.calificacionPe}</span>
                </div>
              </div>
            )}

            {/* Tabla de referencia */}
            <h3 className={styles.sectionTitle} style={{ marginTop: 'var(--spacing-xl)' }}>
              <span>📋</span> Tabla de Equivalencias
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 'var(--spacing-md)' }}>
              Equivalencias aproximadas entre escalas de calificación de los principales países hispanohablantes.
              España, México y Argentina comparten escala 0-10 (con vocabulario distinto).
            </p>
            <table className={styles.tablaConversion}>
              <thead>
                <tr>
                  <th>0-10<br/>🇪🇸🇲🇽🇦🇷</th>
                  <th>1-7<br/>🇨🇱</th>
                  <th>0-5<br/>🇨🇴</th>
                  <th>0-20<br/>🇵🇪🇻🇪</th>
                  <th>GPA<br/>🇺🇸</th>
                  <th>Letra<br/>🇺🇸</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>9,0 - 10,0</td>
                  <td>6,4 - 7,0</td>
                  <td>4,5 - 5,0</td>
                  <td>18 - 20</td>
                  <td>3,6 - 4,0</td>
                  <td>A</td>
                  <td>90 - 100</td>
                </tr>
                <tr>
                  <td>8,0 - 8,9</td>
                  <td>5,8 - 6,3</td>
                  <td>4,0 - 4,4</td>
                  <td>16 - 17</td>
                  <td>3,2 - 3,5</td>
                  <td>B+</td>
                  <td>80 - 89</td>
                </tr>
                <tr>
                  <td>7,0 - 7,9</td>
                  <td>5,2 - 5,7</td>
                  <td>3,5 - 3,9</td>
                  <td>14 - 15</td>
                  <td>2,8 - 3,1</td>
                  <td>B</td>
                  <td>70 - 79</td>
                </tr>
                <tr>
                  <td>6,0 - 6,9</td>
                  <td>4,6 - 5,1</td>
                  <td>3,0 - 3,4</td>
                  <td>12 - 13</td>
                  <td>2,4 - 2,7</td>
                  <td>C+</td>
                  <td>60 - 69</td>
                </tr>
                <tr>
                  <td>5,0 - 5,9</td>
                  <td>4,0 - 4,5</td>
                  <td>2,5 - 2,9</td>
                  <td>10 - 11</td>
                  <td>2,0 - 2,3</td>
                  <td>C</td>
                  <td>50 - 59</td>
                </tr>
                <tr>
                  <td>0 - 4,9</td>
                  <td>1,0 - 3,9</td>
                  <td>0 - 2,4</td>
                  <td>0 - 9</td>
                  <td>0 - 1,9</td>
                  <td>F</td>
                  <td>0 - 49</td>
                </tr>
              </tbody>
            </table>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 'var(--spacing-md)' }}>
              <strong>Nota mínima de aprobado por país:</strong> España, México y Argentina = 5 (sobre 10) ·
              Chile = 4 (sobre 7) · Colombia = 3 (sobre 5) · Perú y Venezuela = 11 (sobre 20).
              En algunos sistemas existen variaciones según institución.
            </p>
          </div>

          {/* Panel lateral vacío para mantener layout */}
          <div></div>
        </div>
      )}

      

      <DisclaimerCard variant="educational" severity="low" collapsible={true} context="calculadora-notas">
        <p>Esta calculadora es una <strong>herramienta educativa</strong> para apoyo académico:</p>
        <ul className={styles.disclaimerList}>
          <li><strong>Los cálculos de EvAU varían por comunidad autónoma</strong>: Cada región aplica ponderaciones y criterios específicos</li>
          <li><strong>Verifica con tu centro educativo</strong>: Consulta la normativa oficial de tu universidad antes de tomar decisiones académicas importantes</li>
        </ul>
      </DisclaimerCard>

      {/* Contenido educativo */}
      <EducationalSection
        title="Guía para Calcular tu Media de Notas"
        subtitle="Entiende los sistemas de calificación y optimiza tu rendimiento académico"
        icon="🎓"
      >
        {/* 1. TABLA COMPARATIVA — sistemas de calificación */}
        <div className={styles.tableWrapper}>
          <table className={styles.comparativaTable}>
            <thead>
              <tr>
                <th>Sistema</th>
                <th>Escala</th>
                <th>Aprobado</th>
                <th>Matrícula / Máximo</th>
                <th>Contexto de uso</th>
              </tr>
            </thead>
            <tbody>
              <tr><td>España (ESO/Bach)</td><td>0 – 10</td><td>5,0</td><td>9,0 – 10</td><td>Educación obligatoria y bachillerato</td></tr>
              <tr><td>Universidad española</td><td>0 – 10</td><td>5,0</td><td>MH (9+, limitada al 5% del grupo)</td><td>Grados y másteres oficiales</td></tr>
              <tr><td>Sistema anglosajón (GPA)</td><td>0,0 – 4,0</td><td>2,0 (C)</td><td>4,0 (A+)</td><td>EEUU, Reino Unido, Latinoamérica</td></tr>
              <tr><td>Sistema francés</td><td>0 – 20</td><td>10</td><td>18 – 20</td><td>Francia, Marruecos, países francófonos</td></tr>
              <tr><td>Sistema alemán</td><td>1 – 6 (inverso)</td><td>4</td><td>1 (Sehr gut)</td><td>Alemania, Austria, Suiza</td></tr>
            </tbody>
          </table>
        </div>

        {/* 2. CASOS DE USO */}
        <div className={styles.escenariosGrid}>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>📚</span>
              <strong>Estudiante de Bachillerato</strong>
            </div>
            <p>Calcula tu nota media ponderada de todos los trimestres para saber si alcanzas el aprobado o si necesitas mejorar en asignaturas específicas antes de los exámenes finales.</p>
            <div className={styles.escenarioTip}>Tip: Las asignaturas con más créditos o horas semanales suelen tener mayor peso en la nota final media.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🎓</span>
              <strong>Universitario</strong>
            </div>
            <p>Calcula tu expediente académico (media ponderada por créditos ECTS) para valorar si optas a una beca, un máster competitivo o unas prácticas con requisito de nota mínima.</p>
            <div className={styles.escenarioTip}>Tip: En la universidad, la media se pondera por ECTS. Una asignatura de 9 créditos pesa el triple que una de 3.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>🧮</span>
              <strong>Preparando oposiciones</strong>
            </div>
            <p>Muchas oposiciones tienen baremos que incluyen el expediente académico. Conoce tu nota exacta para saber cuántos puntos aporta tu expediente al total de la oposición.</p>
            <div className={styles.escenarioTip}>Tip: En oposiciones docentes, el expediente puede valer hasta 8 puntos sobre 10 en el baremo de méritos.</div>
          </div>
          <div className={styles.escenarioCard}>
            <div className={styles.escenarioHeader}>
              <span className={styles.escenarioIcon}>📋</span>
              <strong>Padres / Tutores</strong>
            </div>
            <p>Supervisa el rendimiento académico de tus hijos calculando la media trimestral y anual por asignatura para identificar materias que necesitan refuerzo antes de las evaluaciones.</p>
            <div className={styles.escenarioTip}>Tip: Compara la evolución trimestre a trimestre, no solo la nota final, para detectar tendencias de mejora o declive.</div>
          </div>
        </div>

        {/* 3. FAQ */}
        <details className={styles.faqList}>
          <summary className={styles.faqItem} style={{listStyle:'none', cursor:'pointer', fontWeight:600, fontSize:'1.1rem', padding:'0.75rem 0'}}>❓ Preguntas Frecuentes sobre Calificaciones y Medias</summary>
          <div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cómo se calcula la media ponderada?</div>
              <div className={styles.faqRespuesta}>Se multiplica cada nota por su peso (créditos, horas o porcentaje), se suman todos los productos y se divide entre la suma total de los pesos. Por ejemplo: (7×6 + 5×3) / (6+3) = (42+15)/9 = 6,33. Es diferente a la media aritmética simple.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué nota necesito en el examen final para aprobar la asignatura?</div>
              <div className={styles.faqRespuesta}>Depende del sistema de evaluación del profesor. Si el examen final vale un 60% y tienes un 4 en la evaluación continua (40%), necesitas: (nota_final × 0,6 + 4 × 0,4) ≥ 5 → nota_final ≥ (5 - 1,6) / 0,6 = 5,67. La calculadora puede resolver este cálculo automáticamente.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué es la Matrícula de Honor y cuándo se concede?</div>
              <div className={styles.faqRespuesta}>Es la máxima calificación universitaria española, reservada a notas de 9,0 o superior. Tiene un límite cuantitativo: no puede concederse a más del 5% de los alumnos matriculados en la asignatura. Si el 5% da menos de 1 alumno, puede concederse a 1 como máximo.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cómo se convierte una nota española al sistema GPA americano?</div>
              <div className={styles.faqRespuesta}>La conversión más usada: 9-10 → 4,0 (A), 7-8,9 → 3,0-3,9 (B), 5-6,9 → 2,0-2,9 (C), 3-4,9 → 1,0-1,9 (D), 0-2,9 → 0,0 (F). Sin embargo, no existe una fórmula oficial; cada institución americana puede aplicar su propia escala de conversión.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Las asignaturas suspensas cuentan en la media del expediente universitario?</div>
              <div className={styles.faqRespuesta}>Según el RD 1125/2003 (Espacio Europeo de Educación Superior), solo se incluyen las asignaturas superadas en el cálculo del expediente oficial. Sin embargo, algunas universidades calculan una &quot;media bruta&quot; que sí incluye los suspensos. Consulta el reglamento de tu universidad.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Qué nota mínima exigen los másteres más competitivos en España?</div>
              <div className={styles.faqRespuesta}>Los másteres de alta demanda (MBA de escuelas de negocios, másteres en IA, Derecho en universidades top) suelen pedir entre 7,0 y 8,0 de expediente. Los másteres habilitantes (Medicina, Arquitectura) pueden bajar a 6,5. Siempre consulta los requisitos específicos de cada programa.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cómo funciona la nota de acceso a la universidad (EVAU/Selectividad)?</div>
              <div className={styles.faqRespuesta}>La nota de acceso = 0,6 × nota media de Bachillerato + 0,4 × nota de la EVAU. La nota de admisión puede subir hasta 14 puntos incluyendo las dos materias de fase específica (máximo +2 por materia con coeficiente ponderador). No todas las carreras usan las mismas materias de ponderación.</div>
            </div>
            <div className={styles.faqItem}>
              <div className={styles.faqPregunta}>¿Cuánto afecta una asignatura suspensa a la nota media final?</div>
              <div className={styles.faqRespuesta}>En bachillerato, una asignatura suspensa (por ejemplo un 4) en una materia de 4 horas semanales, frente a una media de 7 en el resto, puede bajar la media total entre 0,3 y 0,6 puntos dependiendo del número de asignaturas. La ponderación y el número total de materias determinan el impacto real.</div>
            </div>
          </div>
        </details>

        {/* 4. GUÍA PASO A PASO */}
        <ol className={styles.pasosList}>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>1</span>
            <div><strong>Reúne todas tus notas</strong> — Anota la calificación de cada asignatura o evaluación y su peso correspondiente (créditos ECTS, horas semanales o porcentaje asignado por el profesor).</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>2</span>
            <div><strong>Introduce cada nota y su peso</strong> — Usa el formato correcto: nota en escala 0-10. Si tienes notas en otros sistemas (GPA, escala francesa), conviértelas antes de introducirlas.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>3</span>
            <div><strong>Verifica los pesos totales</strong> — La suma de todos los pesos debe tener sentido (ej: el total de créditos ECTS de tu curso). Un error en los pesos distorsiona completamente la media.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>4</span>
            <div><strong>Calcula la media ponderada</strong> — La calculadora hace el cálculo automáticamente. Comprueba que el resultado es coherente: debe estar entre la nota más baja y la más alta que introdujiste.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>5</span>
            <div><strong>Identifica las asignaturas más influyentes</strong> — Las materias con mayor peso son las que más afectan a tu media. Subir un punto en una asignatura de 9 ECTS equivale a subir 3 puntos en una de 3 ECTS.</div>
          </li>
          <li className={styles.paso}>
            <span className={styles.pasoNum}>6</span>
            <div><strong>Simula escenarios futuros</strong> — Introduce notas hipotéticas para saber qué necesitas en los exámenes pendientes para alcanzar tu objetivo de nota final.</div>
          </li>
        </ol>

        {/* 5. TIPS GRID */}
        <div className={styles.tipsGrid}>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>⚖️</span>
            <strong>Peso ≠ Dificultad</strong>
            <p>Una asignatura difícil pero con pocos créditos impacta menos en tu media que una fácil con muchos. Enfoca el esfuerzo donde el retorno es mayor.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>📈</span>
            <strong>Mejora incremental</strong>
            <p>Subir de 6 a 7 en una asignatura de 6 ECTS mejora tu media en +0,25 puntos (en un año de 24 ECTS). Cada décima cuenta en expedientes competitivos.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🎯</span>
            <strong>Nota objetivo</strong>
            <p>Define tu nota objetivo antes de empezar el curso (ej: 7,0 para beca, 8,5 para máster). Calcula qué nota necesitas en cada asignatura para alcanzarla.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>📅</span>
            <strong>Seguimiento trimestral</strong>
            <p>No esperes al final del año para calcular tu media. Calcula la media parcial tras cada evaluación para detectar y corregir desviaciones a tiempo.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>🔄</span>
            <strong>Recuperaciones</strong>
            <p>En muchos centros, una recuperación aprobada con un 5 cuenta como 5 aunque el original fuera un 3. Considera si compensa el esfuerzo en función del peso de la asignatura.</p>
          </div>
          <div className={styles.tipCard}>
            <span className={styles.tipIcono}>📋</span>
            <strong>Guarda tu expediente</strong>
            <p>Anota todas las notas en una hoja de cálculo personal. Muchas universidades tardan meses en actualizar el expediente oficial y puedes necesitar la media antes.</p>
          </div>
        </div>

        {/* 6. WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcono}>⚠️</span>
            <strong>Errores frecuentes al calcular medias académicas</strong>
          </div>
          <ul className={styles.warningList}>
            <li><strong>Usar media aritmética en lugar de ponderada</strong> — Si las asignaturas tienen distinto número de créditos, la media simple es incorrecta. Siempre usa la media ponderada por ECTS o por horas.</li>
            <li><strong>No verificar el sistema de calificación</strong> — Asegúrate de usar la escala correcta. En el sistema alemán el 1 es sobresaliente y el 4 es el aprobado; introducir una nota alemana en una calculadora de escala española da resultados erróneos.</li>
            <li><strong>Incluir asignaturas no superadas en la media universitaria</strong> — El expediente oficial español solo incluye asignaturas aprobadas (salvo que la normativa de tu universidad indique lo contrario).</li>
            <li><strong>Confundir la nota de acceso a la universidad con el expediente de bachillerato</strong> — Son cálculos diferentes. La nota de acceso incluye la EVAU; el expediente de bachillerato solo considera las calificaciones del centro.</li>
            <li><strong>No redondear correctamente</strong> — El expediente universitario oficial se expresa con dos decimales. El redondeo se hace en el resultado final, no en cada nota intermedia.</li>
            <li><strong>Asumir que la media es igual en todos los centros</strong> — El criterio de ponderación puede variar entre universidades. Consulta siempre el reglamento de evaluación de tu facultad.</li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps
        apps={getRelatedApps('calculadora-notas')}
        title="Más herramientas para estudiantes"
        icon="📚"
      />

      <ShareCard appName="calculadora-notas" />
      <Footer appName="calculadora-notas" />
    </div>
  );
}
