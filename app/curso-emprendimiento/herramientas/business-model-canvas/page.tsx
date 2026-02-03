'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './BusinessModelCanvas.module.css';
import { MeskeiaLogo, Footer, LegalNotice } from '@/components';

interface CanvasData {
  partners: string;
  activities: string;
  resources: string;
  valueProposition: string;
  customerRelationships: string;
  channels: string;
  customerSegments: string;
  costStructure: string;
  revenueStreams: string;
}

const STORAGE_KEY = 'meskeia-business-model-canvas';

const CANVAS_BLOCKS = [
  { key: 'partners', label: 'Socios Clave', icon: '🤝', hint: '¿Quiénes son tus socios y proveedores clave? ¿Qué recursos obtienes de ellos?' },
  { key: 'activities', label: 'Actividades Clave', icon: '⚙️', hint: '¿Qué actividades son esenciales para tu propuesta de valor?' },
  { key: 'resources', label: 'Recursos Clave', icon: '🏗️', hint: '¿Qué recursos físicos, intelectuales, humanos o financieros necesitas?' },
  { key: 'valueProposition', label: 'Propuesta de Valor', icon: '💎', hint: '¿Qué problema resuelves? ¿Por qué te eligen a ti?' },
  { key: 'customerRelationships', label: 'Relación con Clientes', icon: '💬', hint: '¿Cómo te relacionas con tus clientes? ¿Personal, automatizado, comunidad?' },
  { key: 'channels', label: 'Canales', icon: '📢', hint: '¿Cómo llegas a tus clientes? ¿Web, tienda física, distribuidores?' },
  { key: 'customerSegments', label: 'Segmentos de Clientes', icon: '👥', hint: '¿Para quién creas valor? ¿Quiénes son tus clientes más importantes?' },
  { key: 'costStructure', label: 'Estructura de Costes', icon: '💸', hint: '¿Cuáles son los costes más importantes? ¿Fijos o variables?' },
  { key: 'revenueStreams', label: 'Fuentes de Ingresos', icon: '💰', hint: '¿Por qué pagan tus clientes? ¿Cómo pagan?' },
];

const GLOVO_EXAMPLE: CanvasData = {
  partners: '• Restaurantes y tiendas locales\n• Riders autónomos\n• Empresas de pago (Stripe, PayPal)\n• Compañías de seguros',
  activities: '• Desarrollo y mantenimiento de la app\n• Gestión logística de pedidos\n• Marketing y adquisición de usuarios\n• Soporte al cliente 24/7',
  resources: '• Plataforma tecnológica (app + backend)\n• Red de riders\n• Datos de consumo y comportamiento\n• Marca reconocida',
  valueProposition: '• Cualquier cosa de tu ciudad en menos de 30 minutos\n• Conveniencia total desde el móvil\n• Variedad: comida, farmacia, supermercado, regalos\n• Seguimiento en tiempo real',
  customerRelationships: '• Autoservicio vía app\n• Soporte en chat integrado\n• Programa de fidelización (Prime)\n• Notificaciones personalizadas',
  channels: '• App móvil (iOS/Android)\n• Web para pedidos\n• Redes sociales para marketing\n• Códigos promocionales',
  customerSegments: '• Jóvenes urbanos (18-35)\n• Profesionales sin tiempo\n• Familias en fin de semana\n• Restaurantes que quieren delivery sin inversión',
  costStructure: '• Comisiones a riders\n• Desarrollo tecnológico\n• Marketing y adquisición\n• Operaciones y soporte',
  revenueStreams: '• Comisión por pedido (20-30%)\n• Tasas de envío a usuarios\n• Glovo Prime (suscripción)\n• Publicidad destacada para restaurantes',
};

export default function BusinessModelCanvasPage() {
  const [canvas, setCanvas] = useState<CanvasData>({
    partners: '',
    activities: '',
    resources: '',
    valueProposition: '',
    customerRelationships: '',
    channels: '',
    customerSegments: '',
    costStructure: '',
    revenueStreams: '',
  });
  const [saved, setSaved] = useState(false);

  // Cargar datos guardados
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        setCanvas(JSON.parse(savedData));
      } catch {
        // Ignorar errores de parsing
      }
    }
  }, []);

  // Guardar automáticamente
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(canvas));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [canvas]);

  const handleChange = (key: keyof CanvasData, value: string) => {
    setCanvas(prev => ({ ...prev, [key]: value }));
  };

  const loadExample = () => {
    setCanvas(GLOVO_EXAMPLE);
  };

  const clearCanvas = () => {
    if (confirm('¿Estás seguro de que quieres borrar todo el canvas?')) {
      setCanvas({
        partners: '',
        activities: '',
        resources: '',
        valueProposition: '',
        customerRelationships: '',
        channels: '',
        customerSegments: '',
        costStructure: '',
        revenueStreams: '',
      });
    }
  };

  const exportCanvas = () => {
    const content = CANVAS_BLOCKS.map(block => {
      const value = canvas[block.key as keyof CanvasData];
      return `## ${block.label}\n${value || '(vacío)'}\n`;
    }).join('\n');

    const blob = new Blob([`# Business Model Canvas\nGenerado con meskeIA\n\n${content}`], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'business-model-canvas.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Calcular progreso
  const filledBlocks = Object.values(canvas).filter(v => v.trim().length > 0).length;
  const progress = Math.round((filledBlocks / 9) * 100);

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroIcon}>🎨</div>
        <h1 className={styles.title}>Business Model Canvas</h1>
        <p className={styles.subtitle}>
          Diseña tu modelo de negocio de forma visual. Completa los 9 bloques para tener una visión completa de cómo funcionará tu empresa.
        </p>
      </header>

      <LegalNotice />

      {/* Barra de progreso y acciones */}
      <div className={styles.toolbar}>
        <div className={styles.progressSection}>
          <div className={styles.progressLabel}>
            <span>Progreso</span>
            <span>{filledBlocks}/9 bloques · {progress}%</span>
          </div>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className={styles.actions}>
          {saved && <span className={styles.savedBadge}>✓ Guardado</span>}
          <button onClick={loadExample} className={styles.btnSecondary}>
            📋 Cargar ejemplo (Glovo)
          </button>
          <button onClick={exportCanvas} className={styles.btnSecondary}>
            📥 Exportar
          </button>
          <button onClick={clearCanvas} className={styles.btnDanger}>
            🗑️ Limpiar
          </button>
        </div>
      </div>

      {/* Canvas Grid */}
      <div className={styles.canvasGrid}>
        {/* Fila 1: Partners, Activities+Resources, Value Prop, Relations+Channels, Customers */}
        <div className={styles.canvasCell} style={{ gridArea: 'partners' }}>
          <div className={styles.cellHeader}>
            <span className={styles.cellIcon}>🤝</span>
            <span>Socios Clave</span>
          </div>
          <textarea
            className={styles.cellTextarea}
            value={canvas.partners}
            onChange={(e) => handleChange('partners', e.target.value)}
            placeholder="¿Quiénes son tus socios y proveedores clave?"
          />
        </div>

        <div className={styles.canvasCell} style={{ gridArea: 'activities' }}>
          <div className={styles.cellHeader}>
            <span className={styles.cellIcon}>⚙️</span>
            <span>Actividades Clave</span>
          </div>
          <textarea
            className={styles.cellTextarea}
            value={canvas.activities}
            onChange={(e) => handleChange('activities', e.target.value)}
            placeholder="¿Qué actividades son esenciales?"
          />
        </div>

        <div className={styles.canvasCell} style={{ gridArea: 'resources' }}>
          <div className={styles.cellHeader}>
            <span className={styles.cellIcon}>🏗️</span>
            <span>Recursos Clave</span>
          </div>
          <textarea
            className={styles.cellTextarea}
            value={canvas.resources}
            onChange={(e) => handleChange('resources', e.target.value)}
            placeholder="¿Qué recursos necesitas?"
          />
        </div>

        <div className={styles.canvasCell} style={{ gridArea: 'value' }}>
          <div className={styles.cellHeader}>
            <span className={styles.cellIcon}>💎</span>
            <span>Propuesta de Valor</span>
          </div>
          <textarea
            className={styles.cellTextarea}
            value={canvas.valueProposition}
            onChange={(e) => handleChange('valueProposition', e.target.value)}
            placeholder="¿Qué problema resuelves? ¿Por qué te eligen?"
          />
        </div>

        <div className={styles.canvasCell} style={{ gridArea: 'relations' }}>
          <div className={styles.cellHeader}>
            <span className={styles.cellIcon}>💬</span>
            <span>Relación con Clientes</span>
          </div>
          <textarea
            className={styles.cellTextarea}
            value={canvas.customerRelationships}
            onChange={(e) => handleChange('customerRelationships', e.target.value)}
            placeholder="¿Cómo te relacionas con ellos?"
          />
        </div>

        <div className={styles.canvasCell} style={{ gridArea: 'channels' }}>
          <div className={styles.cellHeader}>
            <span className={styles.cellIcon}>📢</span>
            <span>Canales</span>
          </div>
          <textarea
            className={styles.cellTextarea}
            value={canvas.channels}
            onChange={(e) => handleChange('channels', e.target.value)}
            placeholder="¿Cómo llegas a tus clientes?"
          />
        </div>

        <div className={styles.canvasCell} style={{ gridArea: 'customers' }}>
          <div className={styles.cellHeader}>
            <span className={styles.cellIcon}>👥</span>
            <span>Segmentos de Clientes</span>
          </div>
          <textarea
            className={styles.cellTextarea}
            value={canvas.customerSegments}
            onChange={(e) => handleChange('customerSegments', e.target.value)}
            placeholder="¿Para quién creas valor?"
          />
        </div>

        <div className={styles.canvasCell} style={{ gridArea: 'costs' }}>
          <div className={styles.cellHeader}>
            <span className={styles.cellIcon}>💸</span>
            <span>Estructura de Costes</span>
          </div>
          <textarea
            className={styles.cellTextarea}
            value={canvas.costStructure}
            onChange={(e) => handleChange('costStructure', e.target.value)}
            placeholder="¿Cuáles son los costes más importantes?"
          />
        </div>

        <div className={styles.canvasCell} style={{ gridArea: 'revenue' }}>
          <div className={styles.cellHeader}>
            <span className={styles.cellIcon}>💰</span>
            <span>Fuentes de Ingresos</span>
          </div>
          <textarea
            className={styles.cellTextarea}
            value={canvas.revenueStreams}
            onChange={(e) => handleChange('revenueStreams', e.target.value)}
            placeholder="¿Por qué pagan tus clientes?"
          />
        </div>
      </div>

      {/* Navegación */}
      <div className={styles.navigation}>
        <Link href="/curso-emprendimiento" className={styles.navLink}>
          ← Volver al curso
        </Link>
        <Link href="/curso-emprendimiento/herramientas/dafo" className={styles.navLink}>
          Siguiente: Análisis DAFO →
        </Link>
      </div>

      <Footer appName="curso-emprendimiento" />
    </div>
  );
}
