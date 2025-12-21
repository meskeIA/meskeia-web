'use client';

import { useState, useCallback } from 'react';
import styles from './CalculadoraHerencias.module.css';
import { MeskeiaLogo, Footer, EducationalSection, RelatedApps } from '@/components';
import { formatCurrency, parseSpanishNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// Tipos de territorios con derecho civil propio
type Territorio =
  | 'comun'
  | 'cataluna'
  | 'aragon'
  | 'galicia'
  | 'paisvasco'
  | 'navarra'
  | 'baleares-mallorca'
  | 'baleares-menorca';

interface DatosHerencia {
  caudalHereditario: string;
  numHijos: number;
  conyugeVivo: boolean;
  padresVivos: boolean;
  territorio: Territorio;
}

interface ResultadoReparto {
  legitima: number;
  legitimaEstricta: number;
  mejora: number;
  libreDisposicion: number;
  usufructoViudo: number;
  usufructoViudoDescripcion: string;
  notas: string[];
}

// Información de cada territorio
const TERRITORIOS_INFO: Record<Territorio, { nombre: string; descripcion: string }> = {
  'comun': {
    nombre: 'Código Civil (Derecho Común)',
    descripcion: 'Aplicable en la mayor parte de España'
  },
  'cataluna': {
    nombre: 'Cataluña',
    descripcion: 'Código Civil de Cataluña'
  },
  'aragon': {
    nombre: 'Aragón',
    descripcion: 'Código del Derecho Foral de Aragón'
  },
  'galicia': {
    nombre: 'Galicia',
    descripcion: 'Ley de Derecho Civil de Galicia'
  },
  'paisvasco': {
    nombre: 'País Vasco',
    descripcion: 'Ley de Derecho Civil Vasco'
  },
  'navarra': {
    nombre: 'Navarra',
    descripcion: 'Fuero Nuevo de Navarra'
  },
  'baleares-mallorca': {
    nombre: 'Baleares (Mallorca e Ibiza)',
    descripcion: 'Compilación del Derecho Civil Balear'
  },
  'baleares-menorca': {
    nombre: 'Baleares (Menorca)',
    descripcion: 'Compilación del Derecho Civil Balear'
  }
};

// Función para calcular el reparto según cada territorio
function calcularReparto(datos: DatosHerencia): ResultadoReparto {
  const caudal = parseSpanishNumber(datos.caudalHereditario) || 0;
  const { numHijos, conyugeVivo, padresVivos, territorio } = datos;

  let legitima = 0;
  let legitimaEstricta = 0;
  let mejora = 0;
  let libreDisposicion = 0;
  let usufructoViudo = 0;
  let usufructoViudoDescripcion = '';
  const notas: string[] = [];

  switch (territorio) {
    case 'comun':
      // Código Civil común
      if (numHijos > 0) {
        // Con hijos: 2/3 legítima (1/3 estricta + 1/3 mejora)
        legitima = caudal * (2/3);
        legitimaEstricta = caudal * (1/3);
        mejora = caudal * (1/3);
        libreDisposicion = caudal * (1/3);
        if (conyugeVivo) {
          usufructoViudo = mejora; // Usufructo del tercio de mejora
          usufructoViudoDescripcion = 'Usufructo del tercio de mejora';
        }
        notas.push('La legítima estricta se reparte a partes iguales entre los hijos.');
        notas.push('El tercio de mejora puede distribuirse libremente entre descendientes.');
      } else if (padresVivos) {
        // Sin hijos, con padres: 1/2 legítima
        legitima = caudal * (1/2);
        legitimaEstricta = caudal * (1/2);
        libreDisposicion = caudal * (1/2);
        if (conyugeVivo) {
          usufructoViudo = caudal * (1/2); // Usufructo de la mitad
          usufructoViudoDescripcion = 'Usufructo de la mitad de la herencia';
        }
        notas.push('La legítima de los padres es la mitad del caudal.');
      } else if (conyugeVivo) {
        // Solo cónyuge: usufructo de 2/3
        usufructoViudo = caudal * (2/3);
        usufructoViudoDescripcion = 'Usufructo de dos tercios de la herencia';
        libreDisposicion = caudal;
        notas.push('Sin descendientes ni ascendientes, el cónyuge tiene usufructo de 2/3.');
      } else {
        libreDisposicion = caudal;
        notas.push('Sin legitimarios, toda la herencia es de libre disposición.');
      }
      break;

    case 'cataluna':
      // Cataluña: legítima reducida (1/4)
      if (numHijos > 0) {
        legitima = caudal * (1/4);
        legitimaEstricta = caudal * (1/4);
        libreDisposicion = caudal * (3/4);
        notas.push('En Cataluña la legítima de los hijos es solo 1/4 del caudal.');
        notas.push('La legítima catalana es un crédito, no una cuota hereditaria.');
        if (conyugeVivo) {
          usufructoViudoDescripcion = 'Cuarta viudal si está en situación de necesidad';
          notas.push('El cónyuge puede reclamar la cuarta viudal si está en situación de necesidad.');
        }
      } else if (padresVivos) {
        legitima = caudal * (1/4);
        legitimaEstricta = caudal * (1/4);
        libreDisposicion = caudal * (3/4);
        notas.push('Los padres tienen una legítima del 1/4 del caudal.');
      } else {
        libreDisposicion = caudal;
        notas.push('Sin descendientes ni ascendientes, toda la herencia es de libre disposición.');
      }
      break;

    case 'aragon':
      // Aragón: legítima colectiva del 50%
      if (numHijos > 0) {
        legitima = caudal * (1/2);
        legitimaEstricta = caudal * (1/2);
        libreDisposicion = caudal * (1/2);
        notas.push('La legítima aragonesa es colectiva: el 50% debe ir a los descendientes.');
        notas.push('Se puede distribuir libremente entre cualquier descendiente, incluso desheredando a algunos hijos.');
        if (conyugeVivo) {
          usufructoViudo = caudal; // Usufructo universal
          usufructoViudoDescripcion = 'Derecho de viudedad: usufructo universal de toda la herencia';
          notas.push('El viudo/a aragonés tiene derecho al usufructo universal (derecho de viudedad).');
        }
      } else if (conyugeVivo) {
        usufructoViudo = caudal;
        usufructoViudoDescripcion = 'Usufructo universal de toda la herencia';
        libreDisposicion = caudal;
        notas.push('Sin descendientes, el cónyuge mantiene el usufructo universal.');
      } else {
        libreDisposicion = caudal;
        notas.push('En Aragón los ascendientes no son legitimarios.');
      }
      break;

    case 'galicia':
      // Galicia: legítima reducida (1/4)
      if (numHijos > 0) {
        legitima = caudal * (1/4);
        legitimaEstricta = caudal * (1/4);
        libreDisposicion = caudal * (3/4);
        notas.push('La legítima gallega de los hijos es del 25% del caudal.');
        if (conyugeVivo) {
          if (numHijos > 0) {
            usufructoViudo = caudal * (1/4);
            usufructoViudoDescripcion = 'Usufructo de 1/4 de la herencia';
          }
          notas.push('El viudo/a tiene usufructo de 1/4 concurriendo con descendientes.');
        }
      } else if (conyugeVivo) {
        usufructoViudo = caudal * (1/2);
        usufructoViudoDescripcion = 'Usufructo de la mitad de la herencia';
        libreDisposicion = caudal;
        notas.push('Sin descendientes, el viudo/a tiene usufructo de la mitad.');
      } else {
        libreDisposicion = caudal;
        notas.push('En Galicia los ascendientes no son legitimarios.');
      }
      break;

    case 'paisvasco':
      // País Vasco: legítima colectiva del 1/3
      if (numHijos > 0) {
        legitima = caudal * (1/3);
        legitimaEstricta = caudal * (1/3);
        libreDisposicion = caudal * (2/3);
        notas.push('La legítima vasca es colectiva: 1/3 para todos los descendientes.');
        notas.push('Se puede distribuir libremente entre descendientes, apartando a algunos.');
        if (conyugeVivo) {
          usufructoViudo = caudal * (1/2);
          usufructoViudoDescripcion = 'Usufructo de la mitad de la herencia';
          notas.push('El viudo/a vasco tiene usufructo de la mitad concurriendo con descendientes.');
        }
      } else if (conyugeVivo) {
        usufructoViudo = caudal * (2/3);
        usufructoViudoDescripcion = 'Usufructo de dos tercios de la herencia';
        libreDisposicion = caudal;
        notas.push('Sin descendientes, el viudo/a tiene usufructo de 2/3.');
      } else {
        libreDisposicion = caudal;
        notas.push('En el País Vasco los ascendientes no son legitimarios.');
      }
      break;

    case 'navarra':
      // Navarra: legítima simbólica (libertad total)
      libreDisposicion = caudal;
      notas.push('En Navarra existe libertad total de testar.');
      notas.push('La legítima navarra es meramente simbólica (5 sueldos febles).');
      if (numHijos > 0) {
        notas.push('Los hijos deben ser mencionados en el testamento, pero no es obligatorio dejarles nada.');
      }
      if (conyugeVivo) {
        usufructoViudo = caudal;
        usufructoViudoDescripcion = 'Usufructo universal de fidelidad';
        notas.push('El viudo/a navarro tiene derecho al usufructo universal de fidelidad.');
      }
      break;

    case 'baleares-mallorca':
      // Baleares (Mallorca e Ibiza): 1/3 o 1/2 según número de hijos
      if (numHijos > 0) {
        if (numHijos <= 4) {
          legitima = caudal * (1/3);
          legitimaEstricta = caudal * (1/3);
          libreDisposicion = caudal * (2/3);
          notas.push('Con 4 hijos o menos, la legítima es 1/3 del caudal.');
        } else {
          legitima = caudal * (1/2);
          legitimaEstricta = caudal * (1/2);
          libreDisposicion = caudal * (1/2);
          notas.push('Con más de 4 hijos, la legítima es 1/2 del caudal.');
        }
        if (conyugeVivo) {
          usufructoViudo = caudal * (1/2);
          usufructoViudoDescripcion = 'Usufructo de la mitad de la herencia';
          notas.push('El viudo/a tiene usufructo de la mitad concurriendo con descendientes.');
        }
      } else if (padresVivos) {
        legitima = caudal * (1/4);
        legitimaEstricta = caudal * (1/4);
        libreDisposicion = caudal * (3/4);
        notas.push('Los padres tienen una legítima del 1/4 del caudal.');
      } else {
        libreDisposicion = caudal;
        notas.push('Sin legitimarios, toda la herencia es de libre disposición.');
      }
      break;

    case 'baleares-menorca':
      // Menorca sigue el Código Civil común
      if (numHijos > 0) {
        legitima = caudal * (2/3);
        legitimaEstricta = caudal * (1/3);
        mejora = caudal * (1/3);
        libreDisposicion = caudal * (1/3);
        if (conyugeVivo) {
          usufructoViudo = mejora;
          usufructoViudoDescripcion = 'Usufructo del tercio de mejora';
        }
        notas.push('Menorca aplica el sistema del Código Civil común.');
        notas.push('La legítima estricta se reparte a partes iguales entre los hijos.');
      } else if (padresVivos) {
        legitima = caudal * (1/2);
        legitimaEstricta = caudal * (1/2);
        libreDisposicion = caudal * (1/2);
        if (conyugeVivo) {
          usufructoViudo = caudal * (1/2);
          usufructoViudoDescripcion = 'Usufructo de la mitad de la herencia';
        }
      } else if (conyugeVivo) {
        usufructoViudo = caudal * (2/3);
        usufructoViudoDescripcion = 'Usufructo de dos tercios de la herencia';
        libreDisposicion = caudal;
      } else {
        libreDisposicion = caudal;
      }
      break;
  }

  return {
    legitima,
    legitimaEstricta,
    mejora,
    libreDisposicion,
    usufructoViudo,
    usufructoViudoDescripcion,
    notas
  };
}

export default function CalculadoraHerenciasPage() {
  const [datos, setDatos] = useState<DatosHerencia>({
    caudalHereditario: '',
    numHijos: 0,
    conyugeVivo: false,
    padresVivos: false,
    territorio: 'comun'
  });

  const [resultado, setResultado] = useState<ResultadoReparto | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  const handleCalcular = useCallback(() => {
    const caudal = parseSpanishNumber(datos.caudalHereditario);
    if (!caudal || caudal <= 0) {
      return;
    }

    const reparto = calcularReparto(datos);
    setResultado(reparto);
    setMostrarResultado(true);
  }, [datos]);

  const handleReset = () => {
    setDatos({
      caudalHereditario: '',
      numHijos: 0,
      conyugeVivo: false,
      padresVivos: false,
      territorio: 'comun'
    });
    setResultado(null);
    setMostrarResultado(false);
  };

  const caudal = parseSpanishNumber(datos.caudalHereditario) || 0;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero Section */}
      <header className={styles.hero}>
        <span className={styles.heroIcon}>⚖️</span>
        <h1 className={styles.title}>Calculadora de Herencias</h1>
        <p className={styles.subtitle}>
          Calcula el reparto de una herencia según el derecho civil español.
          Incluye todos los regímenes forales: Código Civil, Cataluña, Aragón, Galicia, País Vasco, Navarra y Baleares.
        </p>
      </header>

      {/* Calculadora Principal */}
      <div className={styles.mainContent}>
        <div className={styles.inputPanel}>
          <h2 className={styles.panelTitle}>Datos de la Herencia</h2>

          {/* Selector de Territorio */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Territorio (Derecho Aplicable)</label>
            <select
              className={styles.select}
              value={datos.territorio}
              onChange={(e) => setDatos({ ...datos, territorio: e.target.value as Territorio })}
            >
              {Object.entries(TERRITORIOS_INFO).map(([key, info]) => (
                <option key={key} value={key}>{info.nombre}</option>
              ))}
            </select>
            <span className={styles.helperText}>
              {TERRITORIOS_INFO[datos.territorio].descripcion}
            </span>
          </div>

          {/* Caudal Hereditario */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Caudal Hereditario (€)</label>
            <input
              type="text"
              className={styles.input}
              value={datos.caudalHereditario}
              onChange={(e) => setDatos({ ...datos, caudalHereditario: e.target.value })}
              placeholder="Ej: 500.000"
            />
            <span className={styles.helperText}>
              Valor total del patrimonio del fallecido (bienes menos deudas)
            </span>
          </div>

          {/* Número de Hijos */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>Número de Hijos/Descendientes</label>
            <div className={styles.counterGroup}>
              <button
                className={styles.counterBtn}
                onClick={() => setDatos({ ...datos, numHijos: Math.max(0, datos.numHijos - 1) })}
                disabled={datos.numHijos === 0}
              >
                −
              </button>
              <span className={styles.counterValue}>{datos.numHijos}</span>
              <button
                className={styles.counterBtn}
                onClick={() => setDatos({ ...datos, numHijos: datos.numHijos + 1 })}
              >
                +
              </button>
            </div>
          </div>

          {/* Checkboxes */}
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={datos.conyugeVivo}
                onChange={(e) => setDatos({ ...datos, conyugeVivo: e.target.checked })}
              />
              <span className={styles.checkmark}></span>
              Cónyuge viudo/a superviviente
            </label>
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={datos.padresVivos}
                onChange={(e) => setDatos({ ...datos, padresVivos: e.target.checked })}
                disabled={datos.numHijos > 0}
              />
              <span className={styles.checkmark}></span>
              Padre/Madre vivo (ascendientes)
              {datos.numHijos > 0 && <span className={styles.disabledNote}> - Solo aplica sin hijos</span>}
            </label>
          </div>

          {/* Botones */}
          <div className={styles.buttonGroup}>
            <button
              className={styles.btnPrimary}
              onClick={handleCalcular}
              disabled={!datos.caudalHereditario || parseSpanishNumber(datos.caudalHereditario) <= 0}
            >
              Calcular Reparto
            </button>
            <button
              className={styles.btnSecondary}
              onClick={handleReset}
            >
              Limpiar
            </button>
          </div>
        </div>

        {/* Resultados */}
        <div className={styles.resultsPanel}>
          <h2 className={styles.panelTitle}>Reparto de la Herencia</h2>

          {mostrarResultado && resultado ? (
            <div className={styles.resultContent}>
              <div className={styles.territorioInfo}>
                <span className={styles.territorioIcon}>📍</span>
                <span>{TERRITORIOS_INFO[datos.territorio].nombre}</span>
              </div>

              <div className={styles.caudalTotal}>
                <span className={styles.caudalLabel}>Caudal Hereditario</span>
                <span className={styles.caudalValue}>{formatCurrency(caudal)}</span>
              </div>

              <div className={styles.repartoGrid}>
                {resultado.legitimaEstricta > 0 && (
                  <div className={styles.repartoCard}>
                    <div className={styles.cardIcon}>👨‍👩‍👧‍👦</div>
                    <div className={styles.cardTitle}>Legítima Estricta</div>
                    <div className={styles.cardValue}>{formatCurrency(resultado.legitimaEstricta)}</div>
                    <div className={styles.cardPercent}>
                      {((resultado.legitimaEstricta / caudal) * 100).toFixed(1)}%
                    </div>
                  </div>
                )}

                {resultado.mejora > 0 && (
                  <div className={styles.repartoCard}>
                    <div className={styles.cardIcon}>⬆️</div>
                    <div className={styles.cardTitle}>Tercio de Mejora</div>
                    <div className={styles.cardValue}>{formatCurrency(resultado.mejora)}</div>
                    <div className={styles.cardPercent}>
                      {((resultado.mejora / caudal) * 100).toFixed(1)}%
                    </div>
                  </div>
                )}

                <div className={`${styles.repartoCard} ${styles.libreCard}`}>
                  <div className={styles.cardIcon}>🎁</div>
                  <div className={styles.cardTitle}>Libre Disposición</div>
                  <div className={styles.cardValue}>{formatCurrency(resultado.libreDisposicion)}</div>
                  <div className={styles.cardPercent}>
                    {((resultado.libreDisposicion / caudal) * 100).toFixed(1)}%
                  </div>
                </div>

                {resultado.usufructoViudo > 0 && (
                  <div className={`${styles.repartoCard} ${styles.viudoCard}`}>
                    <div className={styles.cardIcon}>💍</div>
                    <div className={styles.cardTitle}>Usufructo Viudo/a</div>
                    <div className={styles.cardValue}>{formatCurrency(resultado.usufructoViudo)}</div>
                    <div className={styles.cardDesc}>{resultado.usufructoViudoDescripcion}</div>
                  </div>
                )}
              </div>

              {/* Notas explicativas */}
              {resultado.notas.length > 0 && (
                <div className={styles.notasSection}>
                  <h3 className={styles.notasTitle}>📋 Notas sobre este reparto</h3>
                  <ul className={styles.notasList}>
                    {resultado.notas.map((nota, index) => (
                      <li key={index}>{nota}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Desglose por hijo si aplica */}
              {datos.numHijos > 0 && resultado.legitimaEstricta > 0 && (
                <div className={styles.desglose}>
                  <h3 className={styles.desgloseTitle}>Desglose por heredero</h3>
                  <div className={styles.desglosePorHijo}>
                    <span>Legítima por cada hijo ({datos.numHijos} {datos.numHijos === 1 ? 'hijo' : 'hijos'}):</span>
                    <strong>{formatCurrency(resultado.legitimaEstricta / datos.numHijos)}</strong>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>📊</span>
              <p>Introduce los datos de la herencia para calcular el reparto según el derecho civil aplicable.</p>
            </div>
          )}
        </div>
      </div>

      {/* Disclaimer */}
      <div className={styles.disclaimer}>
        <h3>⚠️ Aviso Legal Importante</h3>
        <p>
          Esta calculadora proporciona una <strong>estimación orientativa</strong> del reparto de una herencia
          según las normas del derecho civil español (legítimas y libre disposición).
        </p>
        <p>
          <strong>NO calcula impuestos</strong>. El Impuesto de Sucesiones se calcula de forma separada y
          varía según la comunidad autónoma. Consulta nuestras calculadoras fiscales específicas.
        </p>
        <p>
          Cada caso particular puede tener circunstancias especiales (testamentos, pactos sucesorios,
          legados, desheredaciones, etc.) que alteren el reparto. <strong>Consulta siempre con un
          notario o abogado especializado</strong> antes de tomar decisiones legales.
        </p>
      </div>

      {/* Contenido Educativo */}
      <EducationalSection
        title="¿Quieres aprender más sobre herencias y legítimas?"
        subtitle="Descubre las diferencias entre los distintos regímenes forales españoles"
      >
        <section className={styles.guideSection}>
          <h2>¿Qué es la legítima?</h2>
          <p className={styles.introParagraph}>
            La legítima es la parte de la herencia que la ley reserva obligatoriamente a determinados
            herederos, llamados <strong>herederos forzosos o legitimarios</strong>. En España, estos son
            principalmente los hijos, descendientes, y en su defecto, los padres o ascendientes.
            El cónyuge viudo también tiene derechos, normalmente en forma de usufructo.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🏛️ Código Civil (Derecho Común)</h4>
              <p>
                Aplica en la mayor parte de España. La legítima de los hijos es <strong>2/3 del caudal</strong>:
                1/3 de legítima estricta (a partes iguales) y 1/3 de mejora (distribución libre entre descendientes).
                El tercio restante es de libre disposición.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🏔️ Cataluña</h4>
              <p>
                La legítima catalana es más reducida: solo <strong>1/4 del caudal</strong> para los hijos.
                Esto permite al testador disponer libremente del 75% de su patrimonio. La legítima es un
                crédito, no una cuota hereditaria.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🏔️ Aragón</h4>
              <p>
                Sistema de legítima colectiva: <strong>1/2 del caudal</strong> debe ir a los descendientes,
                pero se puede distribuir libremente entre ellos, pudiendo apartar a algún hijo.
                El viudo tiene usufructo universal (derecho de viudedad).
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🌊 Galicia</h4>
              <p>
                Legítima reducida de <strong>1/4 del caudal</strong> para los hijos.
                Los ascendientes no son legitimarios. El viudo tiene usufructo de 1/4 o 1/2
                según concurra o no con descendientes.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🌲 País Vasco</h4>
              <p>
                Legítima colectiva de <strong>1/3 del caudal</strong> para los descendientes.
                Se puede distribuir libremente entre ellos, apartando a algunos.
                El viudo tiene usufructo de 1/2 o 2/3.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🏰 Navarra</h4>
              <p>
                El sistema más libre: la legítima es <strong>meramente simbólica</strong> (5 sueldos febles).
                Existe libertad total de testar. El viudo tiene usufructo universal de fidelidad.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>🏝️ Baleares</h4>
              <p>
                En Mallorca e Ibiza, la legítima es <strong>1/3 o 1/2</strong> según el número de hijos
                (más de 4 hijos = 1/2). Menorca aplica el Código Civil común.
              </p>
            </div>
            <div className={styles.contentCard}>
              <h4>💍 Derechos del Cónyuge</h4>
              <p>
                El viudo/a normalmente tiene derecho a usufructo, no a propiedad.
                La extensión varía según el territorio y si concurre con hijos o padres.
                El usufructo puede capitalizarse según la edad del viudo.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.guideSection}>
          <h2>Preguntas Frecuentes</h2>
          <ul className={styles.faqList}>
            <li>
              <strong>¿Puedo desheredar a un hijo?</strong><br />
              Solo en casos muy específicos previstos por la ley (maltrato, injurias graves, etc.).
              En territorios con legítima colectiva (Aragón, País Vasco) se puede &quot;apartar&quot; a un hijo,
              que es diferente de desheredar.
            </li>
            <li>
              <strong>¿Qué derecho se aplica a mi herencia?</strong><br />
              El del lugar donde el fallecido tenía su vecindad civil, no donde resida ni donde estén los bienes.
            </li>
            <li>
              <strong>¿Qué diferencia hay entre legítima estricta y mejora?</strong><br />
              La legítima estricta se reparte obligatoriamente a partes iguales entre los hijos.
              La mejora también va a descendientes, pero el testador decide a quién y en qué proporción.
            </li>
            <li>
              <strong>¿El usufructo del viudo reduce la herencia de los hijos?</strong><br />
              El usufructo recae sobre bienes concretos de la herencia. Los hijos son propietarios
              (nuda propiedad), pero el viudo puede usar y disfrutar de esos bienes mientras viva.
            </li>
          </ul>
        </section>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('calculadora-herencias')} />
      <Footer appName="calculadora-herencias" />
    </div>
  );
}
