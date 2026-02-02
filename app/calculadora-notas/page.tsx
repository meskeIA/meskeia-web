'use client';

import { useState, useMemo, useEffect } from 'react';
import styles from './CalculadoraNotas.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps, DisclaimerCard, LastUpdated } from '@/components';
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

// Funciones de conversión
const convertirNota = (nota: number, desde: string) => {
  // Normalizar a escala 0-10
  let nota10: number;

  switch (desde) {
    case 'espana':
      nota10 = nota;
      break;
    case 'gpa':
      nota10 = (nota / 4) * 10;
      break;
    case 'porcentaje':
      nota10 = nota / 10;
      break;
    default:
      nota10 = nota;
  }

  // Limitar entre 0 y 10
  nota10 = Math.max(0, Math.min(10, nota10));

  // Convertir a todas las escalas
  const gpa = (nota10 / 10) * 4;
  const porcentaje = nota10 * 10;

  // Letra USA
  let letra: string;
  if (nota10 >= 9) letra = 'A';
  else if (nota10 >= 8) letra = 'B+';
  else if (nota10 >= 7) letra = 'B';
  else if (nota10 >= 6) letra = 'C+';
  else if (nota10 >= 5) letra = 'C';
  else if (nota10 >= 4) letra = 'D';
  else letra = 'F';

  // ECTS
  let ects: string;
  if (nota10 >= 9) ects = 'A (Excelente)';
  else if (nota10 >= 8) ects = 'B (Muy Bien)';
  else if (nota10 >= 7) ects = 'C (Bien)';
  else if (nota10 >= 6) ects = 'D (Satisfactorio)';
  else if (nota10 >= 5) ects = 'E (Suficiente)';
  else ects = 'F (Suspenso)';

  // Calificación España
  let calificacion: string;
  if (nota10 >= 9) calificacion = 'Sobresaliente';
  else if (nota10 >= 7) calificacion = 'Notable';
  else if (nota10 >= 5) calificacion = 'Aprobado';
  else calificacion = 'Suspenso';

  return {
    espana: nota10,
    gpa,
    porcentaje,
    letra,
    ects,
    calificacion
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
          Media ponderada, simulador EvAU y conversor de escalas de calificación
        </p>
      </header>

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
          <span>🎓</span> Simulador EvAU
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
                  <option value="espana">España (0-10)</option>
                  <option value="gpa">GPA USA (0-4)</option>
                  <option value="porcentaje">Porcentaje (0-100)</option>
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
                  placeholder={escalaOrigen === 'espana' ? '7,5' : escalaOrigen === 'gpa' ? '3,0' : '75'}
                />
              </div>
            </div>

            {resultadoConversor && (
              <div className={styles.conversorResultados}>
                <div className={styles.conversorResultado}>
                  <span className={styles.conversorEscala}>España (0-10)</span>
                  <span className={styles.conversorValor}>{formatNumber(resultadoConversor.espana, 2)}</span>
                </div>
                <div className={styles.conversorResultado}>
                  <span className={styles.conversorEscala}>GPA USA (0-4)</span>
                  <span className={styles.conversorValor}>{formatNumber(resultadoConversor.gpa, 2)}</span>
                </div>
                <div className={styles.conversorResultado}>
                  <span className={styles.conversorEscala}>Porcentaje</span>
                  <span className={styles.conversorValor}>{formatNumber(resultadoConversor.porcentaje, 0)}%</span>
                </div>
                <div className={styles.conversorResultado}>
                  <span className={styles.conversorEscala}>Letra (USA)</span>
                  <span className={styles.conversorValor}>{resultadoConversor.letra}</span>
                </div>
                <div className={styles.conversorResultado}>
                  <span className={styles.conversorEscala}>ECTS</span>
                  <span className={styles.conversorValor}>{resultadoConversor.ects}</span>
                </div>
                <div className={styles.conversorResultado}>
                  <span className={styles.conversorEscala}>Calificación España</span>
                  <span className={styles.conversorValor}>{resultadoConversor.calificacion}</span>
                </div>
              </div>
            )}

            {/* Tabla de referencia */}
            <h3 className={styles.sectionTitle} style={{ marginTop: 'var(--spacing-xl)' }}>
              <span>📋</span> Tabla de Equivalencias
            </h3>
            <table className={styles.tablaConversion}>
              <thead>
                <tr>
                  <th>España</th>
                  <th>GPA</th>
                  <th>Letra</th>
                  <th>ECTS</th>
                  <th>Calificación</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>9 - 10</td>
                  <td>3.6 - 4.0</td>
                  <td>A</td>
                  <td>A</td>
                  <td>Sobresaliente</td>
                </tr>
                <tr>
                  <td>8 - 8.9</td>
                  <td>3.2 - 3.5</td>
                  <td>B+</td>
                  <td>B</td>
                  <td>Notable Alto</td>
                </tr>
                <tr>
                  <td>7 - 7.9</td>
                  <td>2.8 - 3.1</td>
                  <td>B</td>
                  <td>C</td>
                  <td>Notable</td>
                </tr>
                <tr>
                  <td>6 - 6.9</td>
                  <td>2.4 - 2.7</td>
                  <td>C+</td>
                  <td>D</td>
                  <td>Bien</td>
                </tr>
                <tr>
                  <td>5 - 5.9</td>
                  <td>2.0 - 2.3</td>
                  <td>C</td>
                  <td>E</td>
                  <td>Aprobado</td>
                </tr>
                <tr>
                  <td>0 - 4.9</td>
                  <td>0 - 1.9</td>
                  <td>F</td>
                  <td>F</td>
                  <td>Suspenso</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Panel lateral vacío para mantener layout */}
          <div></div>
        </div>
      )}

      <LastUpdated lastUpdate="2 de febrero de 2026" />

      <DisclaimerCard variant="educational" severity="low" collapsible={true} context="calculadora-notas">
        <p>Esta calculadora es una <strong>herramienta educativa</strong> para apoyo académico:</p>
        <ul className={styles.disclaimerList}>
          <li><strong>Los cálculos de EvAU varían por comunidad autónoma</strong>: Cada región aplica ponderaciones y criterios específicos</li>
          <li><strong>Verifica con tu centro educativo</strong>: Consulta la normativa oficial de tu universidad antes de tomar decisiones académicas importantes</li>
        </ul>
      </DisclaimerCard>

      {/* Contenido educativo */}
      <EducationalSection
        title="¿Quieres saber más sobre el sistema de calificaciones?"
        subtitle="Aprende sobre ECTS, EvAU y equivalencias internacionales"
      >
        <section className={styles.guideSection}>
          <h2>Sistema de Créditos ECTS</h2>
          <p className={styles.introParagraph}>
            El Sistema Europeo de Transferencia y Acumulación de Créditos (ECTS) es el estándar
            adoptado por todas las universidades del Espacio Europeo de Educación Superior para
            homogeneizar los estudios universitarios.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>¿Qué es un crédito ECTS?</h4>
              <p>
                Un crédito ECTS equivale a 25-30 horas de trabajo del estudiante, incluyendo
                clases presenciales, estudio personal, trabajos y exámenes. Un curso académico
                completo son 60 ECTS.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Media Ponderada</h4>
              <p>
                La media ponderada tiene en cuenta los créditos de cada asignatura. Una nota en
                una asignatura de 12 ECTS &quot;pesa&quot; el doble que una de 6 ECTS en tu expediente.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Matrícula de Honor</h4>
              <p>
                Con un 10 puedes optar a Matrícula de Honor (MH). Se concede a un máximo del 5%
                de los alumnos y supone matrícula gratuita en una asignatura del siguiente curso.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>La Prueba EvAU (Selectividad)</h2>
          <p className={styles.introParagraph}>
            La Evaluación para el Acceso a la Universidad (EvAU) es la prueba que deben realizar
            los estudiantes de Bachillerato para acceder a estudios universitarios en España.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Fase General (Obligatoria)</h4>
              <p>
                4 exámenes obligatorios: Lengua, Historia, Idioma extranjero y una materia troncal
                de modalidad. La media de esta fase supone el 40% de la nota de acceso.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Fase Específica (Voluntaria)</h4>
              <p>
                Hasta 4 exámenes adicionales para subir nota. Las 2 mejores notas (≥5) se multiplican
                por 0.1 o 0.2 según la ponderación de cada grado universitario.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Nota de Admisión</h4>
              <p>
                La nota máxima es 14 puntos: 10 de la nota de acceso + hasta 4 puntos de la fase
                específica. Cada grado tiene su propia nota de corte.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Equivalencias Internacionales</h2>
          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>Sistema GPA (Estados Unidos)</h4>
              <p>
                El Grade Point Average va de 0 a 4. Un GPA de 3.0 o superior se considera bueno
                para acceder a universidades estadounidenses. La conversión no es exacta y puede
                variar entre instituciones.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Sistema de Letras</h4>
              <p>
                Las calificaciones por letras (A, B, C, D, F) son comunes en países anglosajones.
                Cada letra puede tener modificadores (+ o -) para mayor precisión.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>Escala ECTS Europea</h4>
              <p>
                La escala ECTS (A-F) facilita la movilidad internacional de estudiantes. Se basa
                en la distribución estadística de notas, no en rangos fijos, aunque existe una
                correspondencia aproximada.
              </p>
            </div>
          </div>
        </section>
      </EducationalSection>

      <RelatedApps
        apps={getRelatedApps('calculadora-notas')}
        title="Más herramientas para estudiantes"
        icon="📚"
      />

      <Footer appName="calculadora-notas" />
    </div>
  );
}
