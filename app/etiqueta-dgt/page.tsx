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

// ============================================================
// TIPOS
// ============================================================

type TipoEtiqueta = 'cero' | 'eco' | 'c' | 'b' | 'ninguna';
type AccesoZBE = 'libre' | 'restriccion' | 'prohibido';
type TipoCombustible = 'bev' | 'phev' | 'hev' | 'gnc' | 'gasolina' | 'diesel';

interface CiudadZBE {
  nombre: string;
  acceso: AccesoZBE;
  detalle: string;
}

interface ResultadoEtiqueta {
  etiqueta: TipoEtiqueta;
  nombre: string;
  descripcion: string;
  ciudades: CiudadZBE[];
  recomendaciones: string[];
}

interface FormState {
  combustible: TipoCombustible | '';
  anio: string;
  autonomiaPhev: 'si' | 'no' | '';
}

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
      'Vehículo eléctrico puro, de pila de combustible o de gas (GNC/GLP). Máxima categoría medioambiental según la DGT.',
    recomendaciones: [
      'Tu vehículo tiene la máxima categoría ambiental. Accedes a todos los beneficios ZBE, carriles BUS+VAO, y parking bonificado en muchos municipios.',
      'En Madrid puedes aparcar gratuitamente en zona SER los primeros 120 minutos (residentes de otras zonas) con autorización previa.',
      'Disfruta de bonificaciones en peajes y exención o reducción del impuesto de matriculación y del IVTM en muchos ayuntamientos.',
    ],
  },
  eco: {
    nombre: 'ECO',
    descripcion:
      'Vehículo híbrido convencional (HEV) o PHEV con autonomía eléctrica inferior a 40 km. Segunda categoría más favorable.',
    recomendaciones: [
      'Buena etiqueta. Accedes a la mayoría de ZBE sin restricciones y tienes beneficios en peajes y aparcamientos públicos.',
      'En Madrid, la etiqueta ECO permite aparcar en zona SER con beneficios y acceder a carriles BUS+VAO con al menos un ocupante.',
      'Considera actualizar a un PHEV con autonomía ≥40 km o un BEV para obtener la etiqueta CERO y maximizar los beneficios.',
    ],
  },
  c: {
    nombre: 'C',
    descripcion:
      'Gasolina matriculado desde 2006 (Euro 4 o superior) o diésel matriculado desde 2015 (Euro 6). Etiqueta amarilla.',
    recomendaciones: [
      'Etiqueta válida en la mayoría de ZBE. En episodios de alta contaminación pueden activarse restricciones para esta etiqueta en algunas ciudades.',
      'En Madrid, vigila el protocolo anticontaminación: en escenarios 2 y 3, los vehículos C pueden quedar restringidos al viario básico.',
      'La etiqueta C sigue siendo la más común en España. A medio plazo, considera la transición hacia etiquetas ECO o CERO.',
    ],
  },
  b: {
    nombre: 'B',
    descripcion:
      'Gasolina matriculado entre 2001 y 2005 (Euro 3) o diésel matriculado entre 2006 y 2014 (Euro 4 o 5). Etiqueta verde.',
    recomendaciones: [
      'Etiqueta limitada. Considera el impacto futuro: las normativas ZBE se están endureciendo progresivamente en todas las ciudades con más de 50.000 habitantes.',
      'En Madrid y Barcelona, la etiqueta B ya tiene restricciones de circulación en determinadas zonas y horarios. Infórmate antes de circular.',
      'Si usas el vehículo habitualmente en entorno urbano, valorar la renovación a un vehículo con etiqueta C, ECO o CERO puede evitarte multas y restricciones.',
    ],
  },
  ninguna: {
    nombre: 'Sin etiqueta',
    descripcion:
      'Vehículo sin etiqueta DGT: gasolina antes de 2001 (pre-Euro 3) o diésel antes de 2006 (pre-Euro 4). Los más contaminantes.',
    recomendaciones: [
      'Tu vehículo no tiene etiqueta DGT y ya no puede circular por las ZBE de las principales ciudades. Si lo utilizas habitualmente en zona urbana, considera la renovación del vehículo.',
      'Las multas por circular en ZBE sin autorización oscilan entre 90€ y 500€ según el municipio. Madrid y Barcelona disponen de control perimetral automático con cámaras.',
      'Infórmate sobre los programas de ayuda a la renovación de vehículos (Plan MOVES III y planes autonómicos) que pueden financiar parcialmente la compra de un vehículo más eficiente.',
    ],
  },
};

// ============================================================
// LÓGICA DE CÁLCULO
// ============================================================

function calcularEtiqueta(
  combustible: TipoCombustible,
  anio: number,
  autonomiaPhev: 'si' | 'no' | ''
): TipoEtiqueta {
  if (combustible === 'bev' || combustible === 'gnc') {
    return 'cero';
  }

  if (combustible === 'phev') {
    return autonomiaPhev === 'si' ? 'cero' : 'eco';
  }

  if (combustible === 'hev') {
    return 'eco';
  }

  if (combustible === 'gasolina') {
    if (anio >= 2006) return 'c';
    if (anio >= 2001) return 'b';
    return 'ninguna';
  }

  if (combustible === 'diesel') {
    if (anio >= 2015) return 'c';
    if (anio >= 2006) return 'b';
    return 'ninguna';
  }

  return 'ninguna';
}

function construirResultado(etiqueta: TipoEtiqueta): ResultadoEtiqueta {
  const info = INFO_ETIQUETA[etiqueta];
  return {
    etiqueta,
    nombre: info.nombre,
    descripcion: info.descripcion,
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
      aria-label={`Etiqueta DGT: ${nombre}`}
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

  const textoMap: Record<AccesoZBE, string> = {
    libre: '✓ Libre acceso',
    restriccion: '⚠ Con restricciones',
    prohibido: '✕ Prohibido',
  };

  return (
    <span className={`${styles.zbeStatus} ${claseMap[acceso]}`}>
      {textoMap[acceso]}
    </span>
  );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function EtiquetaDgtPage() {
  const [form, setForm] = useState<FormState>({
    combustible: '',
    anio: '',
    autonomiaPhev: '',
  });
  const [resultado, setResultado] = useState<ResultadoEtiqueta | null>(null);
  const [errorAnio, setErrorAnio] = useState<string>('');

  const anioActual = 2025;

  function handleCombustibleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setForm((prev) => ({
      ...prev,
      combustible: e.target.value as TipoCombustible,
      autonomiaPhev: '',
    }));
    setResultado(null);
  }

  function handleAnioChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, anio: e.target.value }));
    setErrorAnio('');
    setResultado(null);
  }

  function handleAutonomiaChange(e: React.ChangeEvent<HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, autonomiaPhev: e.target.value as 'si' | 'no' }));
    setResultado(null);
  }

  function handleConsultar(e: React.FormEvent) {
    e.preventDefault();

    if (!form.combustible) return;

    const necesitaAnio =
      form.combustible === 'gasolina' || form.combustible === 'diesel';

    if (necesitaAnio) {
      const anioNum = parseInt(form.anio, 10);
      if (!form.anio || isNaN(anioNum) || anioNum < 1990 || anioNum > anioActual) {
        setErrorAnio(`Introduce un año entre 1990 y ${anioActual}`);
        return;
      }
    }

    if (form.combustible === 'phev' && !form.autonomiaPhev) return;

    const anioNum = form.anio ? parseInt(form.anio, 10) : 2020;
    const etiqueta = calcularEtiqueta(
      form.combustible as TipoCombustible,
      anioNum,
      form.autonomiaPhev
    );
    setResultado(construirResultado(etiqueta));
  }

  const necesitaAnio =
    form.combustible === 'gasolina' || form.combustible === 'diesel';
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
                >
                  <option value="">-- Selecciona combustible --</option>
                  <option value="bev">Eléctrico puro (BEV)</option>
                  <option value="phev">Eléctrico + gasolina enchufable (PHEV)</option>
                  <option value="hev">Híbrido convencional (HEV)</option>
                  <option value="gnc">Gas natural / GLP</option>
                  <option value="gasolina">Gasolina</option>
                  <option value="diesel">Diésel</option>
                </select>
              </div>

              {/* Año de matriculación — solo visible para gasolina/diésel */}
              {necesitaAnio && (
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
                    min={1990}
                    max={anioActual}
                    placeholder={`ej. 2015`}
                    aria-required="true"
                    aria-label="Año de primera matriculación del vehículo"
                    aria-describedby={errorAnio ? 'errorAnio' : undefined}
                    aria-invalid={!!errorAnio}
                    inputMode="numeric"
                  />
                  {errorAnio && (
                    <div
                      id="errorAnio"
                      role="alert"
                      aria-live="polite"
                      style={{ color: '#dc2626', fontSize: '0.875rem', marginTop: '0.25rem' }}
                    >
                      {errorAnio}
                    </div>
                  )}
                </div>
              )}

              {/* Autonomía PHEV — solo visible para PHEV */}
              {esPhev && (
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="autonomiaPhev">
                    ¿La autonomía eléctrica supera los 40 km?
                  </label>
                  <select
                    id="autonomiaPhev"
                    className={styles.select}
                    value={form.autonomiaPhev}
                    onChange={handleAutonomiaChange}
                    aria-required="true"
                    aria-label="¿La autonomía eléctrica de tu PHEV supera los 40 km?"
                  >
                    <option value="">-- Selecciona opción --</option>
                    <option value="si">Sí, supera los 40 km</option>
                    <option value="no">No, inferior a 40 km</option>
                  </select>
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
                Etiqueta{' '}
                <strong>
                  {resultado.etiqueta === 'ninguna' ? 'Sin etiqueta' : resultado.nombre}
                </strong>
              </h2>
              <p className={styles.etiquetaDesc}>{resultado.descripcion}</p>
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
            variant="financial"
            severity="critical"
            context="etiqueta-dgt"
          />
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
              España, por mandato de la Ley de Residuos y Suelos Contaminados (Real Decreto-ley
              7/2022), todos los municipios de más de 50.000 habitantes y las capitales de provincia
              debían tener implantada su ZBE antes del 1 de enero de 2023. El objetivo principal es
              reducir la concentración de dióxido de nitrógeno (NO₂) y partículas en suspensión
              (PM2,5 y PM10), contaminantes que superan con frecuencia los límites fijados por la
              Unión Europea en las grandes ciudades españolas.
            </p>

            <h4>Las 4 etiquetas DGT y qué significan</h4>
            <p>
              La DGT clasifica los vehículos en cinco categorías según sus emisiones. La etiqueta{' '}
              <strong>CERO</strong> (verde oscuro) corresponde a los vehículos eléctricos puros
              (BEV), de pila de combustible (FCEV), los PHEV con autonomía eléctrica igual o
              superior a 40 km y los vehículos propulsados por gas natural (GNC) o GLP. La etiqueta{' '}
              <strong>ECO</strong> (bicolor azul-verde) agrupa a los híbridos convencionales (HEV) y
              los PHEV con autonomía inferior a 40 km. La etiqueta <strong>C</strong> (amarilla)
              incluye los vehículos de gasolina matriculados a partir de 2006 (Euro 4 o superior) y
              los diésel matriculados a partir de 2015 (Euro 6). La etiqueta <strong>B</strong>{' '}
              (verde) abarca los gasolina de entre 2001 y 2005 (Euro 3) y los diésel de entre 2006 y
              2014 (Euro 4 y 5). Los vehículos anteriores a esas fechas no tienen etiqueta y son los
              más restringidos.
            </p>

            <h4>¿Qué pasa si entro sin etiqueta o sin autorización?</h4>
            <p>
              Las sanciones por circular en una ZBE sin la etiqueta correspondiente o sin
              autorización especial oscilan entre <strong>90 € y 500 €</strong> según el municipio y
              las circunstancias. Madrid y Barcelona cuentan con sistemas de control perimetral
              mediante cámaras de lectura automática de matrículas (ANPR) que identifican los
              vehículos infractores de forma continua. Zaragoza y Valladolid también han implantado
              sistemas de control automático en los accesos a sus ZBE. En algunos municipios, la
              denuncia puede interponerse igualmente por la Policía Local durante los controles
              manuales.
            </p>

            <h4>El futuro de las ZBE: endurecimiento progresivo</h4>
            <p>
              La tendencia regulatoria en toda España es clara: las restricciones se irán ampliando
              progresivamente. En 2025-2026 se prevé que la etiqueta B quede restringida también en
              los principales corredores viarios de varias ciudades en horario de mayor tráfico. A
              medio plazo, tener etiqueta C o superior ya es prácticamente imprescindible para
              circular con normalidad en entorno urbano. Los expertos en movilidad urbana coinciden
              en que la descarbonización del parque automovilístico español se acelerará a medida
              que las ZBE se extiendan a municipios de menor tamaño y el control de su cumplimiento
              se refuerce.
            </p>

            <div className={styles.warningBox}>
              <strong>Aviso importante:</strong> La normativa ZBE está en evolución constante. Las
              restricciones específicas (horarios, días, episodios de contaminación) varían por
              ciudad y pueden cambiar con frecuencia. La información de esta herramienta es
              orientativa y está actualizada a 2025. Consulta siempre el portal oficial de tu
              municipio para obtener información actualizada antes de circular por una ZBE.
            </div>
          </EducationalSection>
        </div>
      </main>

      <RelatedApps apps={getRelatedApps('etiqueta-dgt')} />
      <ShareCard appName="etiqueta-dgt" />
      <Footer appName="etiqueta-dgt" />
    </div>
  );
}
