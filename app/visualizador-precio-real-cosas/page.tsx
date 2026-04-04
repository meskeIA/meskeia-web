'use client';

import { useState, useMemo } from 'react';
import styles from './VisualizadorPrecioRealCosas.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  ShareCard,
} from '@/components';
import { formatCurrency, formatNumber } from '@/lib';
import { getRelatedApps } from '@/data/app-relations';
import { jsonLd } from './metadata';

// ─────────────────────────────────────────────
// Datos: objetos y servicios cotidianos
// ─────────────────────────────────────────────

interface Objeto {
  nombre: string;
  precio: number;
  icono: string;
  categoria: 'diario' | 'mensual' | 'grande';
  nota: string;
}

const OBJETOS: Objeto[] = [
  // Diarios
  { nombre: 'Café con leche', precio: 1.80, icono: '☕', categoria: 'diario', nota: 'Precio medio en bar de barrio' },
  { nombre: 'Menú del día', precio: 13, icono: '🍽️', categoria: 'diario', nota: 'Restaurante zona oficinas' },
  { nombre: 'Pack tabaco', precio: 6.50, icono: '🚬', categoria: 'diario', nota: 'Precio medio 2025' },
  { nombre: 'Taxi al trabajo (5 km)', precio: 9, icono: '🚕', categoria: 'diario', nota: 'Tarifa media ciudad' },
  { nombre: 'Cena para dos', precio: 55, icono: '🍷', categoria: 'diario', nota: 'Restaurante medio, con vino' },

  // Mensuales
  { nombre: 'Netflix + Spotify', precio: 25, icono: '📱', categoria: 'mensual', nota: 'Planes estándar combinados' },
  { nombre: 'Gimnasio', precio: 45, icono: '🏋️', categoria: 'mensual', nota: 'Cuota mensual media' },
  { nombre: 'Seguro coche', precio: 55, icono: '🚗', categoria: 'mensual', nota: 'Cuota mensual media (todo riesgo)' },
  { nombre: 'Compra semanal supermercado', precio: 80, icono: '🛒', categoria: 'mensual', nota: 'Una persona, dieta equilibrada' },
  { nombre: 'Factura de la luz', precio: 70, icono: '💡', categoria: 'mensual', nota: 'Media mensual piso 80m²' },

  // Grandes
  { nombre: 'iPhone nuevo', precio: 1299, icono: '📲', categoria: 'grande', nota: 'Modelo Pro, precio lanzamiento' },
  { nombre: 'Vacaciones una semana', precio: 1500, icono: '✈️', categoria: 'grande', nota: 'Vuelos + hotel para dos, Europa' },
  { nombre: 'Ordenador portátil', precio: 900, icono: '💻', categoria: 'grande', nota: 'Gama media, uso general' },
  { nombre: 'Boda (cubierto invitado)', precio: 150, icono: '💒', categoria: 'grande', nota: 'Precio medio por invitado' },
  { nombre: 'Coche usado (3 años)', precio: 15000, icono: '🚙', categoria: 'grande', nota: 'Utilitario revisado' },
  { nombre: 'Entrada piso (20%)', precio: 40000, icono: '🏠', categoria: 'grande', nota: '20% de vivienda de 200.000 €' },
];

const CATEGORIAS = [
  { id: 'diario' as const, nombre: 'Día a día', icono: '☀️' },
  { id: 'mensual' as const, nombre: 'Gastos mensuales', icono: '📅' },
  { id: 'grande' as const, nombre: 'Compras grandes', icono: '🎯' },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function formatHoras(horas: number): string {
  if (horas < 1) {
    return `${Math.round(horas * 60)} minutos`;
  }
  if (horas < 8) {
    return `${formatNumber(horas, 1)} horas`;
  }
  const dias = horas / 8;
  if (dias < 22) {
    return `${formatNumber(dias, 1)} días laborales`;
  }
  const meses = dias / 22;
  if (meses < 12) {
    return `${formatNumber(meses, 1)} meses`;
  }
  return `${formatNumber(meses / 12, 1)} años`;
}

// ─────────────────────────────────────────────
// Componente principal
// ─────────────────────────────────────────────

export default function VisualizadorPrecioRealCosasPage() {
  const [sueldoNetoMensual, setSueldoNetoMensual] = useState(1800);
  const [categoriaActiva, setCategoriaActiva] = useState<'diario' | 'mensual' | 'grande'>('diario');

  const sueldoHora = useMemo(() => {
    return sueldoNetoMensual / (22 * 8); // 22 días laborales × 8 horas
  }, [sueldoNetoMensual]);

  const objetosFiltrados = OBJETOS.filter(o => o.categoria === categoriaActiva);

  // Para la barra relativa, encontrar el máximo en horas de la categoría
  const maxHoras = Math.max(...objetosFiltrados.map(o => o.precio / sueldoHora));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className={styles.container}>
        <MeskeiaLogo />

        <header className={styles.hero}>
          <h1 className={styles.title}>El Precio Real de las Cosas</h1>
          <p className={styles.subtitle}>¿Cuántas horas de tu vida cuesta cada compra? Cambia tu perspectiva sobre el dinero</p>
        </header>

        <LegalNotice />

        {/* Slider de sueldo */}
        <div className={styles.sliderZona}>
          <div className={styles.sliderHeader}>
            <label className={styles.sliderLabel}>Tu sueldo neto mensual</label>
            <span className={styles.sliderValor}>{formatCurrency(sueldoNetoMensual)}</span>
          </div>
          <input
            type="range"
            className={styles.slider}
            min={1000}
            max={6000}
            step={50}
            value={sueldoNetoMensual}
            onChange={(e) => setSueldoNetoMensual(parseInt(e.target.value))}
            aria-label={`Sueldo neto mensual: ${formatCurrency(sueldoNetoMensual)}`}
          />
          <div className={styles.sliderExtremos}>
            <span>1.000 €</span>
            <span>6.000 €</span>
          </div>
          <p className={styles.sueldoHora}>
            Tu hora de trabajo vale <strong>{formatCurrency(sueldoHora)}</strong> netos
            <span className={styles.sueldoHoraDetalle}> ({formatCurrency(sueldoNetoMensual)} ÷ 176 horas/mes)</span>
          </p>
        </div>

        {/* Navegación categorías */}
        <div className={styles.catNav}>
          {CATEGORIAS.map(c => (
            <button
              key={c.id}
              type="button"
              className={`${styles.catBtn} ${categoriaActiva === c.id ? styles.catActiva : ''}`}
              onClick={() => setCategoriaActiva(c.id)}
              aria-pressed={categoriaActiva === c.id}
            >
              <span aria-hidden="true">{c.icono}</span> {c.nombre}
            </button>
          ))}
        </div>

        {/* Lista de objetos */}
        <div className={styles.objetosLista}>
          {objetosFiltrados.map(obj => {
            const horas = obj.precio / sueldoHora;
            const pctBarra = Math.min((horas / maxHoras) * 100, 100);
            return (
              <div key={obj.nombre} className={styles.objetoItem}>
                <div className={styles.objetoTop}>
                  <span className={styles.objetoIcono} aria-hidden="true">{obj.icono}</span>
                  <div className={styles.objetoInfo}>
                    <span className={styles.objetoNombre}>{obj.nombre}</span>
                    <span className={styles.objetoNota}>{obj.nota}</span>
                  </div>
                  <div className={styles.objetoPrecio}>
                    <span className={styles.objetoEuros}>{formatCurrency(obj.precio)}</span>
                    <span className={styles.objetoHoras}>{formatHoras(horas)}</span>
                  </div>
                </div>
                <div className={styles.objetoBarraFondo}>
                  <div
                    className={styles.objetoBarra}
                    style={{ width: `${pctBarra}%` }}
                    role="progressbar"
                    aria-valuenow={horas}
                    aria-label={`${obj.nombre}: ${formatHoras(horas)} de trabajo`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparaciones reveladoras */}
        <div className={styles.comparaciones}>
          <h3 className={styles.compTitulo}>Comparaciones que dan que pensar</h3>
          <div className={styles.compGrid}>
            <div className={styles.compCard}>
              <span className={styles.compIcono} aria-hidden="true">☕</span>
              <p className={styles.compTexto}>
                Un café al día durante un año: <strong>{formatCurrency(1.80 * 365)}</strong> → <strong>{formatHoras((1.80 * 365) / sueldoHora)}</strong> de trabajo
              </p>
            </div>
            <div className={styles.compCard}>
              <span className={styles.compIcono} aria-hidden="true">🚬</span>
              <p className={styles.compTexto}>
                Fumar un paquete al día un año: <strong>{formatCurrency(6.50 * 365)}</strong> → <strong>{formatHoras((6.50 * 365) / sueldoHora)}</strong> de trabajo
              </p>
            </div>
            <div className={styles.compCard}>
              <span className={styles.compIcono} aria-hidden="true">🍽️</span>
              <p className={styles.compTexto}>
                Comer menú fuera cada laborable: <strong>{formatCurrency(13 * 22 * 12)}</strong>/año → <strong>{formatHoras((13 * 22 * 12) / sueldoHora)}</strong> de trabajo
              </p>
            </div>
          </div>
        </div>

        <div className={styles.insight}>
          <p>
            Cuando piensas en precios como <strong>horas de tu vida</strong>, las decisiones cambian.
            No se trata de no gastar — se trata de gastar conscientemente en lo que realmente te importa.
          </p>
        </div>

        <div className={styles.enlaceApp}>
          <span aria-hidden="true">🔗</span> Gestiona tu dinero → <a href="/control-gastos/">Control de Gastos</a> · <a href="/calculadora-suscripciones/">Control Suscripciones</a>
        </div>

        <EducationalSection
          title="La economía del tiempo"
          subtitle="Cómo el tiempo cambia tu relación con el dinero"
          defaultOpen={false}
        >
          <h3>El concepto de &quot;coste de oportunidad vital&quot;</h3>
          <p>
            Cada euro que gastas es un trozo de tu vida que dedicaste a ganarlo. Esta perspectiva,
            popularizada por Vicki Robin en &quot;Your Money or Your Life&quot;, cambia radicalmente
            cómo valoras las compras. No es austeridad — es <strong>consciencia</strong>.
          </p>

          <h3>El impuesto invisible del consumo impulsivo</h3>
          <p>
            Los pequeños gastos recurrentes son los más traicioneros. Un café de 1,80 € no parece nada,
            pero 365 cafés al año son {formatCurrency(1.80 * 365)} — {formatHoras((1.80 * 365) / sueldoHora)} de
            tu trabajo. No significa que dejes el café, sino que seas consciente de la decisión.
          </p>

          <h3>Ganar más no siempre significa ser más libre</h3>
          <p>
            Si con un sueldo mayor subes tu nivel de vida proporcionalmente, sigues necesitando las
            mismas horas para mantenerlo. La verdadera libertad financiera llega cuando la diferencia
            entre lo que ganas y lo que necesitas crece — no cuando ganas más.
          </p>

          <div className={styles.warningBox}>
            <strong>Nota:</strong> los precios son orientativos y pueden variar según ciudad y proveedor.
            El cálculo de horas asume 22 días laborales al mes × 8 horas = 176 horas/mes.
          </div>
        </EducationalSection>

        <RelatedApps apps={getRelatedApps('visualizador-precio-real-cosas')} />
        <ShareCard appName="visualizador-precio-real-cosas" />
        <Footer appName="visualizador-precio-real-cosas" />
      </div>
    </>
  );
}
