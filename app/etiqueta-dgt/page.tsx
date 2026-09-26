'use client';

import React, { useState } from 'react';
import styles from './EtiquetaDgt.module.css';
import {
  MeskeiaLogo,
  Footer,
  LegalNotice,
  RelatedApps,
  ShareCard,
  DisclaimerCard,
  EducationalSection,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';
import { AYUDA_AUTO_PLUS_2026, FISCAL_AYUDAS_VEHICULO_META } from '@/data/fiscal';
import { formatDate, parseISODateLocal } from '@/lib';
import {
  clasificar,
  necesitaMes,
  type AutonomiaPhev,
  type TipoCombustible,
  type TipoEtiqueta,
} from './motor';

// ============================================================
// TIPOS
// ============================================================

type AccesoZBE = 'libre' | 'restriccion' | 'prohibido';

interface CiudadZBE {
  nombre: string;
  acceso: AccesoZBE;
  detalle: string;
}

interface ResultadoEtiqueta {
  etiqueta: TipoEtiqueta;
  nombre: string;
  descripcion: string;
  /** Matiz del caso concreto (frontera de fecha, gas anterior a la C…). */
  matiz: string | null;
  /** Vehículo de combustión (o gas): su etiqueta se deduce de la fecha, no de la norma Euro. */
  porFecha: boolean;
  ciudades: CiudadZBE[];
  recomendaciones: string[];
}

interface FormState {
  combustible: TipoCombustible | '';
  anio: string;
  mes: string;
  autonomiaPhev: AutonomiaPhev;
}

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/** Consulta oficial del distintivo por matrícula (DGT). */
const URL_DGT_DISTINTIVO = 'https://www.dgt.es/nuestros-servicios/tu-vehiculo/tus-vehiculos/distintivo-ambiental/';
const URL_SEDE_DGT = 'https://sede.dgt.gob.es/es/';

// ============================================================
// DATOS ZBE POR ETIQUETA
// ============================================================

const CIUDADES_ZBE: Record<TipoEtiqueta, CiudadZBE[]> = {
  cero: [
    {
      nombre: 'Madrid',
      acceso: 'libre',
      detalle: 'Acceso libre a ZBE Distrito Centro y ZBE 30 sin restricciones horarias ni por episodios.',
    },
    {
      nombre: 'Barcelona',
      acceso: 'libre',
      detalle: 'Acceso libre a la ZBE Rondes sin restricciones en ningún momento.',
    },
    {
      nombre: 'Valencia',
      acceso: 'libre',
      detalle: 'Acceso libre sin restricciones de circulación.',
    },
    {
      nombre: 'Sevilla',
      acceso: 'libre',
      detalle: 'Acceso libre. La ZBE está en proceso de implantación progresiva.',
    },
    {
      nombre: 'Zaragoza',
      acceso: 'libre',
      detalle: 'Acceso libre a la ZBE del centro urbano.',
    },
    {
      nombre: 'Valladolid',
      acceso: 'libre',
      detalle: 'Acceso libre sin restricciones.',
    },
    {
      nombre: 'Bilbao',
      acceso: 'libre',
      detalle: 'Acceso libre a la ZBE del centro y Gran Vía.',
    },
  ],
  eco: [
    {
      nombre: 'Madrid',
      acceso: 'libre',
      detalle: 'Acceso libre a ZBE Distrito Centro y ZBE 30 sin restricciones.',
    },
    {
      nombre: 'Barcelona',
      acceso: 'libre',
      detalle: 'Acceso libre a la ZBE Rondes sin restricciones.',
    },
    {
      nombre: 'Valencia',
      acceso: 'libre',
      detalle: 'Acceso libre sin restricciones.',
    },
    {
      nombre: 'Sevilla',
      acceso: 'libre',
      detalle: 'Acceso libre. ZBE en implantación progresiva.',
    },
    {
      nombre: 'Zaragoza',
      acceso: 'libre',
      detalle: 'Acceso libre a la ZBE del centro.',
    },
    {
      nombre: 'Valladolid',
      acceso: 'libre',
      detalle: 'Acceso libre sin restricciones.',
    },
    {
      nombre: 'Bilbao',
      acceso: 'libre',
      detalle: 'Acceso libre a la ZBE.',
    },
  ],
  c: [
    {
      nombre: 'Madrid',
      acceso: 'restriccion',
      detalle:
        'Acceso libre en condiciones normales. En episodios de alta contaminación (escenario 2 o 3) pueden activarse restricciones puntuales para etiqueta C.',
    },
    {
      nombre: 'Barcelona',
      acceso: 'libre',
      detalle: 'Acceso libre a la ZBE Rondes sin restricciones habituales para etiqueta C.',
    },
    {
      nombre: 'Valencia',
      acceso: 'libre',
      detalle: 'Acceso libre sin restricciones para etiqueta C.',
    },
    {
      nombre: 'Sevilla',
      acceso: 'libre',
      detalle: 'Acceso libre. ZBE en implantación; etiqueta C no está restringida.',
    },
    {
      nombre: 'Zaragoza',
      acceso: 'libre',
      detalle: 'Acceso libre a la ZBE para etiqueta C.',
    },
    {
      nombre: 'Valladolid',
      acceso: 'libre',
      detalle: 'Acceso libre sin restricciones.',
    },
    {
      nombre: 'Bilbao',
      acceso: 'libre',
      detalle: 'Acceso libre para etiqueta C.',
    },
  ],
  b: [
    {
      nombre: 'Madrid',
      acceso: 'restriccion',
      detalle:
        'Solo residentes con permiso en ZBE Distrito Centro. En ZBE 30 pueden circular con autorización especial. Prohibición en episodios de contaminación.',
    },
    {
      nombre: 'Barcelona',
      acceso: 'restriccion',
      detalle:
        'Circulación restringida en la ZBE Rondes en días laborables de 7:00 a 20:00. Solo permitido fines de semana y festivos.',
    },
    {
      nombre: 'Valencia',
      acceso: 'restriccion',
      detalle: 'Restricciones de circulación en el área central. Consultar horarios y días concretos en el portal municipal.',
    },
    {
      nombre: 'Sevilla',
      acceso: 'libre',
      detalle:
        'Acceso libre por ahora. La ZBE está en implantación y aún no aplica restricciones para etiqueta B.',
    },
    {
      nombre: 'Zaragoza',
      acceso: 'restriccion',
      detalle: 'Restricciones en determinados horarios y días laborables en la ZBE del centro.',
    },
    {
      nombre: 'Valladolid',
      acceso: 'libre',
      detalle: 'Acceso libre por el momento, aunque la tendencia es endurecer la normativa.',
    },
    {
      nombre: 'Bilbao',
      acceso: 'restriccion',
      detalle: 'Restricciones en horario de mayor tráfico en días laborables dentro de la ZBE.',
    },
  ],
  ninguna: [
    {
      nombre: 'Madrid',
      acceso: 'prohibido',
      detalle:
        'Acceso completamente prohibido a la ZBE Distrito Centro y ZBE 30. Las cámaras de control perimetral registran las matrículas infractoras.',
    },
    {
      nombre: 'Barcelona',
      acceso: 'prohibido',
      detalle:
        'Acceso prohibido a la ZBE Rondes en días laborables. Sistema de control automático con cámaras activo.',
    },
    {
      nombre: 'Valencia',
      acceso: 'prohibido',
      detalle: 'Acceso prohibido en la ZBE del centro urbano.',
    },
    {
      nombre: 'Sevilla',
      acceso: 'restriccion',
      detalle:
        'Restricciones progresivas en la ZBE en implantación. Se prevé prohibición total en 2025-2026.',
    },
    {
      nombre: 'Zaragoza',
      acceso: 'prohibido',
      detalle: 'Acceso prohibido a la ZBE. Control automático mediante cámaras en los accesos.',
    },
    {
      nombre: 'Valladolid',
      acceso: 'restriccion',
      detalle: 'Restricciones crecientes. Se prevé prohibición total a medida que la ZBE se consolide.',
    },
    {
      nombre: 'Bilbao',
      acceso: 'prohibido',
      detalle: 'Acceso prohibido a la ZBE del centro.',
    },
  ],
};

// ============================================================
// TEXTOS POR ETIQUETA
// ============================================================

const INFO_ETIQUETA: Record<
  TipoEtiqueta,
  { nombre: string; descripcion: string; recomendaciones: string[] }
> = {
  cero: {
    nombre: 'CERO',
    descripcion:
      'Eléctrico de batería (BEV), de autonomía extendida (REEV), híbrido enchufable (PHEV) con 40 km o más de autonomía eléctrica, o de pila de combustible. Etiqueta azul: la máxima categoría ambiental de la DGT.',
    recomendaciones: [
      'Tu vehículo tiene la máxima categoría ambiental. Accedes a todos los beneficios ZBE, carriles BUS+VAO, y parking bonificado en muchos municipios.',
      'En Madrid puedes aparcar gratuitamente en zona SER los primeros 120 minutos (residentes de otras zonas) con autorización previa.',
      'Disfruta de bonificaciones en peajes y exención o reducción del impuesto de matriculación y del IVTM en muchos ayuntamientos.',
    ],
  },
  eco: {
    nombre: 'ECO',
    descripcion:
      'Híbrido no enchufable (HEV), híbrido enchufable con menos de 40 km de autonomía eléctrica o vehículo de gas (GNC, GNL o GLP), que además cumpla los criterios de la etiqueta C. Etiqueta bicolor, verde y azul.',
    recomendaciones: [
      'Buena etiqueta. Accedes a la mayoría de ZBE sin restricciones y tienes beneficios en peajes y aparcamientos públicos.',
      'En Madrid, la etiqueta ECO permite aparcar en zona SER con beneficios y acceder a carriles BUS+VAO con al menos un ocupante.',
      'Considera actualizar a un PHEV con autonomía ≥40 km o un BEV para obtener la etiqueta CERO y maximizar los beneficios.',
    ],
  },
  c: {
    nombre: 'C',
    descripcion:
      'Gasolina matriculado a partir de enero de 2006 (Euro 4, 5 o 6) o diésel a partir de septiembre de 2015 (Euro 6). Etiqueta verde.',
    recomendaciones: [
      'Etiqueta válida en la mayoría de ZBE. En episodios de alta contaminación pueden activarse restricciones para esta etiqueta en algunas ciudades.',
      'En Madrid, vigila el protocolo anticontaminación: en escenarios 2 y 3, los vehículos C pueden quedar restringidos al viario básico.',
      'La etiqueta C sigue siendo la más común en España. A medio plazo, considera la transición hacia etiquetas ECO o CERO.',
    ],
  },
  b: {
    nombre: 'B',
    descripcion:
      'Gasolina matriculado desde el 1 de enero de 2001 (Euro 3) o diésel a partir de 2006 (Euro 4 o 5), sin llegar a la C. Etiqueta amarilla.',
    recomendaciones: [
      'Etiqueta limitada. Considera el impacto futuro: las normativas ZBE se están endureciendo progresivamente en todas las ciudades con más de 50.000 habitantes.',
      'En Madrid y Barcelona, la etiqueta B ya tiene restricciones de circulación en determinadas zonas y horarios. Infórmate antes de circular.',
      'Si usas el vehículo habitualmente en entorno urbano, valorar la renovación a un vehículo con etiqueta C, ECO o CERO puede evitarte multas y restricciones.',
    ],
  },
  ninguna: {
    nombre: 'Sin etiqueta',
    descripcion:
      'Sin distintivo ambiental (la categoría A del Reglamento General de Vehículos): gasolina matriculado antes de 2001 o diésel antes de 2006, es decir, anteriores a Euro 3 y Euro 4 respectivamente. Son los más restringidos en las ZBE.',
    recomendaciones: [
      'Tu vehículo no tiene etiqueta DGT y ya no puede circular por las ZBE de las principales ciudades. Si lo utilizas habitualmente en zona urbana, considera la renovación del vehículo.',
      'Entrar en una ZBE sin respetar sus restricciones es una infracción grave (art. 76.z3 de la Ley sobre Tráfico): 200 € de multa, 100 € con pronto pago, sin pérdida de puntos. Madrid y Barcelona disponen de control perimetral automático con cámaras.',
      `Si piensas cambiarlo por un eléctrico o electrificado, la ayuda estatal vigente es el ${AYUDA_AUTO_PLUS_2026.nombre} (${FISCAL_AYUDAS_VEHICULO_META.fuente.split(' (')[0]}), para vehículos matriculados desde el ${formatDate(parseISODateLocal(AYUDA_AUTO_PLUS_2026.matriculadosDesde))}. Algunas comunidades autónomas y ayuntamientos tienen además planes propios.`,
    ],
  },
};

// ============================================================
// LÓGICA DE CÁLCULO
// ============================================================

// La clasificación vive en ./motor.ts (fuentes y fechas de la DGT en su cabecera).

function construirResultado(
  etiqueta: TipoEtiqueta,
  matiz: string | null,
  porFecha: boolean
): ResultadoEtiqueta {
  const info = INFO_ETIQUETA[etiqueta];
  return {
    etiqueta,
    nombre: info.nombre,
    descripcion: info.descripcion,
    matiz,
    porFecha,
    ciudades: CIUDADES_ZBE[etiqueta],
    recomendaciones: info.recomendaciones,
  };
}

// ============================================================
// SUBCOMPONENTES
// ============================================================

interface EtiquetaCirculoProps {
  etiqueta: TipoEtiqueta;
  nombre: string;
}

function EtiquetaCirculo({ etiqueta, nombre }: EtiquetaCirculoProps) {
  const claseColor = styles[`etiqueta_${etiqueta}`];

  const mostrarLetra = etiqueta === 'c' || etiqueta === 'b';
  const mostrarCero = etiqueta === 'cero';
  const mostrarEco = etiqueta === 'eco';
  const mostrarNinguna = etiqueta === 'ninguna';

  return (
    <div
      className={`${styles.etiquetaCirculo} ${claseColor}`}
      role="img"
      aria-label={etiqueta === 'ninguna' ? 'Sin etiqueta DGT' : `Etiqueta DGT: ${nombre}`}
    >
      {mostrarLetra && (
        <span className={styles.etiquetaLetra} aria-hidden="true">
          {nombre}
        </span>
      )}
      {mostrarCero && (
        <span className={styles.etiquetaNombre} aria-hidden="true">
          CERO
        </span>
      )}
      {mostrarEco && (
        <span className={styles.etiquetaNombre} aria-hidden="true">
          ECO
        </span>
      )}
      {mostrarNinguna && (
        <span className={styles.etiquetaNombre} style={{ fontSize: '1.1rem' }} aria-hidden="true">
          Sin etiqueta
        </span>
      )}
    </div>
  );
}

interface BadgeZbeProps {
  acceso: AccesoZBE;
}

function BadgeZbe({ acceso }: BadgeZbeProps) {
  const claseMap: Record<AccesoZBE, string> = {
    libre: styles.zbeLibre,
    restriccion: styles.zbeRestriccion,
    prohibido: styles.zbeProhibido,
  };

  const iconoMap: Record<AccesoZBE, string> = {
    libre: '✓',
    restriccion: '⚠',
    prohibido: '✕',
  };

  const textoMap: Record<AccesoZBE, string> = {
    libre: 'Libre acceso',
    restriccion: 'Con restricciones',
    prohibido: 'Prohibido',
  };

  return (
    <span className={`${styles.zbeStatus} ${claseMap[acceso]}`}>
      <span aria-hidden="true">{iconoMap[acceso]} </span>
      {textoMap[acceso]}
    </span>
  );
}

interface ErroresForm {
  combustible?: string;
  anio?: string;
  mes?: string;
  autonomia?: string;
}

/** Cualquier año anterior a 2001 ya es «sin etiqueta» por fecha: no hace falta un suelo alto. */
const ANIO_MINIMO = 1900;

/** Gasolina, diésel y gas se clasifican por fecha (el gas, para saber si cumple la C). */
function pideAnio(combustible: TipoCombustible): boolean {
  return combustible === 'gasolina' || combustible === 'diesel' || combustible === 'gnc';
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function EtiquetaDgtPage() {
  const [form, setForm] = useState<FormState>({
    combustible: '',
    anio: '',
    mes: '',
    autonomiaPhev: '',
  });
  const [resultado, setResultado] = useState<ResultadoEtiqueta | null>(null);
  const [errores, setErrores] = useState<ErroresForm>({});

  function limpiar(campo: keyof ErroresForm) {
    setErrores((prev) => ({ ...prev, [campo]: undefined }));
    setResultado(null);
  }

  function handleCombustibleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setForm((prev) => ({
      ...prev,
      combustible: e.target.value as TipoCombustible | '',
      autonomiaPhev: '',
    }));
    setErrores({});
    setResultado(null);
  }

  function handleAnioChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, anio: e.target.value }));
    limpiar('anio');
  }

  function handleMesChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, mes: e.target.value }));
    limpiar('mes');
  }

  function handleAutonomiaChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, autonomiaPhev: e.target.value as AutonomiaPhev }));
    limpiar('autonomia');
  }

  function handleConsultar(e: React.FormEvent) {
    e.preventDefault();
    setResultado(null);

    if (!form.combustible) {
      setErrores({ combustible: 'Elige el tipo de combustible de tu vehículo.' });
      return;
    }
    const combustible = form.combustible;
    const nuevos: ErroresForm = {};

    // El año se toma del reloj: un coche matriculado este año también se clasifica.
    const anioActual = new Date().getFullYear();
    const anioNum = Number(form.anio);
    if (pideAnio(combustible)) {
      if (!/^\d{4}$/.test(form.anio.trim()) || anioNum < ANIO_MINIMO || anioNum > anioActual) {
        nuevos.anio = `Introduce un año de cuatro cifras entre ${ANIO_MINIMO} y ${anioActual}.`;
      } else if (necesitaMes(combustible, anioNum) && !form.mes) {
        nuevos.mes =
          'Indica el mes: la DGT da la etiqueta C al diésel matriculado a partir de septiembre de 2015.';
      }
    }
    if (combustible === 'phev' && !form.autonomiaPhev) {
      nuevos.autonomia = 'Indica si la autonomía eléctrica de tu PHEV es de 40 km o más.';
    }
    if (Object.keys(nuevos).length > 0) {
      setErrores(nuevos);
      return;
    }

    const { etiqueta, matiz } = clasificar({
      combustible,
      anio: pideAnio(combustible) ? anioNum : undefined,
      mes: form.mes ? Number(form.mes) : undefined,
      autonomiaPhev: form.autonomiaPhev,
    });
    setErrores({});
    setResultado(construirResultado(etiqueta, matiz, pideAnio(combustible)));
  }

  const conAnio = form.combustible !== '' && pideAnio(form.combustible);
  const conMes = necesitaMes(form.combustible, Number(form.anio));
  const esPhev = form.combustible === 'phev';

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <h1 className={styles.heroTitle}>¿Qué etiqueta DGT tiene tu coche?</h1>
        <p className={styles.heroSubtitle}>
          Introduce el tipo de combustible y el año de matriculación para conocer tu etiqueta
          medioambiental y si puedes circular por las Zonas de Bajas Emisiones.
        </p>
      </header>

      <main className={styles.mainContent}>
        <LegalNotice />

        {/* ---- Formulario ---- */}
        <section className={styles.formSection} aria-label="Datos del vehículo">
          <div className={styles.formCard}>
            <form onSubmit={handleConsultar} noValidate>
              {/* Tipo de combustible */}
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="combustible">
                  Tipo de combustible
                </label>
                <select
                  id="combustible"
                  className={styles.select}
                  value={form.combustible}
                  onChange={handleCombustibleChange}
                  aria-required="true"
                  aria-label="Selecciona el tipo de combustible de tu vehículo"
                  aria-describedby={errores.combustible ? 'errorCombustible' : undefined}
                  aria-invalid={!!errores.combustible}
                >
                  <option value="">-- Selecciona combustible --</option>
                  <option value="bev">Eléctrico puro (BEV)</option>
                  <option value="phev">Eléctrico + gasolina enchufable (PHEV)</option>
                  <option value="hev">Híbrido convencional (HEV)</option>
                  <option value="gnc">Gas natural / GLP</option>
                  <option value="gasolina">Gasolina</option>
                  <option value="diesel">Diésel</option>
                </select>
                {errores.combustible && (
                  <div id="errorCombustible" role="alert" className={styles.mensajeError}>
                    {errores.combustible}
                  </div>
                )}
              </div>

              {/* Año de matriculación — gasolina, diésel y gas */}
              {conAnio && (
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="anioMatriculacion">
                    Año de primera matriculación
                  </label>
                  <input
                    id="anioMatriculacion"
                    type="number"
                    className={styles.input}
                    value={form.anio}
                    onChange={handleAnioChange}
                    min={ANIO_MINIMO}
                    placeholder="ej. 2015"
                    aria-required="true"
                    aria-label="Año de primera matriculación del vehículo"
                    aria-describedby={errores.anio ? 'errorAnio' : undefined}
                    aria-invalid={!!errores.anio}
                    inputMode="numeric"
                  />
                  {errores.anio && (
                    <div id="errorAnio" role="alert" className={styles.mensajeError}>
                      {errores.anio}
                    </div>
                  )}
                </div>
              )}

              {/* Mes — solo el diésel de 2015: la C empieza en septiembre */}
              {conAnio && conMes && (
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="mesMatriculacion">
                    Mes de primera matriculación
                  </label>
                  <select
                    id="mesMatriculacion"
                    className={styles.select}
                    value={form.mes}
                    onChange={handleMesChange}
                    aria-required="true"
                    aria-describedby={errores.mes ? 'ayudaMes errorMes' : 'ayudaMes'}
                    aria-invalid={!!errores.mes}
                  >
                    <option value="">-- Selecciona mes --</option>
                    {MESES.map((nombre, i) => (
                      <option key={nombre} value={String(i + 1)}>
                        {nombre}
                      </option>
                    ))}
                  </select>
                  <p id="ayudaMes" className={styles.ayudaCampo}>
                    En 2015 el mes decide: la etiqueta C del diésel empieza en septiembre (Euro 6).
                  </p>
                  {errores.mes && (
                    <div id="errorMes" role="alert" className={styles.mensajeError}>
                      {errores.mes}
                    </div>
                  )}
                </div>
              )}

              {/* Autonomía PHEV — solo visible para PHEV */}
              {esPhev && (
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="autonomiaPhev">
                    ¿La autonomía eléctrica es de 40 km o más?
                  </label>
                  <select
                    id="autonomiaPhev"
                    className={styles.select}
                    value={form.autonomiaPhev}
                    onChange={handleAutonomiaChange}
                    aria-required="true"
                    aria-describedby={errores.autonomia ? 'errorAutonomia' : undefined}
                    aria-invalid={!!errores.autonomia}
                  >
                    <option value="">-- Selecciona opción --</option>
                    <option value="cuarentaOMas">Sí, 40 km o más</option>
                    <option value="menos">No, menos de 40 km</option>
                  </select>
                  {errores.autonomia && (
                    <div id="errorAutonomia" role="alert" className={styles.mensajeError}>
                      {errores.autonomia}
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                className={styles.btnConsultar}
                aria-label="Calcular etiqueta DGT de mi vehículo"
              >
                Consultar mi etiqueta DGT
              </button>
            </form>

            <p className={styles.notaOficial}>
              Tu etiqueta oficial es la que consta en el Registro de Vehículos de la DGT según la
              norma Euro de tu coche; aquí se deduce del combustible y la fecha. Puedes comprobarla
              por matrícula en la{' '}
              <a href={URL_SEDE_DGT} target="_blank" rel="noopener noreferrer">
                sede electrónica de la DGT
              </a>
              .
            </p>
          </div>
        </section>

        {/* ---- Resultados ---- */}
        {resultado && (
          <section
            className={styles.resultadosSection}
            aria-label="Resultado de la etiqueta DGT"
            aria-live="polite"
          >
            {/* Etiqueta hero */}
            <div className={styles.etiquetaHero}>
              <EtiquetaCirculo etiqueta={resultado.etiqueta} nombre={resultado.nombre} />
              <h2 className={styles.etiquetaHeroNombre}>
                {resultado.etiqueta === 'ninguna' ? (
                  <strong>Sin etiqueta</strong>
                ) : (
                  <>
                    Etiqueta <strong>{resultado.nombre}</strong>
                  </>
                )}
              </h2>
              <p className={styles.etiquetaDesc}>{resultado.descripcion}</p>
              {resultado.matiz && <p className={styles.matiz}>{resultado.matiz}</p>}
              {resultado.porFecha && (
                <p className={styles.notaFecha}>
                  Resultado por fecha de matriculación, la aproximación que publica la{' '}
                  <a href={URL_DGT_DISTINTIVO} target="_blank" rel="noopener noreferrer">
                    DGT
                  </a>
                  . Manda la norma Euro de tu ficha técnica: un vehículo homologado con una norma
                  más reciente antes de esa fecha puede tener una etiqueta mejor. Compruébala por
                  matrícula en la sede electrónica de la DGT.
                </p>
              )}
            </div>

            {/* Ciudades ZBE */}
            <div className={styles.zbeSection}>
              <h3 className={styles.zbeTitulo}>
                Acceso a las principales ZBE de España
              </h3>
              <div className={styles.zbeGrid}>
                {resultado.ciudades.map((ciudad) => (
                  <div key={ciudad.nombre} className={styles.zbeCard}>
                    <p className={styles.zbeNombreCiudad}>{ciudad.nombre}</p>
                    <BadgeZbe acceso={ciudad.acceso} />
                    <p className={styles.zbeDetalle}>{ciudad.detalle}</p>
                  </div>
                ))}
              </div>
              <p className={styles.notaZbe}>
                Información orientativa a 2025. Las ZBE están en evolución constante.
              </p>
            </div>

            {/* Recomendaciones */}
            <div className={styles.recomendacionesSection}>
              <h3 className={styles.recomendacionesTitulo}>Recomendaciones</h3>
              {resultado.recomendaciones.map((rec, idx) => (
                <div key={idx} className={styles.recomendacionCard}>
                  {rec}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ---- Disclaimer ---- */}
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 1.5rem' }}>
          <DisclaimerCard
            variant="general"
            severity="critical"
            title="Aviso importante sobre la etiqueta y las ZBE"
            context="etiqueta-dgt"
          >
            <p>
              Esta herramienta es <strong>orientativa</strong>. Deduce la etiqueta del combustible y
              la fecha de matriculación, que es la aproximación que publica la DGT; la etiqueta
              oficial es la que consta en el Registro de Vehículos según la norma Euro de tu
              vehículo. Compruébala por matrícula en la{' '}
              <a href={URL_SEDE_DGT} target="_blank" rel="noopener noreferrer">
                sede electrónica de la DGT
              </a>
              .
            </p>
            <p>
              Las restricciones de cada ZBE (horarios, días, episodios de contaminación,
              excepciones) las fija cada ayuntamiento y cambian con frecuencia; los datos de ciudades
              de esta herramienta son orientativos a 2025. Consulta siempre el portal oficial de tu
              municipio antes de circular por una ZBE.
            </p>
            <p>
              <strong>TÚ ERES RESPONSABLE</strong> de comprobar tu etiqueta y las normas de la ZBE
              por la que circules. meskeIA no se responsabiliza de las sanciones derivadas del uso de
              esta herramienta.
            </p>
          </DisclaimerCard>
        </div>

        {/* ---- Sección educativa ---- */}
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 1.5rem' }}>
          <EducationalSection
            title="Cómo funcionan las Zonas de Bajas Emisiones en España"
            subtitle="Todo lo que necesitas saber sobre las ZBE y las etiquetas DGT"
          >
            <h4>¿Qué son las ZBE y por qué se crearon?</h4>
            <p>
              Las Zonas de Bajas Emisiones (ZBE) son áreas urbanas en las que se restringe la
              circulación de los vehículos más contaminantes para mejorar la calidad del aire. En
              España, la Ley 7/2021, de 20 de mayo, de cambio climático y transición energética
              (art. 14.3), obliga a los municipios de más de 50.000 habitantes y a los territorios
              insulares a establecer zonas de bajas emisiones antes de 2023, y a los de más de 20.000
              habitantes cuando superan los valores límite de contaminantes. El objetivo principal
              es reducir la concentración de dióxido de nitrógeno (NO₂) y partículas en suspensión
              (PM2,5 y PM10), contaminantes que superan con frecuencia los límites fijados por la
              Unión Europea en las grandes ciudades españolas.
            </p>

            <h4>Las etiquetas DGT y qué significan</h4>
            <p>
              El Reglamento General de Vehículos (Anexo II) clasifica los turismos y furgonetas
              ligeras por su norma Euro, y la DGT lo traduce a fechas de matriculación. La etiqueta{' '}
              <strong>CERO</strong> (azul) corresponde a los eléctricos de batería (BEV), de
              autonomía extendida (REEV), de pila de combustible y a los híbridos enchufables (PHEV)
              con 40 km o más de autonomía eléctrica. La etiqueta <strong>ECO</strong> (bicolor,
              verde y azul) agrupa a los híbridos no enchufables (HEV), los PHEV con menos de 40 km
              y los vehículos de gas (GNC, GNL o GLP), siempre que cumplan además los criterios de
              la etiqueta C. La etiqueta <strong>C</strong> (verde) incluye los gasolina
              matriculados a partir de enero de 2006 (Euro 4, 5 o 6) y los diésel a partir de
              septiembre de 2015 (Euro 6). La etiqueta <strong>B</strong> (amarilla) abarca los
              gasolina desde el 1 de enero de 2001 (Euro 3) y los diésel a partir de 2006 (Euro 4 o
              5). Los vehículos anteriores a esas fechas no tienen distintivo y son los más
              restringidos. Las fechas son una aproximación: manda la norma Euro del vehículo.
            </p>

            <h4>¿Qué pasa si entro sin etiqueta o sin autorización?</h4>
            <p>
              No respetar las restricciones de una ZBE es una infracción grave del artículo 76.z3
              de la Ley sobre Tráfico, Circulación de Vehículos a Motor y Seguridad Vial:{' '}
              <strong>200 € de multa</strong> (100 € con pronto pago), sin pérdida de puntos.
              Madrid y Barcelona cuentan con sistemas de control perimetral mediante cámaras de
              lectura automática de matrículas (ANPR) que identifican los vehículos infractores de
              forma continua. Zaragoza y Valladolid también han implantado sistemas de control
              automático en los accesos a sus ZBE. En algunos municipios, la denuncia puede
              interponerse igualmente por la Policía Local durante los controles manuales.
            </p>

            <h4>El futuro de las ZBE</h4>
            <p>
              Las ordenanzas municipales suelen implantar las restricciones por fases, empezando por
              los vehículos sin distintivo y ampliándolas después a otras etiquetas, zonas u
              horarios. Cada ayuntamiento decide su calendario, así que la situación de una ciudad
              puede cambiar de un año para otro: conviene revisar la ordenanza de tu municipio si
              piensas conservar tu vehículo varios años.
            </p>
          </EducationalSection>
        </div>
      </main>

      <RelatedApps apps={getRelatedApps('etiqueta-dgt')} />
      <ShareCard appName="etiqueta-dgt" />
      <Footer appName="etiqueta-dgt" />
    </div>
  );
}
