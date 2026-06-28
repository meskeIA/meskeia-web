'use client';

import { useState, useMemo } from 'react';
import styles from './GeneradorGitignore.module.css';
import {
  MeskeiaLogo,
  Footer,
  EducationalSection,
  RelatedApps,
  LegalNotice,
  DisclaimerCard,
  ShareCard,
} from '@/components';
import { getRelatedApps } from '@/data/app-relations';

// Templates de .gitignore para cada tecnología
const TEMPLATES: Record<string, string[]> = {
  nodejs: [
    '# Node.js',
    'node_modules/',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    'pnpm-debug.log*',
    'lerna-debug.log*',
    '.npm',
    '.yarn-integrity',
    '.env',
    '.env.local',
    '.env.development.local',
    '.env.test.local',
    '.env.production.local',
    'dist/',
    'build/',
    '.next/',
    '.nuxt/',
    '.cache/',
    '.vercel',
    '.serverless/',
    '',
  ],
  python: [
    '# Python',
    '__pycache__/',
    '*.py[cod]',
    '*$py.class',
    '*.so',
    '.Python',
    'env/',
    'venv/',
    'ENV/',
    'env.bak/',
    'venv.bak/',
    'pip-log.txt',
    'pip-delete-this-directory.txt',
    '.pytest_cache/',
    '.coverage',
    'htmlcov/',
    'dist/',
    'build/',
    '*.egg-info/',
    '.eggs/',
    '',
  ],
  java: [
    '# Java',
    '*.class',
    '*.log',
    '*.jar',
    '*.war',
    '*.nar',
    '*.ear',
    '*.zip',
    '*.tar.gz',
    '*.rar',
    'target/',
    '.gradle/',
    'build/',
    '.settings/',
    '.project',
    '.classpath',
    'bin/',
    '',
  ],
  csharp: [
    '# C#/.NET',
    'bin/',
    'obj/',
    '*.user',
    '*.suo',
    '*.cache',
    '*.csproj.user',
    '.vs/',
    '[Dd]ebug/',
    '[Rr]elease/',
    'packages/',
    'TestResults/',
    '*.nupkg',
    '*.snupkg',
    '',
  ],
  react: [
    '# React/Frontend',
    'node_modules/',
    'build/',
    'dist/',
    '.cache/',
    '.parcel-cache/',
    '.next/',
    'out/',
    '.nuxt/',
    '.output/',
    '.vuepress/dist',
    '.serverless/',
    '.fusebox/',
    '.dynamodb/',
    '.tern-port',
    '.vscode-test',
    'storybook-static/',
    '',
  ],
  php: [
    '# PHP',
    'vendor/',
    'composer.lock',
    '.env',
    '.env.local',
    '*.log',
    'storage/',
    'bootstrap/cache/',
    '.phpunit.result.cache',
    'Homestead.json',
    'Homestead.yaml',
    'npm-debug.log',
    'yarn-error.log',
    '',
  ],
  ruby: [
    '# Ruby',
    '*.gem',
    '*.rbc',
    '/.config',
    '/coverage/',
    '/InstalledFiles',
    '/pkg/',
    '/spec/reports/',
    '/spec/examples.txt',
    '/test/tmp/',
    '/test/version_tmp/',
    '/tmp/',
    '*.bundle',
    'vendor/bundle',
    '.rvmrc',
    '',
  ],
  go: [
    '# Go',
    '*.exe',
    '*.exe~',
    '*.dll',
    '*.so',
    '*.dylib',
    '*.test',
    '*.out',
    'go.work',
    'vendor/',
    '',
  ],
  rust: [
    '# Rust',
    'target/',
    'Cargo.lock',
    '**/*.rs.bk',
    '*.pdb',
    '',
  ],
  vscode: [
    '# VS Code',
    '.vscode/*',
    '!.vscode/settings.json',
    '!.vscode/tasks.json',
    '!.vscode/launch.json',
    '!.vscode/extensions.json',
    '*.code-workspace',
    '.history/',
    '',
  ],
  jetbrains: [
    '# JetBrains IDEs',
    '.idea/',
    '*.iws',
    '*.iml',
    '*.ipr',
    'out/',
    'cmake-build-*/',
    '.idea_modules/',
    '',
  ],
  macos: [
    '# macOS',
    '.DS_Store',
    '.AppleDouble',
    '.LSOverride',
    'Icon',
    '._*',
    '.DocumentRevisions-V100',
    '.fseventsd',
    '.Spotlight-V100',
    '.TemporaryItems',
    '.Trashes',
    '.VolumeIcon.icns',
    '.com.apple.timemachine.donotpresent',
    '',
  ],
  windows: [
    '# Windows',
    'Thumbs.db',
    'Thumbs.db:encryptable',
    'ehthumbs.db',
    'ehthumbs_vista.db',
    '*.stackdump',
    '[Dd]esktop.ini',
    '$RECYCLE.BIN/',
    '*.cab',
    '*.msi',
    '*.msix',
    '*.msm',
    '*.msp',
    '*.lnk',
    '',
  ],
};

interface Technology {
  id: string;
  name: string;
  category: 'language' | 'framework' | 'ide' | 'os';
  icon: string;
}

const TECHNOLOGIES: Technology[] = [
  { id: 'nodejs', name: 'Node.js', category: 'language', icon: '🟢' },
  { id: 'python', name: 'Python', category: 'language', icon: '🐍' },
  { id: 'java', name: 'Java', category: 'language', icon: '☕' },
  { id: 'csharp', name: 'C#/.NET', category: 'language', icon: '🔷' },
  { id: 'react', name: 'React/Frontend', category: 'framework', icon: '⚛️' },
  { id: 'php', name: 'PHP', category: 'language', icon: '🐘' },
  { id: 'ruby', name: 'Ruby', category: 'language', icon: '💎' },
  { id: 'go', name: 'Go', category: 'language', icon: '🔵' },
  { id: 'rust', name: 'Rust', category: 'language', icon: '🦀' },
  { id: 'vscode', name: 'VS Code', category: 'ide', icon: '💻' },
  { id: 'jetbrains', name: 'JetBrains', category: 'ide', icon: '🧠' },
  { id: 'macos', name: 'macOS', category: 'os', icon: '🍎' },
  { id: 'windows', name: 'Windows', category: 'os', icon: '🪟' },
];

export default function GeneradorGitignorePage() {
  const [selectedTechs, setSelectedTechs] = useState<Set<string>>(new Set(['nodejs', 'vscode', 'macos']));
  const [copied, setCopied] = useState(false);

  const toggleTech = (techId: string) => {
    const newSelected = new Set(selectedTechs);
    if (newSelected.has(techId)) {
      newSelected.delete(techId);
    } else {
      newSelected.add(techId);
    }
    setSelectedTechs(newSelected);
  };

  const generatedContent = useMemo(() => {
    if (selectedTechs.size === 0) {
      return '# Selecciona al menos una tecnología para generar tu .gitignore';
    }

    const lines: string[] = ['# .gitignore generado con meskeIA', '# https://meskeia.com/generador-gitignore', ''];

    selectedTechs.forEach((techId) => {
      if (TEMPLATES[techId]) {
        lines.push(...TEMPLATES[techId]);
      }
    });

    lines.push('# General', '*.log', '*.tmp', '*.temp', '.env', '.env.local');

    return lines.join('\n');
  }, [selectedTechs]);

  const handleDownload = () => {
    const blob = new Blob([generatedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '.gitignore';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  const selectAll = () => {
    setSelectedTechs(new Set(TECHNOLOGIES.map((t) => t.id)));
  };

  const clearAll = () => {
    setSelectedTechs(new Set());
  };

  const categories = [
    { key: 'language', label: 'Lenguajes', icon: '💻' },
    { key: 'framework', label: 'Frameworks', icon: '⚛️' },
    { key: 'ide', label: 'IDEs', icon: '🛠️' },
    { key: 'os', label: 'Sistemas Operativos', icon: '🖥️' },
  ] as const;

  return (
    <div className={styles.container}>
      <MeskeiaLogo />

      <header className={styles.hero}>
        <span className={styles.heroIcon} aria-hidden="true">📝</span>
        <h1 className={styles.title}>Generador de .gitignore</h1>
        <p className={styles.subtitle}>
          Crea archivos .gitignore profesionales combinando plantillas para tus tecnologías. Compatible con Node.js, Python, Java, React y más de 10 tecnologías.
        </p>
      </header>

      <LegalNotice lastUpdated="2026-02-07" />

      <div className={styles.mainContent}>
        {/* Panel de Selección */}
        <div className={styles.selectionPanel}>
          <div className={styles.selectionHeader}>
            <h2>Selecciona tus tecnologías</h2>
            <div className={styles.headerActions}>
              <button type="button" onClick={selectAll} className={styles.btnSecondary} aria-label="Seleccionar todas las tecnologías">
                Todas
              </button>
              <button type="button" onClick={clearAll} className={styles.btnSecondary} aria-label="Limpiar selección de tecnologías">
                Limpiar
              </button>
            </div>
          </div>

          <p className={styles.selectedCount}>
            {selectedTechs.size} tecnología{selectedTechs.size !== 1 ? 's' : ''} seleccionada{selectedTechs.size !== 1 ? 's' : ''}
          </p>

          {categories.map((category) => {
            const techsInCategory = TECHNOLOGIES.filter((t) => t.category === category.key);
            if (techsInCategory.length === 0) return null;

            return (
              <div key={category.key} className={styles.categorySection}>
                <h3 className={styles.categoryTitle}>
                  <span aria-hidden="true">{category.icon}</span> {category.label}
                </h3>
                <div className={styles.techGrid}>
                  {techsInCategory.map((tech) => (
                    <button
                      key={tech.id}
                      type="button"
                      onClick={() => toggleTech(tech.id)}
                      className={`${styles.techCard} ${selectedTechs.has(tech.id) ? styles.techCardSelected : ''}`}
                      aria-pressed={selectedTechs.has(tech.id)}
                      aria-label={`${selectedTechs.has(tech.id) ? 'Deseleccionar' : 'Seleccionar'} ${tech.name}`}
                    >
                      <span className={styles.techIcon} aria-hidden="true">{tech.icon}</span>
                      <span className={styles.techName}>{tech.name}</span>
                      {selectedTechs.has(tech.id) && <span className={styles.checkmark} aria-hidden="true">✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Panel de Preview */}
        <div className={styles.previewPanel}>
          <div className={styles.previewHeader}>
            <h2>.gitignore generado</h2>
            <div className={styles.previewActions}>
              <button type="button" onClick={handleCopy} className={styles.btnSecondary} aria-label="Copiar contenido al portapapeles">
                {copied ? '✓ Copiado' : <><span aria-hidden="true">📋</span> Copiar</>}
              </button>
              <button type="button" onClick={handleDownload} className={styles.btnPrimary} aria-label="Descargar archivo .gitignore">
                <span aria-hidden="true">⬇️</span> Descargar
              </button>
            </div>
          </div>

          <div className={styles.previewContent}>
            <pre className={styles.codeBlock}>
              <code>{generatedContent}</code>
            </pre>
          </div>

          <div className={styles.previewFooter}>
            <p className={styles.previewTip}>
              <span aria-hidden="true">💡</span> <strong>Tip:</strong> Copia el contenido y crea un archivo llamado <code>.gitignore</code> en la raíz de tu proyecto Git.
            </p>
          </div>
        </div>
      </div>

      <DisclaimerCard
        variant="technical"
        severity="low"
        context="generador-gitignore"
        collapsible={true}
      />

      <EducationalSection
        title="¿Quieres dominar .gitignore y el control de versiones?"
        subtitle="Descubre por qué es esencial, cuándo usarlo, errores comunes y mejores prácticas profesionales"
        icon="📚"
      >
        {/* 1. INTRODUCCIÓN */}
        <section className={styles.guideSection}>
          <h2>¿Por qué usar .gitignore?</h2>
          <p className={styles.introParagraph}>
            El archivo <code>.gitignore</code> le indica a Git qué archivos y directorios <strong>NO debe rastrear</strong> en tu repositorio. Es fundamental para mantener tu repositorio limpio, seguro y eficiente.
          </p>

          <div className={styles.contentGrid}>
            <div className={styles.contentCard}>
              <h4>🔒 Seguridad</h4>
              <p>
                Evita subir <strong>credenciales, API keys, tokens</strong> y archivos <code>.env</code> con información sensible. Un error puede exponer datos críticos públicamente.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>📦 Eficiencia</h4>
              <p>
                Excluye <strong>dependencias</strong> (<code>node_modules/</code>, <code>vendor/</code>), <strong>builds</strong> (<code>dist/</code>, <code>target/</code>) y archivos temporales. Reduce el tamaño del repo un 90%.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🧹 Limpieza</h4>
              <p>
                Filtra <strong>archivos del sistema</strong> (<code>.DS_Store</code>, <code>Thumbs.db</code>), <strong>logs</strong> y <strong>cachés</strong> que no aportan valor al código fuente.
              </p>
            </div>

            <div className={styles.contentCard}>
              <h4>🤝 Colaboración</h4>
              <p>
                Evita conflictos de merge por archivos de configuración personal de IDEs (<code>.vscode/</code>, <code>.idea/</code>). Cada desarrollador tiene su entorno sin contaminar el repo.
              </p>
            </div>
          </div>
        </section>

        {/* 2. TABLA COMPARATIVA */}
        <section className={styles.comparativaSection}>
          <h2>Tabla Comparativa: Enfoques para .gitignore</h2>
          <p className={styles.comparativaSubtitle}>
            Compara las ventajas y desventajas de diferentes métodos para crear tu .gitignore
          </p>

          <div className={styles.tableWrapper}>
            <table className={styles.comparativaTable}>
              <thead>
                <tr>
                  <th>Método</th>
                  <th>Velocidad</th>
                  <th>Precisión</th>
                  <th>Personalización</th>
                  <th>Mejor para</th>
                  <th>Inconveniente</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Manual</strong></td>
                  <td>⏱️ Lento</td>
                  <td>⭐⭐⭐⭐⭐ Alta</td>
                  <td>🎯 Máxima</td>
                  <td>Proyectos únicos, expertos Git</td>
                  <td>Propenso a olvidos, laborioso</td>
                </tr>
                <tr>
                  <td><strong>Templates GitHub</strong></td>
                  <td>⚡ Rápido</td>
                  <td>⭐⭐⭐⭐ Buena</td>
                  <td>📝 Media</td>
                  <td>Proyectos estándar mono-tecnología</td>
                  <td>Limitado a una tecnología a la vez</td>
                </tr>
                <tr>
                  <td><strong>gitignore.io</strong></td>
                  <td>⚡ Rápido</td>
                  <td>⭐⭐⭐⭐ Buena</td>
                  <td>🔧 Media-Alta</td>
                  <td>Proyectos multi-tecnología estándar</td>
                  <td>Requiere conexión, interfaz externa</td>
                </tr>
                <tr>
                  <td><strong>meskeIA Generator</strong></td>
                  <td>⚡ Rápido</td>
                  <td>⭐⭐⭐⭐ Buena</td>
                  <td>🎯 Alta</td>
                  <td>Proyectos multi-stack, principiantes</td>
                  <td>Plantillas predefinidas (pero editables)</td>
                </tr>
                <tr>
                  <td><strong>IDE plugins</strong></td>
                  <td>⚡⚡ Muy rápido</td>
                  <td>⭐⭐⭐ Media</td>
                  <td>📝 Baja</td>
                  <td>Workflows integrados en IDE</td>
                  <td>Depende del IDE, menos control</td>
                </tr>
                <tr>
                  <td><strong>Sin .gitignore</strong></td>
                  <td>⚡⚡⚡ Instantáneo</td>
                  <td>❌ Nula</td>
                  <td>-</td>
                  <td>Nunca (riesgo de seguridad)</td>
                  <td>Expone secretos, repo gigante, conflictos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. CASOS DE USO */}
        <section className={styles.escenariosSection}>
          <h2>Casos de Uso Prácticos</h2>
          <p className={styles.escenariosSubtitle}>
            Escenarios reales donde un .gitignore bien configurado marca la diferencia
          </p>

          <div className={styles.escenariosGrid}>
            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🚀</span>
                <h3>Proyecto Fullstack (Node + React)</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>Configuración:</p>
                <code>
                  ✅ Node.js + React + VS Code + macOS<br />
                  ✅ Resultado: 40+ patrones combinados<br />
                  ⚠️ Evita: node_modules/ (300 MB), .next/ (build), .env (API keys)
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Clonar el repo sin .gitignore tardaría 5 minutos vs 10 segundos con él. Protege tus secrets desde el primer commit.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🐍</span>
                <h3>Data Science (Python + Jupyter)</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>Configuración:</p>
                <code>
                  ✅ Python + JetBrains (PyCharm) + Windows<br />
                  ✅ Resultado: Ignora __pycache__/, venv/, .ipynb_checkpoints/<br />
                  ⚠️ Evita: Archivos de entorno (200 MB+), checkpoints innecesarios
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Los entornos virtuales (venv/) pueden pesar 500 MB+. Cada colaborador crea el suyo sin saturar el repo.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">☕</span>
                <h3>Aplicación Java Enterprise</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>Configuración:</p>
                <code>
                  ✅ Java + JetBrains (IntelliJ) + macOS<br />
                  ✅ Resultado: Excluye target/, .idea/, *.class<br />
                  ⚠️ Evita: Archivos compilados (gigabytes), configs IDE personales
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Los .class compilados cambian en cada build. Con .gitignore solo subes código fuente, no binarios.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🔐</span>
                <h3>Proyecto con Secrets (.env)</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>Configuración:</p>
                <code>
                  ✅ Node.js + .env (API keys, DB passwords)<br />
                  ✅ Resultado: .env en .gitignore ANTES del primer commit<br />
                  🚨 Crítico: Una vez en Git, eliminar .env es complejo (reescribir historial)
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Previene <strong>exposición pública de credenciales</strong>. Usa <code>.env.example</code> con placeholders para documentar variables necesarias.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🤝</span>
                <h3>Equipo Multi-IDE</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>Configuración:</p>
                <code>
                  ✅ React (algunos usan VS Code, otros JetBrains, otros Sublime)<br />
                  ✅ Resultado: Ignora .vscode/, .idea/, *.sublime-*<br />
                  ⚠️ Evita: Conflictos de merge por configuraciones personales
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Cada desarrollador tiene sus extensiones/configuraciones sin afectar a otros. El código es lo que importa, no el IDE.
              </p>
            </div>

            <div className={styles.escenarioCard}>
              <div className={styles.escenarioHeader}>
                <span className={styles.escenarioIcon} aria-hidden="true">🛠️</span>
                <h3>Monorepo Multi-Lenguaje</h3>
              </div>
              <div className={styles.escenarioExample}>
                <p>Configuración:</p>
                <code>
                  ✅ Node.js + Python + Go + Rust (microservicios)<br />
                  ✅ Resultado: .gitignore raíz combina todos los patrones<br />
                  ⚠️ Evita: node_modules/, venv/, target/, duplicar 4× las dependencias
                </code>
              </div>
              <p className={styles.escenarioTip}>
                <strong>Por qué funciona:</strong> Un .gitignore completo en la raíz cubre todos los subdirectorios. Puedes añadir .gitignore específicos por carpeta si necesitas excepciones.
              </p>
            </div>
          </div>
        </section>

        {/* 4. FAQ AMPLIADO */}
        <section className={styles.faqSection}>
          <h2>Preguntas Frecuentes</h2>

          <div className={styles.faqList}>
            <div className={styles.faqItem}>
              <h3>¿Puedo usar múltiples .gitignore en un proyecto?</h3>
              <p>
                <strong>Sí.</strong> Git soporta .gitignore en cualquier directorio. Las reglas se combinan:
              </p>
              <p>
                • <code>.gitignore</code> raíz: Reglas globales del proyecto<br />
                • <code>frontend/.gitignore</code>: Reglas específicas de frontend<br />
                • <code>backend/.gitignore</code>: Reglas específicas de backend
              </p>
              <p>
                <strong>Tip:</strong> Usa .gitignore raíz para patrones comunes (node_modules/, .env) y específicos para excepciones locales.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Qué hago si ya subí archivos que debían estar ignorados?</h3>
              <p>
                Si ya hiciste commit de archivos como <code>.env</code> o <code>node_modules/</code>, añadirlos a .gitignore NO los elimina del historial. Debes:
              </p>
              <p>
                1. <strong>Eliminar del índice (sin borrar local):</strong><br />
                <code>git rm --cached .env</code> (un archivo)<br />
                <code>git rm -r --cached node_modules/</code> (carpeta)
              </p>
              <p>
                2. <strong>Confirmar el cambio:</strong><br />
                <code>git commit -m "Remove sensitive files from tracking"</code>
              </p>
              <p>
                <strong>⚠️ Importante:</strong> Si subiste secrets públicamente, rótalos inmediatamente. El historial de Git conserva los commits antiguos. Para reescribir historial: <code>git filter-branch</code> o BFG Repo-Cleaner (avanzado).
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Cómo verifico que .gitignore está funcionando?</h3>
              <p>
                Ejecuta <code>git status</code> después de crear .gitignore. Los archivos ignorados <strong>no deben aparecer en "Untracked files"</strong>.
              </p>
              <p>
                <strong>Comandos útiles:</strong><br />
                • <code>git status --ignored</code>: Muestra archivos ignorados<br />
                • <code>git check-ignore -v archivo.log</code>: Explica por qué se ignora un archivo<br />
                • <code>git add -f archivo.log</code>: Fuerza añadir un archivo ignorado (usar con precaución)
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Debo ignorar archivos de configuración compartidos?</h3>
              <p>
                Depende del tipo de configuración:
              </p>
              <p>
                <strong>✅ SÍ ignorar (personal):</strong><br />
                • <code>.vscode/settings.json</code> (preferencias individuales)<br />
                • <code>.idea/workspace.xml</code> (estado de ventanas del IDE)<br />
                • <code>.editorconfig</code> NO (este SÍ debe compartirse)
              </p>
              <p>
                <strong>❌ NO ignorar (equipo):</strong><br />
                • <code>.prettierrc</code> (formato de código compartido)<br />
                • <code>eslint.config.js</code> (linting del equipo)<br />
                • <code>.nvmrc</code> / <code>.tool-versions</code> (versiones de Node/herramientas)
              </p>
              <p>
                <strong>Regla de oro:</strong> Si el archivo garantiza consistencia en el equipo, NO lo ignores. Si es preferencia personal, SÍ.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Cómo ignoro todo excepto ciertos archivos?</h3>
              <p>
                Usa el patrón <code>!</code> (negación) después de ignorar todo:
              </p>
              <p>
                <strong>Ejemplo: Ignorar todo en /builds/ excepto production.js</strong><br />
                <code>
                  builds/*<br />
                  !builds/production.js
                </code>
              </p>
              <p>
                <strong>Ejemplo: Ignorar todos los .log excepto important.log</strong><br />
                <code>
                  *.log<br />
                  !important.log
                </code>
              </p>
              <p>
                <strong>⚠️ Importante:</strong> La negación NO funciona si ya ignoraste el directorio padre. Ejemplo: <code>build/</code> ignora TODO dentro, <code>!build/file.txt</code> NO funcionará. Solución: <code>build/*</code> en lugar de <code>build/</code>.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Qué diferencia hay entre .gitignore, .git/info/exclude y .gitignore_global?</h3>
              <p>
                Git soporta <strong>tres niveles de reglas de ignorar</strong>:
              </p>
              <p>
                <strong>1. .gitignore (proyecto)</strong><br />
                • Ubicación: Raíz del repo (o subdirectorios)<br />
                • Alcance: Compartido con todo el equipo (vía Git)<br />
                • Uso: Patrones comunes del proyecto (node_modules/, dist/)
              </p>
              <p>
                <strong>2. .git/info/exclude (local)</strong><br />
                • Ubicación: Dentro de .git/ (NO se sube al repo)<br />
                • Alcance: Solo tu máquina local<br />
                • Uso: Archivos personales temporales (notas.txt, TODO.md)
              </p>
              <p>
                <strong>3. ~/.gitignore_global (global del sistema)</strong><br />
                • Ubicación: Tu carpeta de usuario<br />
                • Alcance: TODOS tus repos Git<br />
                • Uso: Patrones de SO/IDE (.DS_Store, Thumbs.db, .idea/)<br />
                • Config: <code>git config --global core.excludesfile ~/.gitignore_global</code>
              </p>
              <p>
                <strong>Recomendación:</strong> Usa .gitignore (proyecto) para patrones del equipo, .gitignore_global para patrones de tu máquina, .git/info/exclude para casos excepcionales locales.
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Los patrones de .gitignore distinguen mayúsculas/minúsculas?</h3>
              <p>
                <strong>Depende del sistema de archivos:</strong>
              </p>
              <p>
                • <strong>Linux/Unix:</strong> Sí (case-sensitive). <code>README.md</code> ≠ <code>readme.md</code><br />
                • <strong>macOS/Windows:</strong> No (case-insensitive). <code>README.md</code> = <code>readme.md</code>
              </p>
              <p>
                <strong>Mejor práctica:</strong> Usa siempre minúsculas en patrones para evitar problemas cross-platform:
              </p>
              <p>
                <code>
                  *.log          # ✅ Funciona en todos los sistemas<br />
                  *.LOG          # ⚠️ Solo funciona en Linux si el archivo es .LOG
                </code>
              </p>
            </div>

            <div className={styles.faqItem}>
              <h3>¿Debo ignorar package-lock.json / yarn.lock / Cargo.lock?</h3>
              <p>
                <strong>Depende del tipo de proyecto:</strong>
              </p>
              <p>
                <strong>✅ NO IGNORAR (aplicaciones):</strong><br />
                • <code>package-lock.json</code> / <code>yarn.lock</code> (Node.js apps)<br />
                • <code>Cargo.lock</code> (Rust apps)<br />
                • <code>Gemfile.lock</code> (Ruby apps)<br />
                <strong>Razón:</strong> Garantiza que todos los desarrolladores/producción usen las mismas versiones exactas de dependencias. Evita bugs tipo "en mi máquina funciona".
              </p>
              <p>
                <strong>❌ SÍ IGNORAR (librerías/paquetes):</strong><br />
                • Si estás creando una librería NPM/Rust crate/Ruby gem que otros instalarán<br />
                <strong>Razón:</strong> Los consumidores de tu librería deben resolver sus propias dependencias. Los lock files pueden causar conflictos.
              </p>
              <p>
                <strong>Regla de oro:</strong> ¿Despliegas la app? → NO ignores. ¿Publicas como paquete? → SÍ ignora.
              </p>
            </div>
          </div>
        </section>

        {/* 5. GUÍA PASO A PASO */}
        <section className={styles.guideSection}>
          <h2>Guía Profesional: Integrar .gitignore en tu Workflow</h2>

          <div className={styles.stepGuide}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepContent}>
                <h3>Genera el .gitignore ANTES del primer commit</h3>
                <p>
                  Usa este generador para crear el archivo con las tecnologías de tu proyecto. Descárgalo y guárdalo como <code>.gitignore</code> (con punto al inicio) en la raíz del repositorio.
                </p>
                <p>
                  <strong>⚠️ Crítico:</strong> Si ya hiciste <code>git init</code> pero AÚN NO hiciste <code>git add .</code>, estás a tiempo. Si ya hiciste commit de node_modules/ o .env, tendrás que limpiar el historial.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepContent}>
                <h3>Verifica que los archivos se ignoran correctamente</h3>
                <p>
                  Ejecuta <code>git status</code>. Los archivos/carpetas en .gitignore NO deben aparecer en "Untracked files". Si aparecen:
                </p>
                <p>
                  • Revisa que el patrón en .gitignore es correcto (ej: <code>node_modules/</code> con barra al final para carpetas)<br />
                  • Usa <code>git check-ignore -v node_modules/</code> para debugging<br />
                  • Si ya están rastreados, usa <code>git rm --cached -r node_modules/</code>
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepContent}>
                <h3>Añade .gitignore al control de versiones</h3>
                <p>
                  El archivo .gitignore <strong>SÍ debe estar en el repo</strong> para que todo el equipo lo use:
                </p>
                <p>
                  <code>
                    git add .gitignore<br />
                    git commit -m "Add .gitignore for Node.js, React, VS Code"
                  </code>
                </p>
                <p>
                  <strong>Tip:</strong> Haz este commit ANTES de añadir el código. Así proteges secrets desde el inicio.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>4</div>
              <div className={styles.stepContent}>
                <h3>Configura .gitignore_global para patrones de tu sistema</h3>
                <p>
                  Crea un .gitignore global para patrones de tu OS/IDE que NO son específicos del proyecto:
                </p>
                <p>
                  <code>
                    # Crear archivo<br />
                    touch ~/.gitignore_global<br />
                    <br />
                    # Añadir patrones (macOS, VS Code)<br />
                    echo ".DS_Store" &gt;&gt; ~/.gitignore_global<br />
                    echo ".vscode/" &gt;&gt; ~/.gitignore_global<br />
                    <br />
                    # Configurar Git para usarlo<br />
                    git config --global core.excludesfile ~/.gitignore_global
                  </code>
                </p>
                <p>
                  <strong>Ventaja:</strong> Evitas añadir <code>.DS_Store</code> a cada proyecto individual.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>5</div>
              <div className={styles.stepContent}>
                <h3>Documenta secretos necesarios con .env.example</h3>
                <p>
                  Si tu proyecto usa variables de entorno (.env), crea un <code>.env.example</code> con placeholders:
                </p>
                <p>
                  <code>
                    # .env (IGNORADO, NO subir)<br />
                    DATABASE_URL=postgresql://user:password@localhost:5432/mydb<br />
                    API_KEY=sk-ant-api03-1234567890<br />
                    <br />
                    # .env.example (SÍ subir al repo)<br />
                    DATABASE_URL=postgresql://user:password@localhost:5432/dbname<br />
                    API_KEY=your_api_key_here
                  </code>
                </p>
                <p>
                  <strong>Propósito:</strong> Los nuevos desarrolladores saben qué variables necesitan sin exponer valores reales.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>6</div>
              <div className={styles.stepContent}>
                <h3>Revisa .gitignore al añadir nuevas tecnologías</h3>
                <p>
                  Si incorporas nuevas herramientas al proyecto (ej: añades Docker, Terraform), actualiza .gitignore:
                </p>
                <p>
                  • <strong>Docker:</strong> <code>.docker/</code>, <code>*.log</code><br />
                  • <strong>Terraform:</strong> <code>.terraform/</code>, <code>*.tfstate</code>, <code>*.tfvars</code><br />
                  • <strong>Cache de frameworks:</strong> <code>.next/</code>, <code>.nuxt/</code>, <code>.cache/</code>
                </p>
                <p>
                  <strong>Tip:</strong> Usa este generador para regenerar el .gitignore con las nuevas tecnologías.
                </p>
              </div>
            </div>

            <div className={styles.step}>
              <div className={styles.stepNumber}>7</div>
              <div className={styles.stepContent}>
                <h3>Audita periódicamente con git status --ignored</h3>
                <p>
                  Ejecuta <code>git status --ignored</code> cada cierto tiempo para verificar que no ignoras archivos importantes por error.
                </p>
                <p>
                  <strong>Señales de alerta:</strong><br />
                  • Si <code>src/</code> o <code>lib/</code> aparecen ignorados → Revisa patrones demasiado amplios<br />
                  • Si archivos de config del equipo se ignoran → Revisa que no confundiste configs personales vs compartidas
                </p>
                <p>
                  <strong>Tip:</strong> Usa patrones específicos (<code>*.log</code>) en lugar de amplios (<code>*</code>).
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 6. MEJORES PRÁCTICAS */}
        <section className={styles.tipsSection}>
          <h2>Mejores Prácticas Profesionales</h2>

          <div className={styles.tipsGrid}>
            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔐</span>
              <h3>Secrets primero</h3>
              <p>
                Añade <code>.env</code>, <code>*.pem</code>, <code>*.key</code> a .gitignore ANTES del primer commit. Rotar credenciales expuestas es costoso.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📏</span>
              <h3>Patrones específicos</h3>
              <p>
                Usa <code>*.log</code> en lugar de <code>*</code>. Patrones amplios pueden ignorar código fuente accidentalmente.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📝</span>
              <h3>Comenta patrones complejos</h3>
              <p>
                Si usas patrones avanzados (<code>**/*.test.{'{'} js,ts{'}'}</code>), añade un comentario explicando su propósito para el equipo.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🔄</span>
              <h3>Consistencia en el equipo</h3>
              <p>
                Usa el mismo .gitignore en todos los entornos (dev, staging, prod). Evita "funciona en mi máquina" por archivos diferentes.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">🧪</span>
              <h3>Verifica antes de push</h3>
              <p>
                Ejecuta <code>git status</code> antes de <code>git push</code>. Asegúrate de que no subes node_modules/ o .env por error.
              </p>
            </div>

            <div className={styles.tipCard}>
              <span className={styles.tipIcon} aria-hidden="true">📦</span>
              <h3>Ignora builds, no fuente</h3>
              <p>
                Ignora <code>dist/</code>, <code>build/</code>, <code>target/</code> (generados). NUNCA ignores <code>src/</code> o <code>lib/</code> (código fuente).
              </p>
            </div>
          </div>
        </section>

        {/* 7. WARNING BOX */}
        <div className={styles.warningBox}>
          <div className={styles.warningHeader}>
            <span className={styles.warningIcon} aria-hidden="true">⚠️</span>
            <h3>Errores Comunes que Debes Evitar</h3>
          </div>
          <ul className={styles.warningList}>
            <li>
              <strong>Añadir .gitignore después de subir secrets:</strong> Si .env ya está en un commit, añadirlo a .gitignore NO lo elimina del historial. Usa <code>git rm --cached .env</code> y rota las credenciales inmediatamente.
            </li>
            <li>
              <strong>Usar patrones demasiado amplios:</strong> <code>*.js</code> ignoraría TODO el JavaScript, incluyendo tu código fuente. Sé específico: <code>dist/*.js</code>.
            </li>
            <li>
              <strong>Ignorar package-lock.json en aplicaciones:</strong> Causa bugs de "funciona en mi máquina" por versiones inconsistentes. Solo ignóralo en librerías publicables.
            </li>
            <li>
              <strong>No ignorar node_modules/ desde el inicio:</strong> Si subes node_modules/ (300 MB+), el repo queda gigante para siempre. Limpiarlo requiere reescribir historial (complejo).
            </li>
            <li>
              <strong>Mezclar configuraciones personales vs del equipo:</strong> <code>.vscode/settings.json</code> (personal) debe ignorarse. <code>.prettierrc</code> (equipo) NO.
            </li>
            <li>
              <strong>Usar .gitignore para archivos ya rastreados:</strong> Si hiciste <code>git add archivo.log</code>, añadirlo a .gitignore después NO lo ignora. Usa <code>git rm --cached archivo.log</code> primero.
            </li>
            <li>
              <strong>Olvidar barras finales en carpetas:</strong> <code>node_modules</code> ignora archivos Y carpetas. <code>node_modules/</code> solo ignora la carpeta. Usa barra para claridad.
            </li>
            <li>
              <strong>No usar .env.example:</strong> Los nuevos desarrolladores no sabrán qué variables de entorno necesitan. Siempre documenta con placeholders.
            </li>
          </ul>
        </div>
      </EducationalSection>

      <RelatedApps apps={getRelatedApps('generador-gitignore')} />
      <ShareCard appName="generador-gitignore" />
      <Footer appName="generador-gitignore" />
    </div>
  );
}
