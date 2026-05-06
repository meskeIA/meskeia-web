'use client';

import { useState } from 'react';
import styles from './EstimadorLegitimas.module.css';
import { MeskeiaLogo, Footer, NumberInput, EducationalSection, RelatedApps, ShareCard, DisclaimerCard, RegionBadge } from '@/components';
import { formatCurrency } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';

// ─── Datos normativos ─────────────────────────────────────────────────────────

// Regímenes de legítima en España
// Fuentes: CC arts. 806-840 | Codi Civil de Catalunya | CFA Aragón | Ley 2/2006 Galicia
//          Compilació Illes Balears | Ley 5/2015 País Vasco | Compilación Navarra

type RegimenId = 'comun' | 'cataluna' | 'aragon' | 'galicia' | 'baleares' | 'pais-vasco' | 'navarra';

interface Regimen {
  id: RegimenId;
  nombre: string;
  ccaas: string;
  fuente: string;
  descripcionBreve: string;
}

const REGIMENES: Regimen[] = [
  {
    id: 'comun',
    nombre: 'Derecho Común (Código Civil)',
    ccaas: 'Madrid, Andalucía, Castilla y León, Castilla-La Mancha, Extremadura, La Rioja, Cantabria, Asturias, Murcia, Comunidad Valenciana, Canarias',
    fuente: 'CC arts. 806-840',
    descripcionBreve: 'Tres tercios: legítima estricta (1/3) + mejora (1/3) + libre disposición (1/3)',
  },
  {
    id: 'cataluna',
    nombre: 'Cataluña',
    ccaas: 'Catalunya',
    fuente: 'Codi Civil de Catalunya, Libro IV, arts. 451-1 y ss.',
    descripcionBreve: 'Legítima global = 1/4 del haber hereditario para todos los descendientes',
  },
  {
    id: 'aragon',
    nombre: 'Aragón',
    ccaas: 'Aragón',
    fuente: 'Código del Derecho Foral de Aragón (CDFA), arts. 486 y ss.',
    descripcionBreve: 'Legítima colectiva = 1/2 para todos los descendientes; el testador elige la distribución',
  },
  {
    id: 'galicia',
    nombre: 'Galicia',
    ccaas: 'Galicia',
    fuente: 'Ley 2/2006 de Derecho Civil de Galicia, art. 243 y ss.',
    descripcionBreve: 'Legítima = 1/4 del haber hereditario para descendientes',
  },
  {
    id: 'baleares',
    nombre: 'Islas Baleares',
    ccaas: 'Illes Balears (Mallorca e Ibiza)',
    fuente: 'Compilació de Dret Civil de les Illes Balears',
    descripcionBreve: '1/3 con un solo hijo; 1/2 con dos o más hijos. Menorca sigue el Derecho Común',
  },
  {
    id: 'pais-vasco',
    nombre: 'País Vasco',
    ccaas: 'Bizkaia y Álava (Territorio Histórico). Gipuzkoa: con particularidades',
    fuente: 'Ley 5/2015 de Derecho Civil Vasco, arts. 47 y ss.',
    descripcionBreve: 'Legítima = 1/3 del haber hereditario para descendientes',
  },
  {
    id: 'navarra',
    nombre: 'Navarra',
    ccaas: 'Comunidad Foral de Navarra',
    fuente: 'Compilación del Derecho Civil Foral de Navarra, Leyes 267-270',
    descripcionBreve: 'Legítima formal (simbólica). Práctica libertad total de testar',
  },
];

// ─── Lógica ───────────────────────────────────────────────────────────────────

interface ResultadoLegitimas {
  regimen: Regimen;
  patrimonioNeto: number;
  numHijos: number;
  tieneConyuge: boolean;

  legitimaTotal: number;           // Importe mínimo obligatorio para todos los herederos forzosos
  legitimaPorHijo: number;         // Cuota mínima de cada hijo (en régimenes individuales)
  tercioMejora: number;            // Solo en Derecho Común
  libreDisposicion: number;        // Parte que el testador puede dejar a quien quiera
  usufructoConyuge: number;        // Estimación del valor del usufructo del cónyuge

  esLegitivaColectiva: boolean;   // Si la legítima es colectiva (Aragón)
  esNavarra: boolean;              // Régimen de libertad de testar
  notas: string[];
}

function calcularLegitimas(
  patrimonioNeto: number,
  regimenId: RegimenId,
  numHijos: number,
  tieneConyuge: boolean,
): ResultadoLegitimas {
  const regimen = REGIMENES.find(r => r.id === regimenId)!;
  const notas: string[] = [];

  let legitimaTotal = 0;
  let legitimaPorHijo = 0;
  let tercioMejora = 0;
  let libreDisposicion = 0;
  let usufructoConyuge = 0;
  let esLegitivaColectiva = false;
  let esNavarra = false;

  switch (regimenId) {
    case 'comun': {
      // 1/3 estricta (individual) + 1/3 mejora (descendientes) + 1/3 libre
      const tercioEstricto = patrimonioNeto / 3;
      tercioMejora = patrimonioNeto / 3;
      libreDisposicion = patrimonioNeto / 3;
      legitimaTotal = tercioEstricto + tercioMejora; // 2/3 "largo" para descendientes
      legitimaPorHijo = numHijos > 0 ? tercioEstricto / numHijos : 0;
      if (tieneConyuge) {
        usufructoConyuge = tercioMejora; // Usufructo del tercio de mejora
        notas.push('El cónyuge viudo tiene derecho al usufructo del tercio de mejora (1/3 del patrimonio).');
        notas.push('El usufructo puede conmutarse por una renta vitalicia, un lote de bienes o un capital en efectivo (CC art. 839).');
      }
      notas.push('El tercio de mejora puede distribuirse libremente entre hijos y/o nietos, sin partes iguales.');
      notas.push('El testador puede dejar el tercio de libre disposición a cualquier persona (familiar o no).');
      break;
    }
    case 'cataluna': {
      // 1/4 global para todos los descendientes
      legitimaTotal = patrimonioNeto / 4;
      legitimaPorHijo = numHijos > 0 ? legitimaTotal / numHijos : 0;
      libreDisposicion = patrimonioNeto - legitimaTotal;
      if (tieneConyuge) {
        notas.push('En Cataluña, el cónyuge superviviente tiene derecho a la cuarta viudal si el causante tenía descendientes, con limitaciones patrimoniales.');
      }
      notas.push('En Cataluña la legítima es una mera prestación económica: el heredero forzoso no tiene derecho a bienes concretos, solo a una cantidad dineraria.');
      notas.push('El testador puede dejar los 3/4 restantes a quien desee (pareja de hecho, terceros, fundaciones, etc.).');
      break;
    }
    case 'aragon': {
      // Legítima colectiva = 1/2, distribución libre entre descendientes
      legitimaTotal = patrimonioNeto / 2;
      libreDisposicion = patrimonioNeto / 2;
      esLegitivaColectiva = true;
      if (tieneConyuge) {
        notas.push('En Aragón, el cónyuge o pareja estable tiene derecho al usufructo universal de viudedad sobre todos los bienes del causante.');
        usufructoConyuge = patrimonioNeto; // Usufructo universal, estimación
      }
      notas.push('La legítima aragonesa es colectiva: el testador puede dejarla a uno solo de los hijos, desheredando a los demás, siempre que el conjunto de descendientes reciba al menos 1/2 del patrimonio.');
      notas.push('El 1/2 restante es de libre disposición: puede ir a no descendientes.');
      break;
    }
    case 'galicia': {
      // 1/4 para descendientes (igual que Cataluña en cuantía)
      legitimaTotal = patrimonioNeto / 4;
      legitimaPorHijo = numHijos > 0 ? legitimaTotal / numHijos : 0;
      libreDisposicion = patrimonioNeto - legitimaTotal;
      if (tieneConyuge) {
        notas.push('En Galicia el cónyuge viudo tiene derecho al usufructo del 1/4 del haber hereditario si hay descendientes.');
        usufructoConyuge = patrimonioNeto / 4;
      }
      notas.push('En Galicia existe la figura del "pacto de mejora": permite transmitir bienes en vida, anticipando la herencia y afectando al cálculo de legítimas.');
      break;
    }
    case 'baleares': {
      // Mallorca e Ibiza: 1/3 con 1 hijo; 1/2 con 2+ hijos
      const fraccion = numHijos === 1 ? 1 / 3 : 1 / 2;
      legitimaTotal = patrimonioNeto * fraccion;
      legitimaPorHijo = numHijos > 0 ? legitimaTotal / numHijos : 0;
      libreDisposicion = patrimonioNeto - legitimaTotal;
      if (tieneConyuge) {
        notas.push('En Baleares el cónyuge viudo tiene derecho al usufructo universal si concurre con descendientes comunes (similar al Derecho Común).');
        usufructoConyuge = legitimaTotal;
      }
      notas.push('Esta estimación aplica para Mallorca e Ibiza. En Menorca rige el Derecho Común (1/3 + 1/3 + 1/3).');
      notas.push(`Con ${numHijos} hijo${numHijos > 1 ? 's' : ''} se aplica la fracción ${numHijos === 1 ? '1/3' : '1/2'} del patrimonio neto.`);
      break;
    }
    case 'pais-vasco': {
      // Bizkaia/Álava: 1/3 para descendientes
      legitimaTotal = patrimonioNeto / 3;
      legitimaPorHijo = numHijos > 0 ? legitimaTotal / numHijos : 0;
      libreDisposicion = (patrimonioNeto * 2) / 3;
      if (tieneConyuge) {
        notas.push('En el País Vasco existe el usufructo foral de viudedad: el cónyuge superviviente tiene derecho al usufructo universal de todos los bienes del causante.');
        usufructoConyuge = patrimonioNeto;
      }
      notas.push('En Bizkaia existe la troncalidad: ciertos bienes (troncales) solo pueden dejarse a parientes de la línea de donde proceden, con independencia de la legítima.');
      notas.push('Esta estimación aplica a Bizkaia y Álava. En Gipuzkoa rige el Derecho Común con algunas particularidades.');
      break;
    }
    case 'navarra': {
      // Legítima formal: simbólica (5 sueldos febles)
      legitimaTotal = 0;
      libreDisposicion = patrimonioNeto;
      esNavarra = true;
      if (tieneConyuge) {
        notas.push('En Navarra el cónyuge viudo tiene derecho al usufructo de fidelidad sobre todos los bienes del causante mientras no contraiga nuevo matrimonio o pareja estable.');
        usufructoConyuge = patrimonioNeto;
      }
      notas.push('En Navarra la legítima es puramente formal: basta con mencionar a los herederos forzosos en el testamento sin dejarles nada efectivo.');
      notas.push('El testador navarro puede disponer libremente de todo su patrimonio, con la única restricción del usufructo de fidelidad del cónyuge.');
      break;
    }
  }

  return {
    regimen,
    patrimonioNeto,
    numHijos,
    tieneConyuge,
    legitimaTotal,
    legitimaPorHijo,
    tercioMejora,
    libreDisposicion,
    usufructoConyuge,
    esLegitivaColectiva: esLegitivaColectiva,
    esNavarra,
    notas,
  };
}

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimadorLegitimas() {
  const [patrimonio, setPatrimonio] = useState('200000');
  const [regimenId, setRegimenId] = useState<RegimenId>('comun');
  const [numHijosStr, setNumHijosStr] = useState('2');
  const [tieneConyuge, setTieneConyuge] = useState(true);
  const [resultado, setResultado] = useState<ResultadoLegitimas | null>(null);
  const [error, setError] = useState('');

  function calcular() {
    setError('');
    const pat = parseFloat(patrimonio.replace(/\./g, '').replace(',', '.'));
    const hijos = parseInt(numHijosStr);

    if (isNaN(pat) || pat < 0) {
      setError('Introduce un patrimonio neto válido (puede ser 0 si las deudas igualan al activo).');
      return;
    }
    if (isNaN(hijos) || hijos < 0 || hijos > 20) {
      setError('Introduce un número de hijos/descendientes válido (0–20).');
      return;
    }
    if (hijos === 0) {
      setError('Sin descendientes, la legítima recae en los ascendientes. Esta herramienta está orientada a herencias con hijos.');
      return;
    }

    setResultado(calcularLegitimas(pat, regimenId, hijos, tieneConyuge));
  }

  const regimenSeleccionado = REGIMENES.find(r => r.id === regimenId);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">⚖️</span>
        <h1 className={styles.title}>Estimador de Legítimas</h1>
        <p className={styles.subtitle}>Herencia forzosa por régimen civil · Código Civil + Derechos Forales · España 2025</p>
      </header>

      <RegionBadge variant="es-only" />


      <DisclaimerCard variant="financial"
        severity="critical">
        <span>
          Este estimador es <strong>SOLO orientativo</strong> para comparar regímenes de legítima según el derecho civil aplicable.
          <br /><strong>No es</strong> asesoramiento jurídico ni fiscal personalizado. La liquidación real de una herencia depende de múltiples factores (bienes concretos, deudas, donaciones previas, impuesto de sucesiones, etc.).
          <br /><strong>Consulta siempre con un abogado o notario</strong> antes de redactar o modificar un testamento.
          <br /><em>meskeIA no se responsabiliza de decisiones basadas en esta estimación.</em>
        </span>
      </DisclaimerCard>

      <div className={styles.mainContent}>
        {/* Formulario */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Datos de la herencia</h2>

          <NumberInput
            value={patrimonio}
            onChange={setPatrimonio}
            label="Patrimonio neto hereditario (€)"
            placeholder="200000"
            helperText="Activo (bienes + derechos) menos pasivo (deudas y cargas). Las donaciones en vida pueden sumarse al caudal relicto (colación)."
          />

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="regimen">Régimen civil aplicable</label>
            <select
              id="regimen"
              className={styles.select}
              value={regimenId}
              onChange={e => { setRegimenId(e.target.value as RegimenId); setResultado(null); }}
            >
              {REGIMENES.map(r => (
                <option key={r.id} value={r.id}>{r.nombre}</option>
              ))}
            </select>
            {regimenSeleccionado && (
              <p className={styles.hint}>
                <strong>CCAA:</strong> {regimenSeleccionado.ccaas}<br />
                <strong>Norma:</strong> {regimenSeleccionado.fuente}
              </p>
            )}
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="numHijos">Número de hijos / descendientes</label>
            <select
              id="numHijos"
              className={styles.select}
              value={numHijosStr}
              onChange={e => { setNumHijosStr(e.target.value); setResultado(null); }}
            >
              {[1, 2, 3, 4, 5, 6].map(n => (
                <option key={n} value={n}>{n} hijo{n > 1 ? 's' : ''}</option>
              ))}
            </select>
            <p className={styles.hint}>Si hay nietos (en lugar de hijos fallecidos), se representan en la misma porción que correspondía a su progenitor.</p>
          </div>

          <div className={styles.switchGroup}>
            <span className={styles.switchLabel}>¿Hay cónyuge superviviente?</span>
            <div className={styles.switchRow}>
              {(['Sí', 'No'] as const).map(opcion => (
                <button
                  key={opcion}
                  type="button"
                  className={`${styles.switchBtn} ${(opcion === 'Sí') === tieneConyuge ? styles.switchActivo : ''}`}
                  onClick={() => { setTieneConyuge(opcion === 'Sí'); setResultado(null); }}
                  aria-pressed={((opcion === 'Sí') === tieneConyuge) ? true : false}
                >
                  {opcion}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div role="alert" aria-live="polite" className={styles.errorMsg}>
              ⚠️ {error}
            </div>
          )}

          <button type="button" className={styles.btn} onClick={calcular} aria-label="Calcular legítimas">
            Calcular legítimas
          </button>
        </div>

        {/* Resultado */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Distribución de la herencia</h2>

          {!resultado ? (
            <p className={styles.placeholder}>
              Introduce los datos y pulsa el botón para ver la distribución orientativa de la herencia según el régimen civil aplicable.
            </p>
          ) : resultado.esNavarra ? (
            <div className={styles.resultados}>
              <div className={`${styles.regimenBadge} ${styles.regimenLibertad}`}>
                <span aria-hidden="true">🟢</span>
                <div>
                  <strong>Navarra — Libertad de testar</strong>
                  <p>La legítima navarra es meramente formal (simbólica). El testador puede dejar la totalidad del patrimonio a quien desee.</p>
                </div>
              </div>
              <div className={styles.distribucionGrid}>
                <div className={`${styles.bloqueDistrib} ${styles.bloqueLibre}`}>
                  <span className={styles.bloquePorcentaje}>100%</span>
                  <span className={styles.bloqueImporte}>{formatCurrency(resultado.patrimonioNeto)}</span>
                  <span className={styles.bloqueLabel}>Libre disposición total</span>
                </div>
              </div>
              <NotasLista notas={resultado.notas} stylesModule={styles} />
            </div>
          ) : (
            <div className={styles.resultados}>
              <div className={styles.regimenBadge}>
                <span aria-hidden="true">📜</span>
                <div>
                  <strong>{resultado.regimen.nombre}</strong>
                  <p>{resultado.regimen.descripcionBreve}</p>
                </div>
              </div>

              <div className={styles.distribucionGrid}>
                {/* Legítima estricta — solo Derecho Común */}
                {resultado.regimen.id === 'comun' && (
                  <div className={`${styles.bloqueDistrib} ${styles.bloqueEstricta}`}>
                    <span className={styles.bloquePorcentaje}>1/3</span>
                    <span className={styles.bloqueImporte}>{formatCurrency(resultado.legitimaTotal - resultado.tercioMejora)}</span>
                    <span className={styles.bloqueLabel}>Legítima estricta</span>
                    <span className={styles.bloqueSublabel}>{formatCurrency(resultado.legitimaPorHijo)}/hijo · Obligatoria e igual para todos</span>
                  </div>
                )}

                {/* Legítima global — otros regímenes */}
                {resultado.regimen.id !== 'comun' && resultado.legitimaTotal > 0 && (
                  <div className={`${styles.bloqueDistrib} ${styles.bloqueEstricta}`}>
                    <span className={styles.bloquePorcentaje}>
                      {resultado.regimen.id === 'aragon' ? '1/2' : resultado.regimen.id === 'baleares' && resultado.numHijos === 1 ? '1/3' : resultado.regimen.id === 'baleares' ? '1/2' : '1/4'}
                    </span>
                    <span className={styles.bloqueImporte}>{formatCurrency(resultado.legitimaTotal)}</span>
                    <span className={styles.bloqueLabel}>
                      Legítima {resultado.esLegitivaColectiva ? 'colectiva' : 'total'}
                    </span>
                    <span className={styles.bloqueSublabel}>
                      {resultado.esLegitivaColectiva
                        ? 'Distribución libre entre descendientes'
                        : `${formatCurrency(resultado.legitimaPorHijo)}/hijo · Obligatoria`}
                    </span>
                  </div>
                )}

                {/* Tercio de mejora — solo Derecho Común */}
                {resultado.regimen.id === 'comun' && (
                  <div className={`${styles.bloqueDistrib} ${styles.bloqueMejora}`}>
                    <span className={styles.bloquePorcentaje}>1/3</span>
                    <span className={styles.bloqueImporte}>{formatCurrency(resultado.tercioMejora)}</span>
                    <span className={styles.bloqueLabel}>Tercio de mejora</span>
                    <span className={styles.bloqueSublabel}>
                      {resultado.tieneConyuge
                        ? 'Usufructo del cónyuge. Se reparte libremente entre descendientes.'
                        : 'Se reparte libremente entre hijos y/o nietos'}
                    </span>
                  </div>
                )}

                {/* Libre disposición */}
                <div className={`${styles.bloqueDistrib} ${styles.bloqueLibre}`}>
                  <span className={styles.bloquePorcentaje}>
                    {resultado.regimen.id === 'comun' ? '1/3' : resultado.regimen.id === 'aragon' ? '1/2' : resultado.regimen.id === 'baleares' && resultado.numHijos === 1 ? '2/3' : resultado.regimen.id === 'baleares' ? '1/2' : '3/4'}
                  </span>
                  <span className={styles.bloqueImporte}>{formatCurrency(resultado.libreDisposicion)}</span>
                  <span className={styles.bloqueLabel}>Libre disposición</span>
                  <span className={styles.bloqueSublabel}>Para cualquier persona o entidad</span>
                </div>
              </div>

              {resultado.tieneConyuge && resultado.usufructoConyuge > 0 && (
                <div className={styles.conyugeCard}>
                  <span aria-hidden="true">💍</span>
                  <div>
                    <strong>Cónyuge superviviente</strong>
                    <p>Usufructo estimado sobre {formatCurrency(resultado.usufructoConyuge)}</p>
                    <p className={styles.conyugeNota}>El usufructo no reduce los derechos de los herederos en plena propiedad, pero limita el disfrute de los bienes mientras viva el cónyuge.</p>
                  </div>
                </div>
              )}

              <div className={styles.resumenRow}>
                <div className={styles.resumenItem}>
                  <span className={styles.resumenLabel}>Patrimonio neto</span>
                  <strong>{formatCurrency(resultado.patrimonioNeto)}</strong>
                </div>
                <div className={styles.resumenItem}>
                  <span className={styles.resumenLabel}>Herederos forzosos</span>
                  <strong>{resultado.numHijos} hijo{resultado.numHijos > 1 ? 's' : ''}</strong>
                </div>
              </div>

              <NotasLista notas={resultado.notas} stylesModule={styles} />
            </div>
          )}
        </div>
      </div>

      <EducationalSection title="¿Qué es la legítima y por qué varía según la comunidad autónoma?" subtitle="Herencia forzosa, libertad de testar y derechos forales en España">
        <p>La legítima es la porción del patrimonio hereditario que la ley reserva obligatoriamente a los herederos forzosos (descendientes, y en su defecto ascendientes). El testador no puede disponer de ella libremente.</p>
        <h3>¿Quiénes son los herederos forzosos?</h3>
        <ul>
          <li><strong>Descendientes</strong> (hijos, nietos…): son los principales legitimarios en todos los regímenes.</li>
          <li><strong>Ascendientes</strong> (padres, abuelos…): si no hay descendientes, tienen legítima en la mayoría de regímenes.</li>
          <li><strong>Cónyuge</strong>: no es heredero forzoso en sentido estricto, pero tiene derecho a un usufructo viudal garantizado.</li>
        </ul>
        <h3>¿Por qué varía la legítima entre CCAA?</h3>
        <p>España tiene una pluralidad de sistemas civiles. El Código Civil (Derecho Común) aplica en la mayoría de comunidades, pero Cataluña, Aragón, Navarra, País Vasco, Galicia y Baleares tienen derechos civiles propios con normas de legítima diferentes — en algunos casos mucho más favorables a la libertad de testar.</p>
        <h3>¿Qué derecho civil aplica a mi herencia?</h3>
        <p>El derecho civil aplicable lo determina la vecindad civil del fallecido, no su domicilio. La vecindad civil se adquiere por nacimiento, residencia continuada o inscripción en el Registro Civil. Una persona nacida en Navarra que lleva 10 años en Madrid puede seguir siendo de vecindad civil navarra si no ha declarado cambio.</p>
        <h3>¿Qué es el tercio de mejora?</h3>
        <p>En el Derecho Común, el tercio de mejora permite al testador favorecer a uno o varios hijos/nietos sobre los demás dentro de ese tramo. Por ejemplo, puede dejarse íntegro a un hijo con discapacidad, sin infringir la legítima de los demás (que queda cubierta por el tercio estricto).</p>
        <h3>¿Cómo se calcula el caudal hereditario (haber hereditario)?</h3>
        <p>Patrimonio en el momento del fallecimiento + donaciones realizadas en vida (colación) − deudas y cargas. El impuesto de sucesiones no se descuenta para calcular las legítimas; se paga adicionalmente sobre la herencia recibida.</p>

      {/* === SECCIONES PROFESIONALES v2.0 === */}

      {/* 1. Tabla Comparativa */}
      <div className={styles.tableWrapper}>
        <h3>Comparativa: Legítimas por sistema civil territorial</h3>
        <table className={styles.comparativaTable}>
          <thead>
            <tr>
              <th>Territorio</th>
              <th>Legítima hijos</th>
              <th>Legítima cónyuge</th>
              <th>Libertad de testar</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Derecho Común (Código Civil)</td>
              <td>2/3 del caudal (1/3 estricta + 1/3 mejora)</td>
              <td>Usufructo del 1/3 mejora</td>
              <td>Solo 1/3 libre</td>
            </tr>
            <tr>
              <td>Cataluña</td>
              <td>1/4 del caudal (solo en metálico)</td>
              <td>Solo si no hay hijos (1/4 usufructo)</td>
              <td>3/4 libres (mayor libertad)</td>
            </tr>
            <tr>
              <td>País Vasco (Troncalidad)</td>
              <td>1/3 o según bien troncal</td>
              <td>Usufructo del haber conyugal</td>
              <td>Variable según territorio foral</td>
            </tr>
            <tr>
              <td>Navarra</td>
              <td>Legítima formal (5 sueldos)</td>
              <td>Usufructo de fidelidad</td>
              <td>Prácticamente total (mayor del mundo)</td>
            </tr>
            <tr>
              <td>Aragón</td>
              <td>1/2 del caudal (legítima colectiva)</td>
              <td>Usufructo viudal universal</td>
              <td>1/2 libre si se cumple colectiva</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 2. Casos de Uso */}
      <div className={styles.escenariosGrid}>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>👨‍👩‍👧</span>
            <strong>Matrimonio con hijos en Derecho Común</strong>
          </div>
          <p>Herencia de 300.000 €. Los hijos tienen derecho a 2/3 (200.000 €). Solo 100.000 € pueden distribuirse libremente. El tercio de mejora puede concentrarse en un hijo.</p>
          <div className={styles.escenarioExample}>Caudal 300.000 €: 100.000 € legítima estricta + 100.000 € mejora + 100.000 € libre</div>
          <div className={styles.escenarioTip}>💡 El tercio de mejora es útil para beneficiar a un hijo cuidador o con necesidades especiales.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>🏘️</span>
            <strong>Residente en Cataluña con patrimonio inmobiliario</strong>
          </div>
          <p>La legítima catalana (1/4) se paga en metálico, no necesariamente con el inmueble. Más libertad para transmitir la vivienda familiar íntegra a quien el testador quiera.</p>
          <div className={styles.escenarioExample}>Caudal 400.000 €: legítima 100.000 € en metálico, 300.000 € libres para el heredero elegido</div>
          <div className={styles.escenarioTip}>💡 La legítima catalana al 1/4 da mucha más flexibilidad que el derecho común para planificar la herencia.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>🤝</span>
            <strong>Sin hijos, con cónyuge y padres</strong>
          </div>
          <p>En derecho común, si no hay descendientes, los ascendientes tienen legítima (1/2 del caudal) y el cónyuge tiene derecho al usufructo del tercio libre.</p>
          <div className={styles.escenarioExample}>Caudal 200.000 €: padres 100.000 € + cónyuge usufructo 1/3 libre (33.333 €)</div>
          <div className={styles.escenarioTip}>💡 El seguro de vida no forma parte de la herencia y no está sujeto a legítimas.</div>
        </div>
        <div className={styles.escenarioCard}>
          <div className={styles.escenarioHeader}>
            <span className={styles.escenarioIcon}>📜</span>
            <strong>Herencia con donaciones en vida previas</strong>
          </div>
          <p>Se hacen donaciones en vida a un hijo. Estas donaciones se imputan a la legítima del donatario (&quot;colación&quot;). Si superan la legítima, el beneficiado deberá compensar a sus hermanos.</p>
          <div className={styles.escenarioExample}>Donación 80.000 € + legítima 50.000 € → donatario ya tiene más de su legítima, sin más derecho</div>
          <div className={styles.escenarioTip}>💡 Planificar bien las donaciones en vida evita conflictos entre herederos al momento del fallecimiento.</div>
        </div>
      </div>

      {/* 3. FAQ */}
      <div className={styles.faqList}>
        <h3>Preguntas frecuentes sobre las legítimas</h3>
        <div className={styles.faqItem}>
          <strong>¿Qué herederos son forzosos en derecho común?</strong>
          <p>Primero: los hijos y descendientes. Si no hay descendientes, los padres y ascendientes. El cónyuge superviviente no es heredero forzoso pero tiene derecho a usufructo de una parte.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Puedo desheredar a un hijo?</strong>
          <p>Solo por causas tasadas en el Código Civil: atentado contra la vida del testador, abandono o malos tratos, privación de la libertad, negar alimentos, condenado por delitos contra la familia, etc.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Las donaciones en vida reducen la herencia?</strong>
          <p>Sí, las donaciones a herederos forzosos se &quot;colacionan&quot; (se suman al caudal ficticio para calcular legítimas). Las donaciones a terceros pueden atacarse si vulneran legítimas.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿El seguro de vida forma parte de la herencia?</strong>
          <p>No, el seguro de vida va directamente al beneficiario designado y no forma parte del caudal hereditario. No está sujeto a legítimas ni a impuesto de sucesiones como herencia.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué es la &quot;acción de suplemento de legítima&quot;?</strong>
          <p>Es la acción judicial que el legitimario perjudicado puede ejercitar para reclamar su parte si el testamento no la respeta o si las donaciones la han vulnerado. Prescribe en 15 años.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Puedo beneficiar a mi cónyuge en Derecho Común?</strong>
          <p>En derecho común, el cónyuge no es heredero forzoso. Puedes dejarle el tercio libre y el usufructo universal a tu cónyuge, pero los hijos reclamarian los 2/3 restantes (legítima).</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Qué ley se aplica si vivo en una CCAA pero nací en otra?</strong>
          <p>La vecindad civil (no el empadronamiento) determina la ley aplicable. La vecindad civil se adquiere por origen, residencia continuada o declaración. Puede diferir del lugar de residencia actual.</p>
        </div>
        <div className={styles.faqItem}>
          <strong>¿Pueden los herederos renunciar a la legítima?</strong>
          <p>Sí, pero solo una vez abierta la sucesión (tras el fallecimiento). No es posible renunciar anticipadamente a la legítima del testador vivo, excepto en algunos territorios forales (como Navarra).</p>
          <div className={styles.faqTip}>💡 Consultar con notario o abogado especializado para planificar la herencia respetando las legítimas de la CCAA aplicable.</div>
        </div>
      </div>

      {/* 4. Guía Paso a Paso */}
      <div className={styles.stepGuide}>
        <h3>Cómo planificar la herencia respetando las legítimas</h3>
        <div className={styles.step}>
          <div className={styles.stepNumber}>1</div>
          <div className={styles.stepContent}>
            <strong>Determina la ley aplicable</strong>
            <p>Verifica tu vecindad civil (no solo domicilio). Si tienes inmuebles en distintas CCAA, el derecho aplicable a la herencia es el de la vecindad civil del fallecido.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>2</div>
          <div className={styles.stepContent}>
            <strong>Calcula el caudal hereditario</strong>
            <p>Suma todos los bienes y derechos, resta las deudas. Si hubo donaciones previas, añade su valor al caudal ficticio para calcular correctamente las legítimas.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>3</div>
          <div className={styles.stepContent}>
            <strong>Identifica a los herederos forzosos</strong>
            <p>Hijos, nietos (si el hijo ha fallecido), ascendientes si no hay descendientes. El cónyuge tiene derechos de usufructo. La concurrencia de todos determina las porciones.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>4</div>
          <div className={styles.stepContent}>
            <strong>Calcula las partes legítimas exactas</strong>
            <p>Usa este estimador para calcular qué parte corresponde a cada heredero forzoso. El resto (tercio libre o lo que corresponda según la CCAA) puede distribuirse libremente.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>5</div>
          <div className={styles.stepContent}>
            <strong>Redacta el testamento con notario</strong>
            <p>El notario asesora sobre cómo distribuir la herencia respetando las legítimas y maximizando la voluntad del testador. El testamento ante notario tiene plena validez.</p>
          </div>
        </div>
        <div className={styles.step}>
          <div className={styles.stepNumber}>6</div>
          <div className={styles.stepContent}>
            <strong>Registra el testamento y comunícalo</strong>
            <p>El notario registra automáticamente el testamento en el Registro Central. Informa a los herederos de la existencia del testamento para evitar conflictos tras el fallecimiento.</p>
          </div>
        </div>
      </div>

      {/* 5. Mejores Prácticas */}
      <div className={styles.tipsGrid}>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>📜</div>
          <strong>Haz testamento cuanto antes</strong>
          <p>Sin testamento, se aplica la herencia intestada. Puede diferir mucho de lo que se desea. Un testamento notarial cuesta entre 50-150 € y da total seguridad jurídica.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>🔄</div>
          <strong>Actualiza el testamento ante cambios</strong>
          <p>Nacimiento de nuevos herederos, fallecimiento de beneficiarios, cambios patrimoniales significativos o divorcio son razones para revisar y actualizar el testamento.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>💡</div>
          <strong>Aprovecha el tercio de mejora</strong>
          <p>En derecho común, el tercio de mejora permite favorecer a un hijo cuidador, con discapacidad o que ha contribuido más a la familia, dentro de los límites legales.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>🏦</div>
          <strong>Usa seguros de vida para beneficiar al cónyuge</strong>
          <p>El seguro de vida no forma parte de la herencia. Es una herramienta eficiente para dejar capital al cónyuge sin afectar a las legítimas de los hijos.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>⚖️</div>
          <strong>Consulta la normativa de tu CCAA</strong>
          <p>Las diferencias entre territorios forales y comunes son enormes. Un abogado o notario especializado en derecho sucesorio de tu CCAA es imprescindible para una planificación correcta.</p>
        </div>
        <div className={styles.tipCard}>
          <div className={styles.tipIcon}>📊</div>
          <strong>Planifica con antelación las donaciones</strong>
          <p>Las donaciones en vida a herederos forzosos se imputan a la legítima. Planificar bien evita que un hijo reciba doblemente o que otro se sienta perjudicado.</p>
        </div>
      </div>

      {/* 6. Warning Box */}
      <div className={styles.warningBox}>
        <div className={styles.warningHeader}>
          <span className={styles.warningIcon}>⚠️</span>
          <strong>Errores frecuentes en la planificación de legítimas</strong>
        </div>
        <ul className={styles.warningList}>
          <li><strong>No tener en cuenta la vecindad civil</strong>: El lugar de residencia no determina la ley aplicable a la herencia. La vecindad civil (que puede ser diferente) es la clave.</li>
          <li><strong>Creer que se puede desheredar sin causa legal</strong>: En derecho común, desheredar sin causa tasada es ineficaz. Los hijos pueden impugnar el testamento y reclamar la legítima.</li>
          <li><strong>Olvidar incluir donaciones previas en el cálculo</strong>: Las donaciones en vida a herederos forzosos se computan. No incluirlas en el cálculo de legítimas puede llevar a conflictos graves.</li>
          <li><strong>Creer que el cónyuge tiene derecho a la misma legítima que los hijos</strong>: El cónyuge en derecho común tiene derecho a usufructo, no a propiedad. Es una diferencia fundamental.</li>
          <li><strong>Confundir la legítima con la &quot;herencia obligatoria&quot;</strong>: La legítima puede satisfacerse de distintas formas: en bienes, en metálico (especialmente en Cataluña), en derechos. No obliga a dar bienes concretos.</li>
          <li><strong>No actualizar el testamento tras cambios familiares</strong>: Un testamento redactado antes de nuevos nacimientos, divorcios o fallecimientos puede no reflejar la voluntad actual ni respetar correctamente las legítimas.</li>
        </ul>
      </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('estimador-legitimas')} />
      <ShareCard appName="estimador-legitimas" />
      <Footer appName="estimador-legitimas" />
    </div>
  );
}

// Componente auxiliar para notas
function NotasLista({ notas, stylesModule }: { notas: string[]; stylesModule: Record<string, string> }) {
  if (notas.length === 0) return null;
  return (
    <div>
      <div className={stylesModule.notasTitle}>📝 Notas sobre este régimen</div>
      {notas.map((nota, i) => (
        <div key={i} className={stylesModule.notaItem}>
          {nota}
        </div>
      ))}
    </div>
  );
}
