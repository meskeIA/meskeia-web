'use client';

import { useState, useEffect, useRef } from 'react';
import AnalyticsTracker from '@/components/AnalyticsTracker';
import MeskeiaLogo from '@/components/MeskeiaLogo';
import Footer from '@/components/Footer';
import { jsonLd, breadcrumbJsonLd, faqJsonLd } from './metadata';
import styles from './ControlGastos.module.css';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);

// Tipos
type TransactionType = 'expense' | 'income';
type FilterType = 'all' | 'income' | 'expense';

interface Transaction {
  id: number;
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface CategoryInfo {
  icon: string;
  name: string;
  color: string;
}

// Categorías con iconos y colores
const CATEGORIES: Record<string, CategoryInfo> = {
  vivienda: { icon: '🏠', name: 'Vivienda', color: '#E76F51' },
  alimentacion: { icon: '🍔', name: 'Alimentación', color: '#F4A261' },
  transporte: { icon: '🚗', name: 'Transporte', color: '#E9C46A' },
  salud: { icon: '💊', name: 'Salud', color: '#2A9D8F' },
  ocio: { icon: '🎬', name: 'Ocio', color: '#264653' },
  ropa: { icon: '👕', name: 'Ropa', color: '#A8DADC' },
  suscripciones: { icon: '📱', name: 'Suscripciones', color: '#457B9D' },
  otros: { icon: '💰', name: 'Otros', color: '#999999' },
};

const INCOME_CATEGORY: CategoryInfo = {
  icon: '📈',
  name: 'Ingreso',
  color: '#48A9A6',
};

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

export default function ControlGastosMensual() {
  // Estados
  const [currentMonth, setCurrentMonth] = useState<number>(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());
  const [currentTransactionType, setCurrentTransactionType] =
    useState<TransactionType>('expense');
  const [currentFilter, setCurrentFilter] = useState<FilterType>('all');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showEducationalContent, setShowEducationalContent] = useState<boolean>(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  // Referencia para el archivo de importación
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar transacciones cuando cambia el mes
  useEffect(() => {
    loadTransactions();
  }, [currentMonth, currentYear]);

  // Funciones de localStorage
  const getStorageKey = () => {
    return `transactions_${currentYear}_${currentMonth}`;
  };

  const loadTransactions = () => {
    if (typeof window === 'undefined') return;

    const key = getStorageKey();
    const saved = localStorage.getItem(key);
    setTransactions(saved ? JSON.parse(saved) : []);
  };

  const saveTransactions = (transactionsList: Transaction[]) => {
    if (typeof window === 'undefined') return;

    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(transactionsList));
    setTransactions(transactionsList);
  };

  // Cambio de tipo de transacción
  const handleTransactionTypeChange = (type: TransactionType) => {
    setCurrentTransactionType(type);
  };

  // Añadir transacción
  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();

    const amount = parseFloat(formData.amount);

    if (amount <= 0) {
      alert('La cantidad debe ser mayor que 0');
      return;
    }

    if (currentTransactionType === 'expense' && !formData.category) {
      alert('Selecciona una categoría');
      return;
    }

    const category =
      currentTransactionType === 'expense' ? formData.category : 'ingreso';
    const description =
      formData.description ||
      (currentTransactionType === 'expense'
        ? CATEGORIES[formData.category]?.name || 'Gasto'
        : 'Ingreso');

    const newTransaction: Transaction = {
      id: Date.now(),
      type: currentTransactionType,
      amount,
      category,
      description,
      date: formData.date,
    };

    const updatedTransactions = [...transactions, newTransaction];
    saveTransactions(updatedTransactions);

    // Resetear formulario
    setFormData({
      amount: '',
      category: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });

    showNotification(
      currentTransactionType === 'expense' ? '✓ Gasto añadido' : '✓ Ingreso añadido'
    );
  };

  // Eliminar transacción
  const handleDeleteTransaction = (id: number) => {
    if (!confirm('¿Eliminar esta transacción?')) return;

    const updatedTransactions = transactions.filter((t) => t.id !== id);
    saveTransactions(updatedTransactions);
    showNotification('✓ Transacción eliminada');
  };

  // Limpiar todas las transacciones
  const handleClearAll = () => {
    const monthName = MONTH_NAMES[currentMonth];
    if (
      !confirm(
        `¿Eliminar TODAS las transacciones de ${monthName} ${currentYear}? Esta acción no se puede deshacer.`
      )
    )
      return;

    saveTransactions([]);
    showNotification('✓ Todas las transacciones eliminadas');
  };

  // Cambiar mes
  const handleChangeMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;

    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  // Exportar a CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('No hay transacciones para exportar este mes');
      return;
    }

    let csv = 'Fecha,Tipo,Categoría,Descripción,Cantidad\n';

    transactions.forEach((t) => {
      const categoryInfo =
        t.type === 'income'
          ? INCOME_CATEGORY
          : CATEGORIES[t.category] || { name: 'Otros' };

      const tipo = t.type === 'income' ? 'Ingreso' : 'Gasto';
      const cantidad = t.type === 'income' ? t.amount : -t.amount;

      csv += `${t.date},${tipo},${categoryInfo.name},"${t.description}",${cantidad}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const monthName = MONTH_NAMES[currentMonth];
    link.setAttribute('href', url);
    link.setAttribute('download', `gastos_${monthName}_${currentYear}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification('✓ CSV descargado');
  };

  // Exportar TODO a JSON
  const handleExportJSON = () => {
    if (typeof window === 'undefined') return;

    const allData: Record<string, Transaction[]> = {};
    let totalTransactions = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('transactions_')) {
        const data = localStorage.getItem(key);
        if (data) {
          const parsedData = JSON.parse(data);
          allData[key] = parsedData;
          totalTransactions += parsedData.length;
        }
      }
    }

    if (Object.keys(allData).length === 0) {
      alert('No hay datos para exportar. Añade algunas transacciones primero.');
      return;
    }

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      totalMonths: Object.keys(allData).length,
      totalTransactions,
      data: allData,
    };

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const today = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `backup_gastos_${today}.json`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification(
      `✓ Backup completo descargado (${Object.keys(allData).length} meses, ${totalTransactions} transacciones)`
    );
  };

  // Importar desde JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      alert('Error: El archivo debe ser un JSON (.json)');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const importData = JSON.parse(event.target?.result as string);

        if (!importData.data || typeof importData.data !== 'object') {
          throw new Error('Formato JSON inválido');
        }

        const shouldMerge = confirm(
          `Se encontraron ${importData.totalMonths || 0} meses con ${
            importData.totalTransactions || 0
          } transacciones.\n\n` +
            `¿Deseas FUSIONAR con tus datos actuales?\n\n` +
            `• Aceptar = Fusionar (mantener datos actuales + añadir importados)\n` +
            `• Cancelar = Cancelar importación`
        );

        if (!shouldMerge) {
          e.target.value = '';
          showNotification('Importación cancelada');
          return;
        }

        let monthsImported = 0;
        let transactionsImported = 0;

        for (const [key, importedTransactions] of Object.entries(importData.data)) {
          if (key.startsWith('transactions_')) {
            const existing = localStorage.getItem(key);
            const existingTransactions: Transaction[] = existing
              ? JSON.parse(existing)
              : [];

            const existingIds = new Set(existingTransactions.map((t) => t.id));
            const newTransactions = (importedTransactions as Transaction[]).filter(
              (t) => !existingIds.has(t.id)
            );

            const merged = [...existingTransactions, ...newTransactions];
            localStorage.setItem(key, JSON.stringify(merged));

            monthsImported++;
            transactionsImported += newTransactions.length;
          }
        }

        loadTransactions();
        e.target.value = '';
        showNotification(
          `✓ Importado: ${monthsImported} meses, ${transactionsImported} transacciones nuevas`
        );
      } catch (error) {
        alert(
          'Error al importar archivo: ' +
            (error as Error).message +
            '\n\nAsegúrate de que sea un archivo JSON válido exportado desde esta aplicación.'
        );
        e.target.value = '';
      }
    };

    reader.onerror = () => {
      alert('Error al leer el archivo');
      e.target.value = '';
    };

    reader.readAsText(file);
  };

  // Notificación
  const showNotification = (message: string) => {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = styles.notification;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  // Calcular resumen
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = income - expenses;

  // Transacciones filtradas
  const filteredTransactions =
    currentFilter === 'all'
      ? transactions
      : transactions.filter((t) => t.type === currentFilter);

  const sortedTransactions = [...filteredTransactions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Datos del gráfico
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const categoryTotals: Record<string, number> = {};

  expenseTransactions.forEach((t) => {
    if (!categoryTotals[t.category]) {
      categoryTotals[t.category] = 0;
    }
    categoryTotals[t.category] += t.amount;
  });

  const chartData = {
    labels: Object.keys(categoryTotals).map(
      (cat) => CATEGORIES[cat]?.name || 'Otros'
    ),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: Object.keys(categoryTotals).map(
          (cat) => CATEGORIES[cat]?.color || '#999999'
        ),
        borderWidth: 2,
        borderColor: '#FFFFFF',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const label = context.label || '';
            const value = formatCurrency(context.parsed);
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((context.parsed / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Analytics v2.1 */}
      <AnalyticsTracker applicationName="control-gastos-mensual" />

      {/* Logo meskeIA */}
      <MeskeiaLogo />

      <div className="container-lg">
        <header className={styles.header}>
          <h1 className="text-2xl text-lg-3xl text-center mb-sm">
            💰 Control de Gastos Mensual
          </h1>
          <p className={`${styles.subtitle} text-center`}>
            Gestiona tus finanzas personales de forma simple y visual
          </p>
        </header>

        {/* Resumen Principal */}
        <section className={styles.summaryCards}>
          <div className={`${styles.summaryCard} ${styles.income}`}>
            <div className={styles.summaryIcon}>📈</div>
            <div className={styles.summaryInfo}>
              <span className={styles.summaryLabel}>Ingresos</span>
              <span className={styles.summaryValue}>{formatCurrency(income)}</span>
            </div>
          </div>

          <div className={`${styles.summaryCard} ${styles.expense}`}>
            <div className={styles.summaryIcon}>📉</div>
            <div className={styles.summaryInfo}>
              <span className={styles.summaryLabel}>Gastos</span>
              <span className={styles.summaryValue}>{formatCurrency(expenses)}</span>
            </div>
          </div>

          <div
            className={`${styles.summaryCard} ${styles.balance} ${
              balance < 0 ? styles.negative : ''
            }`}
          >
            <div className={styles.summaryIcon}>💵</div>
            <div className={styles.summaryInfo}>
              <span className={styles.summaryLabel}>Balance</span>
              <span className={styles.summaryValue}>{formatCurrency(balance)}</span>
            </div>
          </div>
        </section>

        {/* Selector de Mes */}
        <section className={`${styles.card} ${styles.monthSelector}`}>
          <div className={styles.monthControls}>
            <button onClick={() => handleChangeMonth(-1)} className={styles.btnMonth}>
              ◀ Mes Anterior
            </button>
            <h2>
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h2>
            <button onClick={() => handleChangeMonth(1)} className={styles.btnMonth}>
              Mes Siguiente ▶
            </button>
          </div>
        </section>

        {/* Añadir Transacción */}
        <section className={styles.card}>
          <h2>➕ Nueva Transacción</h2>

          <div className={styles.transactionTypeSelector}>
            <button
              className={`${styles.typeBtn} ${
                currentTransactionType === 'expense' ? styles.active : ''
              }`}
              onClick={() => handleTransactionTypeChange('expense')}
            >
              📉 Gasto
            </button>
            <button
              className={`${styles.typeBtn} ${
                currentTransactionType === 'income' ? styles.active : ''
              }`}
              onClick={() => handleTransactionTypeChange('income')}
            >
              📈 Ingreso
            </button>
          </div>

          <form onSubmit={handleAddTransaction} className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="amount">💶 Cantidad (€)</label>
              <input
                type="number"
                id="amount"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                className={styles.input}
                required
              />
            </div>

            {currentTransactionType === 'expense' && (
              <div className={styles.formGroup}>
                <label htmlFor="category">🏷️ Categoría</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className={styles.select}
                  required
                >
                  <option value="">Seleccionar</option>
                  <option value="vivienda">🏠 Vivienda</option>
                  <option value="alimentacion">🍔 Alimentación</option>
                  <option value="transporte">🚗 Transporte</option>
                  <option value="salud">💊 Salud</option>
                  <option value="ocio">🎬 Ocio</option>
                  <option value="ropa">👕 Ropa</option>
                  <option value="suscripciones">📱 Suscripciones</option>
                  <option value="otros">💰 Otros</option>
                </select>
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="date">📅 Fecha</label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={styles.input}
                required
              />
            </div>

            <div className={`${styles.formGroup} ${styles.fullWidth}`}>
              <label htmlFor="description">📝 Descripción (opcional)</label>
              <input
                type="text"
                id="description"
                placeholder="Ej: Compra supermercado, factura luz..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className={styles.input}
              />
            </div>

            <button type="submit" className={`btn btn-primary ${styles.fullWidth}`}>
              💾{' '}
              {currentTransactionType === 'expense' ? 'Añadir Gasto' : 'Añadir Ingreso'}
            </button>
          </form>
        </section>

        {/* Gráfico por Categorías */}
        {expenseTransactions.length > 0 && (
          <section className={styles.card}>
            <h2>📊 Gastos por Categoría</h2>
            <div className={styles.chartContainer}>
              <Doughnut data={chartData} options={chartOptions} />
            </div>
            <div className={styles.categoryLegend}>
              {Object.keys(categoryTotals).map((cat) => {
                const categoryInfo = CATEGORIES[cat] || {
                  icon: '💰',
                  name: 'Otros',
                  color: '#999999',
                };
                const total = Object.values(categoryTotals).reduce(
                  (a, b) => a + b,
                  0
                );
                const percentage = ((categoryTotals[cat] / total) * 100).toFixed(1);

                return (
                  <div key={cat} className={styles.legendItem}>
                    <div
                      className={styles.legendColor}
                      style={{ background: categoryInfo.color }}
                    ></div>
                    <div className={styles.legendText}>
                      <span className={styles.legendName}>
                        {categoryInfo.icon} {categoryInfo.name}
                      </span>
                      <span className={styles.legendAmount}>
                        {formatCurrency(categoryTotals[cat])} ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Lista de Transacciones */}
        <section className={styles.card}>
          <div className={styles.transactionsHeader}>
            <h2>📜 Transacciones del Mes</h2>
            {transactions.length > 0 && (
              <div className={styles.transactionsActions}>
                <button onClick={handleExportCSV} className="btn btn-secondary">
                  📥 CSV Mes Actual
                </button>
                <button onClick={handleClearAll} className="btn btn-outline">
                  🗑️ Limpiar Todo
                </button>
              </div>
            )}
          </div>

          <div className={styles.filterButtons}>
            <button
              className={`${styles.filterBtn} ${
                currentFilter === 'all' ? styles.active : ''
              }`}
              onClick={() => setCurrentFilter('all')}
            >
              Todas
            </button>
            <button
              className={`${styles.filterBtn} ${
                currentFilter === 'income' ? styles.active : ''
              }`}
              onClick={() => setCurrentFilter('income')}
            >
              Ingresos
            </button>
            <button
              className={`${styles.filterBtn} ${
                currentFilter === 'expense' ? styles.active : ''
              }`}
              onClick={() => setCurrentFilter('expense')}
            >
              Gastos
            </button>
          </div>

          <div className={styles.transactionsContainer}>
            {sortedTransactions.length === 0 ? (
              <p className={styles.emptyState}>
                {currentFilter === 'all'
                  ? 'No hay transacciones este mes. Añade tu primera transacción arriba.'
                  : `No hay ${
                      currentFilter === 'income' ? 'ingresos' : 'gastos'
                    } este mes.`}
              </p>
            ) : (
              sortedTransactions.map((t) => {
                const categoryInfo =
                  t.type === 'income'
                    ? INCOME_CATEGORY
                    : CATEGORIES[t.category] || { icon: '💰', name: 'Otros' };

                const amountPrefix = t.type === 'income' ? '+' : '-';

                return (
                  <div key={t.id} className={`${styles.transactionItem} ${styles[t.type]}`}>
                    <div className={styles.transactionInfo}>
                      <div className={styles.transactionHeader}>
                        <span className={styles.transactionCategory}>
                          {categoryInfo.icon}
                        </span>
                        <span className={styles.transactionDescription}>
                          {t.description}
                        </span>
                      </div>
                      <span className={styles.transactionDate}>
                        {formatDate(t.date)}
                      </span>
                    </div>
                    <span className={styles.transactionAmount}>
                      {amountPrefix}
                      {formatCurrency(t.amount)}
                    </span>
                    <button
                      className={styles.transactionDelete}
                      onClick={() => handleDeleteTransaction(t.id)}
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Backup y Restauración */}
        <section className={styles.card}>
          <h2>💾 Backup y Restauración</h2>
          <p className={styles.backupDescription}>
            Exporta todos tus datos para hacer backup o importa desde un archivo JSON
            para restaurar.
          </p>

          <div className={styles.backupActions}>
            <button onClick={handleExportJSON} className="btn btn-primary">
              📦 Exportar TODO a JSON
            </button>

            <div className={styles.importSection}>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleImportJSON}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary"
              >
                📥 Importar desde JSON
              </button>
            </div>
          </div>

          <div className={styles.backupInfo}>
            <p>
              <strong>💡 Exportar TODO a JSON:</strong> Descarga todos tus meses con
              todas las transacciones. Ideal para backup completo.
            </p>
            <p>
              <strong>💡 Importar desde JSON:</strong> Restaura un backup previo. Los
              datos actuales se fusionarán con los importados.
            </p>
            <p>
              <strong>💡 CSV Mes Actual:</strong> Descarga solo el mes actual en
              formato CSV para abrir en Excel.
            </p>
          </div>
        </section>

        {/* Consejos de Ahorro */}
        <section className={`${styles.card} ${styles.tipsSection}`}>
          <h2>💡 Consejos de Ahorro</h2>
          <div className={styles.tipsGrid}>
            <div className={styles.tip}>
              <span className={styles.tipIcon}>🎯</span>
              <h3>Regla 50/30/20</h3>
              <p>
                50% necesidades básicas, 30% gastos personales, 20% ahorro e inversión
              </p>
            </div>
            <div className={styles.tip}>
              <span className={styles.tipIcon}>📊</span>
              <h3>Revisa categorías</h3>
              <p>
                Identifica dónde gastas más y busca oportunidades de reducción
              </p>
            </div>
            <div className={styles.tip}>
              <span className={styles.tipIcon}>🔄</span>
              <h3>Registra diariamente</h3>
              <p>
                Añade gastos cada día para no olvidar ninguno y tener control total
              </p>
            </div>
            <div className={styles.tip}>
              <span className={styles.tipIcon}>💳</span>
              <h3>Revisa suscripciones</h3>
              <p>
                Cancela servicios que no uses. Pequeños gastos mensuales suman mucho
              </p>
            </div>
            <div className={styles.tip}>
              <span className={styles.tipIcon}>🎁</span>
              <h3>Fondo de emergencia</h3>
              <p>Ahorra 3-6 meses de gastos fijos para imprevistos</p>
            </div>
            <div className={styles.tip}>
              <span className={styles.tipIcon}>📅</span>
              <h3>Planifica gastos grandes</h3>
              <p>Vacaciones, regalos, reparaciones: prevé y ahorra con antelación</p>
            </div>
          </div>
        </section>

        {/* Toggle de Contenido Educativo */}
        <div className={styles.educationalToggle}>
          <h3>📚 ¿Quieres aprender más sobre Gestión Financiera Personal?</h3>
          <p className={styles.educationalSubtitle}>
            Descubre cómo controlar tus gastos efectivamente, categorizar operaciones,
            exportar datos y tomar decisiones financieras informadas
          </p>
          <button
            type="button"
            onClick={() => setShowEducationalContent(!showEducationalContent)}
            className={styles.btnSecondary}
          >
            {showEducationalContent
              ? '⬆️ Ocultar Guía Educativa'
              : '⬇️ Ver Guía Completa'}
          </button>
        </div>

        {/* Contenido educativo colapsable */}
        {showEducationalContent && (
          <div className={styles.educationalContent}>
            <div className={styles.eduSection}>
              <h2>¿Cómo funciona esta control gastos mensual?</h2>
              <p>
                Herramienta especializada en control gastos mensual. Proporciona
                cálculos y análisis precisos para facilitar tu trabajo.
              </p>
              <ul>
                <li>
                  <strong>Función principal</strong>: Realiza cálculos especializados
                  de forma rápida
                </li>
                <li>
                  <strong>Interfaz intuitiva</strong>: Diseño simple y fácil de usar
                  sin curva de aprendizaje
                </li>
                <li>
                  <strong>Resultados instantáneos</strong>: Obtén respuestas al
                  momento sin esperas
                </li>
                <li>
                  <strong>100% gratuito</strong>: Sin registro, sin límites, sin costos
                  ocultos
                </li>
              </ul>
            </div>

            <div className={styles.eduSection}>
              <h2>Casos de uso prácticos</h2>
              <ul>
                <li>
                  <strong>Uso profesional</strong>: Aplica en tu trabajo diario para
                  ahorrar tiempo
                </li>
                <li>
                  <strong>Estudios</strong>: Ayuda en tareas académicas y proyectos
                </li>
                <li>
                  <strong>Vida cotidiana</strong>: Resuelve situaciones comunes del día
                  a día
                </li>
                <li>
                  <strong>Toma de decisiones</strong>: Obtén datos precisos para
                  decidir mejor
                </li>
              </ul>
            </div>

            {/* FAQs */}
            <div className={styles.faqSection}>
              <h2>❓ Preguntas Frecuentes</h2>

              <details className={styles.faqItem}>
                <summary>¿Mis datos son privados?</summary>
                <p>
                  Sí, completamente. Todos tus datos se guardan únicamente en tu
                  navegador usando localStorage. No se envía ninguna información a
                  servidores externos. Tienes control total de tu información
                  financiera.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary>¿Puedo usar la app sin conexión a internet?</summary>
                <p>
                  Sí, funciona 100% offline. No requiere conexión a internet para
                  registrar gastos, ver tu balance o consultar el historial.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary>¿Cómo categorizo mis gastos?</summary>
                <p>
                  Al añadir un gasto, seleccionas una categoría de la lista
                  predefinida: Vivienda, Alimentación, Transporte, Salud, Ocio, Ropa,
                  Suscripciones u Otros. Esto te permite analizar en qué gastas más.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary>¿Puedo exportar mis datos?</summary>
                <p>
                  Sí, tienes 2 opciones: (1) Exportar el mes actual a CSV para
                  Excel/Google Sheets, (2) Exportar TODO a JSON para backup completo de
                  todos los meses. También puedes importar backups JSON para restaurar
                  tus datos.
                </p>
              </details>

              <details className={styles.faqItem}>
                <summary>¿Cómo hago backup de mis datos?</summary>
                <p>
                  Usa el botón 'Exportar TODO a JSON' para descargar un backup completo
                  con todos los meses y transacciones. Guarda este archivo en tu nube
                  (Google Drive, Dropbox) y podrás restaurarlo con 'Importar desde
                  JSON'.
                </p>
              </details>
            </div>
          </div>
        )}
      </div>

      {/* Footer meskeIA Unificado */}
      <Footer appName="Control de Gastos Mensual - meskeIA" />
    </>
  );
}
