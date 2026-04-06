'use client';
// @disclaimer: exempt

import { useState, useMemo } from 'react';
import styles from './EstimadorTiempoAhorro.module.css';
import {
  MeskeiaLogo, Footer, LegalNotice, EducationalSection, RelatedApps,
  ShareCard,
} from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─── Objetivos predefinidos ───────────────────────────────────────────────────

interface ObjetivoPredefinido {
  nombre: string;
  icono: string;
  precio: number;
}

const OBJETIVOS: ObjetivoPredefinido[] = [
  { nombre: 'Auriculares inalámbricos', icono: '🎧', precio: 80 },
  { nombre: 'Zapatillas deportivas', icono: '👟', precio: 120 },
  { nombre: 'Consola de videojuegos', icono: '🎮', precio: 400 },
  { nombre: 'Portátil', icono: '💻', precio: 700 },
  { nombre: 'Viaje con amigos', icono: '✈️', precio: 500 },
  { nombre: 'Carné de conducir', icono: '🚗', precio: 1200 },
  { nombre: 'Moto/patinete eléctrico', icono: '🛵', precio: 2000 },
  { nombre: 'Fondo de emergencia', icono: '🛟', precio: 1000 },
];

// ─── Componente ───────────────────────────────────────────────────────────────

export default function EstimadorTiempoAhorroPage() {
  const [objetivo, setObjetivo] = useState('');
  const [precio, setPrecio] = useState('');
  const [ahorroMensual, setAhorroMensual] = useState('');
  const [yaAhorrado, setYaAhorrado] = useState('');

  const parse = (v: string) => parseFloat(v.replace(/\./g, '').replace(',', '.')) || 0;

  const resultado = useMemo(() => {
    const p = parse(precio);
    const ahorro = parse(ahorroMensual);
    const ya = parse(yaAhorrado);
    if (p <= 0 || ahorro <= 0) return null;

    const restante = Math.max(0, p - ya);
    if (restante === 0) return { meses: 0, fechaEstimada: new Date(), restante: 0, total: p, porcentaje: 100 };

    const meses = Math.ceil(restante / ahorro);
    const fechaEstimada = new Date();
    fechaEstimada.setMonth(fechaEstimada.getMonth() + meses);

    return {
      meses,
      fechaEstimada,
      restante,
      total: p,
      porcentaje: Math.min((ya / p) * 100, 100),
    };
  }, [precio, ahorroMensual, yaAhorrado]);

  const seleccionarObjetivo = (obj: ObjetivoPredefinido) => {
    setObjetivo(obj.nombre);
    setPrecio(obj.precio.toString());
  };

  const formatFecha = (d: Date) => {
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${meses[d.getMonth()]} de ${d.getFullYear()}`;
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <span className={styles.heroIcon} aria-hidden="true">🎯</span>
          <h1 className={styles.title}>¿Cuánto tardo en ahorrar?</h1>
          <p className={styles.subtitle}>
            Elige un objetivo, indica cuánto puedes ahorrar y descubre cuándo lo tendrás
          </p>
        </header>

        <LegalNotice />

        {/* ── Objetivos rápidos ── */}
        <div className={styles.objetivosSection}>
          <h2 className={styles.seccionTitulo}>Elige un objetivo o escribe el tuyo</h2>
          <div className={styles.objetivosGrid}>
            {OBJETIVOS.map(obj => (
              <button
                key={obj.nombre}
                type="button"
                className={`${styles.objetivoChip} ${objetivo === obj.nombre ? styles.objetivoActivo : ''}`}
                onClick={() => seleccionarObjetivo(obj)}
              >
                <span aria-hidden="true">{obj.icono}</span>
                <span>{obj.nombre}</span>
                <span className={styles.objetivoPrecio}>{formatCurrency(obj.precio)}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.mainContent}>
          {/* ── Formulario ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Datos</h2>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="objetivo">¿Qué quieres conseguir?</label>
              <input id="objetivo" type="text" className={styles.input} placeholder="Ej: Portátil, viaje, carné..." value={objetivo} onChange={e => setObjetivo(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="precio">¿Cuánto cuesta? (€)</label>
              <input id="precio" type="text" inputMode="decimal" className={styles.input} placeholder="Ej: 500" value={precio} onChange={e => setPrecio(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="ahorro">¿Cuánto puedes ahorrar al mes? (€)</label>
              <input id="ahorro" type="text" inputMode="decimal" className={styles.input} placeholder="Ej: 50" value={ahorroMensual} onChange={e => setAhorroMensual(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="yaAhorrado">¿Ya tienes algo ahorrado? (€, opcional)</label>
              <input id="yaAhorrado" type="text" inputMode="decimal" className={styles.input} placeholder="Ej: 100" value={yaAhorrado} onChange={e => setYaAhorrado(e.target.value)} />
            </div>
          </div>

          {/* ── Resultado ── */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Resultado</h2>

            {!resultado ? (
              <p className={styles.placeholder}>Introduce el precio y tu ahorro mensual para ver el resultado</p>
            ) : resultado.meses === 0 ? (
              <div className={styles.resultHero} data-tipo="logrado">
                <span className={styles.resultIcono} aria-hidden="true">🎉</span>
                <h3>¡Ya tienes suficiente!</h3>
                <p>Ya has ahorrado lo suficiente para {objetivo || 'tu objetivo'}</p>
              </div>
            ) : (
              <div className={styles.resultados}>
                <div className={styles.resultHero} data-tipo={resultado.meses <= 3 ? 'corto' : resultado.meses <= 12 ? 'medio' : 'largo'}>
                  <span className={styles.resultIcono} aria-hidden="true">
                    {resultado.meses <= 3 ? '🚀' : resultado.meses <= 6 ? '⏳' : resultado.meses <= 12 ? '📅' : '🗓️'}
                  </span>
                  <div className={styles.resultMeses}>
                    {resultado.meses} {resultado.meses === 1 ? 'mes' : 'meses'}
                  </div>
                  <p className={styles.resultFecha}>
                    Lo tendrás en <strong>{formatFecha(resultado.fechaEstimada)}</strong>
                  </p>
                </div>

                {/* Barra de progreso */}
                <div className={styles.progresoCard}>
                  <div className={styles.progresoHeader}>
                    <span>Progreso</span>
                    <strong>{formatNumber(resultado.porcentaje, 0)}%</strong>
                  </div>
                  <div className={styles.progresoBarra}>
                    <div className={styles.progresoFill} style={{ width: `${resultado.porcentaje}%` }} />
                  </div>
                  <div className={styles.progresoDetalle}>
                    <span>Ahorrado: {formatCurrency(parse(yaAhorrado))}</span>
                    <span>Falta: {formatCurrency(resultado.restante)}</span>
                  </div>
                </div>

                {/* Trucos para acelerar */}
                <div className={styles.trucosCard}>
                  <h3 className={styles.trucosTitle}>¿Quieres conseguirlo antes?</h3>
                  <div className={styles.trucosGrid}>
                    <div className={styles.truco}>
                      <strong>+10 €/mes</strong>
                      <span>{Math.ceil(resultado.restante / (parse(ahorroMensual) + 10))} meses</span>
                    </div>
                    <div className={styles.truco}>
                      <strong>+25 €/mes</strong>
                      <span>{Math.ceil(resultado.restante / (parse(ahorroMensual) + 25))} meses</span>
                    </div>
                    <div className={styles.truco}>
                      <strong>+50 €/mes</strong>
                      <span>{Math.ceil(resultado.restante / (parse(ahorroMensual) + 50))} meses</span>
                    </div>
                  </div>
                </div>

                {/* Motivación */}
                <div className={styles.motivacionCard}>
                  <span aria-hidden="true">💪</span>
                  <p>
                    {resultado.meses <= 3 && '¡Casi lo tienes! Solo un poco más de constancia y lo conseguirás.'}
                    {resultado.meses > 3 && resultado.meses <= 6 && 'Buen objetivo a medio plazo. La constancia es la clave: no te desanimes.'}
                    {resultado.meses > 6 && resultado.meses <= 12 && 'Es un objetivo ambicioso pero alcanzable. Márcate hitos intermedios para mantener la motivación.'}
                    {resultado.meses > 12 && 'Objetivo a largo plazo. Considera si puedes aumentar tu ahorro mensual o buscar ingresos extra.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <EducationalSection
          title="📚 Trucos para ahorrar más rápido"
          subtitle="Consejos prácticos para acelerar tu ahorro"
        >
          <section className={styles.guideSection}>
            <h2>5 formas de ahorrar más cada mes</h2>
            <div className={styles.consejosGrid}>
              <div className={styles.consejoCard}><span className={styles.consejoIcono} aria-hidden="true">🔄</span><strong>Revisa suscripciones</strong><p>¿Usas todas? Cancela las que no. Netflix, Spotify, gimnasio...</p></div>
              <div className={styles.consejoCard}><span className={styles.consejoIcono} aria-hidden="true">🍱</span><strong>Cocina en casa</strong><p>Comer fuera cuesta 3-5× más. Cocinar y llevar tupper ahorra mucho.</p></div>
              <div className={styles.consejoCard}><span className={styles.consejoIcono} aria-hidden="true">🛍️</span><strong>Lista de compras</strong><p>No vayas al súper sin lista. Las compras impulsivas son el enemigo.</p></div>
              <div className={styles.consejoCard}><span className={styles.consejoIcono} aria-hidden="true">💡</span><strong>Ingresos extra</strong><p>Vende lo que no uses, da clases particulares, trabajos puntuales.</p></div>
              <div className={styles.consejoCard}><span className={styles.consejoIcono} aria-hidden="true">⏰</span><strong>Regla de las 24h</strong><p>Antes de comprar algo caro, espera un día. Si sigues queriéndolo, adelante.</p></div>
            </div>

            <div className={styles.warningBox}>
              <div className={styles.warningHeader}>
                <span className={styles.warningIcon} aria-hidden="true">🐷</span>
                <strong>El poder del hábito</strong>
              </div>
              <ul className={styles.warningList}>
                <li>Ahorrar 5 € al día son 150 €/mes y 1.800 €/año</li>
                <li>Automatiza: programa una transferencia el día que cobres</li>
                <li>Celebra los hitos: cada 25% completado es un logro</li>
              </ul>
            </div>
          </section>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('estimador-tiempo-ahorro')} />
        <ShareCard appName="estimador-tiempo-ahorro" />
        <Footer appName="estimador-tiempo-ahorro" />
      </div>
    </>
  );
}
